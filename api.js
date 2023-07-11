const express = require("express");
const cors = require("cors");
const fs = require("fs");

//creating an API
const app = express();
app.use(cors());
app.use(express.json());

//------------------------------------------------------------------------

const NewsJson = fs.readFileSync("./JSON/news.json", "utf8");
app.get("/", (req, res) => {
    res.write(NewsJson);
    res.end();
});

//------------------------------------------------------------------------

var listener = app.listen(8080, function () {
    console.log("Listening on port " + listener.address().port);
    console.log("Link: https://yanivnadell-reimagined-space-yodel-rv6g6vvg7wr2xv75-" + listener.address().port + ".preview.app.github.dev/");
});
