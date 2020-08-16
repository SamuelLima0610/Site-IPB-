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

//function to verificate which pages exists
function thereIsPage(max,page){
    let arrowleft = parseInt(page) - 1;
    let page2 = ((parseInt(page)) * 6) + 1;
    let page3 = ((parseInt(page) + 1) * 6) + 1;
    let arrowRight = ((parseInt(page) + 2) * 6) + 1;
    let pages = [false,false,false,false];
    if(arrowleft > 0){
        pages[0] = true
    }
    if(page2 <= max){
        pages[1] = true;
        if(page3 <= max){
            pages[2] = true;
            if(arrowRight < max){
                pages[3] = true
            }
        }
    }
    return pages;
}

//function to verificate the offset
function offsetValue(page){
    if(isNaN(page) || page == 1 || page == 0){
        return 0;
    }else{
        return (parseInt(page) -1) * 6;
    }
}

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
        res.redirect('/admin/sermao/0');
    }else{
        let link = req.body.link;
        if(link == ''){
            Sermao.create({title,book,abstract,preacher});
        }else{
            Sermao.create({title,book,abstract,preacher,link});
        }
        res.redirect('/admin/sermao/0');
    }
});

//Rota de listagem
router.get('/admin/sermao/:num', auth,(req,res) => {
    let page = req.params.num;
    let offset = offsetValue(page);
    Sermao.findAndCountAll({
        order: [['id','DESC']],
        offset,
        limit: 6
    }).then(result => {
        let max = result.count;
        let pages = thereIsPage(max,page);
        res.render('sermons/read',{sermoes: result.rows, page: parseInt(page), pages});
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
                    res.redirect('/admin/sermao/0');
                });
            }else{
                Sermao.update({title,book,preacher,link,abstract,audio},{where:{id}}).then(()=> {
                    res.redirect('/admin/sermao/0');
                });
            }
        });
    }else{
        if(link == ''){
            Sermao.update({title,book,preacher,abstract},{where:{id}}).then(()=> {
                res.redirect('/admin/sermao/0');
            });
        }else{
            Sermao.update({title,book,preacher,link,abstract},{where:{id}}).then(()=> {
                res.redirect('/admin/sermao/0');
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
                res.redirect('/admin/sermao/0');
            });
        });
    }else{
        Sermao.destroy({where:{id}}).then( () => {
            res.redirect('/admin/sermao/0');
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