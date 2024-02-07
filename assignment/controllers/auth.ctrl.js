const mongo = require('mongoose');
const myMD = require('../models/nguoiDung.model');
const checkAdmin = async (req, res, next)=>{
    let id;
    try{
        id = new mongo.Types.ObjectId(req.params.idAdmin);
    } catch (err) {
        return false;
    }
    console.log(req.params.idAdmin);
    let adminResult = await myMD.nguoiDungModel.findOne({_id: id});
    if(adminResult == null){
        return false;
    }
    else{
        if(adminResult.isAdmin){
            return true;
        }
        return false;
    }
}
module.exports = {
    checkAdmin
}