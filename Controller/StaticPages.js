const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.render('index');    
});

router.get('/sobre', (req,res) => {
    res.render('about');    
});

router.get('/blog', (req,res) => {
    res.render('blog');    
});

router.get('/postagem', (req,res) => {
    res.render('blogDetail'); 
});

router.get('/audio', (req, res) => {
    res.render('audio');
});

router.get('/contato', (req, res) => {
    res.render('contact');
});

router.get('/eventos', (req, res) => {
    res.render('events');
});

router.get('/sermoes', (req, res) => {
    res.render('sermons');
});

router.get('/sermao', (req, res) => {
    res.render('sermonsDetail');
});

module.exports = router;