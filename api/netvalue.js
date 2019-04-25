"use strict"
// 4/21/2019 David Churn created

// Handle the database reads/writes for the net value assets and debts.
const _ = require("lodash");
const axios = require("axios");
const express = require("express");
const {sequelize} = require ("../database/connection");
const {Op} = require("../database/connection");
const {Asset} = require("../models/asset");
const {Debt} = require("../models/debt");

let router = express.Router();
const deleteStr = "delete";
const iexUrlStr = "https://api.iextrading.com/1.0/stock/";

// get assets
//  add prices to any stocks
// get debts
// return result
router.get("/read/:id", (req,res) => {
  let resultObj = {};
  Asset.findAll({
    where : {
      personID: req.params.id,
      }
  })
  .then (assetArr => {
    let lookupSymbols = "";
    resultObj.assets = assetArr.map(asset => {
      let feObj = {
        id: asset.dataValues.assetID,
        type: asset.dataValues.typeCd,
        description: asset.dataValues.descriptionStr,
        amount: asset.dataValues.balanceAmt,
        apr: asset.dataValues.annualPercentRt,
        payment: asset.dataValues.monthlyPaymentRt,
        symbol: asset.dataValues.symbolID,
        shares: asset.dataValues.shareQty,
        price: 0,
        company: ""
      };
      if (asset.dataValues.typeCd==="stock") {
        lookupSymbols += (asset.dataValues.symbolID + ",");
      }
      return feObj;
    });
    console.log(`resultObj=`,resultObj);
    console.log(`lookupSymbols=${lookupSymbols}`);
    if (lookupSymbols !== "") {
      let requestStr = iexUrlStr + 'market/batch?symbols=' + lookupSymbols + '&types=quote';
      console.log(`requestStr=${requestStr}`);
      return axios.get(requestStr)
    }
    else {
      return lookupSymbols
    }
  })
  .then ((resp) => {
    if (resp !== "") {
      // match stock quotes to the assets and calculate the resulting amount
      let quoteArr = Object.getOwnPropertyNames(resp.data);
      quoteArr.forEach((symbol) => {
        let assetIdx = _.findIndex(resultObj.assets, obj => obj.symbol === symbol);
        resultObj.assets[assetIdx].price = Number(resp.data[symbol].quote.latestPrice).toFixed(4);
        resultObj.assets[assetIdx].latestSource = resp.data[symbol].quote.latestSource;
        resultObj.assets[assetIdx].latestTime = resp.data[symbol].quote.latestTime;
        resultObj.assets[assetIdx].company = resp.data[symbol].quote.companyName;
        resultObj.assets[assetIdx].amount = Number(resp.data[symbol].quote.latestPrice * resultObj.assets[assetIdx].shares).toFixed(2);
      });
    }
    console.log(`read Debts`);
    return Debt.findAll({
      where: {
        personID: req.params.id,
      }
    })
  })
  .then (debtArr => {
    resultObj.debts = debtArr.map(debt => {
      let feObj = {
        id: debt.dataValues.debtID,
        type: debt.dataValues.typeCd,
        description: debt.dataValues.descriptionStr,
        amount: debt.dataValues.balanceAmt,
        apr: debt.dataValues.annualPercentRt,
        payment: debt.dataValues.monthlyPaymentRt
      };
      return feObj;
    });
    res.send(resultObj);
  })
  .catch ((error) => {
    res.send(error);
  })
});

// insert new profile, creating profile and 1st asset "Cash"
router.post("/write/:id", (req,res) => {
  console.log(`writing for personID=${req.params.id}`, req.body);
  for (let a=0; a < req.body.assets.length; a++) {
    if (req.body.assets[a].type==="stock") {
      req.body.assets[a].amount = null;
      req.body.assets[a].symbol = req.body.assets[a].symbol.toUpperCase();
    }
    console.log(`asset=`,req.body.assets[a]);
    if (req.body.assets[a].id < 0) {
      let newID = Asset.create({
        personID: req.params.id,
        typeCd: req.body.assets[a].type,
        descriptionStr: req.body.assets[a].description,
        balanceAmt: req.body.assets[a].amount,
        annualPercentRt: req.body.assets[a].apr,
        monthlyPaymentRt: req.body.assets[a].payment,
        symbolID: req.body.assets[a].symbol,
        shareQty: req.body.assets[a].shares
      }, {
        isNewRecord:true
      })
      .then(asset => {
        console.log(`then asset=`,asset.dataValues);
        req.body.assets[a].id = asset.dataValues.assetID;
      })
      .catch (error => {
        throw error;
      })
    }
    else if (req.body.assets[a].type === deleteStr) {
      Asset.destroy({
        where: {
          assetID : req.body.assets[a].id
        }
      })
      .then (asset => {
        console.log(`asset=`,asset);
      })
      .catch (error => {
        throw error;
      })
    }
    else {
      Asset.update({
        typeCd: req.body.assets[a].type,
        descriptionStr: req.body.assets[a].description,
        balanceAmt: req.body.assets[a].amount,
        annualPercentRt: req.body.assets[a].apr,
        monthlyPaymentRt: req.body.assets[a].payment,
        symbolID: req.body.assets[a].symbol,
        shareQty: req.body.assets[a].shares
      }, {
        where: {
          assetID : req.body.assets[a].id
        }
      })
      .then (asset => {
        console.log(`asset=`,asset);
      })
      .catch ((error) => {
        throw error;
      })
    }
  }
  for (let d=0; d < req.body.debts.length; d++) {
    console.log(`debt=`,req.body.debts[d]);
    if (req.body.debts[d].id < 0) {
      let newID = Debt.create({
        typeCd: req.body.debts[d].type,
        descriptionStr: req.body.debts[d].description,
        balanceAmt: req.body.debts[d].amount,
        annualPercentRt: req.body.debts[d].apr,
        monthlyPaymentRt: req.body.debts[d].payment,
      }, {
        isNewRecord:true
      })
      .then(debt => {
        console.log(`then debt=`,debt.dataValues);
        req.body.debts[d].id = debt.dataValues.debtID;
      })
      .catch (error => {
        throw error;
      })
    }
    else if (req.body.debts[d].type === deleteStr) {
      Debt.destroy({
        where: {
          debtID : req.body.debts[d].id
        }
      })
      .then (debt => {
        console.log(`debt=`,debt);
      })
      .catch (error => {
        throw error;
      })
    }
    else {
      Debt.update({
        typeCd: req.body.debts[d].type,
        descriptionStr: req.body.debts[d].description,
        balanceAmt: req.body.debts[d].amount,
        annualPercentRt: req.body.debts[d].apr,
        monthlyPaymentRt: req.body.debts[d].payment,
        symbolID: req.body.debts[d].symbol,
        shareQty: req.body.debts[d].shares
      }, {
        where: {
          debtID : req.body.debts[d].id
        }
      })
      .then (debt => {
        console.log(`debt=`,debt);
      })
      .catch ((error) => {
        throw error;
      })
    }
  }
  // filter out deletes
  let respObj = {
    assets: req.body.assets.filter(asset => asset.type !== deleteStr),
    debts: req.body.debts.filter(debt => debt.type !== deleteStr)
  }
  // need to wait for all the database updates before sending this back...
  console.log(`respObj=`,respObj);
  res.send(respObj);
});

module.exports = router;
