const express = require('express');

const https = require('https');
const fs = require('fs');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');

// Production port
const port = process.env.PORT || 8041;

app.use(cors());
app.use(express.static('public'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/pdfgenerator/submit/:url', function (req, res) {
   console.log("Accessed");

    var url = req.params.url;

    var uniquePdfID = urlToPdf(url);
    res.send(uniquePdfID);
});

var urlToPdf = function(url) {

    console.log('url to pdf accessed');

    var pdfName = Math.random().toString().replace('0.', '') + '.pdf';

    (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({'uacp_internal_app':'pdfgenerator'});

    await page.goto(url, {waitUntil: 'networkidle2'});

    await page.pdf({
        path: 'public/' + pdfName,
        format: 'A4',
        displayHeaderFooter: true,
        margin: {
            top: "1cm",
            left: "1cm",
            right: "1cm",
            bottom: "1cm"
        }
    });

    await browser.close();

    })();

    return pdfName;
};

var options = {
    key: fs.readFileSync('pdf.key'),
    cert: fs.readFileSync('pdf.crt')
};

var server = https.createServer(options, app);
console.log('Listen to port' + port);
server.listen(port);
