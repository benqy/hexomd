(function(){
  'use strict';

  var util = require('./helpers/util'),
      fs = require('fs'),
  		qiniu = require('../app/node_modules/qiniu');
  /*
  options = {
  	cloundType:'Qiniu',
    path:'',
    file:'',
    body:'',
    accessKey,
    secretKey
  }
  */

  hmd.clound = {
    upload:function(opt){
      this['upload' + opt.cloundType](opt);
    },
    uploadQiniu:function(opt){
    	var putPolicy = new qiniu.rs.PutPolicy(opt.bucketName);
      var extra = new qiniu.io.PutExtra();
    	putPolicy.expires = Math.round(new Date().getTime() / 1000) + 3600;
    	putPolicy.scope = opt.bucketName + ':' + opt.path;
      extra.mimeType = opt.mime;
      qiniu.conf.ACCESS_KEY = opt.accessKey;
    	qiniu.conf.SECRET_KEY = opt.secretKey;
      if(opt.fileType == 'image'){
        opt.token = putPolicy.token();
        this.qiniuImgUpload(opt);
      }
      else{
        qiniu.io.put(putPolicy.token(), opt.path, opt.body, extra, function(err, ret) {
          if (!err) {
            opt.onSuccess({
              url:'http://' + opt.host + '/' + ret.key,
              path:ret.key
            });
          } else {
            opt.onError({
              msg:'七牛设置错误'
            });
          }
        });
      }
    },
    qiniuImgUpload:function (opt) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://up.qiniu.com', true);
      var formData, startDate;
      formData = new FormData();
      formData.append('key', opt.path);
      formData.append('token', opt.token);
      formData.append('file', opt.body);
      var taking;

      xhr.onreadystatechange = function (response) {
        if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText) {
          var blkRet = JSON.parse(xhr.responseText);
          opt.onSuccess && opt.onSuccess(blkRet);
        } else if (xhr.status != 200 && xhr.responseText) {
          if(xhr.status == 631){
            opt.onError && opt.onError({
              msg:'七牛空间不存在'
            });
          }
          else{
            opt.onError && opt.onError({
              msg:'七牛设置错误'
            });
          }
        }
      };
      startDate = new Date().getTime();
      xhr.send(formData);
    },
    readFiles:function(opt){
      qiniu.conf.ACCESS_KEY = opt.accessKey;
    	qiniu.conf.SECRET_KEY = opt.secretKey;

      qiniu.rsf.listPrefix(opt.bucketName, null,null, null, function(err, ret) {
        if(err)throw err;
        opt.onSuccess && opt.onSuccess(ret);
      });
    },
    getFile:function(opt){
      $.ajax({
        url:opt.path,
        data:{clear:new Date()*1},
        success:function(txt){
          opt.onSuccess && opt.onSuccess(txt);
        },
        error:function(err){
          opt.onError && opt.onError(err);
        }
      });
      /*$.get(opt.path,{clear:new Date()*1},function(txt){
        opt.onSuccess && opt.onSuccess(txt);
      },function(){
        console.log(1)
      });*/
    },
    delFile:function(opt){
      qiniu.conf.ACCESS_KEY = opt.accessKey;
    	qiniu.conf.SECRET_KEY = opt.secretKey;
      var client = new qiniu.rs.Client();
      client.remove(opt.bucketName, opt.path, function(err, ret) {
        if (!err) {
          opt.onSuccess && opt.onSuccess(ret);
        } else {
          opt.onError && opt.onError({
            msg:'七牛设置错误'
          });
        }
      });
    }
  };
})();