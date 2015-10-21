(function () {
  var util = require('./helpers/util'),
      fs = require('fs');

  var defaultConfig = {
    theme: 'ambiance',
    mode: 'gfm',
    lineNumbers: false,
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
    dragDrop: false,
    autofocus: true,
    lineWrapping: true,
    foldGutter: true,
    styleActiveLine: true,
    scrollbarStyle: "overlay"
  };

  var shareReg = /\s*\[SHARE:(.*)\]/;

  hmd.editor = {
    init: function (options,filepath) {
      var el = options.el,txt,me = this;
      options = $.extend({}, defaultConfig, options);
      this.initMarked();
      this.initQiniu(options);
      this.cm = CodeMirror.fromTextArea(el, options);
      this.setTheme(options.theme);
      //指定要打开的文件,如果未指定,则保存时会弹出文件选择对话框
      this.setFile(filepath);
      this.parse();
      //编辑器内容修改时触发change事件
      this.cm.on('change', function (em, changeObj) {
        me.fire('change', {
          em: em,
          changeObj: changeObj
        });
      });
      //滚动事件
      this.cm.on('scroll',function(cm){
        me.fire('scroll',cm.getScrollInfo());
      });
      //绑定按键
      this.cm.addKeyMap({
        "Ctrl-S": function () {
          me.save();
        }
      });
      //图片上传
    },
    setTheme:function(theme){
      //if(theme != 'default'){
        $('#editorThemeStyleSheet').remove();
        var styleSheet = $('<link id="editorThemeStyleSheet" href="lib/codemirror/theme/'+theme+'.css" rel="stylesheet" />');
        $('head').append(styleSheet);
      	this.cm.setOption('theme',theme);
     // }
    },
    initMarked:function(){
      var marked = this.marked = require('../app/node_modules/marked');
      var renderer = new marked.Renderer();
      this.marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        emoji:true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: function (code) {
          return require('../app/node_modules/highlight.js').highlightAuto(code).value;
        }
      });
    },
    //解析markdown
    parse:function(){
      return this.marked(this.cm.getValue().replace(shareReg,''));
    },
    initQiniu:function(options){
      this.qiniuToken = options.qiniuToken;
      this.bucketHost = options.bucketHost;
      $('.studio-wrap')[0].onpaste = this.uploadImage.bind(this);
    },
    //设置当前文件
    setFile:function(filepath){
      if(filepath && fs.existsSync(filepath)){
        var txt = util.readFileSync(filepath);
        this.filepath = filepath;
        this.cm.setValue(txt);
        this.fire('setFiled',this.filepath);
      }
      else{
        this.filepath = null;
        this.cm.setValue('');
        this.fire('setFiled');
      }
    },
    guid:function () {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    uploadImage:function(ev){
      var clipboardData, items, item;
      if(!this.qiniuToken){
        this.fire('error',{msg:'未设置七牛密钥,无法上传图片'});
      }
      else if (ev && (clipboardData = ev.clipboardData) && (items = clipboardData.items) &&
          (item = items[0]) && item.kind == 'file' && item.type.match(/^image\//i)) {
        var blob = item.getAsFile();
        var fileName = this.guid() + '.' +  blob.type.split('/')[1];
        this._qiniuUpload(blob, this.qiniuToken, fileName, function (blkRet) {
          var img = '![](http://'+this.bucketHost+'/' + blkRet.key + ')';
          this.cm.doc.replaceSelection(img);
        }.bind(this));
        return false;
      }
    },
    _qiniuUpload:function (f, token, key,fn) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://up.qiniu.com', true);
      var formData, startDate;
      formData = new FormData();
      if (key !== null && key !== undefined) formData.append('key', key);
      formData.append('token', token);
      formData.append('file', f);
      var taking;

      xhr.onreadystatechange = function (response) {
        if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText) {
          var blkRet = JSON.parse(xhr.responseText);
          fn(blkRet);
        } else if (xhr.status != 200 && xhr.responseText) {
          if(xhr.status == 631){
            hmd.editor.fire('error',{msg:'七牛空间不存在.'});
          }
          else{
            hmd.editor.fire('error',{msg:'七牛设置错误.'});
          }
        }
      };
      startDate = new Date().getTime();
      xhr.send(formData);
    },
    openFile:function(){
      var me = this;
      this.openFileInput = $('<input style="display:none;" type="file"  accept=".md"/>');
      this.openFileInput[0].addEventListener("change", function (evt) {
        if(this.value){
          me.setFile(this.value);
        }
      }, false);
      this.openFileInput.trigger('click');
    },
    export:function(){
      var me = this,
          ssData = hmd.system.get();
      this.saveAsInput = $('<input style="display:none;" type="file"  accept=".html" nwsaveas/>');
      this.saveAsInput[0].addEventListener("change", function (evt) {
        var template,styleText;
        if(this.value){
          //读取样式内嵌
          styleText = '<style type="text/css">'+ util.readFileSync('app/css/previewtheme/' + ssData.preViewTheme + '.css') +'</style>';
          styleText += '<style type="text/css">'+ util.readFileSync('app/node_modules/highlight.js/styles/' + ssData.preViewHighLightTheme + '.css') +'</style>';
          template = util.readFileSync('app/modules/studio/views/export.html');
          template = template.replace('<!--cssMarked-->',styleText);
          template = template.replace('<!--content-->',me.parse());
          util.writeFileSync(this.value, template);
          require('nw.gui').Shell.showItemInFolder(this.value);
        }
      }, false);
      this.saveAsInput.trigger('click');
    },
    //弹出保存文件对话框
    saveAs:function(){
      var me = this;
      this.saveAsInput = $('<input style="display:none;" type="file"  accept=".md" nwsaveas/>');
      this.saveAsInput[0].addEventListener("change", function (evt) {
        if(this.value){
          me.filepath = this.value;
          me.save();
        }
      }, false);
      this.saveAsInput.trigger('click');
    },
    //保存文件
    save: function () {
      var txt = this.cm.getValue();
      if(this.filepath){
        util.writeFileSync(this.filepath, txt);
      	this.fire('saved',this.filepath);
      }
      else{
        this.saveAs();
      }
    },
    events: {},
    fire: function (eventName, obj) {
      var me = this;
      this.events[eventName] && this.events[eventName].forEach(function (fn) {
        fn.call(me,obj);
      });
    },
    on: function (eventName, fn) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push(fn);
    }
  };
})();