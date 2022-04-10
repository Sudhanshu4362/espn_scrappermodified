const request = require("request");
const cheerio = require("cheerio");
const {gifs} = require("./scorecard");

function getAllMatches(url){
    request(url,cb);
}
function cb(err,res,body){
    if(err){
        console.log("error",err);
    } else{
        extractAllMatchLink(body);
    }
}
function extractAllMatchLink(html){
    let selecTool = cheerio.load(html);
    let scorecardElemArr = selecTool('a[data-hover="Scorecard"]');
    console.log(scorecardElemArr.length);
    for (let i = 0; i < scorecardElemArr.length; i++) {
        let scorecardLink = selecTool(scorecardElemArr[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + scorecardLink;
        gifs(fullLink);
        // break;
    }
}

module.exports = {
    getAllMatches:getAllMatches
}

