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






module.exports = router;