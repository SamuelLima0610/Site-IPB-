const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Bulletin = connection.define('bulletins',{
    bulletin:{
        type: Sequelize.STRING,
        allowNull: false
    },
    date:{
        type: Sequelize.DATE,
        allowNull: false
    },
});


//Bulletin.sync({force: true});

module.exports = Bulletin;