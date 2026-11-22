# Software Dictionary

繁體中文軟體工程詞典。第一版收錄 SQL 名詞，每個詞條包含英文名稱、中文定義與使用情境。

[開啟 SQL 詞典](https://ge1123.github.io/software-dictionary/)

使用 Node.js 22.12 以上版本。執行 `npm ci` 安裝套件，`npm run dev` 啟動開發站，`npm run check` 檢查詞條，`npm run build` 建立靜態網站。詞條資料位於 `src/terms.js`。

GitHub Actions 會檢查 pull request，main 通過檢查及建置後會部署到 GitHub Pages。部署來源使用 GitHub Actions。
