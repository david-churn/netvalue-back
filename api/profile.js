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
    // personObj=person.get({
    //   plain: true
    // });
    personObj = person.dataValues;
    console.log(`created=${created} personObj=`,personObj);
// build & create the special Cash asset
    if (created) {
      let cashAsset = {
        personID: personObj.personID,
        typeCD: "other",
        desciptionStr: "Cash",
        balanceAmt: 0
      };
      console.log(`cashAsset=`,cashAsset);
      return Asset.create(cashAsset
      , { isNewRecord:true });
    }
    else {
      return
    }
  })
  .then (resp => {
    console.log(`resp=`,resp);
    res.send(personObj)
  })
  .catch (error => {
    res.send(error);
  })
});

// delete from all tables
router.delete("/deluser/:personID", (req,res) => {
  Asset.destroy({
    where: {
      personID : req.params.personID
  }})
  .then (aResp => {
    console.log(`asset delete=`, aResp);
    Debt.destroy({
      where: {
        personID : req.params.personID
    }})
  })
  .then (dResp => {
    console.log(`debt delete=`, dResp);
    Person.destroy({
      where: {
        personID : req.params.personID
    }})
  })
  .then (pResp => {
    console.log(`person delete=`, pResp);
    res.send(`removed personID=${req.params.personID}`);
  })
  .catch (error => {
    console.log(`debt error=`,error);
    res.send(error);
    throw error;
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
    res.send(error);
  })
});

module.exports = router;
