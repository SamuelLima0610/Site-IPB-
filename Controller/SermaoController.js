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

//Rota post para armazenamento
router.post('/sermao/criar', upload.single("file"), (req,res) => {
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
        res.redirect('/admin/sermao');
    }else{
        Sermao.create({title,book,abstract,preacher})
        res.redirect('/');
    }
});

//Rota de listagem
router.get('/sermao', (req,res) => {
    Sermao.findAll({raw:true}).then(sermoes => {
        res.render('sermons/read',{sermoes});
    });
});

//Rota de editagem
router.get('/sermao/editar/:id' , (req,res) => {
    let id = req.params.id;
    Sermao.findByPk(id).then(sermao => {
        res.render('sermons/edit',{sermao});
    });
});

//Rota para salvar os novos dados de um sermão
router.post('/sermao/mudar' , (req,res) => {
    let id = req.body.id;
    let titleOld = req.body.titleOld;
    let title = req.body.title;
    let book = req.body.book;
    let preacher = req.body.preacher;
    let abstract = req.body.abstract;
    let link = req.body.link;
    var dirOld = `./public/audio/${titleOld}.mp3`
    var dirNew = `./public/audio/${title}.mp3`
    var audio = `/audio/${title}.mp3`
    fs.rename(dirOld, dirNew, (err) => {
        if (err) throw err;
        Sermao.update({title,book,preacher,link,abstract,audio},{where:{id}}).then(()=> {
            res.redirect('/admin/sermao');
        });
    });
});

router.post('/sermao/excluir', (req,res)=>{
    let id = req.body.id;
    let title = req.body.title;
    var dir = `./public/audio/${title}.mp3`
    fs.unlink(dir , err =>{
        if (err) throw err;
        Sermao.destroy({where:{id}}).then( () => {
            res.redirect('/admin/sermao');
        })
    })
});

module.exports = router;