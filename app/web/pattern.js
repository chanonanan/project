var models = require('../../models');
const Op = require('sequelize').Op;
module.exports = {
    getPattern: (req, res, next) => {
        console.log('req', req.body.name)
        models.Pattern.findAll({
            limit: 10,
            where: {
                [Op.or]: [
                    { pattern_name: { [Op.like]: '%' + req.body.search + '%' } },
                    { pattern: { [Op.like]: '%' + req.body.search + '%' } }
                ]
            }
        }).then(pattern => {
            console.log('found', pattern)
            var s = true;
            if (!pattern) s = false;
            res.json({
                successful: s,
                message: "pattern filter",
                data: pattern
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
    update: (req, res, next) => {
        let pattern_id = req.query.id;
        let pattern = req.query.pattern;
        models.Pattern.update(
            { 
                where: {  id: pattern_id  }
            },
            { 
                pattern : pattern, 
                length : pattern.length
            }
            ).then(pattern => {
            res.json({
                successful: true,
                message: "update success",
                data: pattern
            });
        }).catch(err => {
            res.json({
                successful: false,
                message: "update error"
            });
        });
    },
}