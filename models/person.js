'use strict';
// 4/13/2019 David Churn customized from auto-seqlelize definition.
const Sequelize = require('sequelize');
const {sequelize} = require('../database/connection');

const Person = sequelize.define('person', {
  personID: {
    type: Sequelize.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  lastLogInTsp: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  gID: {
    type: Sequelize.CHAR(28),
    allowNull: false,
    unique: true
  },
  decimalStr: {
    type: Sequelize.CHAR(1),
    allowNull: false
  },
  separatorStr: {
    type: Sequelize.CHAR(1),
    allowNull: false
  },
  nickNm: {
    type: Sequelize.STRING(45),
    allowNull: true
  },
  emailStr: {
    type: Sequelize.STRING(255),
    allowNull: true
  }
}, {
  freezeTableName: true
});

module.exports = {
  Person
};
