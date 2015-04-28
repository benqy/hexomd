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
    styleActiveLine: true
  };

//  var qiniukey = 'rrGYBTgg782dxQDxccsDpc9Q33FB26iA33zj9D-x:F7vmerL_qBVmMjO0tJ8mfi_ipKM=:eyJzY29wZSI6Im9uZWFib3ZlYWxsIiwiZGVhZGxpbmUiOjE0NTc2NzQyNDF9';
  var qiniukey = 'rrGYBTgg782dxQDxccsDpc9Q33FB26iA33zj9D-x:L--Fb83qK-AOnKZgs918p82eO0c=:eyJzY29wZSI6InRlc3QiLCJkZWFkbGluZSI6MTQ3MzM5MjE4NH0=';
  hmd.editor = {
    init: function (options,filepath) {
      var el = options.el,txt,me = this;
      options = $.extend({}, defaultConfig, options);
      //编辑器样式文件动态加载,用于以后增加样式选择功能
      if(options.theme != 'default'){
        $('head').append('<link href="lib/codemirror/theme/'+options.theme+'.css" rel="stylesheet" />');
      }
      this.initMarked();
      this.cm = CodeMirror.fromTextArea(el, options);
      //指定要打开的文件,如果未指定,则保存时会弹出文件选择对话框
      this.setFile(filepath);
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
      $('.studio-wrap')[0].onpaste = this.uploadImage.bind(this);
    },
    initMarked:function(){
      this.marked = require('../app/node_modules/marked');
      this.marked.setOptions({
        renderer: new this.marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function (code) {
          return require('../app/node_modules/highlight.js').highlightAuto(code).value;
        }
      });
    },
    //解析markdown
    parse:function(){
      return this.marked(this.cm.getValue());
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
      if (ev && (clipboardData = ev.clipboardData) && (items = clipboardData.items) &&
          (item = items[0]) && item.kind == 'file' && item.type.match(/^image\//i)) {
        var blob = item.getAsFile();
        var fileName = this.guid() + '.' +  blob.type.split('/')[1];
        this._qiniuUpload(blob, qiniukey, fileName, function (blkRet) {
          var img = '![](http://7xit3a.com1.z0.glb.clouddn.com/' + blkRet.key + ')';
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
          console.log('error');
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