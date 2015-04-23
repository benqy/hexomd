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

  hmd.editor = {
    init: function (options,filepath) {
      var el = options.el,txt,me = this;
      options = $.extend({}, defaultConfig, options);
      //编辑器样式文件动态加载,用于以后增加样式选择功能
      if(options.theme != 'default'){
        $('head').append('<link href="lib/codemirror/theme/'+options.theme+'.css" rel="stylesheet" />');
      }
      this.cm = this.cm || CodeMirror.fromTextArea(el, options);
      //指定要打开的文件,如果未指定,则保存时会弹出文件选择对话框
      this.setFile(filepath);
      //编辑器内容修改时触发change事件
      this.cm.on('change', function (em, changeObj) {
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
    //设置当前文件
    setFile:function(filepath){
      if(filepath && fs.existsSync(filepath)){
        var txt = util.readFileSync(filepath);
        this.filepath = filepath;
        this.cm.setValue(txt);
      }
      else{
        this.filepath = null;
        this.cm.setValue('');
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