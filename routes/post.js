const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')


const postSchema = mongoose.Schema({
  user :{
    type : mongoose.Schema.Types.ObjectId,
    ref  : "user"
  },
  title          : String,
  description    : String,
  image          : String,
})

postSchema.plugin(plm);

module.exports = mongoose.model('post',postSchema);