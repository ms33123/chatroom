const db = require('./mysql/index');
create = function() {
    const sql = `CREATE TABLE IF NOT EXISTS 'chathistory'  (
        'id' int(0) NOT NULL AUTO_INCREMENT,
        'content' varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
        PRIMARY KEY ('id') USING BTREE
      ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;`
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
        }
    })
}
module.exports = create