var express = require('express');
var router = express.Router();
var nguoiDungCtrl = require("../controllers/nguoiDung.ctrl");
var binhLuanCtrl = require("../controllers/binhLuan.ctrl");
var truyenTranhCtrl = require("../controllers/truyenTranh.ctrl");
var multer = require("../configs/multer.configs");

/* API */
// Người dùng
router.get('/nguoi-dung', nguoiDungCtrl.layDanhSachApi);//app
router.get('/nguoi-dung/:idNguoiDung', nguoiDungCtrl.layChiTietApi);//app
router.post('/nguoi-dung/dang-nhap', nguoiDungCtrl.dangNhapApi);//app
router.post('/nguoi-dung/dang-ky', nguoiDungCtrl.dangKyApi);//app
router.put('/nguoi-dung/:idNguoiDung', nguoiDungCtrl.capNhatApi);
router.delete('/nguoi-dung/:idNguoiDung', nguoiDungCtrl.xoaApi);

// Truyện tranh
router.get('/truyen-tranh', truyenTranhCtrl.layDanhSachApi);//app
router.get('/truyen-tranh/so-luong', truyenTranhCtrl.laySoLuongDanhSachApi);//app
router.get('/truyen-tranh/:idTruyenTranh', truyenTranhCtrl.layChiTietApi);//app
router.get('/truyen-tranh/noi-dung/:idTruyenTranh', truyenTranhCtrl.layNoiDungApi);//app
router.post('/truyen-tranh', multer.upload.fields([{name:'anhBia', maxCount: 1}, {name:'anhNoiDung', maxCount: 10}]), truyenTranhCtrl.themTruyenApi);
router.put('/truyen-tranh/:idTruyenTranh', multer.upload.fields([{name:'anhBia', maxCount: 1}, {name:'anhNoiDung', maxCount: 10}]), truyenTranhCtrl.capNhatTruyenApi);
router.delete('/truyen-tranh/:idTruyenTranh', truyenTranhCtrl.xoaTruyenApi);

// Bình luận
router.get('/binh-luan/:idTruyenTranh', binhLuanCtrl.layDanhSachApi);//app
router.get('/binh-luan/so-luong/:idTruyenTranh', binhLuanCtrl.laySoLuongDanhSachApi);//app
router.post('/binh-luan/:idTruyenTranh/:idNguoiDung', binhLuanCtrl.themBinhLuanpApi);//app
router.put('/binh-luan/:idBinhLuan', binhLuanCtrl.suaBinhLuanpApi);
router.delete('/binh-luan/:idBinhLuan', binhLuanCtrl.xoaBinhLuanpApi);


module.exports = router;

//http://localhost:3000/api/danh-sach-nguoi-dung

//http://localhost:3000/api/dang-nhap
// { "username":"admin", "password" : "password"}

//http://localhost:3000/api/dang-ky
//http://10.0.2.2:3000/api/dang-ky 
//{"username":"admin2", "password" : "password2", "email" : "hoangnhph29211@gmail.com", "fullname": "Nguyen Huy Hoang"}

//http://localhost:3000/api/danh-sach-truyen

//http://localhost:3000/api/chi-tiet/655507ddd42570f8df63c4b9

//http://localhost:3000/api/noi-dung/655507ddd42570f8df63c4b9

//http://localhost:3000/api/danh-sach-binh-luan/655507ddd42570f8df63c4b9

//http://localhost:3000/api/binh-luan/655507ddd42570f8df63c4b9/655413936d9c49ad96bb0ac1
//{"moTa" : "Truyen nay hay"}
