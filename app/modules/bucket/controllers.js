(function () {
  'use strict';

  var bucket = hmd.bucket,
  	fs = require('fs');

  var readFiles = function($scope){
    var ss = hmd.system.get();
		hmd.clound.readFiles({
      bucketName:ss.docBucketName,
      accessKey:ss.accessKey,
      secretKey:ss.secretKey,
      onSuccess:function(data){
        var datas = {},previewFiles=[];
        data.items.forEach(function(item){
          if(~item.key.indexOf('.md')){
            datas[item.key.replace('.md')] = item;
          }
          else if(~item.key.indexOf('.html')){
            previewFiles.push(item);
          }
        });
        previewFiles.forEach(function(item){
          var key = item.key.replace('.html');
          datas[key] && (datas[key].previewUrl = item.key);
        });
        $scope.files = datas;
        $scope.$digest();
      }
    });
  };
  bucket.controller('bucket', function ($scope,$state) {
		readFiles($scope);

    $scope.editFile = function(file){
      var ss = hmd.system.get();
      //防止打开本地文件之后,再从远程打开另一个文件,保存时本地文件被覆盖
      hmd.editor.filepath = null;
      hmd.system.setLastFile('http://' + ss.docBucketHost + '/' + file.key);
      $state.transitionTo('studio');
    };

    $scope.openFile = function(file){
      var ss = hmd.system.get();
      require('nw.gui').Shell.openItem('http://' + ss.docBucketHost + '/' + file.key + '?' + Date.now());
    };

		$scope.preview = function(file){
      var ss = hmd.system.get();
      require('nw.gui').Shell.openItem('http://' + ss.docBucketHost + '/' + file.previewUrl + '?' + Date.now());
    };

    $scope.delFile = function(file){
      var ss = hmd.system.get();
      if(confirm('确认删除!')){
        hmd.clound.delFile({
          accessKey:ss.accessKey,
      		secretKey:ss.secretKey,
          bucketName:ss.docBucketName,
          path:file.key,
          onSuccess:function(ret){
            hmd.system.setLastFile('');
            hmd.editor.setFile();
            readFiles($scope);
          }
        });
      }
    };
  });
})();