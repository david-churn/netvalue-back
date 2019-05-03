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

// get only the price fields
// note, the symbol field was encoded by the caller.
router.get("/price/:symbol", (req,res) => {
  let iexRequest = iexUrlStr + req.params.symbol + iexPriceStr;
  axios.get(iexRequest)
    .then ((resp) => {
      res.send(resp.data);
    })
    .catch ((error) => {
      logger.error(`iex price error=`,error);
      res.send(`server error`);
    })
});

// note, the symbol field was encoded by the caller.
router.get("/company/:symbol", (req,res) => {
  let iexRequest = iexUrlStr + req.params.symbol + iexPriceStr;
  let stockObj = {};
  axios.get(iexRequest)
    .then ((resp) => {
      this.stockObj = resp.data;
      this.stockObj.symbol = req.params.symbol;
    })
    .then ( () => {
      iexRequest = iexUrlStr + req.params.symbol + iexCompanyStr;
      return axios.get(iexRequest)
    })
    .then ((resp) => {
      this.stockObj.companyName = resp.data.companyName;
      this.stockObj.exchange = resp.data.exchange;
      this.stockObj.industry = resp.data.industry;
      this.stockObj.website = resp.data.website;
      this.stockObj.sector = resp.data.sector;
      res.send(this.stockObj);
    })
    .catch ((error) => {
      logger.error(`iex company error=`,error);
      res.send(`server error`);
    })
});

module.exports = router;
