var models = require('../../models');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = {
    get: async (req, res, next) => {
        user_id = req.query.id;
        coach = await models.User.findAndCountAll({ where: {role_id: 0} });
        athlete = await models.User.findAndCountAll({ where: {role_id: 1} });
        test = await models.Test.findAndCountAll({});
        latest = await models.Test.findOne({ 
            where: {
                [Op.or]: [
                    { coach_id: user_id },
                    { athlete_id: user_id },
                ]
            },
            include:  [
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
                {
                    model: models.Record,
                }
            ],
            order: [ [ 'createdAt', 'DESC' ], [ models.Record, 'lap', "ASC"]],
        });
        if(!latest){
            latest = []
        }
        // console.log(latest)
        await res.json({
            successful: true,
            message: 'success',
            data: {
                info: {
                    coach: coach.count,
                    athlete: athlete.count,
                    test: test.count,
                },
                latest: latest
            }
        });
    },
}