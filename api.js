const express = require('express');
const cors = require('cors');
const fs = require('fs');
const DiscordLogger = require('node-discord-logger').default;
const os = require('os')
const geoip = require('geoip-country');

const logger = new DiscordLogger({
  hook: 'https://discord.com/api/webhooks/1128638927654371389/mk1cFfGZ1ZtUY4-jVhNSEb6bz1Z3a2lr50D35sOr10VGughpEqy1kaqKPnPoPWmeQ4mh',
  serviceName: 'Aeromobil News API', // optional, will be included as text in the footer
  defaultMeta: {                    // optional, will be added to all the messages
    'Process ID': process.pid,
    Host: os.hostname(),            // import os from 'os';
  },
  errorHandler: err => {            // optional, if you don't want this library to log to console
    console.error('error from discord', err);
  }
});

//creating an API
const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', true)

//------------------------------------------------------------------------

//Default Page
const Welcome_NoKey_txt = fs.readFileSync("./Text/Welcome_NoKey.txt");
app.get("/", (req, res) => {
    res.write(Welcome_NoKey_txt);
    res.end();
});

//Get News
app.get("/news", (req, res) => {
    const NewsJson = fs.readFileSync("./JSON/news.json", "utf8");
    res.write(NewsJson);
    res.end();
});

//Main API Page
const Welcom_txt = fs.readFileSync("./Text/Welcome.txt");
app.get("/:key", (req, res) => {
    if(req.params.key != "favicon.ico" && req.params.key.length > 0){
        if(req.params.key == process.env.key && geoip.lookup(req.ip).country == process.env.Country){
            res.write(Welcom_txt);
        } 
        else {
            res.write("Error");
            logger.warn({ 
                message: "IP - " + req.ip + " From " + geoip.lookup(req.ip).country + " tried to access the API",
                description: "Key - " + req.params.key
            });
        }
    }
    res.end();
});

//Remove Function
app.get("/:key/:func/:title", (req, res) => {
    const News = JSON.parse(fs.readFileSync("./JSON/news.json", "utf8"))
    if(req.params.key != "favicon.ico" && req.params.key.length > 0){
        if(req.params.key == process.env.key && geoip.lookup(req.ip).country == process.env.Country){
            if(req.params.func == "remove") {
                if(News.filter(obj => obj.title == req.params.title).length > 0){
                    res.write(JSON.stringify(News.filter(obj => obj.title == req.params.title)));
                    fs.writeFileSync('./JSON/news.json', JSON.stringify(News.filter(obj => obj.title !== req.params.title), null, 4));
                    logger.error({
                        message: 'News With The Title "' + req.params.title + '" Got Removed!',
                        description: "Removed By: " + req.ip + " From " + geoip.lookup(req.ip).country + "\nNew JSON:" + "\n```JSON\n" + JSON.stringify(News.filter(obj => obj.title !== req.params.title), null, 4) + "\n```"
                    });
                }
                else res.write("News With The Title " + '"' + req.params.title + '"' + " Dose Not Exist.");
            }    
            else res.write("There Is No " + '"' + req.params.func + '"' + " Function.");
        } 
        else {
            res.write("Error");
            logger.warn({ 
                message: "IP - " + req.ip + " From " + geoip.lookup(req.ip).country + " tried to access the API" ,
                description: "Key - " + req.params.key + "\nFunction - " + req.params.func
            });
        }
    }
    res.end();
});


//Add Function
app.get("/:key/:func/:title/:content/:date/:time/:color", (req, res) => {
    const News = JSON.parse(fs.readFileSync("./JSON/news.json", "utf8"))
    if(req.params.key != "favicon.ico" && req.params.key.length > 0){
        if(req.params.key == process.env.key && geoip.lookup(req.ip).country == process.env.Country){
            if(req.params.func == "add") {
                News.push({
                    "text": "test"
                })
                fs.writeFileSync('./JSON/news.json', JSON.stringify(News), null, 4);
            }    
            else res.write("There Is No " + '"' + req.params.func + '"' + " Function.");
        } 
        else {
            res.write("Error");
            logger.warn({ 
                message: "IP - " + req.ip + " From " + geoip.lookup(req.ip).country + " tried to access the API" ,
                description: "Key - " + req.params.key + "\nFunction - " + req.params.func
            });
        }
    }
    res.end();
});

//------------------------------------------------------------------------

var listener = app.listen(8080, function () {
    console.log("Listening on port " + listener.address().port);
    console.log("Link: https://yanivnadell-reimagined-space-yodel-rv6g6vvg7wr2xv75-" + listener.address().port + ".preview.app.github.dev/");
});
