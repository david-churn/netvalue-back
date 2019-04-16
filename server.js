"use strict";
// 4/5/2019 David Churn created

// 3rd party references
const axios = require("axios");
const bodyParser = require("body-parser");  // JSON parser
const cors = require("cors");  // security
const express = require("express");  // handles server events
const {sequelize} = require ("./database/connection");
const {Op} = require("./database/connection");

// local references
const profile = require("./api/profile");

// set up security options
let corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors({corsOptions}));
app.use(bodyParser.json());

app.get("/", (req,res) => {
  res.send("ready");
})
// Send the profile requests to the profile module.
app.use("/profile", profile)
// Look up the company name and today"s price.
//   with iextrading
// https://api.iextrading.com/1.0
// /stock/"symbol"/company
// /stock/"symbol"/price

app.get("/symbol", (req,res) => {
  let cannedResp = {
    company: "Ink Inc.",
    price: "10.99"
  }
  res.send(cannedResp);
})
//set up end point to call custom files.  For each table?
// Database query
// Game.findOne ({
//     order: [["gameID","DESC"]]
// })
// .then (games => {
//   res.send(games);
// })
// .catch ((error) => {
//   res.send(error);
// })
//

app.listen(3000, () => {
  console.log(`>>> Net Value server started <<<`);
})
