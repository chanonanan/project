var models = require('../../models');
const Op = require('sequelize').Op;
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = {
    getPlayer: (req, res, next) => {
        console.log('req', req.body.name)
        models.User.findAll({
            limit: 10,
            where: {
                role_id: 1,
                [Op.or]: [
                    { firstname: { [Op.like]: '%' + req.body.name + '%' } },
                    { lastname: { [Op.like]: '%' + req.body.name + '%' } },
                    { email: { [Op.like]: '%' + req.body.name + '%' } },
                    { username: { [Op.like]: '%' + req.body.name + '%' } }
                ]
            },
            attributes: { exclude: ['password','role_id','updatedAt','createdAt'] },
        }).then(user => {
            console.log('found', user)
            var s = true;
            if (!user) s = false;
            res.json({
                successful: s,
                message: "user filter",
                data: user
            });
        }).catch(err => {
            console.log('errr')
            res.json({
                successful: false,
                message: "ไม่พบผู้ใช้นี้"
            });
        });
    },
    own: (req, res, next) => {
        models.User.findOne({
            where: {
                id: req.user.id
            },
            attributes: { exclude: ['password'] },
        }).then(user => {
            var s = true;
            if (!user) s = false;
            res.json({
                successful: s,
                message: "get own",
                data: user
            });
        }).catch(err => {
            res.json({
                successful: false,
                message: "get own"
            });
        });
    },
    store: (req, res, next) => {
        var username = req.body.username;
        var password = req.body.password;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var role_id = req.body.role_id;
        if (!username || !password) {
            res.json({
                successful: false,
                message: "create fail3"
            });
        } else {
            models.User.findOne({
                where: { username: username }
            }).then(user => {
                if (user) {
                    res.json({
                        successful: false,
                        message: "มีชื่อผู้ใช้นี้อยู่แล้วในระบบ"
                    });
                } else {
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            if (hash) {
                                models.User.create({
                                    username: username,
                                    password: hash,
                                    firstname: firstname,
                                    lastname: lastname,
                                    email: email,
                                    role_id: role_id
                                }).then(resu => {
                                    res.json({
                                        successful: true,
                                        message: "create success",
                                        data: resu
                                    });
                                });

                            } else {
                                res.json({
                                    successful: false,
                                    message: "create fail2"
                                });
                            }
                        });
                    });
                }
            }).catch(err => {
                res.json({
                    successful: false,
                    message: "create fail:" + err
                });
            });
        }

    },
}