const express = require('express');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');

// Production port
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var getCookieJSON = function(cookieString) {

    var cookieArray = cookieString.split('; ');
    var cookies = [];

    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = {};
        var cookieElement = cookieArray[i].split('=');
        cookie.name = cookieElement[0];
        cookie.value = cookieElement[1];
        cookie.domain = "localhost";
        cookies.push(cookie);
    }

    return cookies;
};

app.get('/pdfgenerator/submit/:url', function (req, res) {

    console.log('submit accessed');
    console.dir(req);

    var cookies = getCookieJSON(req.headers.cookie);
    var url = req.params.url;

    var uniquePdfID = urlToPdf(url, cookies);
    res.send(uniquePdfID);
});

var urlToPdf = function(url, cookies) {

    console.log('url to pdf accessed');

    var pdfName = Math.random().toString().replace('0.', '') + '.pdf';

    (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    for(var i=0; i<cookies.length; i++) {
        var cookie = cookies[i];
        await page.setCookie(cookie);
    }
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

var server = app.listen(port, function () {
	console.log('Server is running on port '+ port);
});