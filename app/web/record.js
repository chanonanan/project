var models = require('../../models');
const Op = require('sequelize').Op;
module.exports = {
    store: (rec) => {
        console.log("store", rec)
        models.Record.create({
            duration: rec.duration,
            from: rec.from,
            to: rec.to,
            test_id: rec.test_id,
        }).then(res => {
            res.json({
                successful: true,
                message: "create success",
                data: res
            })
        })
    }
}