var express = require('express');
var router = express.Router();
const request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {

  var url = 'http://127.0.0.1:3000/api?func=getVideoList'
  request(url, function (error, response, body) {
    if (error) {
      res.render('error');
    }else {
      var result = JSON.parse(body);
      res.render('index', { videoList: result.data });
    }
});

});

module.exports = router;
