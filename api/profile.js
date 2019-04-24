"use strict"
// Handle requests dealing with the users profile.

const express = require("express");
const {sequelize} = require ("../database/connection");
const {Op} = require("../database/connection");
const {Person} = require("../models/person");

let router = express.Router();

// get all fields
router.get("/gid/:gid", (req,res) => {
  Person.findOne({
    where : {
      gID: req.params.gid,
      }
  })
  .then (person => {
    console.log(`person=`,person.dataValues);
    res.send(person.dataValues);
  })
  .catch ((error) => {
    res.send(error);
  })
});

// delete from all tables
router.delete("/", (req,res) => {
  const data = {title: "Homepage"};
  res.send(data);
});

// insert new profile, creating profile and 1st asset "Cash"
// .findOrCreate can handle new person.
router.post("/", (req,res) => {
  const data = {title: "Homepage"};
  res.send(data);
});

// update the columns on the profile screen.
router.patch("/upduser/:id", (req,res) => {
  Person.update({
    nickNm : req.body.nickNm,
    emailStr : req.body.emailStr,
    decimalStr : req.body.emailStr,
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
