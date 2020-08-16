const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const auth = require('../Middleware/AuthMiddleware');
const Category = require('../Model/Category');
const Notice = require('../Model/Notice');

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

//Rota de listagem
router.get('/admin/categoria/:num' , auth ,(req,res) => {
    let page = req.params.num;
    let offset = offsetValue(page);
    Category.findAndCountAll({
        order: [['id','DESC']],
        offset,
        limit: 6
    }).then(result => {
        let max = result.count;
        let pages = thereIsPage(max,page);
        res.render('category/read',{categories: result.rows, page: parseInt(page), pages});
    });
});

//Rota de criação (GET)
router.get('/admin/categoria/adicionar', auth, (req,res) => {
    res.render('category/create');
});

//Rota de criação (POST)
router.post('/categoria/criar' , auth, (req,res) => {
    let title = req.body.title;
    let slug = slugify(title);
    Category.create({title,slug}).then(() => {
        res.redirect('/admin/categoria/0');
    });
});

//Rota de edição (GET)
router.get('/admin/categoria/editar/:id', auth, (req,res) => {
    let id = req.params.id;
    if(id != undefined){
        if(!isNaN(id)){
            Category.findByPk(id).then(category => {
                res.render('category/edit',{category});
            }).catch(error => {
                res.redirect('/admin/categoria/0');
            })
        }
    }
});

//Rota de edição (POST)
router.post('/categoria/editar', auth, (req,res) => {
    let {id, title} = req.body;
    let slug = slugify(title);
    Category.update({title: slug},{where:{id}}).then(() => {
        res.redirect('/admin/categoria/0');
    });
});

//Rota de exclusão (POST)
router.post('/categoria/excluir', auth ,(req,res) => {
    let id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            Notice.destroy({where: {categoryId: id}}).then(() => {
                Category.destroy({where: {id}}).then(() => {
                    res.redirect('/admin/categoria/0');
                }).catch(error => {
                    res.redirect('/admin/categoria/0');
                });
            })
        }
    }
});

module.exports = router;