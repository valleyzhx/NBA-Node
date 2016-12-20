var express = require('express')
var app = express()
var superagent = require('superagent')
var cheerio = require('cheerio')
var VideoItem = require('../model/VideoItem');

function playvideo(url, type) {
	var videoUrl;
		if (type){
			if(type == 'qq'){
				videoUrl = 'http://www.24zbw.com/bf/qq.html?id=' + url + '&tiny=0&auto=1';
			}else if(type == 'qq2'){
				videoUrl = 'http://www.24zbw.com/bf/vget.php?u=' + url + '&s=qq&hd=3';
			}else if(type == 'youku'){
				videoUrl = '<http://player.youku.com/embed/' + url ;
			}else if(type == 'youku2'){
				videoUrl = 'http://www.24zbw.com/bf/vget.php?u=' + url + '&s=youku&hd=3';
			}else if(type == 'sohu'){
				videoUrl ='http://www.24zbw.com/bf/vget.php?u=' + url + '&s=sh&hd=3';
			}else if(type == 'letv2'){
				videoUrl =  'http://www.24zbw.com/bf/vget.php?u=' + url + '&s=letv&hd=3';
			}else if(type == 'sina'){
				videoUrl = 'http://p.you.video.sina.com.cn/swf/quotePlayer20130723_V4_4_42_4.swf?vid=' + url + '&as=0';
			}else if(type == 'xyty'){
				videoUrl =  url ;
			}else if(type == 'cntv'){
				videoUrl = 'http://player.cntv.cn/flashplayer/players/htmls/smallwindow.html?pid=' + url;
			}else if(type == 'tudou'){
				videoUrl = 'http://www.tudou.com/v/' + url;
			}else if(type == 'letv'){
				videoUrl = 'http://img1.c0.letv.com/ptv/player/swfPlayer.swf?id=' + url + '&amp;isPlayerAd=0&amp;autoplay=1&amp;typefrom=hupu';
			}else{
				videoUrl =  url ;
			}
		}else{
			videoUrl = url;
		}

		return videoUrl;
}

function getVideoList(title,href,callback) {
	var detailItems = [];
	superagent.get(href)
		.end(function (err, sres) {
			// 常规的错误处理
			if (err) {
				callback([]);
			}
			var $ = cheerio.load(sres.text);
			var length = $('#con_vdjs_1 ul li a').length;
			if (length === 0) {

				var patt1=/var zblist+(.*)/g;
				var str = String(sres.text.match(patt1));
				var patt2 = /"http+(\S*)"/g;
				var video = String(str.match(patt2));
				detailItems.push({
					title:title,
					video:video.slice(1,-1)
				});

				callback(detailItems);
				return;
			}
			$('#con_vdjs_1 ul li a').each(function (idx, element) {
				var $element = $(element);
				var func = 'var url = ' + $element.attr('onclick')
				eval(func);
				detailItems.push({
					title:$element.attr('title'),
					video:url
				});
				length--;
				if (length === 0) {
					callback(detailItems);
				}
			});
		});
}


function appAction(page) {
	var html = page==1?'index':page;
  var url = 'http://www.24zbw.com/lqsp/nbasp/'+html+'.html';
  // url = 'http://www.24zbw.com/lqsp/nbasp/11-9593.html';
  superagent.get(url)
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {

        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      var length = $('.p-lb .p-lb-v a').length;
      console.log('length' + length);

      $('.p-lb .p-lb-v a').each(function (idx, element) {
        var $element = $(element);
				var title = $element.attr('title');
        var href = $element.attr('href');
				var html = href.split("/").pop();
				var videoId = html.split('.').shift();
        getVideoList(title,href,function (detailItems) {
          var videoItem = new VideoItem({
            videoId:videoId,
            title: title,
            href:href,
            videoList: detailItems,
            img: $($element.html()).children('img').attr('src')
          });
          videoItem.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log('success');
            }
          });
          // items.push({
					// 	videoId:videoId,
          //   title: title,
          //   href:href,
          //   videoList: detailItems,
          //   img: $($element.html()).children('img').attr('src')
          // });
          length--;
          //console.log('idx' + idx);
          //console.log('herf'+ href);
          if (length === 0) {
						page--;
						if (page>0) {
							appAction(page);
						}
          }
        });

      });
    });
}
appAction(5);
setInterval(function() {
	appAction(1);
},1000*3600*1);


// app.listen(3000, function () {
//   console.log('app is listening at port 3000');
// });
