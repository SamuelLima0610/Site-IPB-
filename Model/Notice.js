const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Category = require('./Category');

const Notice = connection.define('notices',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },
    notice:{
        type: Sequelize.TEXT,
        allowNull: false
    },
    time:{
        type: Sequelize.STRING,
        allowNull: false
    },
    date:{
        type: Sequelize.DATE,
        allowNull: false
    },
    image:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

Notice.belongsTo(Category);
Category.hasMany(Notice);

//Notice.sync({force: true});

module.exports = Notice;