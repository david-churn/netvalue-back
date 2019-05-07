"use strict";
// 5/6/2019 David Churn cloned for deployment

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const sequelize = new Sequelize({
  host:     "den1.mysql6.gear.host",
  username: "netvalue",
  password: "Fl0sb~t8oQ?N",
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
