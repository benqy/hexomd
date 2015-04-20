(function () {
  var util = require('./helpers/util');

  var defaultConfig = {
    theme: 'ambiance',
    mode: 'gfm',
    lineNumbers: false,
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
    //关闭自带的拖动显示
    dragDrop: false,
    autofocus: true,
    lineWrapping: true,    
    foldGutter: true,
    styleActiveLine: true
  };

  var execPath = require('path').dirname(process.execPath);


  hmd.editor = {
    init: function (options,filepath) {
      var el = options.el,txt,me = this;
      options = $.extend({}, defaultConfig, options);
      if(options.theme != 'default'){
        $('head').append('<link href="lib/codemirror/theme/'+options.theme+'.css" rel="stylesheet" />');
      }
      if(!this.cm){
      	this.cm = CodeMirror.fromTextArea(el, options);
      }
      filepath && this.setFile(filepath);
      this.cm.on('change', function (em, changeObj) {
        me.hasChange = true;
        me.fire('change', {
          em: em,
          changeObj: changeObj
        });
      });
      //绑定按键
      this.cm.addKeyMap({
        "Ctrl-S": function () {
          me.save();
        }
      });
    },
    setFile:function(filepath){
      var txt = util.readFileSync(filepath);
      this.filepath = filepath;
      this.cm.setValue(txt);
    },
    initMarked:function(){
      var marked = require('marked');
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
      });
			this.marked = marked;
    },
    events: {},
    preview:function(){
      var txt = this.cm.getValue();
      
    },
    save: function () {
       var txt = this.cm.getValue();
       util.writeFileSync(hmd.editor.filepath, txt);
       this.hasChange = false;
       var fileNameArr = this.filepath.split('\\');
       hmd.msg('文件:' + fileNameArr[fileNameArr.length - 1] + '保存成功!');
       this.fire('save');
    },
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