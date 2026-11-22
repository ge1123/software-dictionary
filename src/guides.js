export const guides = [
  {
    id: 'payment-timeout',
    title: '付款逾時，這筆可以再扣一次嗎？',
    terms: ['commerce/payment-attempt', 'commerce/payment-pending', 'commerce/payment-reconciliation', 'backend/timeout']
  },
  {
    id: 'rabbitmq-redelivery',
    title: '已入帳卻來不及 ACK，重送會再加一次嗎？',
    terms: ['mq/consumer-ack', 'mq/idempotent-consumer', 'mq/dead-letter-queue', 'dotnet/background-service']
  }
];
