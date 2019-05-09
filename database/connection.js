"use strict";
// 5/8/2019 David Churn removed production authorization

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const sequelize = new Sequelize({
  host:     "yourHostHere",
  username: "netvalue",
  password: "yourPasswordHere",
  database: "netvalue",
  dialect:  "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
})

// exporting the object as sequelize...
module.exports = {
  Op : Op,
  sequelize : sequelize
}
