const myMD = require('../models/binhLuan.model');
const auth = require('../controllers/auth.ctrl');
const mongo = require('mongoose');
var sock = require('../socket_server');

const themBinhLuan = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const moTa = req.body.moTa;
    const thoiGianBinhLuan = new Date().toISOString();
    let idTruyenTranh;
    let idNguoiDung
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
        idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    } catch (err) {
        msg = "Lỗi sai id";
        return {data, msg};
    }
    //Validate
    if(typeof moTa === "string" && moTa.trim().length === 0){
        msg = "Chưa nhập nội dung bình luận";
        return {data, msg};
    }
    //Thêm mới bình luận
    let objSave = {
        idTruyenTranh: idTruyenTranh,
        idNguoiDung: idNguoiDung,
        moTa: moTa,
        thoiGianBinhLuan: thoiGianBinhLuan,
        trangThai: true
    };
    await myMD.binhLuanModel.create(objSave)
    .then(
        (response) => {
            data = response;
            msg = "Thêm mới bình luận thành công";
            sock.io.in(idTruyenTranh.toString()).emit("binhluan", "Có bình luận mới");
        }
    ).catch((err)=>{
        console.log(err);
        msg = "Thêm mới bình luận thất bại";
    })
    return {data, msg};
}

const xoaBinhLuan = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idBinhLuan;
    try{
        idBinhLuan = new mongo.Types.ObjectId(req.params.idBinhLuan);
    } catch (err) {
        msg = "Lỗi id bình luận";
        return {data, msg};
    }
    await myMD.binhLuanModel.findOneAndDelete({ _id: idBinhLuan })
    .then((result)=> {
        data = result;
        msg = "Xóa bình luận thành công"
    }
    ).catch((err) => {
            msg = "Xóa bình luận thất bại"
    });
    return {data, msg};
}

const suaBinhLuan = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idBinhLuan;
    const moTa = req.body.moTa;
    try{
        idBinhLuan = new mongo.Types.ObjectId(req.params.idBinhLuan);
    } catch (err) {
        msg = "Lỗi id bình luận";
        return {data, msg};
    }
    if(typeof moTa === "string" && moTa.trim().length === 0){
        msg = "Chưa nhập mô tả";
        return {data, msg};
    }
    let objSave = {
        moTa: moTa,
    };
    await myMD.binhLuanModel.findOneAndUpdate({_id: idBinhLuan}, objSave, {new : true})
    .then((result)=> {
        data = result;
        msg = "Sửa bình luận thành công"
    }
    ).catch((err) => {
            msg = "Sửa bình luận thất bại"
    });
    return {data, msg};
}

const laySoLuongDanhSach = async (req, res, next)=>{
    let data = {};
    let msg = "Lấy số lượng thành công";
    let idTruyenTranh;
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
    } catch (err) {
        msg = "Lỗi id truyện tranh";
        return {data, msg};
    }
    data = await myMD.binhLuanModel.find({idTruyenTranh: idTruyenTranh}).count();
    return {data, msg}
}

const layDanhSach = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idTruyenTranh;
    try{
        idTruyenTranh = new mongo.Types.ObjectId(req.params.idTruyenTranh);
    } catch (err) {
        msg = "Lỗi sai id";
        return {data, msg};
    }
    const match = { 
        idTruyenTranh: idTruyenTranh,
        trangThai: true 
    };
    var skip = 0;
    var limit = 1000;//all
    if(typeof(req.query.username) != 'undefined' && req.query.username != ""){
        match.username = {$regex: req.query.username + "?"}
    }
    if(typeof(req.query.moTa) != 'undefined' && req.query.moTa != ""){
        match.moTa = {$regex: req.query.moTa + "?"}
    }
    if(typeof(req.query.limit) != 'undefined' && req.query.limit != ""){
        limit = parseInt(req.query.limit);
    }
    if(typeof(req.query.page) != 'undefined' && req.query.page != ""){
        skip = limit * (req.query.page - 1);
    }
    await myMD.binhLuanModel.aggregate([
        {$lookup: {
            from: "NguoiDung",
            localField: "idNguoiDung",
            foreignField: "_id",
            as: "NguoiBinhLuan"
        }},
        {$unwind: {
          path: "$NguoiBinhLuan",
          preserveNullAndEmptyArrays: false
        }},
        {
            $match: match
        },
        { $sort : { thoiGianBinhLuan : -1 } },
        {
            $project : {
                "_id" : "$_id",
                "fullname": "$NguoiBinhLuan.fullname",
                "moTa" : "$moTa",
                "thoiGianBinhLuan" : { $dateToString: { format: "%d-%m-%Y %H:%M" , date: "$thoiGianBinhLuan"} },
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

//API
const themBinhLuanpApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await themBinhLuan(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const suaBinhLuanpApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await suaBinhLuan(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const xoaBinhLuanpApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await xoaBinhLuan(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const layDanhSachApi = async (req, res, next)=>{
    let data;
    let msg = "";
    let result = await layDanhSach(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const laySoLuongDanhSachApi = async (req, res, next)=>{
    console.log("Here")
    let data;
    let msg = "";
    let result = await laySoLuongDanhSach(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

//Webview
const themBinhLuanWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await themBinhLuan(req, res, next);
    const idTruyenTranh = req.params.idTruyenTranh;
    const idNguoiDung = req.params.idNguoiDung;
    res.redirect('/chi-tiet' + "/" + idTruyenTranh + "/" + idNguoiDung);
}

const xoaWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await xoaBinhLuan(req, res, next);
    data = result.data;
    msg = result.msg;
    res.redirect("/chi-tiet" + "/" + req.params.idTruyenTranh + "/" + req.params.idAdmin);
}

module.exports = {
    layDanhSach,
    laySoLuongDanhSach,
    //Api
    layDanhSachApi,
    laySoLuongDanhSachApi,
    themBinhLuanpApi,
    suaBinhLuanpApi,
    xoaBinhLuanpApi,
    //Web View
    themBinhLuanWebView,
    xoaWebView
}