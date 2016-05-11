(function () {
  var util = require('./helpers/util'),
      fs = require('fs'),
      pdf = require('../app/node_modules/phantom-html2pdf');

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

  var SHARE_REG = /\s*\[SHARE:(.*)\]/;
	var PDF_REG = /\.pdf/;
  hmd.editor = {
    init: function (options,filepath) {
      var el = options.el,txt,me = this;
      options = $.extend({}, defaultConfig, options);
      this.initMarked();
      this.initClound(options);
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
        },
        //加粗
        "Ctrl-B": me.bold.bind(this),
        //突出关键词显示
        "Ctrl-M": me.mark.bind(this),
        "Ctrl-W": me.code.bind(this),
        //表格模版
        "Ctrl-T": me.table.bind(this),
        "Ctrl-I": me.image.bind(this),
        "Ctrl-L": me.link.bind(this),
      });
    },
    wrapSelection:function(reg,signLeft,signRight){
      var selection = this.cm.doc.getSelection(),
          resultTxt;
      signRight = signRight || signLeft;
      if(reg.test(selection)){
        resultTxt = selection.replace(reg,function($1,$2){return $2;});
      }
      else{
        resultTxt = signLeft + selection + signRight;
      }
      this.cm.doc.replaceSelection(resultTxt,'around');
    },
    image:function(){
      this.cm.doc.replaceSelection('![]()');
    },
    link:function(){
      this.cm.doc.replaceSelection('[]()');
    },
    table:function(){
    	var tableTemplate = `| aaa | bbbb | cccc |
|---:| :-- |:---:|
| 1 | 2 | 3 |`;
      this.cm.doc.replaceSelection(tableTemplate,'star');
    },
    code:function(){
      this.wrapSelection(/```([\s\S]*)```/,'```\r\n','\r\n```');
    },
    mark:function(){
      this.wrapSelection(/`(.*)`/,'`');
    },
    bold:function(a){
      this.wrapSelection(/\*\*(.*)\*\*/,'**');
    },
    reset:function(){
      setTimeout(function(){
      	hmd.editor.cm.setValue(hmd.editor.cm.getValue());
      },1000);
    },
    setTheme:function(theme){
      $('#editorThemeStyleSheet').remove();
      var styleSheet = $('<link id="editorThemeStyleSheet" href="lib/codemirror/theme/'+theme+'.css" rel="stylesheet" />');
      $('head').append(styleSheet);
      this.cm.setOption('theme',theme);
      this.reset();
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
    parse:function(){
      var val = this.cm.getValue().replace(SHARE_REG,'');
      var time = new Date()*1;
      var html = this.marked(val);
      console.log(new Date()*1 - time);
      return html;
    },
    getTitle:function(html){
      html = html || this.parse();
      var match = html.match(/<h1>.*<\/h1>/),
      title = match ? $(match[0]).text():'预览';
      return title;
    },
    //上传文档到云端
    share:function(fn){
      var shareArgs =  SHARE_REG.exec(this.cm.getValue()),
          me = this,
          path,
          ss = hmd.system.get();
      if(!shareArgs || !shareArgs[1]){
        me.fire('error',{msg:'缺少[SHARE:文件名]标签'});
        return;
      }
      path = ~shareArgs[1].indexOf('.html') ? shareArgs[1] : shareArgs[1]+ '.html';
      //上传html文档
      hmd.clound.upload({
        cloundType:ss.cloundType,
        path:path,
        host:ss.docBucketHost,
        bucketName:ss.docBucketName,
        accessKey:ss.accessKey,
    		secretKey:ss.secretKey,
        body:this.generalHtmlStr(),
        onSuccess:function(data){
          fn(data.url);
        },
        onError:function(data){
          me.fire('error',{msg:data.msg});
        }
      });
    },
    initClound:function(options){
      $('.studio-wrap')[0].onpaste = this.uploadImage.bind(this);
    },
    //设置当前文件
    setFile:function(filepath){
      if(filepath){
        //线上文件
        if(~filepath.indexOf('http://')){
          hmd.clound.getFile({
            path:filepath,
            onSuccess:function(txt){
              this.cm.setValue(txt);
              this.fire('setFiled',filepath);
            }.bind(this),
            onError:function(err){
              if(err.status  == 404){
                this.fire('error',{msg:'文件不存在'});
              }
              else{
               	this.fire('error',{msg:err.statusText});
              }
            }.bind(this)
          });
        }
        //本地文件
        else if(fs.existsSync(filepath)){
          var txt = util.readFileSync(filepath);
          this.filepath = filepath;
          this.cm.setValue(txt);
          this.fire('setFiled',this.filepath);
          this.reset();
        }
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
      var clipboardData, items, item,ss = hmd.system.get(),me = this;
      if (ev && (clipboardData = ev.clipboardData) && (items = clipboardData.items) &&
          (item = items[0]) && item.kind == 'file' && item.type.match(/^image\//i)) {
        var blob = item.getAsFile();
        var path = this.guid() + '.' +  blob.type.split('/')[1];
        hmd.clound.upload({
          cloundType:ss.cloundType,
          path:path,
          host:ss.bucketHost,
          bucketName:ss.bucketName,
          accessKey:ss.accessKey,
    			secretKey:ss.secretKey,
          body:blob,
          fileType:'image',
          onSuccess:function(data){
            var img = '![](http://'+ ss.bucketHost+'/' + data.key + ')';
          	this.cm.doc.replaceSelection(img);
            //fn(data.url);
          }.bind(this),
          onError:function(data){
            me.fire('error',{msg:data.msg});
          }
        });
        return false;
      }
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
    generalHtmlStr:function(){
      var ssData = hmd.system.get(), html =this.parse() ;
      //读取样式文件,内嵌到导出的html页面
      styleText = '<style type="text/css">'+ util.readFileSync('app/css/previewtheme/' + ssData.preViewTheme + '.css') +'</style>';
      styleText += '<style type="text/css">'+ util.readFileSync('app/node_modules/highlight.js/styles/' + ssData.preViewHighLightTheme + '.css') +'</style>';
      template = util.readFileSync('app/modules/studio/views/export.html');
      template = template.replace('<!--titleMarked-->',this.getTitle(html))
      template = template.replace('<!--cssMarked-->',styleText);
      template = template.replace('<!--content-->',html);
      return template;
    },
    export:function(){
      var me = this;
      this.saveAsInput = $('<input style="display:none;" type="file"  accept=".html|.pdf" nwsaveas/>');
      this.saveAsInput[0].addEventListener("change", function (evt) {
        var template,styleText;
        var path = this.value;
        var html = me.generalHtmlStr();
        if(!path) return;
        if(PDF_REG.test(path)){
          pdf.convert({html : html}, function(result) {
            result.toFile(path);
            require('nw.gui').Shell.showItemInFolder(path);
          });
        }
        else{
          util.writeFileSync(this.value, html);
        	require('nw.gui').Shell.showItemInFolder(path);
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
      var txt = this.cm.getValue(),
          path,
          shareArgs =  SHARE_REG.exec(this.cm.getValue());
      if(this.filepath || (shareArgs && shareArgs[1])){
        if(this.filepath){
          hmd.system.setLastFile(this.filepath);
          util.writeFileSync(this.filepath, txt);
          this.fire('saved',this.filepath);
        }
        if(shareArgs && shareArgs[1]){
          path = ~shareArgs[1].indexOf('.md') ? shareArgs[1] : shareArgs[1]+ '.md';
          this.saveToClound(path)
        }
      }
      else{
        this.saveAs();
      }
    },
    //保存到云存储
    saveToClound:function(path){
      var me = this,
      ss = hmd.system.get();
      //上传原始markdown文档
      hmd.clound.upload({
        cloundType:ss.cloundType,
        path:path,
        host:ss.docBucketHost,
        bucketName:ss.docBucketName,
        accessKey:ss.accessKey,
        mime:'text/plain',
    		secretKey:ss.secretKey,
        body:this.cm.getValue(),
        onSuccess:function(data){
          me.fire('saved',data.path);
        },
        onError:function(data){
          me.fire('error',{msg:data.msg});
        }
      });
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