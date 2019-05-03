"use strict";
// 4/5/2019 David Churn created

// 3rd party references
const bodyParser = require("body-parser");  // JSON parser
const cors = require("cors");  // security
const express = require("express");  // handles server events
const morgan = require("morgan");
const winston = require("winston");
const {format} = require("winston");
require('winston-daily-rotate-file');

// local references
const lookup = require("./api/iex-lookup");
const netvalue = require("./api/netvalue");
const profile = require("./api/profile");

// set up security options
let corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200
};

const app = express();
app.use(bodyParser.json());
app.use(cors({corsOptions}));

// set up logging middleware
//! remove the console logging after testing.
let combinedLog = new (winston.transports.DailyRotateFile)({
  filename: './logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});
let errorLog = new (winston.transports.DailyRotateFile)({
  filename: './logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: "error"
});

combinedLog.on('rotate', function(oldFilename, newFilename) {
  console.log(`combined log rotated`);
});
errorLog.on('rotate', function(oldFilename, newFilename) {
  console.log(`error log rotated`);
});

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new winston.transports.Console(),
    errorLog,
    combinedLog
  ]
});

logger.stream = {
  write(message, encoding) {
    logger.info(message)
  }
}
app.use(morgan("combined",{ stream:logger.stream }));

// end points!
app.get("/", (req,res) => {
  res.send("By Your Command.");
})
// Send the profile requests to the profile module.
app.use("/profile", profile);

// Look up the company name and today"s price.
//   with iextrading
// https://api.iextrading.com/1.0
// /stock/"symbol"/company
// /stock/"symbol"/price
app.use("/stock", lookup);

// Handle saving and reading asset and debt items.
app.use("/nv", netvalue);

app.listen(3000, () => {
  console.log(`>>> Net Value server started <<<`);
  logger.error(`Net Value server started`);
})
