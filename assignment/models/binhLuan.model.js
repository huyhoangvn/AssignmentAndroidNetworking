const db = require('./db');
const mongo = require('mongoose');

const binhLuanSchema = new db.mongo.Schema(
    {
        idTruyenTranh: {type: mongo.Schema.Types.ObjectId, ref:'TruyenTranh', required: true},
        idNguoiDung: {type: mongo.Schema.Types.ObjectId, ref:'NguoiDung', required: true},
        moTa: {type: String, required: true},
        thoiGianBinhLuan:{type: Date , required: true},
        trangThai:{type: Boolean, required: true}
    }, { collection: 'BinhLuan'}
);
let binhLuanModel = db.mongo.model ('binhLuanModel', binhLuanSchema );

module.exports = {binhLuanModel}