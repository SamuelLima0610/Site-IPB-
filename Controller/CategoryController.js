const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const Category = require('../Model/Category');

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
    Category.findByPk(id).then(category => {
        res.render('category/edit',{category});
    });
});

router.post('/categoria/editar' , (req,res) => {
    let id = req.body.id;
    let title = req.body.title;
    let slug = slugify(title);
    Category.update({title: slug},{where:{id}}).then(() => {
        res.redirect('/admin/categoria');
    });
});

router.post('/categoria/excluir', (req,res) => {
    let id = req.body.id;
    Category.destroy({where: {id}}).then(() => {
        res.redirect('/admin/categoria');
    });
});

module.exports = router;