// Intel Edisonからセンサーを扱うのに便利なのがmraaというライブラリです。
// 今回は使いませんが。
var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion());

// ファイルを読み込むのに使うライブラリがfsです。
var fs = require('fs');

// URL周りの処理（パースなど）を行うのがurlです。
var url = require('url');

// mBaaSを扱う準備です。
var NCMB = require('ncmb');

var application_key = "21404b8a6513de18a4de7906de121d390ffbc8e1f5f95d48d08be2b1b6e74f98",
    client_key = "92eb83e40559574935e8175c3dcaa56ab49bb8147bc904626a484ef1bc28c1f3";
// アプリケーションキーとクライアントキーで初期化します
var ncmb = new NCMB(application_key, client_key);
// 再度データストアでMessageクラスを準備します。データベースのテーブル相当です。
var Message = ncmb.DataStore("Message");

// HTTP サーバを準備します。
var http = require('http');

// ここではごくごく簡単なHTTPサーバを設定します。
http.createServer(function (req, res) {
    // ブラウザからのアクセスがあるとここの処理に入ります。
    // ↓URLにlightsensorという文字があるかどうかチェックしています。
    if (req.url.indexOf('lightsensor') != -1) {
      // lightsensorという文字があればこちらの処理
      // HTMLを返します、と宣言します
      res.writeHead(200, {'Content-Type': 'text/html'});
      // lightsensor.htmlというファイルを読み込みます
      var lightSensorPage = fs.readFileSync('./lightsensor.html');
      // 読み込んだファイルの内容をそのまま返します
      res.end(lightSensorPage);
    // こちらはURLにmessageという文字があるかどうかチェックしています
    } else if (req.url.indexOf('message') != -1) {
      // messageという文字があればこちらの処理
      // URLのクエリパラメータをチェックしています。（http://example.com/?hello=world といった時の?以降）
      var queryObject = url.parse(req.url,true).query;
      // メッセージを作成します。
      var message = new Message();
      // textカラムにクエリパラメータのmessageをセットします
      message.set("text", queryObject['message']);
      var data = fs.readFileSync("/etc/hostname");
      message.set("name", data.toString('ascii', 0, data.length));
      // 保存処理の実行
      message.save()
        // 保存処理が成功した場合はこちら
        .then(function() {
          // メッセージを返して終わり
          res.end(JSON.stringify({message: "Save sucessful. Check console panel."}));
        })
        // 保存処理が失敗した場合はこちら
        .catch(function(err) {
          // エラーメッセージを出力
          console.error("Error: ", err);
        });
    // その他、JavaScript SDKを指定された場合
    } else if (req.url.indexOf('ncmb.min.js') != -1) {
      // Webブラウザ用のJavaScript SDKを返します
      res.end(fs.readFileSync("./node_modules/ncmb/ncmb.min.js"));
    }
}).listen(1337);
