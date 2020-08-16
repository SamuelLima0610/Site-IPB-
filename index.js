//express
const express = require('express');
const app = express();
const session = require('express-session');
//body-parser
const bodyParser = require('body-parser');
//Controller
const staticController = require('./Controller/StaticPages');
const sermaoController = require('./Controller/SermaoController');
const categoryController = require('./Controller/CategoryController');
const noticeController = require('./Controller/NoticeController');
const userController = require('./Controller/UserController');
const bulletinController = require('./Controller/BulletinController');
//Database(Sequelize)
const connection = require('./database/connection');

//Sessions
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 3600000 }}));

connection.authenticate().then(() => {
    console.log('Banco conectado');
});

//body-parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//ejs e public
app.set('view engine','ejs');
app.use(express.static('public')); //usar arquivos estaticos

//Routes
app.use('/',staticController);
app.use('/',sermaoController);
app.use('/',categoryController);
app.use('/',noticeController);
app.use('/',userController);
app.use('/',bulletinController);

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Umbler listening on port %s', port);
});