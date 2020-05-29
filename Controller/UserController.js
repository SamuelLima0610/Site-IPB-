const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const bcrypt = require('bcryptjs');
const auth = require('../Middleware/AuthMiddleware');

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
            var correct = bcrypt.compareSync(password,user.password);
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
            console.log("Aqui")
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password,salt);
            User.create({nickname, password: hash}).then(() => {
                res.redirect('/admin/usuario');
            });
        }else{
            res.redirect('/admin/usuario/adicionar');
        }
    });
});

router.get('/admin/usuario', auth, (req,res) => {
    User.findAll().then(users => {
        res.render('user/read',{users});
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
                res.redirect('/admin/usuario');
            });
        }
    }
});

router.post('/admin/usuario/editar', auth, (req,res) => {
    let {nickname,id} = req.body;
    if(!isNaN(id)){
        User.update({nickname},{where:{id}}).then( () => {
            res.redirect('/admin/usuario');
        });
    }
});

module.exports = router;