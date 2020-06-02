//express
const express = require('express');
const router = express.Router();
//multer
const multer = require('multer');
//body-parser
const bodyParser = require('body-parser');
//path
const path = require('path');
//fs (file)
const fs = require('fs');
//database sermon
const Sermao = require('../Model/Sermao');
//months
let months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
//Middleware de autenticação
const auth = require('../Middleware/AuthMiddleware');

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

//Rota de criação (GET)
router.get('/admin/sermao/adicionar', auth, (req,res) => {
    res.render('sermons/create');
});

//Rota post para armazenamento 
router.post('/sermao/criar', upload.single("file"), (req,res) => {
    let {title,abstract,book,preacher} = req.body;
    if(req.file){
        let link = req.body.link;
        let audio = `/audio/${title}.mp3`;
        if(link == ''){
            Sermao.create({title,book,abstract,preacher,audio});
        }else{
            Sermao.create({title,book,abstract,preacher,audio,link});
        }
        res.redirect('/admin/sermao');
    }else{
        let link = req.body.link;
        if(link == ''){
            Sermao.create({title,book,abstract,preacher});
        }else{
            Sermao.create({title,book,abstract,preacher,link});
        }
        res.redirect('/admin/sermao');
    }
});

//Rota de listagem
router.get('/admin/sermao', auth,(req,res) => {
    Sermao.findAll({raw:true}).then(sermoes => {
        res.render('sermons/read',{sermoes});
    });
});

//Rota de editagem (GET)
router.get('/admin/sermao/editar/:id' , auth,(req,res) => {
    let id = req.params.id;
    if(id != undefined){
        Sermao.findByPk(id).then(sermao => {
            res.render('sermons/edit',{sermao});
        });
    }
});

//Rota para salvar os novos dados de um sermão (POST)
router.post('/sermao/mudar', auth,(req,res) => {
    let {id,titleOld,title,book,preacher,abstract,link} = req.body;
    if(titleOld != 'sem'){
        var dirOld = `./public/audio/${titleOld}.mp3`
        var dirNew = `./public/audio/${title}.mp3`
        var audio = `/audio/${title}.mp3`
        fs.rename(dirOld, dirNew, (err) => {
            if (err) throw err;
            if(link == ''){
                Sermao.update({title,book,preacher,abstract,audio},{where:{id}}).then(()=> {
                    res.redirect('/admin/sermao');
                });
            }else{
                Sermao.update({title,book,preacher,link,abstract,audio},{where:{id}}).then(()=> {
                    res.redirect('/admin/sermao');
                });
            }
        });
    }else{
        if(link == ''){
            Sermao.update({title,book,preacher,abstract},{where:{id}}).then(()=> {
                res.redirect('/admin/sermao');
            });
        }else{
            Sermao.update({title,book,preacher,link,abstract},{where:{id}}).then(()=> {
                res.redirect('/admin/sermao');
            });
        }
    }
});

//rota para excluir (POST)
router.post('/sermao/excluir', auth, (req,res)=>{
    let id = req.body.id;
    let title = req.body.title;
    if(title != "null"){
        var dir = `./public/audio/${title}.mp3`
        fs.unlink(dir , err =>{
            if (err) throw err;
            Sermao.destroy({where:{id}}).then( () => {
                res.redirect('/admin/sermao');
            });
        });
    }else{
        Sermao.destroy({where:{id}}).then( () => {
            res.redirect('/admin/sermao');
        });
    }
});

//rota para visualizar um sermao mais detalhadamente
router.get('/sermao/:id', (req,res) => {
    let id = req.params.id;
    Sermao.findByPk(id).then(sermon => {
        Sermao.findAll({limit: 5, order: [['id','DESC']]}).then(sermons => {
            res.render('sermons/sermonsDetail',{sermon, sermons, months});
        });
    });
})

module.exports = router;