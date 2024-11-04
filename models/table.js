const mongoose=require('mongoose');

mongoose.connect('mongodb+srv://admin:Mayank%402104@cluster0.qqkx1.mongodb.net/table');
let tableSchema=mongoose.Schema({
    uid:String,
    url:String
})
module.exports=mongoose.model('table',tableSchema);