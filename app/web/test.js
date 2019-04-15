var models = require('../../models');
module.exports = {
    store: (req, res, next) => {
        var test_name = req.body.test_name;
        var date = req.body.date;
        var style = req.body.style;
        var player_id = req.body.player_id;
        var coach_id = req.body.coach_id;
        var pattern_id = req.body.pattern_id;
        var pattern_name = req.body.pattern_name;
        var pattern = req.body.pattern;
        console.log("asdas",pattern_id,pattern_name,pattern)
        if (!player_id || !coach_id) {
            res.json({
                successful: false,
                message: "create fail"
            });
        } else {
            if (!pattern_id) {
                console.log("null patt id")
                var length = null;
                if(pattern){
                    length = pattern.length; 
                }
                models.Pattern.create({
                    pattern_name: pattern_name,
                    pattern: pattern,
                    created_by: coach_id,
                    length: length
                }).then(pattern => {
                    console.log("pattern.id")
                    pattern_id = pattern.id;
                    models.Test.create({
                        test_name: test_name,
                        date: date,
                        style: style,
                        player_id: player_id,
                        coach_id: coach_id,
                        pattern_id: pattern_id
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
                    style: style,
                    player_id: player_id,
                    coach_id: coach_id,
                    pattern_id: pattern_id
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
                    model: models.Pattern,
                    as: 'Pattern',
                    // attributes: ['firstname'],
                }
            ]
        }).then(test => {
            console.log("test",test)
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
    getAll: (req, res, next) => {
        models.Test.findAll({
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
                    model: models.Pattern,
                    as: 'Pattern',
                    // attributes: ['firstname'],
                }
            ]
        }).then(test => {
            console.log("test",test)
            if (test) {
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