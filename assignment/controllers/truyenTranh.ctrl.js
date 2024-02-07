const myMD = require('../models/truyenTranh.model');
const auth = require('../controllers/auth.ctrl');
const binhLuanCtrl = require('../controllers/binhLuan.ctrl');
const mongo = require('mongoose');
var sock = require('../socket_server');

const laySoLuongDanhSach = async (req, res, next)=>{
    let data = {};
    let msg = "Lấy số lượng thành công";
    data = await myMD.truyenTranhModel.find().count();
    return {data, msg}
}

const layDanhSach = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const match = { trangThai: true };
    var skip = 0;
    var limit = 1000;//all
    if(typeof(req.query.tenTruyen) != 'undefined' && req.query.tenTruyen != ""){
        match.tenTruyen = {$regex: req.query.tenTruyen + "?"}
    }
    if(typeof(req.query.tacGia) != 'undefined' && req.query.tacGia != ""){
        match.tacGia = {$regex: req.query.tacGia + "?"}
    }
    if(typeof(req.query.limit) != 'undefined' && req.query.limit != ""){
        limit = parseInt(req.query.limit);
    }
    if(typeof(req.query.page) != 'undefined' && req.query.page != ""){
        skip = limit * (req.query.page - 1);
    }
    if(typeof(req.query.year) != 'undefined' && req.query.year != ""){
        match.ngayXuatBan = {
            $gte: new Date(req.query.year+"-01-01T00:00:00.000Z"),
            $lte: new Date(req.query.year+"-12-31T00:00:00.000Z")
        }
    }
    await myMD.truyenTranhModel.aggregate([
        {
            $match: match
        },
        {
            $project : {
                "_id" : "$_id",
                "tenTruyen" : "$tenTruyen",
                "tacGia" : "$tacGia",
                "moTa": "$moTa",
                "ngayXuatBan" : { $dateToString: { format: "%d-%m-%Y" , date: "$ngayXuatBan"} },
                "anhBia" : [{ $concat:[req.protocol + "://", req.get("host"), "/public/images/", { $arrayElemAt: ["$anhBia", 0]}]}],
                "trangThai": "$trangThai"
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        }
    ]).then((result)=> {
            data = result;
            msg = "Lấy dữ liệu thành công"
        }
    ).catch((err) => {
            msg = "Lấy dữ liệu thất bại"
        }
    )
    return {data, msg}
}

const layChiTiet = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idTruyenTranh;
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
    } catch (err) {
        msg = "Lỗi id truyện tranh";
        return {data, msg};
    }
    await myMD.truyenTranhModel.aggregate([
        {
            $match: {
                _id: idTruyenTranh,
                trangThai: true
            }
        },
        {
            $project : {
                "_id" : "$_id",
                "tenTruyen" : "$tenTruyen",
                "tacGia" : "$tacGia",
                "moTa": "$moTa",
                "ngayXuatBan" : { $dateToString: { format: "%d-%m-%Y" , date: "$ngayXuatBan"} },
                "anhBia" : [{$concat:[req.protocol + "://", req.get("host"), "/public/images/", { $arrayElemAt: ["$anhBia", 0]}]}],
                "trangThai": "$trangThai"
            }
        }
    ])
    .then((result)=>{
        if(result.length > 0){
            data = result[0];
            msg = "Lấy chi tiết truyện thành công";
        }
        else {
            msg = "Lấy chi tiết truyện thất bại";
        }
        return {data , msg}
    })
    .catch((err)=>{
        msg = "Lấy chi tiết truyện thất bại";
        return {data, msg};
    })
    return {data, msg}
}

const layNoiDung = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idTruyenTranh;
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
    } catch (err) {
        msg = "Lỗi id truyện tranh";
        return {data, msg};
    }
    await myMD.truyenTranhModel.findOne({_id: idTruyenTranh})
    .then((result)=>{
        msg = "Lấy nội dung truyện thành công";
        data = {
            _id: result.id,
            tenTruyen: result.tenTruyen,
            anhNoiDung: result.anhNoiDung.map((item)=>{
                return req.protocol + "://" + req.get("host") + "/public/images/" + item;}),
            anhBia: [req.protocol + "://" + req.get("host") + "/public/images/" + result.anhBia]
        }
        return {data , msg}
    })
    .catch((err)=>{
        msg = "Lấy nội dung truyện thất bại";
        return {data, msg};
    })
    return {data, msg}
}

const themTruyen = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const tenTruyen = req.body.tenTruyen;
    const tacGia = req.body.tacGia;
    const moTa = req.body.moTa;
    const ngayXuatBan = req.body.ngayXuatBan;
    if(typeof(req.files) != 'undefined'){
        if(typeof(req.files.anhBia) != 'undefined'){
            anhBia = req.files.anhBia.map((file) => file.filename);
        } else {
            msg = "Chưa chọn ảnh bìa";
            return {data, msg};
        }
        if(typeof(req.files.anhNoiDung) != 'undefined'){
            anhNoiDung = req.files.anhNoiDung.map((file) => file.filename);
        } else {
            msg = "Chưa chọn ảnh nội dung";
            return {data, msg};
        }
    } else {
        msg = "Chưa chọn ảnh";
        return {data, msg};
    }
    //Validate
    if(typeof tenTruyen === "string" && tenTruyen.trim().length === 0){
        msg = "Chưa nhập tên truyện";
        return {data, msg};
    }
    if(typeof tacGia === "string" && tacGia.trim().length === 0){
        msg = "Chưa nhập tác giả";
        return {data, msg};
    }
    if(typeof moTa === "string" && moTa.trim().length === 0){
        msg = "Chưa nhập mô tả";
        return {data, msg};
    }
    if(typeof ngayXuatBan === "string" && ngayXuatBan.trim().length === 0){
        msg = "Chưa nhập ngày xuất bản";
        return {data, msg};
    }
    //Thêm mới truyện
    let objSave = {
        tenTruyen: tenTruyen,
        moTa: moTa,
        tacGia: tacGia,
        ngayXuatBan: ngayXuatBan,
        anhBia: anhBia,
        anhNoiDung: anhNoiDung,
        trangThai: true
    };
    await myMD.truyenTranhModel.create(objSave)
    .then(
        (response) => {
            data = response;
            msg = "Thêm mới truyện thành công";
            sock.io.emit("news", data.tenTruyen + " đã được thêm");
        }
    ).catch((err)=>{
        console.log(err);
        msg = "Thêm mới truyện thất bại";
    })
    return {data, msg};
}


const capNhatTruyen = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const tenTruyen = req.body.tenTruyen;
    const tacGia = req.body.tacGia;
    const moTa = req.body.moTa;
    const ngayXuatBan = req.body.ngayXuatBan;
    let idTruyenTranh;
    let anhBia;
    let anhNoiDung;
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
    } catch (err) {
        msg = "Lỗi id truyện";
        return {data, msg};
    }
    //Validate
    if(typeof tenTruyen === "string" && tenTruyen.trim().length === 0){
        msg = "Chưa nhập tên truyện";
        return {data, msg};
    }
    if(typeof tacGia === "string" && tacGia.trim().length === 0){
        msg = "Chưa nhập tác giả";
        return {data, msg};
    }
    if(typeof moTa === "string" && moTa.trim().length === 0){
        msg = "Chưa nhập mô tả";
        return {data, msg};
    }
    if(typeof ngayXuatBan === "string" && ngayXuatBan.trim().length === 0){
        msg = "Chưa nhập ngày xuất bản";
        return {data, msg};
    }
    //Thêm mới truyện
    let objSave = {
        tenTruyen: tenTruyen,
        moTa: moTa,
        tacGia: tacGia,
        ngayXuatBan: ngayXuatBan,
    };
    if(typeof(req.files) != 'undefined'){
        if(typeof(req.files.anhBia) != 'undefined'){
            objSave.anhBia = req.files.anhBia.map((file) => file.filename);
        }
        if(typeof(req.files.anhNoiDung) != 'undefined'){
            objSave.anhNoiDung = req.files.anhNoiDung.map((file) => file.filename);
        }
    }
    await myMD.truyenTranhModel.findOneAndUpdate({_id: idTruyenTranh}, objSave, {new : true})
    .then(
        (response) => {
            data = response;
            msg = "Cập nhật truyện thành công";
        }
    ).catch((err)=>{
        console.log(err);
        msg = "Cập nhật truyện thất bại";
    })
    return {data, msg};
}

const xoaTruyen = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idTruyenTranh;
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
    } catch (err) {
        msg = "Lỗi id truyện";
        return {data, msg};
    }
    await myMD.truyenTranhModel.findOneAndDelete({_id: idTruyenTranh})
    .then(
        (response) => {
            data = response;
            msg = "Xóa truyện thành công";
        }
    ).catch((err)=>{
        console.log(err);
        msg = "Xóa truyện thất bại";
    })
    return {data, msg};
}

//API
const layDanhSachApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await layDanhSach(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const laySoLuongDanhSachApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await laySoLuongDanhSach(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const layChiTietApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await layChiTiet(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}))
}

const layNoiDungApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await layNoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}))
}

const themTruyenApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await themTruyen(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}))
}

const capNhatTruyenApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await capNhatTruyen(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}))
}

const xoaTruyenApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await xoaTruyen(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}))
}

//WEB VIEW
const layDanhSachWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let checkAdmin = await auth.checkAdmin(req, res, next);
    if(!checkAdmin){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await layDanhSach(req, res, next);
    let soLuong = await laySoLuongDanhSach(req, res, next);
    data.danhSach = result.data;
    data.soLuong = soLuong.data;
    msg = result.msg;
    res.render("truyentranh/danhSachTruyen", {data, msg});
}

const layChiTietWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await layChiTiet(req, res, next);
    data.chiTiet = result.data;
    msg = result.msg;
    let resultBinhLuan = await binhLuanCtrl.layDanhSach(req, res, next);
    let soLuong = await binhLuanCtrl.laySoLuongDanhSach(req, res, next);
    data.binhLuan = resultBinhLuan.data;
    data.soLuong = soLuong.data;
    res.render("truyentranh/chiTietTruyen", {data, msg});
}

const layNoiDungWebView = async (req, res, next)=>{
    let data;
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await layNoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.render("truyentranh/noiDungTruyen", {data, msg});
}

const themTruyenWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await themTruyen(req, res, next);
    data = result.data;
    msg = result.msg;
    res.render("truyentranh/themTruyen", {data, msg});
}

const suaTruyenWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await capNhatTruyen(req, res, next);
    data = result.data;
    msg = result.msg;
    res.redirect("/danh-sach-truyen" + "/" + req.params.idAdmin);
}


const layTrangThemTruyenWebView = async (req, res, next)=>{
    let data;
    let msg = "";
    res.render("truyentranh/themTruyen", {data, msg});
}

const errMulterCheckerWebView = async (err, req, res, next)=>{
    let data = {};
    let msg = "";
    if (err.code === "LIMIT_FILE_SIZE") {
        msg = "File quá lớn"
        res.render("truyentranh/themTruyen", {data, msg});
    } else if (err.code === "LIMIT_FILE_COUNT") {
        msg = "Vượt quá số lượng file tải lên đồng thời (ảnh bìa 1 file, ảnh nội dung 10 files)";
        res.render("truyentranh/themTruyen", {data, msg});
    } else {
        msg = "" + err.message;
        res.render("truyentranh/themTruyen", {data, msg});
    }
}

const xoaTruyenWebview = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await xoaTruyen(req, res, next);
    data = result.data;
    msg = result.msg;
    res.redirect("/danh-sach-truyen" + "/" + req.params.idAdmin);
}

module.exports = {
    //Api
    layDanhSachApi,
    laySoLuongDanhSachApi,
    layChiTietApi,
    layNoiDungApi,
    themTruyenApi,
    capNhatTruyenApi,
    xoaTruyenApi,
    //Web View
    layDanhSachWebView,
    layChiTietWebView,
    layNoiDungWebView,
    themTruyenWebView,
    suaTruyenWebView,
    layTrangThemTruyenWebView,
    errMulterCheckerWebView,
    xoaTruyenWebview
}