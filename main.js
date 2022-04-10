let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const request = require("request");
const cheerio = require("cheerio");
const allMatchobj = require("./allMatch");
const fs = require("fs");
const path = require("path");

request(url,cb);

function cb(err,res,body){
    if(err){
        console.log("error",err);
    } else{
        handleHtml(body);
    }
}
let iplPath = path.join(__dirname,"IPL");
if(!fs.existsSync(iplPath)){
    fs.mkdirSync(iplPath);
}
function handleHtml(html){
    let selecTool = cheerio.load(html);
    let anchorElem = selecTool('a[data-hover="View All Results"]');
    //attr method -> Method for getting attributes. Gets the attribute value
    let relativeLink = anchorElem.attr("href");
    // console.log(relativeLink);
    let fullLink = "https://www.espncricinfo.com" + relativeLink;
    // console.log(fullLink);

    allMatchobj.getAllMatches(fullLink);
}