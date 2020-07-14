const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../Middleware/AuthMiddleware');
const Category = require('../Model/Category');
const Notice = require('../Model/Notice');
const path = require('path');
const fs = require('fs');
const Bulletin = require('../Model/Bulletin')

//multer
const upload = multer({
    // Como deve ser feito o armazenamento dos arquivos?
    storage: multer.diskStorage({     
        destination:function(req,file,cb){ 
            cb(null,"public/boletin");
        },
        filename: function(req,file,cb){
            var date = req.body.date;
            cb(null, date + path.extname(file.originalname));
        }
    }),
    // Como esses arquivos serão filtrados, quais formatos são aceitos/esperados?
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.pdf') {
            // Se o arquivo não bateu com nenhum aceito, executamos o callback com o segundo valor false (validação falhouo)
            return cb(null, false);
        }
        // Executamos o callback com o segundo argumento true (validação aceita)
        return cb(null, true);
    }
});

function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
}

function month(month){
    switch(month){
        case 'Jan': return '01';
        case 'Feb': return '02';
        case 'Mar': return '03';
        case 'Apr': return '04';
        case 'May': return '05';
        case 'Jun': return '06';
        case 'Jul': return '07';
        case 'Aug': return '08';
        case 'Set': return '09';
        case 'Oct': return '10';
        case 'Nov': return '11';
        case 'Dec': return '12';
    }
}

//rota para listagem dos boletins
router.get('/admin/boletins', auth, (req,res) => {
    Bulletin.findAll().then(bulletins => {
        res.render('bulletin/read',{bulletins});
    });
});

//rota para criação de boletin (GET)
router.get('/admin/boletins/adicionar', auth, (req,res) => {
    res.render('bulletin/create');
});

//rota para salvamento dos dados (POST)
router.post('/boletins/salvar', upload.single("file"), (req,res) => {
    let date = new Date(req.body.date);
    if(req.file){
        let bulletin = `/boletin/${req.body.date}${path.extname(req.file.originalname)}`;
        Bulletin.create({bulletin,date}).then(()=>{
            res.redirect('/admin/boletins');
        });
    }else{
        res.redirect('/admin/boletins/adicionar');
    }
});

//Rota de editagem (GET)
router.get('/admin/boletins/editar/:id', auth, (req,res) => {
    let id = req.params.id;
    if(id != undefined){
        Bulletin.findByPk(id).then(bulletin => {
            let date = `${bulletin.date.getUTCFullYear()}-${pad(bulletin.date.getUTCMonth() + 1)}-${pad(bulletin.date.getUTCDate())}` 
            res.render('bulletin/edit',{bulletin,date});
        });
    }
});

//rota para salvamento dos dados da edição (POST)
router.post('/boletins/mudar', auth, (req,res) => {
    let {oldDate,bulletin,id} = req.body;
    let date = new Date(req.body.date);
    let split = bulletin.split('.');
    let extension = split[1];
    let bulletinNew = `/boletin/${req.body.date}.${extension}`;
    let dirOld = `./public/boletin/${oldDate}.${extension}`;
    let dirNew = `./public/boletin/${req.body.date}.${extension}`;
    fs.rename(dirOld, dirNew, (err) => {
        if (err) throw err;
        Bulletin.update({bulletinNew,date},{where:{id}}).then(()=> {
            res.redirect('/admin/boletins');
        });
    });
});

//rota para excluir (POST)
router.post('/boletins/excluir', auth,(req,res)=>{
    let {id,date,bulletin} = req.body;
    let split = bulletin.split('.');
    let extension = split[1];
    let datesplit = date.split(' ');
    let dir = `./public/boletin/${datesplit[3]}-${month(datesplit[1])}-${parseInt(datesplit[2]) + 1}.${extension}`;
    fs.unlink(dir , err =>{
        if (err) throw err;
        Bulletin.destroy({where:{id}}).then( () => {
            res.redirect('/admin/boletins');
        });
    });
});

module.exports = router;

