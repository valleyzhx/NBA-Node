var express = require('express');
var router = express.Router();

var VideoItem = require('../model/VideoItem');

/* GET users listing. */
router.get('/', function(req, res, next) {

  if (req.query.func = 'getVideoList') {
    var page = 1;
    var pagesize = 10;
    if (req.query.page) {
      page = Math.max(req.query.page,1);
    }
    if (req.query.pagesize) {
      pagesize = Math.max(req.query.pagesize,1);
    }
    VideoItem.find({},'-_id -__v')
    .limit(pagesize)
    .skip((page-1)*pagesize)
    .sort({'videoId':-1})
    .exec(function (err,list) {
      if (err) {
            res.jsonp('error',{
            message:err.message,
            error:err
             });
            return;
          }
      if (!list) {
        res.jsonp({'code':0,'data':[]});
      }else{
        res.jsonp({'code':0,'data':list});
      }
   });
 }

});

module.exports = router;
