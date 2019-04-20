var models = require('../../models');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = {
    getAthlete: (req, res, next) => {
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
        if (req.body.img) var img = req.body.img; else var img = "assets/img/profile.png";
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
                                    role_id: role_id,
                                    img: img
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
    get: (req, res, next) => {
        var user_id = req.query.id;
        if (req.query.page) var page = +req.query.page; else var page = 1;
        if (req.query.sort) var sort = req.query.sort; else var sort = 'date';
        if (req.query.order) var order = req.query.order; else var order = 'DESC';
        var per_page = 10;
        var offset = per_page * (page - 1);
        var count;
        models.Test.findAndCountAll({
            where: {
                [Op.or]: [
                    { coach_id: user_id },
                    { athlete_id: user_id },
                ]
            }
        }).then((data) => {
            count = data.count;
            console.log(sort)
            models.User.findOne({
                where: { id: user_id },
                include: [
                    {
                        model: models.Test,
                        as: 'Athlete',
                        include: [
                            {
                                model: models.User,
                                as: 'Athlete',
                                attributes: ['firstname','lastname'],
                                raw: true
                            },
                            {
                                model: models.User,
                                as: 'Coach',
                                attributes: ['firstname','lastname'],
                                raw: true
                            },
                        ],
                        limit: per_page,
                        offset: offset,
                        order: [[sequelize.col(sort), order]],
                    },
                    {
                        model: models.Test,
                        as: 'Coach',
                        include: [
                            {
                                model: models.User,
                                as: 'Athlete',
                                attributes: ['firstname','lastname'],
                                raw: true
                            },
                            {
                                model: models.User,
                                as: 'Coach',
                                attributes: ['firstname','lastname'],
                                raw: true
                            },
                        ],
                        limit: per_page,
                        offset: offset,
                        order: [[sequelize.col(sort), order]],
                    },
                ],
                logging: true
            }).then(user => {
                console.log("user", user)
                if (user) {
                    res.json({
                        successful: true,
                        message: "get user",
                        data: {user: user, this_page: page, total_item: count, per_page: per_page}
                    });
                } else {
                    res.json({
                        successful: false,
                        message: "get fail"
                    });
                }
            }).catch(() => {
                res.json({
                    successful: false,
                    message: "get fail2"
                });
            });
        })
        
    },
}