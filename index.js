const fs = require('fs');
const axios = require('axios');
const iconv = require('iconv-lite');
const RSS = require('rss');

//臺灣證券交易所 公開申購公告-抽籤日程表 網頁
const SITE_URL = 'https://www.twse.com.tw/zh/announcement/public.html';
//臺灣證券交易所 公開申購公告-抽籤日程表 CSV 下載
const CSV_URL = `https://www.twse.com.tw/rwd/zh/announcement/publicForm?response=csv&date=${new Date().getFullYear()}0101`;
//RSS XML檔案名稱
const RSS_FILENAME = 'stock-public-form.xml';

axios.get(CSV_URL, {
    responseType: 'arraybuffer', //因為後面用iconv.decode需要buffer，所以這邊要設定成arraybuffer
})
    .catch(err => {
        console.error('ERROR:', err);
    })
    .then(res => {
        //下載到的CSV是big5編碼，轉成utf8方便處理
        const content = iconv.decode(res.data, 'big5');

        //產生RSS
        let feed = new RSS({
            title: '台灣股票公開申購',
            description: '台灣股票公開申購RSS',
            site_url: SITE_URL,
            language: 'zh-TW',
            pubDate: (new Date).toUTCString(),
        });

        //逐行處理資料
        content.split('\n').forEach(line => {
            //空白行就不處理
            if (0 === line.trim()) {
                return false;
            }

            //跳過公債的資料
            if (line.indexOf('公債') > -1) {
                return false;
            }

            //處理每個欄位的資料
            const cols = line.substr(1, line.length - 2).split('","');
            //如果欄位數量太少，表示可能是說明文字，而非申購標的
            if (cols.length < 17) {
                return false;
            }

            //第1欄是序號，用這個來判斷是否為申購標的
            if (isNaN(parseInt(cols[0]))) {
                return false;
            }

            //申購開始日當作每個item的日期
            let ymd = cols[5].split('/').map(Number);
            ymd[0] += 1911; //民國年轉西元年

            //日期字串
            const date = (new Date(ymd[0], ymd[1] - 1, ymd[2], 8, 0, 0)).toUTCString();

            //用第一筆資料的日期，當作RSS的pubDate
            if (0 === feed.items.length) {
                feed.pubDate = date;
            }

            //加入RSS Item
            feed.item({
                title: `${cols[3]} ${cols[2]} 申購期間 ${cols[5]}~${cols[6]} 承銷價 ${cols[9]}`,
                description: `抽籤日 ${cols[1]} ${cols[3]} ${cols[2]} ${cols[4]} 申購期間 ${cols[5]}~${cols[6]} 承銷股數 ${cols[7]} 承銷價 ${cols[9]}`,
                url: SITE_URL,
                guid: `${cols[3]} ${cols[2]} ${cols[4]}`,
                date: date,
            });
        });

        //寫入檔案
        fs.writeFile(RSS_FILENAME, feed.xml(), (err) => {
            if (err) {
                console.error('ERROR:', err);
            } else {
                console.log(`${RSS_FILENAME} has been saved!`);
            }
        });
    });

