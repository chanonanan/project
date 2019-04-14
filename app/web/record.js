var models = require('../../models');
const Op = require('sequelize').Op;
module.exports = {
    store: (rec) => {
        var duration = rec.duration;
        var from = rec.from;
        var to = rec.to;
        var test_id = rec.test_id;
        models.Record.create({
            duration: duration,
            from: from,
            to: to,
            test_id: test_id,
        }).then(res => {
            console.log("create success",res);
        })
    },
    reset: (req, res, next) => {
        var test_id = req.body.test_id;
        console.log("test_id", test_id)
        models.Record.findAll({
            where: { test_id: test_id }
        }).then(record => {
            record.destroy().then(() => {
                res.json({
                    successful: true,
                    message: "ลบเรียบร้อยแล้ว"
                });
            });
        });
    }
}