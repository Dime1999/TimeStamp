// Where the node.js app starts

//Required Libraries
var express = require("express");
var app = express();

//Allows the program to scan for user input in the HTML file.
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

//Test if given date is in unix format
const isUnix = (date_string) => {
  return /^\d+$/.test(date_string);
}

// Enable CORS for required frontend functions (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

//http://expressjs.com/en/starter/static-files.html
//Give the backend access to the css file and any other files in the public folder
app.use(express.static("public"));

//http://expressjs.com/en/starter/basic-routing.html
//Get the request to load the app and send the html file
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

//Create object to store timestamps
let responseObject = {};

//Lines 43 to 51 are from https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
//Lines 43 to 51 take the user given date as a parameter and converts it to regular format

function changeTime(date) {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

app.get("/api/currTime", (request, response) => {
  response.json(changeTime(new Date()));
});

//Lines 56 to 62 are from: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
function changeDate(date) {
  var day = String(date.getDate()).padStart(2, '0');
  var month = String(date.getMonth() + 1).padStart(2, '0');//January is 0
  var year = date.getFullYear();
  date = month + '/' + day + '/' + year;
  return date;
}

//Calls the function changeDate
app.get("/api/currDate", (request, response) => {
  response.json(changeDate(new Date()));
});

//Lines 70 to 89 initiate the request to see each given date in unix and utc format
app.post("/api/dateInput", (request, response)=> {
  let date = request.body.date;

  if (date.includes("-")) {
    //Date String
    responseObject["unix"] = new Date(date).getTime(); //returns number of milliseconds
    responseObject["utc"] = new Date(date).toUTCString();
  } else {
    //Timestamp. Make it an int then a date
    date = parseInt(date);
    responseObject['unix'] = new Date(date).getTime();//Already in milliseconds
    responseObject['utc'] = new Date(date).toUTCString();
  }
  
  if(!responseObject['unix'] || !responseObject['utc']) {
    response.json({error: "Invalid Date"});
  } 
    
  response.json(responseObject);
});

//Takes the user requested date in a certain format and returns the unix and utc version of the date
app.get("/api/:date_string", (request, response) => {
    const date = isUnix(request.params.date_string) ? new Date(parseInt(request.params.date_string)) : new Date(request.params.date_string);
    if(date.getTime()){
      response.json({
        unix: date.getTime(),
        utc: date.toUTCString()
      });
    }
});

//Deploys the code locally
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
