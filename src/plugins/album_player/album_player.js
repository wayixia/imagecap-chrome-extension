/* @file album_player.js 
 * @author Q
 */
function contains(parentNode, childNode) {
    if (parentNode.contains) {
        return parentNode != childNode && parentNode.contains(childNode);
    } else {
        return !!(parentNode.compareDocumentPosition(childNode) & 16);
    }
}

function checkHover(e,target) {
  e = e || window.event;
  if (e.type=="mouseover")  {
    return !contains(target, e.relatedTarget|| e.fromElement) && !((e.relatedTarget||e.fromElement)===target);
  } else {
    return !contains(target, e.relatedTarget|| e.toElement) && !((e.relatedTarget||e.toElement)===target);
  }
}

/**
 * 复制内容到粘贴板
 * content : 需要复制的内容
 * message : 复制完后的提示，不传则默认提示"复制成功"
 */
function copyToClipboard(content, message) {
    var aux = document.createElement("input"); 
    aux.setAttribute("value", content); 
    document.body.appendChild(aux); 
    aux.select();
    document.execCommand("copy"); 
    document.body.removeChild(aux);
    if (message == null) {
        alert("复制成功");
    } else{
        alert(message);
    }
}
        //全屏
function enterFullScreen() {
  var element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        }
}

//退出全屏 
function exitFullScreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
}

//IE浏览器旋转方法
function ie_trans(o,d){  
  o.style.fileter=d
}
//非IE浏览器旋转方法
function notie_trans(o,d){
  o.style.MozTransform = d;
  o.style.webkitTransform = d;
  o.style.msTransform = d;
  o.style.OTransform = d;
  o.style.transform = d;
}

//图片顺时针旋转
function right_rotate(o){
  if(Q.isIE()){
      var currentFilter = o.currentStyle.filter;
      if (currentFilter){
         var filterMatch = currentFilter.match(/rotation=(\d)+/);
         var r = parseInt(filterMatch[1]) + 1;
         if(r > 3) r = 0;
         ieTrans(o,'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + r + ')');
      }else{
         ieTrans(o,'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)');
      }
   } else { //非IE
      var currentFilter = o.style.MozTransform;
      if (currentFilter) {
         var filterMatch = currentFilter.match(/rotate\(([\-]?\d+)deg\)/);
         var r = parseInt(filterMatch[1]) + 90;
         if (r > 0) r = -270;
         notie_trans(o,'rotate(' + r + 'deg)');
      }else{
        //如果o.style.MozTransform不存在，就说明这是第一次旋转，也就是右转90度，-270
        notie_trans(o,'rotate(-270deg)');
       }
    }
}

function reset_rotate(o) {
  if(Q.isIE()) {
    delete o.style.filter;
   } else { 
    var d = 'rotate(0deg)';
    o.style.MozTransform = d;
    o.style.webkitTransform = d;
    o.style.msTransform = d;
    o.style.OTransform = d;
    o.style.transform = d;
  } 
}

Q.album_player = Q.extend({
  hwnd: null,
  display: false,
  image_list : null,
  image_view : null,
  image_selected: null,
  width: 0,
  old_overflow: null,
  old_scrolltop: 0,
  album_id: 0,
  //current_image_id : 0,
  current_image_url : 0,
  image_origin_width: 0,
  image_origin_height: 0,
  images_data : null,
  album_list_api: null,
  fullscreen: false,
  __init__ : function(config) {
    config = config || {};

    this.hwnd = document.createElement( 'div' );
    this.hwnd.id = "album-view";
    this.hwnd.innerHTML = ' \
  <div id="album-transparent-layer"></div> \
  <div id="album-top"> \
    <div id="album-close-button"></div> \
    <div id="image-info"> \
      <div id="toolbar"> \
        <a id="toolbar-1" > &nbsp;</a> \
        <a id="toolbar-direction"> &nbsp; </a> \
        <a id="toolbar-share"> &nbsp; </a> \
        <a id="toolbar-download"> &nbsp; </a> \
        <a id="toolbar-restore" > &nbsp;</a> \
        <a id="toolbar-copy" > &nbsp;</a> \
      </div> \
      <div style="display: none;;"> \
        <p id="image-title" class="text">标题:</p> \
        <p id="image-url" class="text">地址:</p> \
        <p id="image-size" class="text">大小:</p> \
      </div> \
    </div>    \
  </div> \
  <div id="album-bottom"> \
    <div id="image-container"> \
      <img id="image-view" class="image-ani"/> \
      <div id="image-list-bar"> \
        <div id="image-list-alpha" class="alpha_6"></div>  \
        <div id="image-list-container"> \
        <ul id="image-list"> \
          <!--li class="item selected">1</li> \
          <li class="item">2</li--> \
        </ul> \
        </div> \
      </div> \
      <div id="image-loadding"> 正在努力加载图片中...</div> \
      <div id="image-next" class="btn-prev-next"> </div> \
      <div id="image-prev" class="btn-prev-next"> </div> \
    </div> \
  </div> \
    ';
    document.body.appendChild( this.hwnd );


    this.album_list_api = config.album_list_api;
    // main view
    this.image_container = Q.$('image-container');
    this.image_view = Q.$('image-view');
    this.image_list_container = Q.$('image-list-container');
    this.image_list = Q.$('image-list');
    this.images_data = {};
    // init draging objects 
    Q.drag({id: this.image_view, self: true});
     
    // init data
    this.width = this.hwnd.offsetWidth;
    this.height= this.hwnd.offsetHeight;
    this.move(this.width);
    this.image_view.onload = Q.bind_handler(this, function(e) { this.image_ok(e); });
    this.image_view.onerror= Q.bind_handler(this, function() { this.image_error(); });
    Q.$('image-next').onclick= Q.bind_handler(this, function() { this.image_next(); });
    Q.$('image-prev').onclick= Q.bind_handler(this, function() { this.image_prev(); });
    Q.$('album-close-button').onclick= Q.bind_handler(this, function() { this.close(); });
    this.image_container.onclick= Q.bind_handler(this, function(evt) {
      var evt = evt || window.event;
      var srcElement = evt.srcElement || evt.target;
      if( srcElement.id && srcElement == this.image_container ) {
        //this.close(); 
      }
    });
    Q.$('toolbar-restore').onclick   = Q.bind_handler(this, function() { 
      //fullScreen()和exitScreen()有多种实现方式，此处只使用了其中一种
      if( this.fullscreen ) {
        exitFullScreen();
      } else {
        enterFullScreen();
      }
      this.fullscreen = !this.fullscreen;
    });

    Q.$('toolbar-1').onclick   = Q.bind_handler(this, function() { this.image_view.style.zoom = 1});
    Q.$('toolbar-direction').onclick = Q.bind_handler(this, function() { right_rotate(this.image_view); });
    //Q.$('toolbar-download').onclick  = Q.bind_handler(this, function() { 
    //    var o = Q.$('toolbar-download');
    //    window.open( this.current_image_url );
    //    //var add = (o.className != "checked");
    //    //api_image_favorite(this.current_image_id, add?"add":"remove", function(ok) {
    //    //  o.className=(ok && add)?"checked":"";
    //    //});
    //});

     Q.$('toolbar-share').onclick = (function(z, f) { return function(evt) {
      if(typeof f === 'function') {
        f(z.image_view.src);
      }
    }})(this, config.share);
    
    Q.$('toolbar-download').onclick = (function(z, f) { return function(evt) {
      if(typeof f === 'function') {
        f(z.image_view.src);
      }
    }})(this, config.download);

    Q.$('toolbar-copy').onclick  = Q.bind_handler(this, function() { 
      copyToClipboard( this.current_image_url, '已复制URL' );
    });

    //Q.$('toolbar-share').onclick      = Q.bind_handler(this, function() { api_share2sina(this.current_image_url)});
    Q.addEvent(window, 'resize', Q.bind_handler(this, this.on_resize));
    Q.addEvent(this.image_container, 'mousewheel', Q.bind_handler(this, this.on_mousewheel));
    Q.addEvent(document, 'keyup', Q.bind_handler(this, this.on_keyup));
    Q.addEvent(this.image_container, 'mouseover', Q.bind_handler(this, this.on_mouseover));
    Q.addEvent(this.image_container, 'mouseout', Q.bind_handler(this, this.on_mouseout));
  },

  on_resize : function() {  
    this.width = this.hwnd.offsetWidth;
    this.height= this.hwnd.offsetHeight;
    if(!this.display) {
      this.move(this.width);
    } 
  },

  on_mousewheel : function(evt) {
    var evt = evt || window.event;
    //Q.printf(evt.wheelDeltaY);
    // 获取对象缩放比例， 并转化成十进制整数
    Q.printf(this.image_view.currentStyle.zoom);
    var zoom = parseInt(this.image_view.currentStyle.zoom*100,10);
    //滚轮移动量上移+120， 下移-120
    zoom+=evt.wheelDelta/12;
    if(zoom>0)
      this.image_view.style.zoom = zoom/100.0;  //重新设置比例
    //this.on_resize(); 
    Q.$('toolbar-restore').disabled = (zoom == 1);

    // Prevent parent scroll bar
    evt.stopPropagation();
    evt.preventDefault();
  },
 
  on_keyup : function(evt) {
    evt = evt || window.event;
    var kcode = evt.which || evt.keyCode;
    console.log(kcode + '->' + String.fromCharCode(kcode));
    if(kcode === 39) {
      this.image_next();
    } else if(kcode === 37) {
      this.image_prev();
    } else if(kcode === 27) {
      this.close();
    }
  },

  on_mouseover : function(e) {
    var _this = this;
    if(!checkHover(e, this.image_container))
      return;
    
    (new Q.Animate({
        tween: 'cubic',
        ease: 'easyin',
        max: 800,
        begin: 0,
        duration: 25,
        bind : function(x) {
         Q.$('image-next').style.opacity = x / 1000.0;
         Q.$('image-prev').style.opacity = x / 1000.0;
        }
    })).play();
  },

  on_mouseout : function(e) {
    var _this = this;
    if(!checkHover(e, this.image_container))
      return;
    
    (new Q.Animate({
        tween: 'cubic',
        ease: 'easyin',
        max: 1000,
        begin: 0,
        duration: 25,
        bind : function(x) {
          Q.$('image-next').style.opacity = (1000-x) / 1000.0;
          Q.$('image-prev').style.opacity = (1000-x) / 1000.0;
        }
      })).play();
  },

  image_ok : function(e) {
    //Q.printf("width: "+this.image_view.width + ", height: " + this.image_view.height)          
   // var pos_left = -(this.image_view.width - this.image_container.offsetWidth)/2;
   // var pos_top  = -(this.image_view.height - (this.image_container.offsetHeight-this.image_list_container.offsetHeight))/2;
   // this.image_view.style.left = pos_left + 'px';
   // this.image_view.style.top = pos_top + 'px';
   //Q.printf("image width " + this.)
    this.image_view.width = 5;

    var _this = this;
    (new Q.Animate({
        tween: 'cubic',
        ease: 'easyin',
        max: this.image_origin_width,
        begin: 0,
        duration: 25,
        bind : function(x) {
          _this.image_view.width = x; 
          var pos_left = -(_this.image_view.width - _this.image_container.offsetWidth)/2;
          var pos_top  = -(_this.image_view.height - (_this.image_container.offsetHeight-_this.image_list_container.offsetHeight))/2;
          _this.image_view.style.left = pos_left + 'px';
          _this.image_view.style.top = pos_top + 'px';
        }
    })).play();
    this.image_view.style.visibility = 'visible';
    Q.$('image-loadding').style.visibility = 'hidden';
  },

  image_error : function() {
    Q.$('image-loadding').style.visibility = 'hidden';
  },

  /*
  render : function(url, images ) {
    var _this = this;
    

    if(this.image_view.src ==  url)
      return;

    this.image_view.style.visibility = 'hidden';
    Q.removeClass( this.image_view, "image-ani");
    //this.current_image_id = id;
    this.current_image_url = url;
    this.image_view.style.zoom = 1; 
    //this.image_view.src = url;
  
    reset_rotate(this.image_view);
    Q.$('image-loadding').style.visibility = 'visible';
    if(!_this.display) {
      _this.display = true;
      _this.hwnd.style.visibility = 'visible';
      _this.move(_this.width);
      _this.load_album_images(album_id, id);
      (new Q.Animate({
        tween: 'cubic',
        ease: 'easyin',
        max: _this.width,
        begin: 0,
        duration: 25,
        bind : function(x) {
          _this.move(_this.width-x);
        }
      })).play();
    } else {
      _this.select_album_item(id);
    }
  },
  */

  render : function(url, imgs) {
    this.image_selected = null;
    this.image_list.innerHTML = '';
    this.images_data = {};
    for(var i=0; i < imgs.length; i++) {
      this.create_item_with_template(this.image_list, imgs[i], i);
    }
    var id = this.url2id(url);
    this.render_(id);
  },
  
  url2id : function(url) {
    for(var id in this.images_data) {
      if(this.images_data[id].src == url)
        return id;
    }

    return 0;
  },

  render_album_list : function(imgs) {
    for(var i=0; i < imgs.length; i++) {
      this.create_item_with_template(this.image_list, imgs[i], i+1);
    }
  },

  create_item_with_template : function(container, item, i) {
    var element = document.createElement('LI');
    element.className = "item";
    element.id="album-item-" + i;
    element.onclick = (function(z) { return function(evt) {
      z.render_(i);
    }})(this, i);
    var pre_width = 192;
    var tpl = "<a href=\"#\"><img src=\"[[src]]\" width=\"96\" height=\"80\"><\/a>"
    tpl = tpl.replace(/\[\[(\w+)\]\]/ig, 
      function(w,w2,w3,w4) {
        return item[w2];
      }
    );
    element.innerHTML = tpl;
    container.appendChild(element);
    this.images_data[i] = item;
  },


  render_ : function(id) {
    var _this = this;
    var url = this.images_data[id].src;
    if(this.image_view.src ==  url)
      return;
    this.image_view.style.zoom = 1; 
    this.image_view.src = url;
    this.current_image_url = url;
    reset_rotate(this.image_view);
    Q.$('image-loadding').style.visibility = 'visible';
    if(!_this.display) {
      _this.select_album_item(id);
      _this.display = true;
      _this.hwnd.style.visibility = 'visible';
      _this.move(_this.width);
      (new Q.Animate({
        tween: 'cubic',
        ease: 'easyin',
        max: _this.width,
        begin: 0,
        duration: 25,
        bind : function(x) {
          _this.move(_this.width-x);
        }
      })).play();
    } else {
      _this.select_album_item(id);
    }
  },


  update_image_info : function(id) {
    var img = this.images_data[id];
    if(!img)
      return;
    var update_size = new Image();
    
    update_size.onload = ( function( t ) { return function() {
      //Q.printf(this.width+":"+this.height);
      Q.$('image-title').innerText = "标题: " + img.title;
      Q.$('image-title').title = img.title;
      Q.$('image-url').title = this.src;
      Q.$('image-url').innerText = "地址: " + this.src;
      Q.$('image-size').innerText= "大小: " + this.width + " x " + this.height + " pixels";
      t.image_origin_width = this.width;
      t.image_origin_height = this.height;
      t.image_view.src = this.src;
    } } )( this );
    update_size.src = img.src;       
  },

  close : function() {
    var _this = this;
    if( !this.display )
      return;
    _this.display = false;
    _this.move(_this.width);
    (new Q.Animate({
      tween: 'Cubic',
      ease: 'easyIn',
      max: _this.width,
      begin: 0,
      duration: 25,
      bind : function(x) {
        _this.move(x);
        if(x >= _this.width) {
          _this.image_view.src = '';
        }
      }
    })).play();
  },

  onclose : function() {
  
  },
  
  move : function(x) {
    this.hwnd.style.left  = x + 'px';
    this.hwnd.style.right = -x + 'px'
  },

  select_album_item : function(id) {
    this.update_image_info(id);
    //console.log("album list scrollWidth == offsetWidth: " + this.image_list.scrollWidth + ', ' +this.image_list.offsetWidth);

    var item = Q.$('album-item-'+id);
    if(item == this.image_selected)
      return;

    if(this.image_selected) 
      this.image_selected.className = "item";
    
    this.image_selected = item;
    item.className = 'item selected';
    // load image info
    this.load_image_info();

    if( this.image_selected.nextElementSibling == null ) {
      Q.$('image-next').style.display = "none";       
    } else {
      if( Q.$('image-next').style.display == "none" ) {
        Q.$('image-next').style.display = "";       
      }
    }

    if( this.image_selected.previousElementSibling == null ) {
      Q.$('image-prev').style.display = "none";       
    } else {
      if( Q.$('image-prev').style.display == "none" ) {
        Q.$('image-prev').style.display = "";       
      }
    }



    if(this.image_list_container.scrollWidth > this.image_list_container.offsetWidth) {
      var _this = this;
      var scroll_left = _this.image_list_container.scrollLeft;
      var width = (item.offsetLeft-scroll_left) - (this.image_list_container.offsetWidth-item.offsetWidth)/2;
      // scroll view
      (new Q.Animate({
        tween: 'Cubic',
        ease: 'easyIn',
        max: width,
        begin: 0,
        duration: 25,
        bind : function(x) {
          _this.image_list_container.scrollLeft = scroll_left + x;
        }
      })).play();
    }
  },

  load_image_info : function(id) {
                      
  },

  get_first_child : function( node ) {
    if( !node.childNodes ) {
      return null;
    }
    
    for( var i=0; i < node.childNodes.length; i++ ) {
      var child = node.childNodes[i];
      if( child.nodeType == Q.ELEMENT_NODE ) {
        return child;
      }
    }
  },  

  image_next : function() {
    var item = null;
    if(!this.image_selected) {
      item = this.get_first_child( this.image_list );
    } else if(!this.image_selected.nextElementSibling) {
      return;
    } else {
      item = this.image_selected.nextElementSibling;
    }
    
    if( item ) {
      
      item.click();
      
    }
    //if(!re.test(item.id))
    //  return;
    //this.select_album_item(RegExp.$1);
  },

  image_prev : function() {
    var item = null;
    if(!this.image_selected) {
      item = this.get_first_child( this.image_list );
    } else if(!this.image_selected.previousElementSibling) {
      return;
    } else {
      item = this.image_selected.previousElementSibling;
    }
    
    if( item )
      item.click();
  }
});

