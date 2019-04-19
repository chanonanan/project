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
    list: async function (req, res, next) {
        if (req.query.page) var page = +req.query.page; else var page = 1;
        if (req.query.sort) var sort = req.query.sort; else var sort = 'date';
        if (req.query.order) var order = req.query.order; else var order = 'DESC';
        if (req.query.search) var search = '%' + req.query.search + '%'; else var search = '%%';
        var per_page = 10
        var offset = per_page * (page - 1)
        var clients_count = await models.Test.findAll({ raw: true, attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'count']], })
        console.log(clients_count)

            var tests = await models.sequelize.query(
"SELECT         `test`.`id`,\
                `test`.`test_name`, \
                `test`.`style`,\
                `test`.`date`, \
                `athlete`.`id`           AS `athlete_id`, \
                `athlete`.`firstname`    AS `athlete_firstname`, \
                `athlete`.`lastname`     AS `athlete_lastname`, \
                `athlete`.`email`        AS `athlete_email`, \
                `athlete`.`username`     AS `athlete_username`, \
                `coach`.`id`             AS `coach_id`, \
                `coach`.`firstname`      AS `coach_firstname`, \
                `coach`.`lastname`       AS `coach_lastname`, \
                `coach`.`email`          AS `coach_email`, \
                `coach`.`username`       AS `coach_username`, \
                `pattern`.`id`           AS `pattern_id`, \
                `pattern`.`pattern_name` AS `pattern_pattern_name`, \
                `pattern`.`pattern`      AS `pattern_pattern`, \
                `pattern`.`length`       AS `pattern_length` \
FROM            `tests`                  AS `test` \
LEFT OUTER JOIN `users`                  AS `athlete` \
ON              `test`.`athlete_id` = `athlete`.`id` \
LEFT OUTER JOIN `users` AS `coach` \
ON              `test`.`coach_id` = `coach`.`id` \
LEFT OUTER JOIN `patterns` AS `pattern` \
ON              `test`.`pattern_id` = `pattern`.`id` \
WHERE(`test`.`test_name` LIKE :search OR `athlete`.`firstname` LIKE :search OR `athlete`.`lastname` LIKE :search \
        OR `coach`.`firstname` LIKE :search OR `coach`.`lastname` LIKE :search\
        OR `pattern`.`pattern_name` LIKE :search OR `pattern`.`pattern` LIKE :search )\
ORDER BY " + sort + ' ' + order + " LIMIT :per_page OFFSET :offset",
                { replacements: { search: search, per_page: per_page, offset: offset }, type: sequelize.QueryTypes.SELECT }
            )
            await res.json({
                successful: true,
                message: "list of clients",
                data: { test: tests, this_page: page, total_item: clients_count['0'].count, per_page: per_page },
            });


    },
    getHistory: (req, res, next) => {
        var test_id = req.query.id;
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
                    where: { test_id: test_id }
                }).then(rec => {
                    res.json({
                        successful: true,
                        message: "get test",
                        data: {test: test, record: rec}
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
    },
}