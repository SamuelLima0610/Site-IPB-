const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const auth = require('../Middleware/AuthMiddleware');
const Category = require('../Model/Category');
const Notice = require('../Model/Notice');

//Rota de listagem
router.get('/admin/categoria' , auth ,(req,res) => {
    Category.findAll().then(categories => {
        res.render('category/read',{categories});
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
        res.redirect('/admin/categoria');
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
                res.redirect('/admin/categoria');
            })
        }
    }
});

//Rota de edição (POST)
router.post('/categoria/editar', auth, (req,res) => {
    let {id, title} = req.body;
    let slug = slugify(title);
    Category.update({title: slug},{where:{id}}).then(() => {
        res.redirect('/admin/categoria');
    });
});

//Rota de exclusão (POST)
router.post('/categoria/excluir', auth ,(req,res) => {
    let id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            Notice.destroy({where: {categoryId: id}}).then(() => {
                Category.destroy({where: {id}}).then(() => {
                    res.redirect('/admin/categoria');
                }).catch(error => {
                    res.redirect('/admin/categoria');
                });
            })
        }
    }
});

module.exports = router;