var express = require('express');
var router = express.Router();
var multer = require("../configs/multer.configs");
var nguoiDungCtrl = require("../controllers/nguoiDung.ctrl");
var binhLuanCtrl = require("../controllers/binhLuan.ctrl");
var truyenTranhCtrl = require("../controllers/truyenTranh.ctrl");

/* WEB VIEW */
// Người dùng
router.get('/', nguoiDungCtrl.layTrangDangNhapWebView);
router.post('/', nguoiDungCtrl.dangNhapWebView);
router.get('/danh-sach-nguoi-dung/:idAdmin', nguoiDungCtrl.layDanhSachWebView);
router.get('/them-nguoi-dung/:idAdmin', nguoiDungCtrl.layTrangThemNguoiDungWebView);
router.post('/them-nguoi-dung/:idAdmin', nguoiDungCtrl.themNguoiDungWebView);

router.get('/xoa-nguoi-dung/:idNguoiDung/:idAdmin', nguoiDungCtrl.xoaWebView);
router.delete('/xoa-nguoi-dung/:idNguoiDung/:idAdmin', nguoiDungCtrl.xoaWebView);


// Truyện tranh
router.get('/danh-sach-truyen/:idAdmin', truyenTranhCtrl.layDanhSachWebView);
router.get('/chi-tiet/:idTruyenTranh/:idAdmin', truyenTranhCtrl.layChiTietWebView);
router.get('/noi-dung/:idTruyenTranh/:idAdmin', truyenTranhCtrl.layNoiDungWebView);
router.get('/them-truyen/:idAdmin' ,truyenTranhCtrl.layTrangThemTruyenWebView);
router.post('/them-truyen/:idAdmin', multer.upload.fields([{name:'anhBia', maxCount: 1}, {name:'anhNoiDung', maxCount: 10}]),truyenTranhCtrl.themTruyenWebView, truyenTranhCtrl.errMulterCheckerWebView);
router.post('/sua-truyen/:idTruyenTranh/:idAdmin', multer.upload.fields([{name:'anhBia', maxCount: 1}, {name:'anhNoiDung', maxCount: 10}]),truyenTranhCtrl.suaTruyenWebView, truyenTranhCtrl.errMulterCheckerWebView);
router.get('/xoa-truyen/:idTruyenTranh/:idAdmin', truyenTranhCtrl.xoaTruyenWebview);
router.delete('/xoa-truyen/:idTruyenTranh/:idAdmin', truyenTranhCtrl.xoaTruyenWebview);

// Bình luận
router.post('/binh-luan/:idTruyenTranh/:idNguoiDung', binhLuanCtrl.themBinhLuanWebView)
router.get('/xoa-binh-luan/:idTruyenTranh/:idBinhLuan/:idAdmin', binhLuanCtrl.xoaWebView);
router.delete('/xoa-binh-luan/:idTruyenTranh/:idBinhLuan/:idAdmin', binhLuanCtrl.xoaWebView);

module.exports = router;
