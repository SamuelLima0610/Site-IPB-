const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const Category = require('../Model/Category');
const Notice = require('../Model/Notice');

//Rota de criação
router.get('/admin/categoria' , (req,res) => {
    Category.findAll().then(categories => {
        res.render('category/read',{categories});
    });
});

router.get('/admin/categoria/adicionar' , (req,res) => {
    res.render('category/create');
});

router.post('/categoria/criar' , (req,res) => {
    let title = req.body.title;
    let slug = slugify(title);
    Category.create({title,slug}).then(() => {
        res.redirect('/admin/categoria');
    });
});

router.get('/admin/categoria/editar/:id' , (req,res) => {
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

router.post('/categoria/editar' , (req,res) => {
    let {id, title} = req.body;
    let slug = slugify(title);
    Category.update({title: slug},{where:{id}}).then(() => {
        res.redirect('/admin/categoria');
    });
});

router.post('/categoria/excluir', (req,res) => {
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