var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nba');

var VideoItem = mongoose.model('ReptileItem', {
  videoId:{type:String,unique: true},
  title:String,
  href:String,
  videoList:Array,
  img:String
});

module.exports = VideoItem;
