var models = require('../../models');
module.exports = {
    getOne: (req, res, next) => {
        models.User.findOne({
            where: {
                id: req.params.id
            },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: models.Role,
                    as: 'role',
                    attributes: ['name', 'id'],
                    include: [
                        {
                            model: models.RolePermission,
                            as: 'permissions',
                            attributes: ['permission']
                        }
                    ]
                }
            ],
        }).then(user => {
            var s = true;
            if (!user) s = false;
            res.json({
                successful: s,
                message: "ไม่พบผู้ใช้นี้",
                data: user
            });
        }).catch(err => {
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
            // include: [
            //     {
            //         model: models.Role,
            //         as: 'role',
            //         attributes: ['name', 'id'],
            //         include: [
            //             {
            //                 model: models.RolePermission,
            //                 as: 'permissions',
            //                 attributes: ['permission']
            //             }
            //         ]
            //     }
            // ],
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