const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const bcrypt = require('bcryptjs');
const auth = require('../Middleware/AuthMiddleware');

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

router.get('/login', (req,res) => {
    res.render('user/login',{inside: false});
});

router.get('/logout', (req,res) => {
    req.session.user = undefined;
    res.redirect('/');
})

router.get('/admin', (req,res) => {
    res.render('user/screenAdm');
});

router.post('/autenticacao', (req,res) => {
    let {nickname,password} = req.body;
    User.findOne({where: {nickname}}).then(user => {
        if(user != undefined){
            var correct = bcrypt.compare(password,user.password);
            if(correct){
                //sessão
                req.session.user = {
                    id: user.id,
                    nickname: user.nickname
                }
                res.redirect('/admin');
            }else{
                res.redirect('/login');
            }
        }
    })
})

router.get('/admin/usuario/adicionar', auth , (req,res) => {
    res.render('user/create');
});

router.post('/save/user', auth, (req,res) => {
    let {nickname,password} = req.body;
    User.findOne({where: {nickname}}).then(user => {
        if(user == undefined){
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password,salt);
            User.create({nickname, password: hash}).then(() => {
                res.redirect('/admin/usuario/0');
            });
        }else{
            res.redirect('/admin/usuario/adicionar');
        }
    });
});

router.get('/admin/usuario/:num', auth, (req,res) => {
    let page = req.params.num;
    let offset = offsetValue(page);
    User.findAndCountAll({
        order: [['id','DESC']],
        offset,
        limit: 6
    }).then(result => {
        let max = result.count;
        let pages = thereIsPage(max,page);
        res.render('user/read',{users: result.rows, page: parseInt(page), pages});
    });
});

router.get('/admin/usuario/editar/:id', auth, (req,res) => {
    let id = req.params.id;
    if(!isNaN(id)){
        User.findByPk(id).then(user => {
            res.render('user/edit',{user});
        });
    }
});

router.post('/admin/usuario/delete', auth, (req,res) => {
    let id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            User.destroy({where: {id}}).then( () => {
                res.redirect('/admin/usuario/0');
            });
        }
    }
});

router.post('/admin/usuario/editar', auth, (req,res) => {
    let {nickname,id} = req.body;
    if(!isNaN(id)){
        User.update({nickname},{where:{id}}).then( () => {
            res.redirect('/admin/usuario/0');
        });
    }
});

module.exports = router;