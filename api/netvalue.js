"use strict"
// 4/21/2019 David Churn created

// Handle the database reads/writes for the net value assets and debts.

const express = require("express");
const {sequelize} = require ("../database/connection");
const {Op} = require("../database/connection");
const {Asset} = require("../models/asset");
const {Debt} = require("../models/debt");

let router = express.Router();

// get all fields
router.get("/read/:id", (req,res) => {
  let resultObj = {};
  Asset.findAll({
    where : {
      personID: req.params.id,
      }
  })
  .then (assetObj => {
    console.log(`assetObj=`,assetObj);
    resultObj = {
      assets: assetObj
    };
    console.log(`resultObj=`,resultObj);
    Debt.findAll({
      where: {
        personID: req.params.id,
      }
    });
  })
  .then (debtObj => {
    console.log(`debtObj=`,debtObj);
    resultObj = {
      debts: debtObj
    }
// how does this handle finding no rows?
    res.send(resultObj);
  })
  .catch ((error) => {
    res.send(error);
  })
});

// insert new profile, creating profile and 1st asset "Cash"
router.post("/write", (req,res) => {
  const data = {title: "Updates under construction"};
  res.send(data);
});


module.exports = router;
