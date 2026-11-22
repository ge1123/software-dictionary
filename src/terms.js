import { examples } from './sql-examples.js';

// slug, English, 中文, 定義, 使用情境
export const sections = {
  '資料模型': [
    ['primary-key','Primary Key','主鍵','唯一識別每一列資料的一個或多個欄位，值不可為 NULL。','訂單明細用 (order_id, line_no) 作為複合主鍵，同一訂單內的行號不能重複。'],
    ['foreign-key','Foreign Key','外鍵','限制子表的參照值必須對應父表中受唯一性約束的鍵。','order_items.order_id 參照 orders.id，可阻止明細指向不存在的訂單。'],
    ['unique','Unique Constraint','唯一約束','由資料庫保證指定欄位組合不會出現重複鍵。NULL 的處理依資料庫而異。','對非空的 (channel_id, external_order_id) 建立唯一約束，避免同一通路訂單重複入庫。'],
    ['null','NULL','空值','表示值未知或缺失。一般比較遇到 NULL 會得到 UNKNOWN。','找尚未付款的訂單可寫 WHERE paid_at IS NULL。'],
    ['normalization','Normalization','正規化','依鍵與資料之間的相依關係拆分資料表，減少重複與更新異常。','供應商地址放在供應商主檔，商品透過 supplier_id 參照。']
  ],
  '查詢與彙總': [
    ['inner-join','INNER JOIN','內部連接','回傳兩邊符合連接條件的資料列組合。','訂單連接明細後，一張含三筆明細的訂單會產生三列。'],
    ['left-join','LEFT JOIN','左外部連接','保留左表的每一列。沒有配對時，右表欄位以 NULL 補齊。','從訂單左連接退款單，可同時列出已退款和從未退款的訂單。'],
    ['group-by','GROUP BY','分組彙總','將相同分組鍵的資料列歸成一組，搭配聚合函式計算各組結果。','財務想知道每個通路各收了多少款項，一個通路只需要一列合計。'],
    ['having','HAVING','篩選群組','在分組後依條件保留群組，可引用聚合結果。','查重複外部單號：GROUP BY external_order_id HAVING COUNT(*) > 1。'],
    ['window','Window Function','視窗函式','在一組相關資料列上計算，同時保留目前每一列。','SUM(amount) OVER (PARTITION BY account_id ORDER BY entry_id ROWS UNBOUNDED PRECEDING) 可計算各帳戶逐筆累計金額。'],
    ['cte','Common Table Expression (CTE)','通用資料表運算式','用 WITH 為單一陳述式內的查詢結果命名。','先以 CTE 彙總各訂單的退款金額，再與訂單主檔連接。']
  ],
  '交易與併發': [
    ['transaction','Transaction','交易','將多項資料庫操作組成可一起提交或回滾的工作單位。','建立付款紀錄與更新訂單付款狀態放在同一交易，任一步失敗就回滾。'],
    ['acid','ACID','交易的四項特性','原子性、一致性、隔離性與持久性，分別描述提交單位、資料約束、並行互動與提交後的保存。','轉帳要同時完成扣款與入帳。餘額規則仍須透過約束或交易邏輯實作。'],
    ['dirty-read','Dirty Read','髒讀','交易讀到其他交易尚未提交的變更。','報表讀到一筆未提交的退款，對方回滾後，報表曾計入的退款消失。'],
    ['non-repeatable-read','Non-repeatable Read','不可重複讀','同一交易再次讀取同一列，因其他交易已提交修改或刪除而得到不同結果。','兩次查詢同一訂單的金額，中途有人提交調價。'],
    ['phantom-read','Phantom Read','幻讀','同一交易重做相同條件查詢時，其他交易提交的變更使符合條件的資料列集合改變。','兩次查待出貨訂單，第二次多出另一交易剛新增的訂單。'],
    ['lost-update','Lost Update','遺失更新','兩個交易根據同一舊值計算後寫回，後寫入的值覆蓋先前更新。','兩人各從庫存 10 算出 9 並寫回，兩次扣庫存只留下扣一次的結果。'],
    ['write-skew','Write Skew','寫入偏差','並行交易依同一組舊資料做決策，各自修改不同列，合併後破壞跨列規則。','兩名值班者都看到另一人在班，各自將自己改為休假，最後無人值班。'],
    ['deadlock','Deadlock','死鎖','交易形成循環等待，每個交易都等另一個釋放資源。','交易 A 鎖訂單再等庫存，交易 B 鎖庫存再等訂單。統一鎖定順序可減少這類死鎖。'],
    ['conditional-update','Conditional Update','條件式更新','在同一個 UPDATE 內檢查條件並更新符合的列。','庫存只剩一件時，兩個櫃台同時結帳，系統必須判斷哪一筆成功保留商品。']
  ],
  '索引與效能': [
    ['index','Index','索引','維護額外的資料結構，協助資料庫找到符合條件的列。更新資料也可能需要維護索引。','常用訂單編號查詢時，可替 order_no 建索引並檢查執行計畫。'],
    ['composite-index','Composite Index','複合索引','以多個欄位作為同一索引的鍵。鍵的排列順序會影響可利用的查詢方式。','索引 (channel_id, created_at) 可支援指定通路後依日期範圍查訂單。'],
    ['execution-plan','Execution Plan','執行計畫','資料庫為 SQL 選擇的執行步驟，例如掃描、連接、排序與彙總。','報表突然變慢時，可比較估計與實際列數，定位哪個步驟處理的資料比預期多。'],
    ['covering-index','Covering Index','涵蓋索引','對特定查詢而言，索引已含所需欄位，具備只從索引取得欄位值的條件。','SQL Server 的索引可用 INCLUDE (amount) 帶上報表要讀取的金額。']
  ]
};
const properties = {
  acid: [
    ['Atomicity · 原子性', '扣款與入帳放在同一筆交易。若入帳失敗，扣款也一併回滾。'],
    ['Consistency · 一致性', '交易提交後，資料仍須滿足已定義的規則，例如訂單明細必須指向有效的訂單。'],
    ['Isolation · 隔離性', '隔離等級決定並行交易能看到哪些變更。例如在 Read Committed 下，報表讀不到尚未提交的扣款。'],
    ['Durability · 持久性', '在同步持久化設定下，一旦資料庫確認提交成功，當機後仍可復原該筆交易。']
  ]
};

export const terms = Object.entries(sections).flatMap(([category, rows]) =>
  rows.map(([id, en, zh, definition, example]) => ({ id, en, zh, definition, example, category, sqlExample: examples[id], ...(properties[id] && { properties: properties[id] }) }))
);

// Store each relationship once. Both entries use it for navigation.
export const relations = [
  ['conditional-update', 'lost-update'],
  ['conditional-update', 'transaction'],
  ['lost-update', 'write-skew'],
  ['left-join', 'inner-join'],
  ['left-join', 'null'],
  ['group-by', 'having'],
  ['group-by', 'window']
];

export function relatedTerms(id) {
  const neighbors = relations.filter(pair => pair.includes(id)).flat();
  return terms.filter(term => term.id !== id && neighbors.includes(term.id));
}
