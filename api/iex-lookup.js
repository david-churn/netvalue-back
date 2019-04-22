"use strict"
// 4/21/2019 David Churn created

// Lookup the stock information from IEX.
const axios = require("axios");
const express = require("express");

let router = express.Router();

// constants needed to talk with the iex api.
// Look up the company name and today's price.
//   with iextrading
// https://api.iextrading.com/1.0
// /stock/"symbol"/company
// /stock/"symbol"/price

const iexCompanyStr = "/company?filter=companyName,exchange,industry,website,sector";
const iexPriceStr = "/quote?filter=companyName,latestPrice,latestSource,latestTime";
const iexUrlStr = "https://api.iextrading.com/1.0/stock/";

// What the front end is expecting on a full lookup.
// stockObj: {
//   symbol: "",
//   exchange: "",
//   latestPrice: undefined,
//   latestSource: "",
//   latestTime: "",
//   companyName: "",
//   industry: "",
//   sector: "",
//   website: ""
// },

// get only the price fields
router.get("/price/:symbol", (req,res) => {
  let iexRequest = iexUrlStr + req.params.symbol + iexPriceStr;
  console.log(`iexRequest=${iexRequest}`);
  axios.get(iexRequest)
    .then ((resp) => {
      console.log(`iex response=`,resp.data);
      res.send(resp.data);
    })
    .catch ((error) => {
      console.log(`iex error=`,error);
      res.send(error);
    })
});

router.get("/company/:symbol", (req,res) => {
  let iexRequest = iexUrlStr + req.params.symbol + iexPriceStr;
  let stockObj = {};
  console.log(`iexRequest=${iexRequest}`);
  axios.get(iexRequest)
    .then ((resp) => {
      console.log(`price=`,resp.data);
      this.stockObj = resp.data;
      this.stockObj.symbol = req.params.symbol;
    })
    .then ( () => {
      iexRequest = iexUrlStr + req.params.symbol + iexCompanyStr;
      console.log(`iexRequest=${iexRequest}`);
      return axios.get(iexRequest)
    })
    .then ((resp) => {
      console.log(`company=`,resp.data);
      this.stockObj.companyName = resp.data.companyName;
      this.stockObj.exchange = resp.data.exchange;
      this.stockObj.industry = resp.data.industry;
      this.stockObj.website = resp.data.website;
      this.stockObj.sector = resp.data.sector;
      res.send(this.stockObj);
    })
    .catch ((error) => {
      console.log(`post error=`,error);
      res.send(error);
    })
});

module.exports = router;
