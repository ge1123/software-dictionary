# ER 圖盤點 · 2026-11-22

共 180 張。圖集有 176 張 PostgreSQL 實作圖與 2 張概念圖，分批出貨教學另有 2 張。下表的方案字母連到對應的圖。

以訂單頁修正後的版本作為盤點起點，逐圖比對文字、線條與資料表邊界。33 張圖出現端點數量壓進表框，部分也壓到欄位或連線。表格最後一欄列出這些方案。修正後，每條外鍵的數量與欄位共用標籤，複合外鍵依宣告順序逐行顯示。[盤點起點](https://github.com/ge1123/software-dictionary/commit/30ec402d09cf83bb3378ac6d7eedc4f79a4d6be9)

67 章固定版 SQL 已在 PostgreSQL 18.7 重跑，並核對實驗結束時的系統目錄。修正後的 180 張圖各以 360、1280 CSS 像素寬度在 Chrome 驗收，檢查文字相交、表框與圖面邊界、連線穿字及捲動範圍。[驗收紀錄](https://github.com/ge1123/software-dictionary/actions/runs/45032113237)

## 資料模型設計

| 章節 | 方案圖 | 數量標籤曾壓進表框的方案 |
| --- | --- | --- |
| 01 公司與業務角色 | [A](https://ge1123.github.io/software-dictionary/models/core-01-business-parties/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-01-business-parties/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-01-business-parties/#c) | C |
| 02 商品與 SKU | [A](https://ge1123.github.io/software-dictionary/models/core-02-product-sku/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-02-product-sku/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-02-product-sku/#c) | C |
| 03 通路價格 | [A](https://ge1123.github.io/software-dictionary/models/core-03-channel-pricing/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-03-channel-pricing/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-03-channel-pricing/#c) | B、C |
| 04 級距與有效期 | [A](https://ge1123.github.io/software-dictionary/models/core-04-tiered-effective-pricing/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-04-tiered-effective-pricing/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-04-tiered-effective-pricing/#c) | — |
| 05 訂單快照 | [A](https://ge1123.github.io/software-dictionary/models/core-05-order-snapshots/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-05-order-snapshots/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-05-order-snapshots/#c) | — |
| 06 分批出貨 | [A](https://ge1123.github.io/software-dictionary/models/core-06-split-shipments/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-06-split-shipments/#b) | B |
| 07 庫存預留 | [A](https://ge1123.github.io/software-dictionary/models/core-07-inventory-reservations/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-07-inventory-reservations/#b) | — |
| 08 庫存流水 | [A](https://ge1123.github.io/software-dictionary/models/core-08-inventory-ledger/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-08-inventory-ledger/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-08-inventory-ledger/#c) | — |
| 09 付款與退款 | [A](https://ge1123.github.io/software-dictionary/models/core-09-payments-refunds/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-09-payments-refunds/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-09-payments-refunds/#c) | B、C |
| 10 票券核銷 | [A](https://ge1123.github.io/software-dictionary/models/core-10-voucher-redemption/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-10-voucher-redemption/#b) | — |
| 11 分潤與結算 | [A](https://ge1123.github.io/software-dictionary/models/core-11-commission-settlement/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-11-commission-settlement/#b) | B |
| 12 重送與冪等 | [A](https://ge1123.github.io/software-dictionary/models/core-12-order-idempotency/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-12-order-idempotency/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-12-order-idempotency/#c) | — |
| 13 多租戶隔離 | [A](https://ge1123.github.io/software-dictionary/models/core-13-tenant-isolation/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-13-tenant-isolation/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-13-tenant-isolation/#c) | B |
| 14 資料異動稽核 | [A](https://ge1123.github.io/software-dictionary/models/core-14-change-audit/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-14-change-audit/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-14-change-audit/#c) | — |
| 15 識別碼與唯一性 | [A](https://ge1123.github.io/software-dictionary/models/core-15-identity-uniqueness/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-15-identity-uniqueness/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-15-identity-uniqueness/#c) | — |
| 16 刪除與封存 | [A](https://ge1123.github.io/software-dictionary/models/core-16-deletion-archiving/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-16-deletion-archiving/#b) | B |
| 17 地址與預設值 | [A](https://ge1123.github.io/software-dictionary/models/core-17-addresses-defaults/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-17-addresses-defaults/#b) | B |
| 18 商品子類型 | [A](https://ge1123.github.io/software-dictionary/models/core-18-product-subtypes/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-18-product-subtypes/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-18-product-subtypes/#c) | B |
| 19 動態屬性 | [A](https://ge1123.github.io/software-dictionary/models/core-19-dynamic-attributes/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-19-dynamic-attributes/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-19-dynamic-attributes/#c) | — |
| 20 訂單狀態模型 | [A](https://ge1123.github.io/software-dictionary/models/core-20-order-state-model/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-20-order-state-model/#b) | B |
| 21 核准流程 | [A](https://ge1123.github.io/software-dictionary/models/core-21-approval-workflow/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-21-approval-workflow/#b) | B |
| 22 促銷適用範圍 | [A](https://ge1123.github.io/software-dictionary/models/core-22-promotion-targets/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-22-promotion-targets/#b) | B |
| 23 業務與系統時間 | [A](https://ge1123.github.io/software-dictionary/models/core-23-business-system-time/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-23-business-system-time/#b) | — |
| 24 更正與沖回 | [A](https://ge1123.github.io/software-dictionary/models/core-24-corrections-reversals/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-24-corrections-reversals/#b) | — |
| 25 金額與幣別 | [A](https://ge1123.github.io/software-dictionary/models/core-25-money-currency-rounding/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-25-money-currency-rounding/#b) | — |
| 26 外部編號映射 | [A](https://ge1123.github.io/software-dictionary/models/core-26-external-identifiers/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-26-external-identifiers/#b) | B |
| 27 批次匯入 | [A](https://ge1123.github.io/software-dictionary/models/core-27-import-staging/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-27-import-staging/#b) | — |
| 28 報表模型 | [A](https://ge1123.github.io/software-dictionary/models/core-28-reporting-models/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-28-reporting-models/#b) · [C](https://ge1123.github.io/software-dictionary/models/core-28-reporting-models/#c) | — |
| 29 Schema 演進 | [A](https://ge1123.github.io/software-dictionary/models/core-29-schema-evolution/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-29-schema-evolution/#b) | — |
| 30 RBAC 角色權限 | [A](https://ge1123.github.io/software-dictionary/models/core-30-rbac/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-30-rbac/#b) | B |
| 31 租戶自訂角色 | [A](https://ge1123.github.io/software-dictionary/models/core-31-tenant-custom-roles/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-31-tenant-custom-roles/#b) | A、B |
| 32 跨租戶成員身分 | [A](https://ge1123.github.io/software-dictionary/models/core-32-tenant-memberships/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-32-tenant-memberships/#b) | B |
| 33 資料授權範圍 | [A](https://ge1123.github.io/software-dictionary/models/core-33-authorization-scopes/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-33-authorization-scopes/#b) | A |
| 34 ABAC 屬性政策 | [A](https://ge1123.github.io/software-dictionary/models/core-34-abac-policies/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-34-abac-policies/#b) | B |
| 35 期限與代理授權 | [A](https://ge1123.github.io/software-dictionary/models/core-35-temporary-delegation/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-35-temporary-delegation/#b) | B |
| 36 職務分離 | [A](https://ge1123.github.io/software-dictionary/models/core-36-separation-of-duties/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-36-separation-of-duties/#b) | B |
| 37 授權判斷稽核 | [A](https://ge1123.github.io/software-dictionary/models/core-37-authorization-audit/#a) · [B](https://ge1123.github.io/software-dictionary/models/core-37-authorization-audit/#b) | — |

## 電商交易模組

| 章節 | 方案圖 | 數量標籤曾壓進表框的方案 |
| --- | --- | --- |
| 01 會員與購買人 | [A](https://ge1123.github.io/software-dictionary/models/commerce-01-customer/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-01-customer/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-01-customer/#c) | — |
| 02 商品與規格 | [A](https://ge1123.github.io/software-dictionary/models/commerce-02-product-sku/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-02-product-sku/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-02-product-sku/#c) | C |
| 03 分類與通路上架 | [A](https://ge1123.github.io/software-dictionary/models/commerce-03-catalog-channel/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-03-catalog-channel/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-03-catalog-channel/#c) | B |
| 04 售價與價表 | [A](https://ge1123.github.io/software-dictionary/models/commerce-04-pricing/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-04-pricing/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-04-pricing/#c) | B |
| 05 購物車 | [A](https://ge1123.github.io/software-dictionary/models/commerce-05-cart/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-05-cart/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-05-cart/#c) | C |
| 06 促銷活動 | [A](https://ge1123.github.io/software-dictionary/models/commerce-06-promotion/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-06-promotion/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-06-promotion/#c) | — |
| 07 優惠券 | [A](https://ge1123.github.io/software-dictionary/models/commerce-07-coupon/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-07-coupon/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-07-coupon/#c) | — |
| 08 點數折抵與贈點 | [A](https://ge1123.github.io/software-dictionary/models/commerce-08-loyalty-points/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-08-loyalty-points/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-08-loyalty-points/#c) | C |
| 09 購物金與禮物卡 | [A](https://ge1123.github.io/software-dictionary/models/commerce-09-store-credit/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-09-store-credit/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-09-store-credit/#c) | — |
| 10 結帳與報價 | [A](https://ge1123.github.io/software-dictionary/models/commerce-10-checkout/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-10-checkout/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-10-checkout/#c) | — |
| 11 訂單主檔與明細 | [A](https://ge1123.github.io/software-dictionary/models/commerce-11-order/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-11-order/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-11-order/#c) | — |
| 12 訂單金額與分攤 | [A](https://ge1123.github.io/software-dictionary/models/commerce-12-order-amount/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-12-order-amount/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-12-order-amount/#c) | — |
| 13 訂單地址與收件人 | [A](https://ge1123.github.io/software-dictionary/models/commerce-13-order-address/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-13-order-address/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-13-order-address/#c) | C |
| 14 訂單狀態與變更 | [A](https://ge1123.github.io/software-dictionary/models/commerce-14-order-state/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-14-order-state/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-14-order-state/#c) | — |
| 15 庫存 | [A](https://ge1123.github.io/software-dictionary/models/commerce-15-inventory/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-15-inventory/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-15-inventory/#c) | — |
| 16 庫存保留 | [A](https://ge1123.github.io/software-dictionary/models/commerce-16-inventory-reservation/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-16-inventory-reservation/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-16-inventory-reservation/#c) | C |
| 17 付款 | [A](https://ge1123.github.io/software-dictionary/models/commerce-17-payment/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-17-payment/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-17-payment/#c) | — |
| 18 退款 | [A](https://ge1123.github.io/software-dictionary/models/commerce-18-refund/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-18-refund/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-18-refund/#c) | — |
| 19 履約分配 | [A](https://ge1123.github.io/software-dictionary/models/commerce-19-fulfillment/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-19-fulfillment/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-19-fulfillment/#c) | — |
| 20 包裹與物流 | [A](https://ge1123.github.io/software-dictionary/models/commerce-20-shipping/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-20-shipping/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-20-shipping/#c) | — |
| 21 取消訂單 | [A](https://ge1123.github.io/software-dictionary/models/commerce-21-cancellation/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-21-cancellation/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-21-cancellation/#c) | — |
| 22 退貨與驗收 | [A](https://ge1123.github.io/software-dictionary/models/commerce-22-return/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-22-return/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-22-return/#c) | — |
| 23 換貨 | [A](https://ge1123.github.io/software-dictionary/models/commerce-23-exchange/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-23-exchange/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-23-exchange/#c) | — |
| 24 發票與折讓 | [A](https://ge1123.github.io/software-dictionary/models/commerce-24-invoice/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-24-invoice/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-24-invoice/#c) | — |
| 25 賣家分潤與結算 | [A](https://ge1123.github.io/software-dictionary/models/commerce-25-seller-settlement/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-25-seller-settlement/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-25-seller-settlement/#c) | — |
| 26 金流對帳 | [A](https://ge1123.github.io/software-dictionary/models/commerce-26-reconciliation/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-26-reconciliation/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-26-reconciliation/#c) | C |
| 27 訂閱與定期購 | [A](https://ge1123.github.io/software-dictionary/models/commerce-27-subscription/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-27-subscription/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-27-subscription/#c) | — |
| 28 外部系統編號與同步 | [A](https://ge1123.github.io/software-dictionary/models/commerce-28-external-reference/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-28-external-reference/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-28-external-reference/#c) | — |
| 29 冪等與事件一致性 | [A](https://ge1123.github.io/software-dictionary/models/commerce-29-idempotency-events/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-29-idempotency-events/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-29-idempotency-events/#c) | — |
| 30 操作稽核與歷史 | [A](https://ge1123.github.io/software-dictionary/models/commerce-30-audit-history/#a) · [B](https://ge1123.github.io/software-dictionary/models/commerce-30-audit-history/#b) · [C](https://ge1123.github.io/software-dictionary/models/commerce-30-audit-history/#c) | C |

## 分批出貨獨立案例

| 方案 | 核對結果 |
| --- | --- |
| [A · 訂單明細摘要](https://ge1123.github.io/software-dictionary/cases/split-shipments/#model-a) | 單表的全部欄位、型別及主鍵與方案 A 的實驗一致。 |
| [B · 出貨單與明細](https://ge1123.github.io/software-dictionary/cases/split-shipments/#model-b) | 補上 SKU、供應商及出貨明細的外鍵標記，核對四張核心表間的連線與兩端數量。 |
