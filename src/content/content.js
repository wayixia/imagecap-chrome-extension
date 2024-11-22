/*
 *  wayixia chrome plugin 
 *  
 * */

// impliment prototype of currentStyle
var agent   = function() { return navigator.userAgent.toLowerCase(); }
var isW3C   = function() { return document.getElementById ? true:false; }
var isNS6   = function() { return isW3C() && (navigator.appName=="Netscape"); }

//为Firefox下的DOM对象增加innerText属性
if(isNS6()) { //firefox innerText define
  HTMLElement.prototype.__defineGetter__("innerText",    function() { return this.textContent; });
  HTMLElement.prototype.__defineSetter__("innerText",    function(sText) { this.textContent=sText; });
  HTMLElement.prototype.__defineGetter__("currentStyle", function () { return this.ownerDocument.defaultView.getComputedStyle(this, null); });     
}

function get_all_images() {
  var links  = [];
  var docs = [];
  try { 
    docs = [].slice.apply(window.frames);
    docs = docs.map(function(e) {
      return e.document;
    });
  } catch(e) {
    console.log( "[content] error-> " + e );
    docs = [];
  }
  docs.push(document);
  for(var i=0; i < docs.length; i++) {
    var images = get_document_images(docs[i]);
    links = links.concat(images);
  }

  return links;
}

function get_document_images(doc) {
  var imgs = doc.getElementsByTagName('img');
  var links = [].slice.apply(imgs);
  links = links.map(function(element) {
    return {src: element.src};
  });
  
  var all = document.all;
  for(var i=0; i != all.length; i++) {
    var e = all[i];
    if(e.nodeType == 1) {
      var url = "";
      if(e.currentStyle && e.currentStyle.backgroundImage) {
        url = e.currentStyle.backgroundImage
      } else if(e.style && e.style.backgroundImage) {
        url = e.style.backgroundImage;        
      }
      if(url !="" && /^url\(/.test(url)) {
        url =url.replace(/^url\("?/, '').replace(/"?\)$/, '');       
        links.push({src: url});
      }
    }
  }

  return links;
}

function generate_response(imgs) {
  return {
      type : 'display-images', 
      imgs : imgs,
      data : {
        cookie : document.cookie,  // 用于处理防盗链
        title  : document.title,   // 用于显示默认标题
        pageUrl: location.href     // 用于保存来源地址
      }
  };
}

function getScrollbarWidth() {
  const outer = document.createElement('div'); 
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden'; 
  outer.style.width = '100px';
  outer.style.position = 'absolute'; 
  outer.style.top = '-9999px'; document.body.appendChild(outer);
  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);
  const widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  var scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};



function get_hscrollbarwidth()
{
  if( document.documentElement.scrollWidth == document.documentElement.clientWidth ) {
    return 0;
  } else {
    return getScrollbarWidth();
  }
}

function get_vscrollbarwidth()
{
  if( document.documentElement.scrollHeight == document.documentElement.clientHeight ) {
    return 0;
  } else {
    return getScrollbarWidth();
  }
}



var g_fullscreen_capture = {
  scroll_top : 0,
  scroll_left : 0,
  overflow : '',
  page_width : 0,
  page_height : 0,
  fixed_elements: [],

  start : function() {

    this.fixed_disabled();

    this.scroll_top  = this.body_scroll_top(); //document.body.scrollTop;
    this.scroll_left = this.body_scroll_left(); //document.body.scrollLeft;
    //this.overflow    = document.body.style.overflow;
    //document.body.style.overflow='hidden';
    this.set_body_scroll_top( 0 ); //document.body.scrollTop = 0;
    this.set_body_scroll_left( 0 );  //document.body.scrollLeft= 0;
    this.page_width  = document.documentElement.clientWidth;
    this.page_height = document.documentElement.clientHeight;
  
    return {
      full_width : document.body.scrollWidth * window.devicePixelRatio, 
      full_height: document.body.scrollHeight * window.devicePixelRatio,
      page_width : this.page_width * window.devicePixelRatio,  
      page_height: this.page_height * window.devicePixelRatio,
      hscrollbarwidth: get_hscrollbarwidth()*window.devicePixelRatio, 
      vscrollbarwidth: get_vscrollbarwidth()*window.devicePixelRatio, 
    };
  }, 

  capture_page : function(row, col) {
    this.fixed_disabled();
    window.scrollTo( col * this.page_width, row * this.page_height);

  },

  stop : function() {
    window.scrollTo( this.scroll_left, this.scroll_top);
    this.fixed_enabled();
  },

  body_scroll_top : function() {
    if( document.documentElement && document.documentElement.scrollTop ) {
      return document.documentElement.scrollTop;
    } else {
      return document.body.scrollTop;
    }
  },

  set_body_scroll_top: function( v ) {
    if( document.documentElement ) {
      document.documentElement.scrollTop = v; 
    } else {
      document.body.scrollTop = v; 
    }

    console.log("set scroll top " + v);
  },


  body_scroll_left: function() {
    if( document.documentElement && document.documentElement.scrollLeft ) {
      return document.documentElement.scrollLeft;
    } else {
      return document.body.scrollLeft;
    }
  },


  set_body_scroll_left: function( v ) {
    if( document.documentElement ) {
      document.documentElement.scrollLeft = v; 
    } else {
      document.body.scrollLeft = v; 
    }
  },

  hide_element: function(element) {
    this.fixed_elements.push({
        e: element,
        opacity: element.style.getPropertyValue("opacity"),
        animation: element.style.getPropertyValue("animation"),
        transitionDuration: element.style.getPropertyValue("transition-duration")
    });
    element.style.setProperty("opacity", "0", "important");
    element.style.setProperty("animation", "unset", "important");
    element.style.setProperty("transition-duration", "0s", "important");
    element.__imagecap_ignore = true; 
  },

  show_element: function(item) {
   if( item ) { 
      item.e.style.setProperty("transition-duration", item.transitionDuration);
      item.e.style.setProperty("opacity", item.opacity);
      item.e.style.setProperty("animation", item.animation);
    }
  },

  isinviewport : function(element) {
    const viewHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewWidth = window.innerWidth || document.documentElement.clientWidth;
    // 当滚动条滚动时，top, left, bottom, right时刻会发生改变。
    const {
      top,
      right,
      bottom,
      left
    } = element.getBoundingClientRect();
    return (top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight);
  },

  ishide_element : function(e) {
    for( var i=0; i < this.fixed_elements.length; i++ ) {
      if( this.fixed_elements[i].e == e ) {
        return true;
      }
    }

    return false;
  },

  fixed_disabled : function() {
    var elems = document.body.getElementsByTagName("*");
    var len = elems.length

    for (var i=0;i<len;i++) {
      var position = window.getComputedStyle(elems[i],null).getPropertyValue('position');
      var e = elems[i];
      if( position == 'fixed' || position=="sticky") {
        if( !this.ishide_element(e)) {
        //  if( this.isinviewport(e) ) {
            console.log( "fixed item: " + e.className + ", id:" + e.id );
            this.hide_element(e);
        //}
        }
        //console.log( "fixed item: " + e.className );
        //this.hide_element(e); 
      //} else if( position=="sticky" ) {
        //this.hide_element(e);
        //console.log( "sticky item: " + e.className );
      }
    }
  },

  fixed_enabled: function() {
    for( var i=0; i < this.fixed_elements.length; i++ ) {
      var e = this.fixed_elements[i];
      this.show_element(e);
    }
  }
};

chrome.runtime.sendMessage( { action:"userstatus" } );



// listener
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  switch (request.type) {
  case "display-all-images": 
    sendResponse(generate_response(get_all_images()));
    break;
  
  case "display-single-image":
    sendResponse(generate_response([{src: request.src}]));    
    break; 

  case "screenshot-begin":
    sendResponse(g_fullscreen_capture.start());
    break; 
  
  case "screenshot-page":
    g_fullscreen_capture.capture_page(request.row, request.col); 
    sendResponse({});
    break; 
  
  case "screenshot-end":
    g_fullscreen_capture.stop(); 
    sendResponse({});
    break;
  
  default:
    sendResponse({});
    break;
  }

  //return true;
});

