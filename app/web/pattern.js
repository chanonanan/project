var models = require('../../models');
const Op = require('sequelize').Op;
module.exports = {
    getPattern: (req, res, next) => {
        // console.log('req', req.body.name)
        models.Pattern.findAll({
            limit: 10,
            where: {
                [Op.or]: [
                    { pattern_name: { [Op.like]: '%' + req.body.search + '%' } },
                    { pattern: { [Op.like]: '%' + req.body.search + '%' } }
                ]
            }
        }).then(pattern => {
            // console.log('found', pattern)
            var s = true;
            if (!pattern) s = false;
            res.json({
                successful: s,
                message: "pattern filter",
                data: pattern
            });
        }).catch(err => {
            // console.log('errr')
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
        let pattern_id = req.body.id;
        let pattern_pattern = req.body.pattern;
        models.Pattern.findOne({ 
                where: {  id: pattern_id  }
            }).then(pattern => {
                if (pattern) {
                    pattern.pattern = pattern_pattern;
                    pattern.save().then(() => {
                        res.json({
                            successful: true,
                            message: "success"
                        });
                    })
                } else {
                    res.json({
                        successful: false,
                        message: "update error"
                    });
                }
        }).catch(err => {
            res.json({
                successful: false,
                message: "update error"
            });
        });
    },
}