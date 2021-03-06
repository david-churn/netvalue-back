"use strict"
// 4/21/2019 David Churn created

// Handle the database reads/writes for the net value assets and debts.
const _ = require("lodash");
const axios = require("axios");
const express = require("express");
const {sequelize} = require ("../database/connection");
const {Asset} = require("../models/asset");
const {Debt} = require("../models/debt");

let router = express.Router();
const deleteStr = "delete";
const iexUrlStr = "https://api.iextrading.com/1.0/stock/";

// insert a new asset and return the generated id
router.post("/asset/:id/:type", (req,res) => {
  let newType = decodeURIComponent(req.params.type);
  let newAsset = {
    personID: req.params.id,
    typeCd: newType,
    descriptionStr: "new asset"
  };
  if (newType === "saving") {
    newAsset.balanceAmt = 0;
    newAsset.annualPercentRt = 0;
    newAsset.monthlyPaymentRt = 0;
  }
  else if (newType === "stock") {
    newAsset.symbolId = "";
    newAsset.shareQty = 0;
  }
  else {
    newAsset.balanceAmt = 0;
  };
  Asset.create(newAsset
  , { isNewRecord:true })
  .then (resp => {
    res.send(resp);
  })
  .catch (error => {
    logger.error(`asset create error=`,error);
    res.send(`server error`);
  })
});

// insert a new debt and return the generated id
router.post("/debt/:id/:type", (req,res) => {
  let newType = decodeURIComponent(req.params.type);
  Debt.create({
    personID: req.params.id,
    typeCd: newType,
    descriptionStr: 'new debt',
    balanceAmt: 0,
    annualPercentRt: 0,
    monthlyPaymentRt: 0,
  }, {
    isNewRecord:true
  })
  .then (resp => {
    res.send(resp);
  })
  .catch (error => {
    logger.error(`debt create error=`,error);
    res.send(`server error`);
  })
});

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
    if (lookupSymbols !== "") {
      let requestStr = iexUrlStr + 'market/batch?symbols=' + lookupSymbols + '&types=quote';
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
    logger.error(`read all error=`,error);
    res.send(`server error`);
  })
});

// insert new profile, creating profile and 1st asset "Cash"
router.post("/write/:id", (req,res) => {
  return sequelize.transaction(t => {
    let promises = [];
    for (let a=0; a < req.body.assets.length; a++) {
      if (req.body.assets[a].type === deleteStr) {
        let newPromise = Asset.destroy({
          where: {
            assetID : req.body.assets[a].id
          }},{
            transaction:t
        })
        promises.push(newPromise)
      }
      else {
        let dbAmount = req.body.assets[a].amount;
        let dbSymbol = null;
        if (req.body.assets[a].type==="stock") {
          dbSymbol = req.body.assets[a].symbol.toUpperCase();
          dbAmount = null;
        }
        let newPromise = Asset.update({
          typeCd: req.body.assets[a].type,
          descriptionStr: req.body.assets[a].description,
          balanceAmt: dbAmount,
          annualPercentRt: req.body.assets[a].apr,
          monthlyPaymentRt: req.body.assets[a].payment,
          symbolID: dbSymbol,
          shareQty: req.body.assets[a].shares
        }, {
          where: {
            assetID : req.body.assets[a].id
          }}, {
            transaction:t
        })
        promises.push(newPromise)
      }
    }
    for (let d=0; d < req.body.debts.length; d++) {
      if (req.body.debts[d].type === deleteStr) {
        let newPromise = Debt.destroy({
          where: {
            debtID : req.body.debts[d].id
        }}, {
          transaction:t
        })
        promises.push(newPromise)
      }
      else {
        let newPromise = Debt.update({
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
          }}, {
            transaction:t
        })
        promises.push(newPromise)
      }
    }
    return Promise.all(promises)
    .then(assetOrDebt => {
      let aodReturn = [];
      for (let i=0; i<assetOrDebt.length; i++) {
        aodReturn.push(assetOrDebt[i]);
      }
      return Promise.all(aodReturn);
    })
  })
// need to wait for all the database updates before proceeding
  .then(result => {
    // filter out deletes -or- just ignore them...
    res.send(result);
    })
  .catch(error => {
    logger.error(`write all error=`,error);
    res.send(`server error`);
  })
});

module.exports = router;
