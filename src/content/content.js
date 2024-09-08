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
    this.overflow    = document.body.style.overflow;
    document.body.style.overflow='hidden';
    this.set_body_scroll_top( 0 ); //document.body.scrollTop = 0;
    this.set_body_scroll_left( 0 );  //document.body.scrollLeft= 0;
    this.page_width  = document.documentElement.clientWidth;
    this.page_height = document.documentElement.clientHeight;
  
    return {
      full_width : document.body.scrollWidth, 
      full_height: document.body.scrollHeight,
      page_width : this.page_width,  
      page_height: this.page_height,
    };
  }, 

  capture_page : function(row, col) {
    //document.body.scrollTop  = row * this.page_height;
    //document.body.scrollLeft = col * this.page_width;
    this.set_body_scroll_top( row * this.page_height );
    this.set_body_scroll_left( col * this.page_width );
    //this.fixed_disabled();
  },

  stop : function() {
    document.body.style.overflow = this.overflow;
    //document.body.scrollTop = this.scroll_top;
    //document.body.scrollLeft= this.scroll_left;
    this.set_body_scroll_top( this.scroll_top );
    this.set_body_scroll_left( this.scroll_left );
    
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


  fixed_disabled : function() {
    for( var i=0; i < document.all.length; i++) {
      var e = document.all[i];
      if( e.currentStyle.position == "fixed" && !( e.currentStyle.display == "none" || e.currentStyle.visibility == "hidden" )) {
        e.style.position = "relative";
        this.fixed_elements.push( e );
      }
    }
  },

  fixed_enabled: function() {
    for( var i=0; i < this.fixed_elements.length; i++ ) {
      this.fixed_elements[i].style.position = "fixed";
    }
  }
};

chrome.runtime.sendMessage( { action:"userstatus" } );



// listener
chrome.runtime.onMessage(function(request, sender, sendResponse) 
{
  switch (request.type) {
  case "display-all-images": 
    sendResponse(generate_response(get_all_images()));
    break;
  
  case "display-single-image":
    sendResponse(generate_response([{src: request.src}]));    
    break; 

  case "screenshot-ismax":
    // Check page size
    if( document.body.scrollHeight > request.maxheight ) {
      //Q.alert( { wstyle: "q-attr-no-icon", title: "Wayixia.com", content: "<div style='padding: 5px;'>page is too large ( " + document.body.scrollWidth + "," + document.body.scrollHeight +" ), please download caputre assistant from <a href='http://www.wayixia.com/download/assistant'>here</a> </div>" } );  
      Q.alert( { wstyle: "q-window w-window", title: "ImageCap", content: "<div style='padding: 10px'>" +  locale_text("stringLongPageTips") + " ( " + document.body.scrollWidth + "," + document.body.scrollHeight +" )</div>"} );  
      sendResponse({ acceptable: false });
    } else {
      sendResponse({ acceptable: true });
    }
    break;

  case "bodysize":
    sendResponse( { width: document.body.scrollWidth, height: document.body.scrollHeight } );
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
});

//( function(d) { return function() {
  var e = document.getElementById("wayixia_chrome_extension_identity_label");
  if( e ) {
    e.innerHTML = "Extension of Wayixia(id:" + chrome.runtime.id+ ") is installed. Connect OK!";
    chrome.extension.sendMessage( { action:"assistant", port: location.port } );
    window.close();
  }
//} } )(document)

