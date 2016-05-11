(function () {
  //配置文件,用于判断是否有新版本
  var packageFile = 'https://raw.githubusercontent.com/benqy/hexomd/master/package.json',
  //当前程序的运行目录
  execPath = require('path').dirname(process.execPath),
  //补丁文件存放目录
  updatePath = execPath + '\\update',
  fs = require('fs'),
  util = require('./helpers/util'),
  when = require('./node_modules/when');
  var checkUpdateTimer;
  hmd.updater = {
    //下载指定url的内容并返回promise对象
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
        hmd.msg('===更新失败,请检查网络===', hmd.MSG_LEVEL.error);
        deferred.resolve();
      }, 120000);
      req = protocolModule.get(urlOpt, function (res) {
        //是否经过gzip压缩
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
    ///安装补丁包
    checkUpdate: function () {
      hmd.msg('===正在检查更新===');
      //超时检查
      checkUpdateTimer =setTimeout(function(){
        hmd.msg('===更新失败,可能github被墙了===', hmd.MSG_LEVEL.error);
      }, 120000);
      var locPackage = require('nw.gui').App.manifest;
      //获取版本信息和更新文件列表
      hmd.updater.get(packageFile+ '?'+new Date()*1)
      .then(function (packageData) {
        clearTimeout(checkUpdateTimer);
        packageData.text = packageData.buffer.toString();
        if (!packageData.text) return;
        var remotePackage = JSON.parse(packageData.text);
        if (remotePackage.updater.version != locPackage.updater.version){
          if (confirm('是否更新到最新版本:' + remotePackage.updater.version)) {
            //如果update目录不存在则创建
            if (!fs.existsSync(updatePath)) {
              util.mkdir(updatePath, true);
            }
            //保存最新的配置文件
            fs.writeFileSync(updatePath + '\\package.json', packageData.buffer);
            //下载补丁包
          	hmd.updater.update(remotePackage.updater.package);
          }
        }
        else {
          hmd.msg('当前版本:' + remotePackage.updater.version + ',已经是最新版');
        }
      });
    },
    //下载补丁包
    update:function(packageUrl){
      hmd.msg('===正在下载更新文件===', hmd.MSG_LEVEL.warnings);
      hmd.updater.get(packageUrl + '?' + new Date() * 1)
      .then(function (data) {
				fs.writeFileSync(updatePath + '\\update.zip',data.buffer);
				hmd.updater.install();
      });
    },
    //安装补丁包
    install: function () {
      fs.rmdirSync(updatePath);
      fs.mkdirSync(updatePath);
      //移动配置文件
      require("child_process").exec('xcopy "' + updatePath + '\\package.json" "' + execPath + '\\package.json" /s /e /y');
      //解压缩补丁文件
      var unzip = execPath + '\\7z.exe x '+ updatePath +'\\update.zip -o'+ execPath+' -y';
      require("child_process").exec(unzip,function(){
      hmd.msg('===更新完成,重启后生效===');
      });
    }
  };
})();