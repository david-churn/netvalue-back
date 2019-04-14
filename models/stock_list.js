'use strict';
// 4/13/2019 David Churn customized from auto-seqlelize definition.
const Sequelize = require('sequelize');
const {sequelize} = require('../database/connection');

const Stock_list = sequelize.define('stock_list', {
    assetID: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    updateAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    personID: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    symbolID: {
      type: Sequelize.CHAR(10),
      allowNull: false
    }
  }, {
    tableName: 'stock_list'
  });
};


module.exports = {
  Stock_list
};
