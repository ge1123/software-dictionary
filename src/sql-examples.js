// Each example describes its starting data and the result to look for.
export const examples = {
  'conditional-update': {
    setup: 'inventory 的 sku_id 是主鍵。假設商品 42 只剩 1 件，兩個櫃台各要買 1 件。',
    sql: `UPDATE inventory
SET available = available - 1
WHERE sku_id = 42 AND available >= 1;`,
    result: '在 SQL Server 的 READ COMMITTED 下，第一筆成功交易更新 1 列，庫存變成 0。第二筆更新 0 列。應用程式要檢查受影響列數，再決定是否接受訂單。'
  },
  'lost-update': {
    setup: '商品 42 有 10 件庫存。在 SQL Server 開兩個連線，使用 READ COMMITTED，按註解順序逐步執行。',
    sql: `-- ① 連線 A：讀到 10
BEGIN TRANSACTION;
SELECT available FROM inventory WHERE sku_id = 42;

-- ② 連線 B：也讀到 10
BEGIN TRANSACTION;
SELECT available FROM inventory WHERE sku_id = 42;

-- ③ 連線 A：程式用先前讀到的 10 減 1
UPDATE inventory SET available = 9 WHERE sku_id = 42;
COMMIT;

-- ④ 連線 B：也用先前讀到的 10 減 1
UPDATE inventory SET available = 9 WHERE sku_id = 42;
COMMIT;`,
    result: '兩筆扣庫存都提交了，庫存卻是 9，正確結果應為 8。點「條件式更新」查看怎麼讓資料庫用當下的庫存扣減。'
  },
  'left-join': {
    setup: 'orders 有訂單 101、102。refunds 只有一筆退款，id 為 7，屬於訂單 101。',
    sql: `SELECT o.id AS order_id, r.id AS refund_id
FROM orders AS o
LEFT JOIN refunds AS r ON r.order_id = o.id
ORDER BY o.id;`,
    result: '回傳 (101, 7) 和 (102, NULL)。訂單 102 沒有退款，仍出現在清單中。換成 INNER JOIN 就只剩第一列。'
  },
  'group-by': {
    setup: 'payments 有三筆付款：通路 A 收到 100 元與 50 元，通路 B 收到 80 元。',
    sql: `SELECT channel_id, SUM(amount) AS total
FROM payments
GROUP BY channel_id
ORDER BY channel_id;`,
    result: '輸出兩列：(A, 150)、(B, 80)。如果報表只想看合計達 100 元的通路，接著查 HAVING。'
  },
  having: {
    setup: '沿用通路 A 收到 100 元與 50 元、通路 B 收到 80 元的付款資料。',
    sql: `SELECT channel_id, SUM(amount) AS total
FROM payments
GROUP BY channel_id
HAVING SUM(amount) >= 100;`,
    result: '只留下 (A, 150)。若改成 WHERE amount >= 100，會先排除 50 元那筆付款，A 的合計會變成 100。'
  }
};
