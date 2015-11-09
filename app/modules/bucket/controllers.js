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
        $scope.files = data.items;
        $scope.$digest();
      }
    });
  };
  bucket.controller('bucket', function ($scope,$state) {
		readFiles($scope);

    $scope.editFile = function(file){
      var ss = hmd.system.get();
      hmd.system.setLastFile('http://' + ss.docBucketHost + '/' + file.key);
      $state.transitionTo('studio');
    };

    $scope.openFile = function(file){
      var ss = hmd.system.get();
      require('nw.gui').Shell.openItem('http://' + ss.docBucketHost + '/' + file.key + '?' + Date.now());
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