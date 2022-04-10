const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

function getInfoFromScorecard(url) {
  request(url, cb);
}


function cb(err,res,body) {
    if (err) {
        console.log(err);
    }
    else if (res.statusCode == 404) {
      console.log("Page not found");
    }
    else {
        getMatchDetails(body);
    }
}

function getMatchDetails(html) {
  let selecTool = cheerio.load(html);

  //1. get venue
  //2. get date
  let desc = selecTool(".match-header-info.match-info-MATCH");

    let descArr = desc.text().split(",");
    let dateOfMatch = descArr[2];
    let venueOfMatch = descArr[1];
    console.log(dateOfMatch);
    console.log(venueOfMatch);
    //3. get result
      let matchResEle = selecTool(
        ".match-info.match-info-MATCH.match-info-MATCH-half-width>.status-text"
      );
  let matchResult = matchResEle.text();;
      console.log(matchResult);
  //4. get team names
  let teamNameArr = selecTool(".name-detail>.name-link");
  // console.log(teamNames.text());
  let ownTeam = selecTool(teamNameArr[0]).text();
  let opponentTeam = selecTool(teamNameArr[1]).text();
  // console.log(ownTeam);
  // console.log(opponentTeam);

  //5. get innings 

  let allBatsmenTable = selecTool(".table.batsman tbody");
  for (let i = 0; i < allBatsmenTable.length; i++) {
    let allRows = selecTool(allBatsmenTable[i]).find("tr");
    if (i == 1) {
      let temp = ownTeam;
      ownTeam = opponentTeam;
      opponentTeam = temp;
    }
    console.log(ownTeam);
    console.log(opponentTeam);
    for (let i = 0; i < allRows.length; i++) {
      
      let row = selecTool(allRows[i]);
      let firstColmnOfRow = row.find("td")[0];
      if (selecTool(firstColmnOfRow).hasClass("batsman-cell")) {
        let pn = selecTool(row.find("td")[0]).text().split("");
        let playerName = "";
        if (pn.includes("(")) {
          playerName = pn.join("").split("(")[0];
        } else if (pn.includes("†")) {
          playerName = pn.join("").split("†")[0];
        } else playerName = pn.join("");
        let runs = selecTool(row.find("td")[2]).text();
        let balls = selecTool(row.find("td")[3]).text();
        let numberOf4 = selecTool(row.find("td")[5]).text();
        let numberOf6 = selecTool(row.find("td")[6]).text();
        let sr = selecTool(row.find("td")[7]).text();

        console.log(
          `playerName -> ${playerName} runsScored ->  ${runs} ballsPlayed ->  ${balls} numbOfFours -> ${numberOf4} numbOfSixes -> ${numberOf6}  strikeRate-> ${sr}`
        );

        processInformation(
          dateOfMatch,
          venueOfMatch,
          matchResult,
          ownTeam,
          opponentTeam,
          playerName,
          runs,
          balls,
          numberOf4,
          numberOf6,
          sr
        );

        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      }
    }
  }

  function processInformation(dateOfMatch,venueOfMatch,matchResult,ownTeam,opponentTeam,playerName,runs,balls,numberOf4,numberOf6,sr) {
    let teamNamePath = path.join(__dirname, "IPL", ownTeam);
    if (!fs.existsSync(teamNamePath)) {
      fs.mkdirSync(teamNamePath);
    }

    let playerPath = path.join(teamNamePath, playerName + ".xlsx");
    let content = excelReader(playerPath, playerName);

    let playerObj = {
      dateOfMatch,
      venueOfMatch,
      matchResult,
      ownTeam,
      opponentTeam,
      playerName,
      runs,
      balls,
      numberOf4,
      numberOf6,
      sr
    };

    content.push(playerObj);
    excelWriter(playerPath, content, playerName);
    
  }
}
//this function reads the data from excel file
function excelReader(playerPath, sheetName) {
  if (!fs.existsSync(playerPath)) { 
    return [];
  }
  let workBook = xlsx.readFile(playerPath);
  let excelData = workBook.Sheets[sheetName];
  let playerObj = xlsx.utils.sheet_to_json(excelData);
  return playerObj;
}

function excelWriter(playerPath, jsObject, sheetName) {
  //Creates a new workbook
  let newWorkBook = xlsx.utils.book_new();
  let newWorkSheet = xlsx.utils.json_to_sheet(jsObject);
  xlsx.utils.book_append_sheet(newWorkBook, newWorkSheet, sheetName);
  xlsx.writeFile(newWorkBook, playerPath);
} 
module.exports = {
    gifs:getInfoFromScorecard
}