const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Sermao = connection.define('sermons',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },
    book:{
        type: Sequelize.STRING,
        allowNull: false
    },
    abstract:{
        type: Sequelize.TEXT,
        allowNull: false
    },
    preacher:{
        type: Sequelize.STRING,
        allowNull: false
    },
    audio:{
        type: Sequelize.STRING,
        allowNull: true
    },
    link:{
        type: Sequelize.STRING,
        allowNull: true
    }
});

Sermao.sync({force:false});

module.exports = Sermao;