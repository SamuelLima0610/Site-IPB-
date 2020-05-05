const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Category = require('./Category');

const Notice = connection.define('notices',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },
    notice:{
        type: Sequelize.STRING,
        allowNull: false
    },
    time:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

Notice.belongsTo(Category);
Category.hasMany(Notice);

Notice.sync({force: false});

module.exports = Notice;