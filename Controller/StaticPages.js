const express = require('express');
const router = express.Router();
//database sermon
const Sermao = require('../Model/Sermao');
let months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

router.get('/', (req,res) => {
    Sermao.findAll({limit: 3, order: [['id','DESC']]}).then(sermons => {
        res.render('index',{sermons,months});   
    }) ;
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

router.get('/sermoes/:num', (req, res) => {
    let page = req.params.num;
    let offset = 0;

    if(isNaN(page) || page == 1 || page == 0){
        offset = 0;
    }else{
        offset = (parseInt(page) -1) * 6;
    }
    Sermao.findAndCountAll({
        order: [['id','DESC']],
        offset,
        limit: 6
    }).then(result => {
        let max = result.count;
        let arrowleft = parseInt(page) - 1;
        let page2 = ((parseInt(page)) * 6) + 1;
        let page3 = ((parseInt(page) + 1) * 6) + 1;
        let arrowRight = ((parseInt(page) + 2) * 6) + 1;
        let left = false;
        let right = false;
        let secondPage = false;
        let thirdPage= false;
        if(arrowleft > 0){
            left = true
        }
        if(page2 <= max){
            secondPage = true;
            if(page3 <= max){
                thirdPage = true;
                if(arrowRight < max){
                    right = true
                }
            }
        }
        res.render('sermons',{sermons: result.rows, page: parseInt(page), months, left, secondPage , thirdPage , right});
    });
});

router.get('/sermao', (req, res) => {
    res.render('sermonsDetail');
});

module.exports = router;