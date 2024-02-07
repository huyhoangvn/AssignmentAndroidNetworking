const db = require('./db');
const truyenTranhSchema = new db.mongo.Schema(
    {
        tenTruyen: { type: String , required: true},
        moTa: {type: String},
        tacGia:{type: String},
        ngayXuatBan:{type: Date , required: true},
        anhBia: [{type:String}],
        anhNoiDung: [{type:String}],
        trangThai:{type: Boolean, required: true}
    }, { collection: 'TruyenTranh'}
);
let truyenTranhModel = db.mongo.model ('truyenTranhModel', truyenTranhSchema );

module.exports = {truyenTranhModel}