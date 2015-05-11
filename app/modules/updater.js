(function () {
  //7z.exe x update.zip -y
  var packageFile = 'https://raw.githubusercontent.com/benqy/hexomd/master/package.json',
  //var  packageFile = 'http://7xit5q.com1.z0.glb.clouddn.com/package.json?' + new Date() * 1,
  execPath = require('path').dirname(process.execPath),
  //补丁文件临时目录
  updatePath = execPath + '\\update',
  fs = require('fs'),
  util = require('./helpers/util'),
  when = require('./node_modules/when');
  hmd.updater = {
    get: function (url) {
      var deferred = when.defer(),
          gzipDeferred = when.defer(),
          BufferHelper = require('./node_modules/bufferhelper'),
          urlOpt = require('url').parse(url);
      var req = null;
      var protocolModule = ~url.indexOf('https')? require('https') : require('http');
      //超时
      var timer = setTimeout(function () {
        req.abort();
        alert('更新失败,可能github被墙了,' + url);
        deferred.resolve();
      }, 120000);
      req = protocolModule.get(urlOpt, function (res) {
        var isGzip = !!res.headers['content-encoding'] && !!~res.headers['content-encoding'].indexOf('gzip');
        var bufferHelper = new BufferHelper();
        res.on('data', function (chunk) {
          bufferHelper.concat(chunk);
        });

        res.on('end', function () {
          var buffer = bufferHelper.toBuffer();
          clearTimeout(timer);
          //判断是否需要gzip解压缩
          gzipDeferred.promise.then(function (buffer) {
            deferred.resolve({
              buffer: buffer,
              urlOpt: urlOpt
            });
          });

          if (isGzip) {
            require('zlib').unzip(buffer, function (err, buffer) {
              gzipDeferred.resolve(buffer);
            });
          }
          else {
            gzipDeferred.resolve(buffer);
          }
        });
        res.on('error', function () {
          alert('更新出错!');
        });
      });
      return deferred.promise;
    },
    install: function () {
      //移动配置文件
      require("child_process").exec('xcopy "' + updatePath + '\\package.json" "' + execPath + '\\package.json" /s /e /y');
      //解压缩补丁文件
      var unzip = execPath + '\\7z.exe x '+ updatePath +'\\update.zip -y';
      require("child_process").exec(unzip,function(){
      hmd.msg('===更新完成,重启后生效===');
      });
    },
    update:function(packageUrl){
      hmd.msg('===正在下载更新文件===', hmd.MSG_LEVEL.warnings);
      //下载更新文件
      hmd.updater.get(packageUrl + '?' + new Date() * 1)
      .then(function (data) {
				fs.writeFileSync(updatePath + '\\update.zip',data.buffer);
				hmd.updater.install();
      });
    },
    checkUpdate: function () {
      var locPackage = require('nw.gui').App.manifest;
      //获取版本信息和更新文件列表
      hmd.updater.get(packageFile)
      .then(function (packageData) {
        packageData.text = packageData.buffer.toString();
        if (!packageData.text) return;
        var remotePackage = JSON.parse(packageData.text);
        if (remotePackage.updater.version != locPackage.updater.version){
          if (confirm('是否更新到最新版本:' + remotePackage.updater.version)) {
            if (!fs.existsSync(updatePath)) {
              util.mkdir(updatePath, true);
            }
            fs.writeFileSync(updatePath + '\\package.json', packageData.buffer);
          	hmd.updater.update(remotePackage.updater.package);
          }
        }
        else {
          hmd.msg('当前版本:' + remotePackage.updater.version + ',已经是最新版');
        }
      });
    }
  };
})();