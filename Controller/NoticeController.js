const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../Middleware/AuthMiddleware');
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

//rota para listagem dos eventos
router.get('/admin/eventos/:num', auth, (req,res) => {
    let page = req.params.num;
    let offset = offsetValue(page);
    Notice.findAndCountAll({
        include:{model: Category},
        order: [['id','DESC']],
        offset,
        limit: 6
    }).then(result => {
        let max = result.count;
        let pages = thereIsPage(max,page);
        res.render('notice/read',{notices: result.rows, page: parseInt(page), pages});
    });
});

//rota para criação de evento (GET)
router.get('/admin/evento/adicionar', auth, (req,res) => {
    Category.findAll().then(categories => {
        res.render('notice/create', {categories});
    });
});

//rota para salvamento dos dados (POST)
router.post('/evento/salvar', upload.single("file"), (req,res) => {
    let {title,time,categoryId,notice} = req.body;
    let date = new Date(req.body.date);
    if(req.file){
        let image = `/img/eventos/${title}${path.extname(req.file.originalname)}`;
        Notice.create({title,date,time,categoryId,notice,image}).then(()=>{
            res.redirect('/admin/eventos/0');
        });
    }else{
        res.redirect('/admin/evento/adicionar');
    }
});

//Rota de editagem (GET)
router.get('/admin/evento/editar/:id', auth, (req,res) => {
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

//rota para salvamento dos dados da edição (POST)
router.post('/evento/mudar', auth, (req,res) => {
    let {id,titleOld, image, title,time,categoryId,notice} = req.body;
    let date = new Date(req.body.date);
    let split = image.split('.');
    let extension = split[1];
    let imageNew = `/img/eventos/${title}.${extension}`;
    let dirOld = `./public/img/eventos/${titleOld}.${extension}`;
    let dirNew = `./public/img/eventos/${title}.${extension}`;
    fs.rename(dirOld, dirNew, (err) => {
        if (err) throw err;
        Notice.update({title,date,time,categoryId,notice,image: imageNew},{where:{id}}).then(()=> {
            res.redirect('/admin/eventos/0');
        });

    });
});

//rota para excluir (POST)
router.post('/evento/excluir', auth,(req,res)=>{
    let {id,title,image} = req.body;
    let split = image.split('.');
    let extension = split[1];
    let dir = `./public/img/eventos/${title}.${extension}`;
    fs.unlink(dir , err =>{
        if (err) throw err;
        Notice.destroy({where:{id}}).then( () => {
            res.redirect('/admin/eventos/0');
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