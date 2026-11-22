# Software Dictionary

[開啟軟體工程詞典](https://ge1123.github.io/software-dictionary/)

以繁體中文查英文工程名詞。可依分類或關鍵字搜尋，點詞條閱讀定義、實際情境、程式範例與雙向參照。

## 補充內容

| 工作 | 入口 |
| --- | --- |
| 編輯現有 SQL 詞條 | [SQL 詞庫](src/domains/sql.json) |
| 確認用詞、版面、範例及關係的寫法 | [詞條維護規範](AGENTS.md) |
| 新增領域 | 複製 [領域樣板](templates/domain.json) 到 src/domains，再加入 [領域清單](src/terms.js) |

首頁以主題索引卡進入 SQL、後端、.NET 後端、Redis 與 MQ 詞庫。Infra、FAE、Frontend、Browser、資安列在規劃區；領域加入 domains 後，自動顯示可開啟的索引卡及實際詞條數。

## 開發與部署

使用 Node.js 22.12 或以上版本。

```sh
npm ci
npm run dev
```

`npm run check` 驗證詞條、範例欄位與雙向參照，`npm run build` 產生靜態站。GitHub Actions 檢查 pull request，main 通過建置後自動部署至 GitHub Pages。
