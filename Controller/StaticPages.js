const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();
//database sermon
const Sermao = require('../Model/Sermao');
const Notice = require('../Model/Notice');
const Category = require('../Model/Category');
let months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

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

function admin(req){
    return req.session.user == undefined ? true: false;
}

//function to verificate the offset
function offsetValue(page){
    if(isNaN(page) || page == 1 || page == 0){
        return 0;
    }else{
        return (parseInt(page) -1) * 6;
    }
}

router.get('/', (req,res) => {
    Sermao.findAll({limit: 3, order: [['id','DESC']]}).then(sermons => {
        Notice.findAll({limit: 6, order: [['date','DESC']]}).then(notices => {
            res.render('index',{sermons,months,notices,inside: admin(req)});   
        })
    }) ;
});

router.get('/sobre', (req,res) => {
    res.render('about',{inside: admin(req)});    
});

router.get('/blog', (req,res) => {
    res.render('blog',{inside: admin(req)});    
});

router.get('/postagem', (req,res) => {
    res.render('blogDetail',{inside: admin(req)}); 
});

router.get('/audio', (req, res) => {
    res.render('audio',{inside: admin(req)});
});

router.get('/contato', (req, res) => {
    res.render('contact',{inside: admin(req)});
});

router.post('/filter', (req,res) => {
    let category = req.body.category;
    res.redirect('/eventos/categoria/'+ category+'/1',{inside: admin(req)});
});

router.get('/eventos/:num', (req, res) => {
    const Op = Sequelize.Op;
    let date = new Date();
    let page = req.params.num;
    let offset = offsetValue(page);
    Category.findAll().then(categories => { //busca por todas as tuplas de category(Categoria de evento)
        Notice.findAndCountAll({ //busca por Notices(Avisos)
            where:{ //a partir da data atual até o fim do mês
                date:{
                    [Op.gte]: date,
                    [Op.lte]: new Date(date.getFullYear(),date.getMonth()+1)
                }
            },
            order:[['time','ASC']], //ordem crescente
            offset, //offset a partir de qual tupla iniciará a busca
            limit: 6 //limite de 6 por pesquisa
        }).then(notices => {
            let max = notices.count;
            let pages = thereIsPage(max,page);
            let information = {
                type: "date",
                data: date
            }
            res.render('events',{information,months,notices: notices.rows, pages, page: parseInt(page), categories,inside: admin(req)});
        });
    })
});

router.get('/eventos/categoria/:categoryChosen/:page', (req,res) => {
    let {page,categoryChosen} = req.params;
    let offset = offsetValue(page);
    Category.findAll().then(categories => {
        Category.findOne({where:{title: categoryChosen}}).then(category => {
            Notice.findAndCountAll({
                where:{
                    categoryId: category.id,
                },
                offset,
                limit: 6
            }).then(notices => {
                let max = notices.count;
                let pages = thereIsPage(max,page);
                let information = {
                    type: "category",
                    data: categoryChosen
                }
                res.render('events',{information,months,notices: notices.rows, pages, page: parseInt(page),categories,inside: admin(req)})
            });
        });
    });
});

router.get('/sermoes/:num', (req, res) => {
    let page = req.params.num;
    let offset = offsetValue(page);
    Sermao.findAndCountAll({
        order: [['id','DESC']],
        offset,
        limit: 6
    }).then(result => {
        let max = result.count;
        let pages = thereIsPage(max,page);
        res.render('sermons',{sermons: result.rows, page: parseInt(page), months, pages,inside: admin(req)});
    });
});

router.get('/sermao', (req, res) => {
    res.render('sermonsDetail',{inside: admin(req)});
});

module.exports = router;