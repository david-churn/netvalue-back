"use strict";
// Handle requests dealing with the users profile.

const _ = require("lodash");
const express = require("express");
const {sequelize} = require ("../database/connection");
const {Asset} = require("../models/asset");
const {Debt} = require("../models/debt");
const {Person} = require("../models/person");

let router = express.Router();

// get all fields
router.get("/gid/:gid", (req,res) => {
  let personObj = {};
  Person.findOrCreate({
    where: {
      gID: req.params.gid
    },
    defaults: {
      decimalStr: ".",
      separatorStr: ",",
      nickNm: "you",
      emailStr: ""
    }
  })
  .then(([person, created]) => {
    personObj = person.dataValues;
// build & create the special Cash asset
    if (created) {
      let cashAsset = {
        personID: personObj.personID,
        typeCd: "other",
        descriptionStr: "Cash",
        balanceAmt: 0
      };
      Asset.create(cashAsset
      , { isNewRecord:true });
    }
    else {
      return (`response`);
    }
  })
  .then (resp => {
    res.send(personObj);
  })
  .catch (error => {
    logger.error(`findOrCreate error=`,error);
    res.send(`server error`);
  })
});

// delete from all tables
router.delete("/deluser/:personID", (req,res) => {
  Asset.destroy({
    where: {
      personID : req.params.personID
  }})
  .then (aResp => {
    Debt.destroy({
      where: {
        personID : req.params.personID
    }})
  })
  .then (dResp => {
    Person.destroy({
      where: {
        personID : req.params.personID
    }})
  })
  .then (pResp => {
    res.send(`removed personID=${req.params.personID}`);
  })
  .catch (error => {
    logger.error(`destroy error=`,error);
    res.send(`server error`);
  })
});

// update the columns on the profile screen.
router.patch("/upduser/:id", (req,res) => {
  Person.update({
    nickNm : req.body.nickNm,
    emailStr : req.body.emailStr,
    decimalStr : req.body.decimalStr,
    separatorStr : req.body.separatorStr,
  },{
    where: {
      personID : req.params.id
    }
  })
  .then (play => {
    res.send(`updated`);
  })
  .catch ((error) => {
    logger.error(`person update error=`,error);
    res.send(`server error`);
  })
});

module.exports = router;
