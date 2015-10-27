HexoMD
===

给自己用的markdown编辑器

###下载
这是打包好的链接,有自动更新功能,以后只要更新就行
[打包好的程序v0.8.0.0](http://pan.baidu.com/s/1i3zZp33)

### 目前功能: 

1.  基本markdown功能
2.  自动更新.
3.  实时预览窗口. 
4.  编辑器,预览,内嵌代码段样式选择和自定义(只要写css文件即可)
5.  **自动上传图片**(使用七牛云存储,要自己配置,因为如果我的七牛空间很小,只是我自己用的,[配置教程](http://benq.im/2015/04/28/hexomd-05/)）.
6.  **[emoji](http://www.emoji-cheat-sheet.com/)表情功能**.  
7.  导出html文件功能.
8.  目录语法

### 源代码如何运行

下载 [NW.js](http://nwjs.io/)(目前我只在win64测试过)

解压缩到源代码根目录,双击nw.exe即可


### 文档
[开发进度](https://trello.com/b/cagX7F2r/hexomd)
[开发和使用教程系列博客](http://benq.im/2015/04/21/hexomd-01/)
本文档就是用这个编辑器写的,eg:

emoji分割线:
:shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: :shit: 

自动上传图片,复制图片(比如qq截图,系统截屏),然后在编辑器里ctrl+v即可
![](http://7ximoo.com1.z0.glb.clouddn.com/efpjr8uq1hj5g4qtn0mtc5deip.png)


一键上传文档
![](http://7ximoo.com1.z0.glb.clouddn.com/q9sxxcp8hydmfzstkch0tqzhhn.png)
文档里如果包含[SHARE:文件名],则点击工具栏的云朵按钮,会自动上传到七牛空间(需配置空间地址),并在浏览器打开文档.