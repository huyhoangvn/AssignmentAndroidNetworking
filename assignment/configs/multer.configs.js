const multer = require('multer');
const path = require("path");
const maxSize = 100*1024*1024;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function(req, file, cb) {
        //dat ten file dc uploade len de khong bi trung lap
        const filename = file.originalname.substring(0, file.originalname.indexOf(".")) + "_" +
        new Date(Date.now()).toLocaleString().split(',')[0].replaceAll("/", "-") + '_' + Math.round(Math.random() * 10000) + "." + file.mimetype.replace("image/", "");
        console.log(filename);
        cb(null, filename)
    },
});

const filter = (req, file, cb) => {
    console.log(file.mimetype);
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){ // check file type to be png, jpeg, or jpg
        cb(null, true);
    }else{
        cb(new Error("Ảnh không phải đuôi png/jpeg nên không upload được"), false);
    }
}
var upload = multer({ storage: storage, limits:{fileSize : maxSize}, fileFilter: filter});

exports.upload = upload;