var mongodb = require('mongoose');
const MONGODB_URL = 'mongodb://0.0.0.0:27017';
const DB_NAME = 'QuanLyTruyen'
mongodb.connect(MONGODB_URL + "/" + DB_NAME)
    .catch((err)=>{
        console.log("Loi ket noi csdl");
        console.log(err);
    });

module.exports = {mongodb};