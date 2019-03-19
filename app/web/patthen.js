var models = require('../../models');
const Op = require('Sequelize').Op;
module.exports = {
    getPatthen: (req, res, next) => {
        console.log('req', req.body.name)
        models.Patthen.findAll({
            limit: 10,
            where: {
                [Op.or]: [
                    { patthen_name: { [Op.like]: '%' + req.body.search + '%' } },
                    { patthen: { [Op.like]: '%' + req.body.search + '%' } }
                ]
            }
        }).then(patthen => {
            console.log('found', patthen)
            var s = true;
            if (!patthen) s = false;
            res.json({
                successful: s,
                message: "patthen filter",
                data: patthen
            });
        }).catch(err => {
            console.log('errr')
            res.json({
                successful: false,
                message: "ไม่พบแพทเทิร์น"
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