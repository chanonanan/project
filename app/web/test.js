var models = require('../../models');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
module.exports = {
    store: (req, res, next) => {
        var test_name = req.body.test_name;
        var date = req.body.date;
        var style = req.body.style;
        var athlete_id = req.body.athlete_id;
        var coach_id = req.body.coach_id;
        var pattern_id = req.body.pattern_id;
        var pattern_name = req.body.pattern_name;
        var pattern = req.body.pattern;
        console.log("asdas", pattern_id, pattern_name, pattern)
        if (!athlete_id || !coach_id) {
            res.json({
                successful: false,
                message: "create fail"
            });
        } else {
            if (!pattern_id) {
                console.log("null patt id")
                var length = null;
                if (pattern) {
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
                        athlete_id: athlete_id,
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
                    athlete_id: athlete_id,
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
                    as: 'Athlete',
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
            console.log("test", test)
            if (test) {
                // models.User.findOne({
                //     where: { id: athlete_id }
                // }).then(athlete => {

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
    list: function (req, res, next) {
        if (req.query.page) var page = +req.query.page; else var page = 1;
        if (req.query.sort) var sort = req.query.sort; else var sort = 'date';
        if (req.query.order) var order = req.query.order; else var order = 'DESC';
        if (req.query.search) var search = '%' + req.query.search + '%'; else var search = '%%';
        var per_page = 10
        var offset = per_page * (page - 1)
        var count;
        models.Test.findAndCountAll({}).then((data) => {
            count = data.count;
            models.Test.findAll({
                include: [
                    {
                        model: models.User,
                        as: 'Athlete',
                    },
                    {
                        model: models.User,
                        as: 'Coach',
                    },
                    {
                        model: models.Pattern,
                        as: 'Pattern',
                    },
                ],
                limit: per_page,
                offset: offset,
                order: [[sequelize.col(sort), order]],
                where: {
                    $or: {
                        '$test_name$': {
                            $like: search
                        },
                        '$Athlete.firstname$': {
                            $like: search
                        },
                        '$Athlete.lastname$': {
                            $like: search
                        },
                        '$Coach.firstname$': {
                            $like: search
                        },
                        '$Coach.lastname$': {
                            $like: search
                        },
                        '$Pattern.pattern_name$': {
                            $like: search
                        },
                        '$Pattern.pattern$': {
                            $like: search
                        },
                    }
                },
            }).then(tests => {
                console.log("asd")
                if (tests) {
                    res.json({
                        successful: true,
                        message: "get test",
                        data: { test: tests, this_page: page, total_item: count, per_page: per_page },
                    });
                } else {
                    res.json({
                        successful: false,
                        message: "no test"
                    });
                }
            })
        })




    },
    getHistory: (req, res, next) => {
        var test_id = req.query.id;
        models.Record.destroy({
            where: { test_id: test_id }
        }).then(record => {
            models.Test.findOne({
                where: { id: test_id },
                include: [
                    {
                        model: models.User,
                        as: 'Athlete',
                    },
                    {
                        model: models.User,
                        as: 'Coach',
                    },
                    {
                        model: models.Pattern,
                        as: 'Pattern',
                    }
                ]
            }).then(test => {
                console.log("test", test)
                if (test) {
                    models.Record.findAll({
                        where: { test_id: test_id },
                        order: [[ "lap", "ASC"]],
                    }).then(recs => {
                        for(let rec of recs){
                            var d = new Date(rec.duration);
                            rec.time = [d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()]
                        }
                        res.json({
                            successful: true,
                            message: "get test",
                            data: { test: test, record: recs }
                        });
                    })
    
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
        });
        
    },
}