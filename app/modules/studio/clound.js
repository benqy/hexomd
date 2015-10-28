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
      qiniu.conf.ACCESS_KEY = opt.accessKey;
    	qiniu.conf.SECRET_KEY = opt.secretKey;
    	putPolicy.expires = Math.round(new Date().getTime() / 1000) + 3600;
    	putPolicy.scope = opt.bucketName + ':' + opt.path;
      if(opt.fileType == 'image'){
        opt.token = putPolicy.token();
        this.qiniuImgUpload(opt);
      }
      else{
        qiniu.io.put(putPolicy.token(), opt.path, opt.body, new qiniu.io.PutExtra(), function(err, ret) {
          if (!err) {
            opt.onSuccess({
              url:'http://' + opt.host + '/' + ret.key
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
    uploadUpyun:function(opt){
      
    }
  };
})();