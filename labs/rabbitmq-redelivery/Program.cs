using System.Text;
using System.Text.Json;
using Npgsql;
using RabbitMQ.Client;

const string queue = "credits";
const string deadQueue = "credits.dead";
const string eventId = "credit-17";
var factory = new ConnectionFactory { Uri = new Uri(Required("AMQP")), AutomaticRecoveryEnabled = false };
await using var connection = await factory.CreateConnectionAsync();
await using var channel = await connection.CreateChannelAsync(new CreateChannelOptions(true, true));
await using var db = new NpgsqlConnection(Required("DB"));
await db.OpenAsync();

async Task Publish(string id, string body)
{
    var properties = new BasicProperties { MessageId = id, ContentType = "application/json", Persistent = true };
    await channel.BasicPublishAsync("", queue, true, properties, Encoding.UTF8.GetBytes(body));
}

async Task<BasicGetResult> Receive(string name)
{
    using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(30));
    while (true)
    {
        var item = await channel.BasicGetAsync(name, autoAck: false, cancellationToken: deadline.Token);
        if (item != null) return item;
        await Task.Delay(100, deadline.Token);
    }
}

async Task<string> Consume(BasicGetResult delivery, bool crashAfterCommit)
{
    Credit? credit;
    try { credit = JsonSerializer.Deserialize<Credit>(delivery.Body.Span); }
    catch (JsonException) { credit = null; }
    var id = delivery.BasicProperties.MessageId;
    if (credit is null || credit.AmountMinor <= 0 || string.IsNullOrWhiteSpace(id))
    {
        await channel.BasicNackAsync(delivery.DeliveryTag, multiple: false, requeue: false);
        return "rejected";
    }

    await using var tx = await db.BeginTransactionAsync();
    await using var apply = new NpgsqlCommand("""
        WITH first_delivery AS (
            INSERT INTO processed_events (event_id) VALUES (@id)
            ON CONFLICT (event_id) DO NOTHING RETURNING event_id
        )
        UPDATE account SET balance_minor = balance_minor + @amount
        WHERE account_id = 1 AND EXISTS (SELECT 1 FROM first_delivery)
        """, db, tx);
    apply.Parameters.AddWithValue("id", id);
    apply.Parameters.AddWithValue("amount", credit.AmountMinor);
    var changed = await apply.ExecuteNonQueryAsync();
    await tx.CommitAsync();
    if (crashAfterCommit)
    {
        Check(changed == 1, "First delivery must credit the account");
        Console.WriteLine("COMMIT credit-17 +250; stopping before ACK");
        Environment.Exit(42);
    }
    await channel.BasicAckAsync(delivery.DeliveryTag, multiple: false);
    return changed == 1 ? "credited" : "duplicate";
}

switch (args.SingleOrDefault())
{
    case "seed":
        await using (var create = new NpgsqlCommand("""
            CREATE TABLE account (account_id integer PRIMARY KEY, balance_minor bigint NOT NULL);
            CREATE TABLE processed_events (event_id text PRIMARY KEY);
            INSERT INTO account VALUES (1, 0);
            """, db))
            await create.ExecuteNonQueryAsync();
        await channel.QueueDeclareAsync(deadQueue, durable: true, exclusive: false, autoDelete: false);
        await channel.QueueDeclareAsync(queue, durable: true, exclusive: false, autoDelete: false,
            arguments: new Dictionary<string, object?> {
                ["x-dead-letter-exchange"] = "", ["x-dead-letter-routing-key"] = deadQueue
            });
        await Publish(eventId, JsonSerializer.Serialize(new Credit(250)));
        break;
    case "crash":
        var first = await Receive(queue);
        Check(first.BasicProperties.MessageId == eventId && !first.Redelivered, "Expected first delivery");
        await Consume(first, crashAfterCommit: true);
        throw new InvalidOperationException("Crash point not reached");
    case "recover":
        var replay = await Receive(queue);
        Check(replay.BasicProperties.MessageId == eventId && replay.Redelivered, "Expected broker redelivery");
        Check(await Consume(replay, false) == "duplicate", "Redelivery credited twice");
        await Publish("malformed-1", "{");
        var malformed = await Receive(queue);
        Check(await Consume(malformed, false) == "rejected", "Expected poison message rejection");
        var rejected = await Receive(deadQueue);
        Check(rejected.BasicProperties.MessageId == "malformed-1" &&
              Encoding.UTF8.GetString(rejected.Body.Span) == "{", "DLQ lost the original message");
        await channel.BasicAckAsync(rejected.DeliveryTag, multiple: false);
        await using (var verify = new NpgsqlCommand("""
            SELECT balance_minor, (SELECT count(*) FROM processed_events),
                   EXISTS (SELECT 1 FROM processed_events WHERE event_id = 'credit-17')
            FROM account WHERE account_id = 1
            """, db))
        await using (var row = await verify.ExecuteReaderAsync())
        {
            Check(await row.ReadAsync() && row.GetInt64(0) == 250 && row.GetInt64(1) == 1 &&
                  row.GetBoolean(2), "PostgreSQL balance or processed event mismatch");
        }
        Check(await channel.MessageCountAsync(queue) == 0 && await channel.MessageCountAsync(deadQueue) == 0,
              "Queues were not drained");
        Console.WriteLine("PASS redelivered=true; balance_minor=250; processed_events=1; DLQ=malformed-1");
        break;
    default: throw new ArgumentException("Use seed, crash or recover");
}

static string Required(string key) => Environment.GetEnvironmentVariable(key)
    ?? throw new InvalidOperationException("Missing " + key);
static void Check(bool ok, string error)
{
    if (!ok) throw new InvalidOperationException(error);
}

internal sealed record Credit(long AmountMinor);
