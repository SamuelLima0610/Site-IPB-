const express = require('express');
const router = express.Router();
const multer = require('multer');
const Category = require('../Model/Category');
const Notice = require('../Model/Notice');
const path = require('path');
const fs = require('fs');

//multer
const upload = multer({
    // Como deve ser feito o armazenamento dos arquivos?
    storage: multer.diskStorage({     
        destination:function(req,file,cb){ 
            cb(null,"public/img/eventos");
        },
        filename: function(req,file,cb){
            var title = req.body.title;
            cb(null, title + path.extname(file.originalname));
        }
    }),
    // Como esses arquivos serão filtrados, quais formatos são aceitos/esperados?
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.png' && path.extname(file.originalname) !== '.jpeg' && path.extname(file.originalname) !== '.jpg') {
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

//rota para listagem dos eventos
router.get('/admin/eventos', (req,res) => {
    Notice.findAll({include:{model: Category}}).then(notices => {
        res.render('notice/read',{notices});
    });
});

//rota para criação de evento
router.get('/admin/evento/adicionar' , (req,res) => {
    Category.findAll().then(categories => {
        res.render('notice/create', {categories});
    });
});

//rota para salvamento dos dados
router.post('/evento/salvar', upload.single("file"), (req,res) => {
    let title = req.body.title;
    let date = new Date(req.body.date);
    let time = req.body.time;
    let categoryId = req.body.category;
    let notice = req.body.notice;
    if(req.file){
        let image = `/img/eventos/${title}${path.extname(req.file.originalname)}`;
        Notice.create({title,date,time,categoryId,notice,image}).then(()=>{
            res.redirect('/admin/eventos');
        });
    }else{
        res.redirect('/admin/evento/adicionar');
    }
});

//Rota de editagem
router.get('/admin/evento/editar/:id' , (req,res) => {
    let id = req.params.id;
    if(id != undefined){
        Category.findAll().then(categories => {
            Notice.findByPk(id).then(notice => {
                let date = `${notice.date.getUTCFullYear()}-${pad(notice.date.getUTCMonth() + 1)}-${pad(notice.date.getUTCDate())}` 
                res.render('notice/edit',{notice,categories,date});
            });
        });
    }
});

//rota para salvamento dos dados da edição
router.post('/evento/mudar', (req,res) => {
    let id = req.body.id;
    let titleOld = req.body.titleOld;
    let image = req.body.image;
    let title = req.body.title;
    let date = new Date(req.body.date);
    let time = req.body.time;
    let categoryId = req.body.category;
    let notice = req.body.notice;
    let split = image.split('.');
    let extension = split[1];
    let imageNew = `/img/eventos/${title}.${extension}`;
    let dirOld = `./public/img/eventos/${titleOld}.${extension}`;
    let dirNew = `./public/img/eventos/${title}.${extension}`;
    fs.rename(dirOld, dirNew, (err) => {
        if (err) throw err;
        Notice.update({title,date,time,categoryId,notice,image: imageNew},{where:{id}}).then(()=> {
            res.redirect('/admin/eventos');
        });

    });
});

//rota para excluir
router.post('/evento/excluir', (req,res)=>{
    let id = req.body.id;
    let title = req.body.title;
    let image = req.body.image;
    let split = image.split('.');
    let extension = split[1];
    let dir = `./public/img/eventos/${title}.${extension}`;
    fs.unlink(dir , err =>{
        if (err) throw err;
        Notice.destroy({where:{id}}).then( () => {
            res.redirect('/admin/eventos');
        });
    });
});

//rota para visualizar o evento
router.get("/evento/:id", (req,res) => {
    let id = req.params.id;
    Category.findAll().then(categories => {
        Notice.findByPk(id).then(notice => {
            res.render("notice/noticeDetail",{notice,categories});
        })
    })
})

module.exports = router;