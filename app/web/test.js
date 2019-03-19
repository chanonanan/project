var models = require('../../models');
module.exports = {
    store: (req, res, next) => {
        var test_name = req.body.test_name;
        var date = req.body.date;
        var player_id = req.body.player_id;
        var coach_id = req.body.coach_id;
        var patthen_id = req.body.patthen_id;
        var patthen_name = req.body.patthen_name;
        var patthen = req.body.patthen;
        if (!player_id || !coach_id) {
            res.json({
                successful: false,
                message: "create fail"
            });
        } else {
            if (!patthen_id) {
                models.Patthen.create({
                    patthen_name: patthen_name,
                    patthen: patthen,
                    created_by: coach_id,
                    length: patthen.length
                }).then(patthen => {
                    patthen_id = patthen.id;
                    models.Test.create({
                        test_name: test_name,
                        date: date,
                        player_id: player_id,
                        coach_id: coach_id,
                        patthen_id: patthen_id
                    }).then(resu => {
                        res.json({
                            successful: true,
                            message: "create success",
                            data: resu
                        });
                    }).catch(() => {
                        res.json({
                            successful: false,
                            message: "create fail"
                        });
                    });
                }).catch(() => {
                    res.json({
                        successful: false,
                        message: "create fail"
                    });
                });
            } else {
                models.Test.create({
                    test_name: test_name,
                    date: date,
                    player_id: player_id,
                    coach_id: coach_id,
                    patthen_id: patthen_id
                }).then(resu => {
                    res.json({
                        successful: true,
                        message: "create success",
                        data: resu
                    });
                }).catch(() => {
                    res.json({
                        successful: false,
                        message: "create fail"
                    });
                });
            }


        }

    },
    get: (req, res, next) => {
        var test_id = req.params.id;
        models.Test.findOne({
            where: { id: test_id },
            include: [
                {
                    model: models.User,
                    as: 'Player',
                    // attributes: ['firstname'],
                },
                {
                    model: models.User,
                    as: 'Coach',
                    // attributes: ['firstname'],
                },
                {
                    model: models.Patthen,
                    as: 'Patthen',
                    // attributes: ['firstname'],
                }
            ]
        }).then(test => {
            if (test) {
                // models.User.findOne({
                //     where: { id: player_id }
                // }).then(player => {

                // })
                res.json({
                    successful: true,
                    message: "get test",
                    data: test
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
                message: "get fail"
            });
        });
    },
}