"use strict"
// 4/21/2019 David Churn created

// Handle the database reads/writes for the net value assets and debts.

const express = require("express");
const {sequelize} = require ("../database/connection");
const {Op} = require("../database/connection");
const {Asset} = require("../models/asset");
const {Debt} = require("../models/debt");

let router = express.Router();
const deleteStr = "delete";

// get all fields
router.get("/read/:id", (req,res) => {
  let resultObj = {};
  Asset.findAll({
    where : {
      personID: req.params.id,
      }
  })
  .then (assetArr => {
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
        company: 0
      };
      return feObj;
    })
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
router.post("/write", (req,res) => {
  // const data = {title: "Updates under construction"};
  // res.send(data);
  console.log(`writing=`, req.data);
  for (let a=0; a < req.body.assets.length; a++) {
    console.log(`asset=`,req.body.assets[a]);
    if (req.body.assets[a].id < 0) {
      let newID = Asset.create({
        typeCd: req.body.assets[a].type,
        descriptionStr: req.body.assets[a].description,
        balanceAmt: req.body.assets[a].amount,
        annualPercentRt: req.body.assets[a].apr,
        monthlyPaymentRt: req.body.assets[a].payment,
        symbolID: req.body.assets[a].symbol,
        shareQty: req.body.assets[a].shares
      }, {
        isNewRecord:true
      }).complete((err,result) => err ? 0 : result.assetID)
      req.body.assets[a].id = newID;
    }
    else if (req.body.assets[a].type = deleteStr) {
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
    if (req.body.debts[d].id < 0) {
      let newID = Debt.create({
        typeCd: req.body.debts[d].type,
        descriptionStr: req.body.debts[d].description,
        balanceAmt: req.body.debts[d].amount,
        annualPercentRt: req.body.debts[d].apr,
        monthlyPaymentRt: req.body.debts[d].payment,
      }, {
        isNewRecord:true
      }).complete((err,result) => err ? 0 : result.debtID)
      req.body.debts[d].id = newID;
    }
    else if (req.body.debts[d].type = deleteStr) {
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
          assetID : req.body.debts[d].id
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
  res.send(req.body);
});


module.exports = router;
