var models = require('../../models');
const Op = require('sequelize').Op;
module.exports = {
    store: (rec) => {
        var lap = rec.lap;
        var duration = rec.duration;
        var from = rec.from;
        var to = rec.to;
        var test_id = rec.test_id;
        models.Record.create({
            lap: lap,
            duration: duration,
            from: from,
            to: to,
            test_id: test_id,
        }).then(res => {
            // console.log("create success",res);
        })
    },
    reset: (req, res, next) => {
        var test_id = req.params.test_id;
        // console.log("test_id", test_id)
        models.Record.destroy({
            where: { test_id: test_id }
        }).then(record => {
            res.json({
                successful: true,
                message: "ลบเรียบร้อยแล้ว"
            });
        });
    }
}