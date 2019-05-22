## 台灣股票公開申購RSS產生器

此程式會將[公開申購公告TWSE 臺灣證券交易所](http://www.tse.com.tw/zh/page/announcement/publicForm.html)的資料抓下來，並且產生RSS格式的資料，提供訂閱。

### 使用方式

執行爬蟲
```bash
node index.js
```
之後會在目錄中產生`stock-public-form.xml`  
再把這個檔案放到網頁目錄上，即可提供給RSS訂閱器使用