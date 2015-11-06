(function () {
  'use strict';

  var bucket = hmd.bucket,
  	fs = require('fs');
  bucket.controller('bucket', function ($scope,$state) {
    var ss = hmd.system.get();
		hmd.clound.readFiles({
      bucketName:ss.docBucketName,
      accessKey:ss.accessKey,
      secretKey:ss.secretKey,
      onSuccess:function(data){
        $scope.files = data.items;
        $scope.$digest();
      },
      onError:function(data){
        me.fire('error',{msg:data.msg});
      }
    });

    $scope.editFile = function(file){
      hmd.system.setLastFile('http://' + ss.docBucketHost + '/' + file.key);
      $state.transitionTo('studio');
    };

    $scope.openFile = function(file){
      require('nw.gui').Shell.openItem('http://' + ss.docBucketHost + '/' + file.key + '?' + Date.now());
    };

    $scope.delFile = function(file){
      if(confirm('确认删除!')){
        hmd.clound.delFile({
          bucketName:ss.docBucketName,
          path:file.key
        });
      }
    };
  });
})();