const connection = require('../database/connection');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config()

const User = connection.define('users',{
    nickname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.sync({force: false});

User.findOne({where: {nickname: process.env.DB_ADM}}).then(user => {
    if(user == undefined){
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(process.env.DB_ADM,salt);
        User.create({nickname: process.env.DB_ADM, password: hash}).then(() => {});
    }
});

module.exports = User;