//express
const express = require('express');
const router = express.Router();
//multer
const multer = require('multer');
//body-parser
const bodyParser = require('body-parser');
//path
const path = require('path');
//database sermon
const Sermao = require('../Model/Sermao');

//multer
const upload = multer({
    // Como deve ser feito o armazenamento dos arquivos?
    storage: multer.diskStorage({     
        destination:function(req,file,cb){ 
            cb(null,"public/audio");
        },
        filename: function(req,file,cb){
            var title = req.body.title;
            cb(null, title + path.extname(file.originalname));
        }
    }),
    // Como esses arquivos serão filtrados, quais formatos são aceitos/esperados?
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.mp3') {
            // Se o arquivo não bateu com nenhum aceito, executamos o callback com o segundo valor false (validação falhouo)
            return cb(null, false);
        }
        // Executamos o callback com o segundo argumento true (validação aceita)
        return cb(null, true);
    }
});

//Rota de criação
router.get('/sermao/adicionar', (req,res) => {
    res.render('sermons/create');
});

//Rota de listagem
router.get('/sermao', (req,res) => {
    Sermao.findAll({raw:true}).then(sermoes => {
        res.render('sermons/read',{sermoes});
    });
});

//Rota post para armazenamento
router.post('/sermao/adicionar', upload.single("file"), (req,res) => {
    let title = req.body.title;
    let abstract = req.body.abstract;
    let book = req.body.book;
    let preacher = req.body.preacher;
    if(req.file){
        let link = req.body.link;
        let audio = `/audio/${title}.mp3`;
        if(link == ''){
            Sermao.create({title,book,abstract,preacher,audio});
        }else{
            Sermao.create({title,book,abstract,preacher,audio,link});
        }
        res.redirect('/');
    }else{
        Sermao.create({title,book,abstract,preacher})
        res.redirect('/');
    }
});

module.exports = router;