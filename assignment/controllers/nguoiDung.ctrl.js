const myMD = require('../models/nguoiDung.model');
const auth = require('../controllers/auth.ctrl');
const mongo = require('mongoose');
var sock = require('../socket_server');

const dangNhap = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const username = req.body.username;
    const password = req.body.password;
    //Validate
    if(typeof username === "string" && username.trim().length === 0){
        msg = "Chưa nhập tên đăng nhập";
        return {data, msg};
    }
    if(typeof password === "string" && password.trim().length === 0){
        msg = "Chưa nhập mật khẩu";
        return {data, msg};
    }
    var item = await myMD.nguoiDungModel.findOne({ username: username });
    if(item == null){
        msg = "Tài khoản không tồn tại";
        return {data, msg};
    } 
    else {
        if(item.password == password){
            data = {
                _id : item._id,
                fullname : item.fullname,
                email : item.email,
                isAdmin : item.isAdmin,
                trangThai: item.trangThai
            }
            msg = "Đăng nhập thành công";
            // sock.io.emit("login", item.fullname + " đăng nhập thành công");
        }
        else{
            msg = "Mật khẩu không chính xác";
        }
    }
    return {data, msg};
}

const themNguoiDung = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fullname = req.body.fullname;
    //Validate
    if(typeof username === "string" && username.trim().length === 0){
        msg = "Chưa nhập tên đăng nhập";
        return {data, msg};
    }
    if(typeof password === "string" && password.trim().length === 0){
        msg = "Chưa nhập mật khẩu";
        return {data, msg};
    }
    if(typeof email === "string" && email.trim().length === 0){
        msg = "Chưa nhập email";
        return {data, msg};
    }
    if(typeof fullname === "string" && fullname.trim().length === 0){
        msg = "Chưa nhập họ tên";
        return {data, msg}   ;    
    }
    if(typeof email === "string" && email.trim().length > 50){
        msg = "Email quá dài. Tối đa 50 kí tự";
        return {data, msg};
    }
    if(typeof username === "string" && username.trim().length > 50){
        msg = "Username quá dài. Tối đa 50 kí tự";
        return {data, msg};
    }
    if(typeof fullname === "string" && fullname.trim().length > 50){
        msg = "Họ và tên quá dài. Tối đa 50 kí tự";
        return {data, msg}   ;    
    }
    var item = await myMD.nguoiDungModel.findOne({ username: username });
    if(item != null){
        msg = "Tên tài khoản đã tồn tại";
        return {data, msg};
    };
    //Thêm mới người dùng
    let objSave = {
        username: username,
        email:email,
        password:password,
        fullname:fullname,
        isAdmin: false,
        trangThai: true
    };
    await myMD.nguoiDungModel.create(objSave)
    .then(
        (response) => {
            data = {
                _id : response._id,
                fullname : response.fullname,
                email : response.email,
                isAdmin : response.isAdmin,
                trangThai: response.trangThai
            }
            msg = "Thêm mới tài khoản thành công";
            sock.io.emit("register", response.fullname + " đăng ký thành công");

        }
    ).catch((err)=>{
        console.log(err);
        msg = "Thêm mới tài khoản thất bại";
    })
    return {data, msg};
}

const laySoLuongDanhSach = async (req, res, next)=>{
    let data = {};
    let msg = "";
    data = await myMD.nguoiDungModel.find().count();
    return {data, msg}
}

const layDanhSach = async (req, res, next)=>{
    // "^" start
    // "$" end
    // "?" contain
    let data = {};
    let msg = "";
    const match = { trangThai: true };
    var skip = 0;
    var limit = 1000;//all
    if(typeof(req.query.username) != 'undefined' && req.query.username != ""){
        match.username = {$regex: req.query.username + "?"}
    }
    if(typeof(req.query.fullname) != 'undefined' && req.query.fullname != ""){
        match.fullname = {$regex: req.query.fullname + "?"}
    }
    if(typeof(req.query.email) != 'undefined' && req.query.email != ""){
        match.email = {$regex: req.query.email + "?"}
    }
    if(typeof(req.query.limit) != 'undefined' && req.query.limit != ""){
        limit = parseInt(req.query.limit);
    }
    if(typeof(req.query.page) != 'undefined' && req.query.page != ""){
        skip = limit * (req.query.page - 1);
    }
    //fullname = "\\w+";
    await myMD.nguoiDungModel.aggregate([
        {
            $match: match
        },
        {
            $project : {
                "_id" : "$_id",
                "username" : "$username",
                // "password": "$password",
                "fullname" : "$fullname",
                "email": "$email",
                "isAdmin": "$isAdmin",
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

const chiTietNguoiDung = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idNguoiDung;
    try{
        idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    } catch (err) {
        msg = "Lỗi id truyện tranh";
        return {data, msg};
    }
    await myMD.nguoiDungModel.aggregate([
        {
            $match: {
                _id: idNguoiDung,
                trangThai: true
            }
        },
        {
            $project : {
                "_id" : "$_id",
                "username" : "$username",
                // "password": "$password",
                "fullname" : "$fullname",
                "email": "$email",
                "isAdmin": "$isAdmin",
            }
        }
    ])
    .then((result)=>{
        if(result.length > 0){
            data = result[0];
            msg = "Lấy chi tiết người dùng thành công";
        }
        else {
            msg = "Lấy chi tiết người dùng thất bại";
        }
        return {data , msg}
    })
    .catch((err)=>{
        msg = "Lấy chi tiết người dùng thất bại";
        return {data, msg};
    })
    return {data, msg}
}

const capNhatNguoiDung = async (req, res, next)=>{
    let data = {};
    let msg = "";
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fullname = req.body.fullname;
    let idNguoiDung;
    //Validate
    try{
        idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    } catch (err) {
        msg = "Lỗi id người dùng";
        return {data, msg};
    }
    if(typeof username === "string" && username.trim().length === 0){
        msg = "Chưa nhập tên đăng nhập";
        return {data, msg};
    }
    if(typeof password === "string" && password.trim().length === 0){
        msg = "Chưa nhập mật khẩu";
        return {data, msg};
    }
    if(typeof email === "string" && email.trim().length === 0){
        msg = "Chưa nhập email";
        return {data, msg};
    }
    if(typeof fullname === "string" && fullname.trim().length === 0){
        msg = "Chưa nhập họ tên";
        return {data, msg}   ;    
    }
    var item = await myMD.nguoiDungModel.aggregate([
        {
            $match: {
                username: username,
                _id: { $not: { $eq: idNguoiDung } },
            },
        }
    ])
    if(!(item.length === 0)){
        msg = "Tên tài khoản đã tồn tại";
        return {data, msg};
    } 
    let update = {
        username: username,
        password: password,
        email: email,
        fullname: fullname
    };
    await myMD.nguoiDungModel.findOneAndUpdate({ _id: idNguoiDung }, update, {new:true})
    .then((result)=> {
        data = result;
        msg = "Cập nhật người dùng thành công"
    }
    ).catch((err) => {
            msg = "Cập nhật người dùng thất bại"
    });
    return {data, msg};
}

const xoaNguoiDung = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let idNguoiDung;
    try{
        idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    } catch (err) {
        msg = "Lỗi id người dùng";
        return {data, msg};
    }
    var item = await myMD.nguoiDungModel.findOneAndDelete({ _id: idNguoiDung })
    .then((result)=> {
        data = result;
        msg = "Xóa người dùng thành công"
    }
    ).catch((err) => {
            msg = "Xóa người dùng thất bại"
    });
    return {data, msg};
}

//API
const dangNhapApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await dangNhap(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const dangKyApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await themNguoiDung(req, res, next);
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

const layChiTietApi = async (req, res, next)=>{
    let data;
    let msg = "";
    let result = await chiTietNguoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const capNhatApi = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let result = await capNhatNguoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

const xoaApi = async (req, res, next)=>{
    let data;
    let msg = "";
    let result = await xoaNguoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.end(JSON.stringify({data, msg}));
}

//WEB-VIEW
const layTrangDangNhapWebView = async (req, res, next)=>{
    let data;
    let msg = "";
    res.render("index", {data, msg});
}

const dangNhapWebView = async (req, res, next)=>{
    let data;
    let msg = "";
    let result = await dangNhap(req, res, next);
    data = result.data;
    msg = result.msg;
    if(data && !(Object.keys(data).length === 0) && data.constructor === Object){
        if(data.isAdmin){
            return res.redirect("danh-sach-nguoi-dung" + "/" + data._id);
            // res.render("truyenTranh/danhSachTruyen" + "/" + data._id, {data, msg});
        }
        else {
            msg = "Mời bạn đăng nhập với tài khoản admin";
            return res.render("index", {data, msg});
        }
    }
    return res.render("index", {data, msg});
}

const themNguoiDungWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await themNguoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.render("nguoidung/themNguoiDung", {data, msg});
}

const xoaWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    if(!auth.checkAdmin(req, res, next)){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    let result = await xoaNguoiDung(req, res, next);
    data = result.data;
    msg = result.msg;
    res.redirect("/danh-sach-nguoi-dung" + "/" + req.params.idAdmin);
}

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
    res.render("nguoidung/danhSachNguoiDung", {data, msg});
}

const layTrangThemNguoiDungWebView = async (req, res, next)=>{
    let data = {};
    let msg = "";
    let checkAdmin = await auth.checkAdmin(req, res, next);
    if(!checkAdmin){
        msg = "Mời bạn đăng nhập với tài khoản admin"
        res.render("index", {data, msg});
    }
    res.render("nguoidung/themNguoiDung", {data, msg});
}

module.exports = {
    //Api
    dangNhapApi,
    dangKyApi,
    layDanhSachApi,
    capNhatApi,
    xoaApi,
    layChiTietApi,
    //Web View
    layTrangDangNhapWebView,
    dangNhapWebView,
    layTrangThemNguoiDungWebView,
    themNguoiDungWebView,
    layDanhSachWebView,
    xoaWebView
}