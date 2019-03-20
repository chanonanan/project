var models = require('../../models');
const Op = require('sequelize').Op;
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
}