'use strict';
// 4/13/2019 David Churn customized from auto-seqlelize definition.
const Sequelize = require('sequelize');
const {sequelize} = require('../database/connection');

const Asset = sequelize.define('asset', {
    assetID: {
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
    personID: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    typeCd: {
      type: Sequelize.CHAR(6),
      allowNull: false
    },
    descriptionStr: {
      type: Sequelize.CHAR(45),
      allowNull: false
    },
    balanceAmt: {
      type: Sequelize.DECIMAL,
      allowNull: true
    },
    annualPercentRt: {
      type: Sequelize.DECIMAL,
      allowNull: true
    },
    monthlyPaymentRt: {
      type: Sequelize.DECIMAL,
      allowNull: true
    },
    symbolID: {
      type: Sequelize.CHAR(10),
      allowNull: true
    },
    shareQty: {
      type: Sequelize.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'asset'
});

module.exports = {
  Asset
};
