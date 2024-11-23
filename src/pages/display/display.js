/*-------------------------------------------------------
 $ file:  wayixia.js
 $ powered by wayixia.com
 $ date: 2014-11-8
 $ author: Q 
---------------------------------------------------------*/


import config from "../../scripts/config.js"

import {wayixia_track_button_click} from "../../scripts/tracker.js"
import {urls_filter} from "../../scripts/urls_filter.js"
import worker from "../../scripts/worker.js";

var t = {};
var checkbox_show_block = null;
var wayixia_images_box = null;
var wayixia_images_filter = null;
var wayixia_block_images = {};
//var wayixia_source_tab_id = 0;

window.is_block_image = function(url) {
  //var config = chrome.config.getBackgroundPage();
  return !!wayixia_block_images[url]; 
}

/** font size drop window
 *
 */
window.ImageFilter = Q.DropWindow.extend( {
g_min_width: 0,
g_min_height: 0,
e_with : null,
e_height : null,
__init__ : function( json ) {
  var _this = this;
  json = json || {};
  this.g_min_width = 0;
  this.g_min_height= 0; 

  this.e_width = new Q.Slider({id: 'x-ctrl-mini-width', min: 0, max: 100, value: 0/10, 
    on_xscroll: function(v) {
      _this.g_min_width = v*10;
      
      wayixia_images_box.each_item(function(item) {
        if(!(checkbox_show_block.checked() && Q.hasClass(item, 'blocked')))
          wayixia_images_box.check_size(item, _this.g_min_width, _this.g_min_height);
      });
      Q.$('wayixia-min-width').innerText = _this.g_min_width + 'px';
      config.save_lastconfig((c) => {
        if( c )
        {
          config.set_filter_width( _this.g_min_width );
        }
      });
    }
  });
  
  

  this.e_height = new Q.Slider({id: 'x-ctrl-mini-height', min: 0, max: 100, value: 0/10, 
    on_xscroll: function(v) {

      _this.g_min_height = v*10;
      console.log( "eheight scroll " + _this.g_min_height );
      
      wayixia_images_box.each_item(function(item) {
        if(!(checkbox_show_block.checked() && Q.hasClass(item, 'blocked')))
          wayixia_images_box.check_size(item, _this.g_min_width, _this.g_min_height);
      });
      
      Q.$('wayixia-min-height').innerText = _this.g_min_height + 'px';
      
      config.save_lastconfig( (c) => {
        if( c )
        {
          config.set_filter_height( _this.g_min_height );
        }
      });
    }
  });


  json.content = Q.$('wayixia-filter-wnd');
  json.width = 122;
  json.height = 120;
  Q.DropWindow.prototype.__init__.call(this, json);
}

} );

function initialize () {
  var _this = t = this;
  var blocked_images = [];
  var accept_length  = 0;
  
  // Image box
  wayixia_images_box = new Q.ImagesBox({id: 'wayixia-list',
    buttons : ['preview', 'edit', /*'tocloud',*/ 'save'],
    on_item_changed: function(item, check) {
      if(item.style.display == '') { 
        update_ui_count();
      }
    },
    is_item_enabled: function(item) {
      return (item.style.display != 'none');
    },
    on_item_click : function( item, target ) {
      console.log(target.className);
      if( target.className == "preview" ) {
        var imgs = [];
        wayixia_images_box.each_item( function(item2) {
          if(item2.style.display == '') {
            imgs.push({
              src: item2.getAttribute('data-url')
            });
          }
        } );
        album_player_display( item.getAttribute( 'data-url' ), imgs );
      } else if( target.className == "save" ) {
        download_item( item );
      } else if( target.className == "edit" ) {
        edit_item( item );
      } else if( target.className == "tocloud" ) {
        tocloud_item( item );
      }
    }
  });


  // View
  Q.$('wayixia-view').onclick = function(evt) {return false;}
  var view_type = new Q.DropDownList({ 
    id: 'wayixia-select-view', 
    wstyle: 'wayixia-menu',
    value : config.view_type(),
    on_change: function(text, value) {
      wayixia_images_box.set_style(value);
      config.view_type_set(value);
      if(!window.__first_display)
        wayixia_track_button_click(Q.$('wayixia-view'), value);
      window.__first_display = true;
    }  
  });

  checkbox_show_block = new Q.CheckBox({id:'wayixia-show-block',
    checked: true,
    onchange: function(checked) {
      wayixia_track_button_click(Q.$('wayixia-show-block'));
      var visible = !checked;
      wayixia_images_box.each_item(function(item) {
        if(Q.hasClass(item, 'blocked')) {
          if(visible) {
            item.style.display = '';
            accept_length++; 
          } else {
            accept_length--; 
            wayixia_images_box.set_check(item, false);
            item.style.display = 'none';
          }
        }
      });

      update_ui_count();
    }
  });

  var button_select_all = new Q.CheckBox({id: 'wayixia-select-all',
    onchange: function(checked) {
      wayixia_track_button_click(Q.$('wayixia-select-all'));
      wayixia_images_box.select_all(checked);
    }  
  });

  Q.$('wayixia-add-block').onclick=function() {
    wayixia_track_button_click(this);
    var box = Q.alert({
      title: Q.locale_text('extName'),
      wstyle: "q-widnow w-window",
      content: '<div style="margin:auto; padding:20px;font-size:14px;">'+Q.locale_text('infoAddBlock')+'</div>',
      on_ok: function() {
        var remove_items = [];
        //var config = chrome.config.getBackgroundPage();
        wayixia_images_box.each_item(function(item) {
          if(Q.hasClass(item, 'mouseselected') && item.style.display == '') {
            if(!Q.hasClass(item, 'blocked')) {
              var url = item.getAttribute('data-url');
              config.block_image_add(url);
              blocked_images.push(url);
	          }
            block_item(item, true);
            accept_length--;
          }
        });

        update_ui_count();
        return true; 
      },
      on_no: function() { return true; },
    });
  }


  Q.$('wayixia-local-download').onclick=function( evt ) {
    evt = evt || window.event;
    wayixia_track_button_click(this);

    //var config = chrome.config.getBackgroundPage();
    var selected_items = 0;
    wayixia_images_box.each_item( ( function( folder ) { return function( item ) {
      if((item.className.indexOf('mouseselected') != -1) && item.style.display == '') {
        download_item( item, folder );
        selected_items ++;
      }
    } } )( config.last_site() ) );

    if( selected_items == 0 ) {
      wayixia.message_box( { content: Q.locale_text('stringSelectNone'), icon: 'info' } ); 
    }
  }

  Q.$('wayixia-local-download-menu').onclick = function( evt ) {
    evt = evt || window.event;
    wayixia_track_button_click(this);
    event.cancelBubble = true;
    popup_save_menu( Q.$('wayixia-local-download'), evt, function( folder ) {
      var selected_items = 0;
      wayixia_images_box.each_item(function(item) {
        if((item.className.indexOf('mouseselected') != -1) && item.style.display == '') {
          download_item(item, folder );
          selected_items ++;
        }
      });
      if( selected_items == 0 ) {
        wayixia.message_box( { content: Q.locale_text('stringSelectNone'), icon: 'info' } ); 
      }
    } );
  }

  /*
  Q.$('wayixia-tocloud').onclick = function( evt ) {
    evt = evt || window.event;
    wayixia_track_button_click(this);
    if(!check_login_dialog()) 
      return;


    popup_tocloud_menu( this, evt, function(album) {
      var selected_items = 0;
      wayixia_images_box.each_item(function(item) {
        if( ( item.className.indexOf( 'mouseselected' ) != -1 ) && ( item.style.display == '' ) ) {
          tocloud_item( item, album.id );
          wayixia_images_box.set_check(item, false);
          selected_items ++;
        }
      })
      if( selected_items == 0 ) {
        wayixia.message_box( { content: Q.locale_text('stringSelectNone'), icon: 'info' } ); 
      }
      
    } );
  }
  */

  wayixia_images_filter =  new ImageFilter({}); 
  Q.$( 'wayixia-filter-icon' ).onclick = (function(t, e) { return function(evt) { 
    wayixia_images_filter.showElement(e);
    wayixia.track_event( 'toolbar', 'filtersize' );
  } } )(this, Q.$( 'wayixia-filter-icon' ));

  // Initialize gotop button
  Q.$('wayixia-gotop').onclick = function( evt ) {
    wayixia_track_button_click(this);
    (new Q.Animate({
      tween: 'Cubic',
      ease: 'easyIn',
      max: wayixia_images_box.hwnd.scrollTop,
      begin: 0,
      duration: 25,
      bind : (function(z, b) { return function(x) {
        // console.log(x);
        if( x == this.max ) {
          b.style.display = "none";
        } else {
          b.style.display = '';
        }
        z.scrollTop = ( this.max - x );

      }})( wayixia_images_box.hwnd, this )
    })).play();
  }

  Q.$('wayixia-gotop').style.display = 'none';
  
  var gotop_func = ( function(box, btn, toolbar ) { return function(evt) {
    if( box.scrollTop > 0 ) {
      btn.style.display = '';
      Q.addClass( toolbar, 'dropshadow');
    } else {
      btn.style.display = 'none';
      Q.removeClass( toolbar, 'dropshadow');
    }
  } } )( wayixia_images_box.hwnd, Q.$('wayixia-gotop'), Q.$('wayixia-toolbar') ) ;
 
  // Add event listener
  Q.addEvent( wayixia_images_box.hwnd, 'mousewheel', gotop_func );
  Q.addEvent( wayixia_images_box.hwnd, 'scroll', gotop_func );




  function block_item(item, blocked) {
    if(blocked) {
      Q.addClass(item, 'blocked');
      item.style.display = 'none';
      wayixia_images_box.set_check(item, false);
    } else {
      Q.removeClass(item, 'blocked');
      item.style.display = '';
    }
  }

  function download_item( item, folder ) {
    //if((item.className.indexOf('mouseselected') != -1) && item.style.display == '') {
      //var config = chrome.config.getBackgroundPage();
      var url = item.getAttribute('data-url');
      var name = "";
      if( folder && folder.name ) {
        name = folder.name;
      }
      worker.download_image(url, window, name, "" );
      Q.addClass(item, 'downloaded');
      item.style.display = 'none';
    //}
  }

  function edit_item( item ) {
    //var config = chrome.config.getBackgroundPage();
    worker.edit_image( item.getAttribute('data-url'), window );
  }

  function tocloud_item( item, album_id ) {
    wa_image( {
      src : item.getAttribute( 'data-url' ),
      width : item.getAttribute( 'data-width' ),
      height : item.getAttribute( 'data-height' ),
      album_id: album_id, 
    } )( item );
    //alert( item.getAttribute( 'data-url' ) );
  }

  function update_ui_count() {
    //Q.$('wayixia-show-block').innerText = Q.locale_text('haveBlocked') + '('+blocked_images.length+')';
    //Q.$('wayixia-select-all').innerText = Q.locale_text('selectAll') + '('+accept_length+')';
    //Q.$('wayixia-select-all').innerText = '('+accept_length+')';
  }

  function init_filter_image_items( blocked_images ) {
    return function(item) {
      var is_blocked = false;
      var url = item.getAttribute('data-url');
      for(var i=0; i < blocked_images.length; i++) {
        if(url == blocked_images[i]) {
          block_item(item, true); 
          is_blocked = true;
        }
      }

      if(!is_blocked) {
        accept_length++;
        update_ui_count();
        wayixia_images_box.check_size( item, config.filter_width(), config.filter_height() );
      }
    }
  }

  // entry display images
  window.display_valid_images = function( extension, imgs, data) {
    // clear errors
    clear_errors();
    clear_album_player();
    //filter_rule_is_enabled, filter_rules,
    wayixia_images_filter.e_width.setValue( extension.filter_width/10  );
    wayixia_images_filter.e_height.setValue( extension.filter_height/10 );
    // init datacheckbox_show_block.checked()
    var accept_images  = {};
    accept_length  = 0;
    blocked_images = [];

    if(!imgs)
      return;

    //filter image duplicated
    for(var i=0; i < imgs.length ; i++) {
      var url = imgs[i].src;
      if(extension.filter_rule_is_enabled)
        url = urls_filter(url, extension.filter_rules.rules);
      if(url && (accept_images[url] == undefined) ) {
        var blocked = window.is_block_image(url);
        accept_images[url] = blocked;
        //accept_length++;
        if(blocked) 
          blocked_images.push(url);
      }
    }
    //accept_length -= blocked_images.length;
    update_ui_count();
    return wayixia_images_box.display_images(accept_images, data, init_filter_image_items( blocked_images));
  }


  /*
  this.g_min_width = 0;
  this.g_min_height= 0; 
  this.e_width = new Q.Slider({id: 'x-ctrl-mini-width', min: 0, max: 100, value: config.filter_width()/10, 
    on_xscroll: function(v) {
      g_min_width = v*10;
      wayixia_images_box.each_item(function(item) {
        if(!(checkbox_show_block.checked() && Q.hasClass(item, 'blocked')))
          wayixia_images_box.check_size(item, t.g_min_width, t.g_min_height);
      });
      Q.$('wayixia-min-width').innerText = t.g_min_width + 'px';
      if( config.save_lastconfig() ) {
        config.set_filter_width( t.g_min_width );
      }
    }
  });
  
  this.e_height = new Q.Slider({id: 'x-ctrl-mini-height', min: 0, max: 100, value: config.filter_height()/10, 
    on_xscroll: function(v) {

      t.g_min_height = v*10;
      console.log( "eheight scroll " + t.g_min_height );
      wayixia_images_box.each_item(function(item) {
        if(!(checkbox_show_block.checked() && Q.hasClass(item, 'blocked')))
          wayixia_images_box.check_size(item, t.g_min_width, t.g_min_height);
      });
      Q.$('wayixia-min-height').innerText = t.g_min_height + 'px';
      
      if( config.save_lastconfig() ) {
        config.set_filter_height( t.g_min_height );
      }
    }
  });
  */


  /** initialize title of buttons */
  Q.$( 'wayixia-local-download' ).title = Q.locale_text( 'toolSave' );
  //Q.$( 'wayixia-tocloud' ).title = Q.locale_text( 'toolSaveToCloud' );
  Q.$( 'wayixia-select-all' ).title = Q.locale_text( 'selectAll' );
  Q.$( 'wayixia-add-block' ).title = Q.locale_text( 'addBlock' );
  Q.$( 'wayixia-show-block' ).title = Q.locale_text( 'haveBlocked' );

  // Set image item state
  function set_image_state( e, state ) {
    var _state_message = {
      ing:  Q.locale_text('stringDigging'),
      ok :  Q.locale_text('stringDigOk'), 
      error: Q.locale_text('stringDigError'), 
      warn: Q.locale_text('stringHadDigged') 
    }

    if(!_state_message[state]) {
      state = 'ing';
    }
    var wing_box = qid( e, 'layer-mask' );
    wing_box.className = 'layer-mask wing-box-'+state;
    e.state = state;
    wing_box.innerHTML = _state_message[state];
    if( ( state == 'ok' ) || ( state == 'warn' ) ) {
      setTimeout( function() {
      (new Q.Animate({ tween: 'cubic', ease: 'easyin',
        max: 2000, begin: 0, duration: 100,
        bind : function(x) {
          if(x == this.max) {
            e.style.display = 'none';
          } else {
            e.style.opacity = ((this.max-x)*1.0) / this.max;
          }
        }
      })).play();
      }, 3000 );
      e.disabled = false;
    } else if( state== "ing" ) {
      e.disabled = true;
    } else {
      setTimeout(function() {
        wing_box.className = 'layer-mask wing-box';
      }, 3000);
      e.disabled = false;
    }
  }

  function wa_image(config) { return function(item) {
    if(!check_login_dialog()) 
      return;
    //quick wa
    var json_data = {};
    json_data.pageUrl = wayixia_request_data.data.pageUrl;
    json_data.srcUrl = config.src, 
    json_data.cookie = wayixia_request_data.data.cookie,
    json_data.title = wayixia_request_data.data.title,
    json_data.width = config.width;
    json_data.height = config.height;
    if( !config.album_id ) {
      json_data.album_id = 0;
    } else {
      json_data.album_id = config.album_id;
    }
    set_image_state( item, 'ing' );
    
    Q.ajaxc( { command:"http://www.wayixia.com:10086/getimage",
      data: {img: json_data},
      withCredentials: true,
      noCache:true,
      method:"post",
      queue: true,
      continueError: true,
      oncomplete: function(xmlhttp){
        var res = {}; 
        try {
          res = Q.json_decode( xmlhttp.responseText );
        } catch(e) {
          res.header = -1;
          res.data = e.description;
        }
        var result = res.header;
        if(result == 0) {
          set_image_state( item, 'ok' );
          Q.addClass(item, 'downloaded');
        } else if(result == -2) {
          check_login_dialog();
          return;
        } else if(result == -100){
          set_image_state( item, 'warn' );
          Q.addClass(item, 'downloaded');
        } else {
          set_image_state( item, 'error' );
        }
      }, // ok

      onerror: function( xmlhttp ) {
        set_image_state( item, 'error' );
      }  // error
    } );
  } } // end wa_image
  
  console.log('content is loaded');
};

/** 开放平台接口 */
function api_share2sina(image_src) {
  var json = {
    url: wayixia_request_data.data.pageUrl,
    type:'3',
    count:'1', /**是否显示分享数，1显示(可选)*/
    appkey:'59191755', /**您申请的应用appkey,显示分享来源(可选)*/
    title: wayixia_request_data.data.title, /**分享的文字内容(可选，默认为所在页面的title)*/
    pic: image_src, /**分享图片的路径(可选)*/
    ralateUid:'', /**关联用户的UID，分享微博会@该用户(可选)*/
    language:'zh_cn', /**设置语言，zh_cn|zh_tw(可选)*/
    dpc:1
  }

  window.open("http://service.weibo.com/share/share.php?url=" + json.url + "&appkey=" + json.appkey + "&title=" + json.title + "&pic=" + json.pic + "&ralateUid=" + json.ralateUid + "&language=" + json.language, "_blank", "width=615,height=505")
}

/** 图册播放器 */
var g_album_player = null;

function album_player_display( url, imgs ) {
  if(!g_album_player) {
      g_album_player= new Q.album_player({
        share : function(src) {
          api_share2sina(src); 
        },
        
        download : function(src) {
          //var config = chrome.config.getBackgroundPage();
          worker.download_image(src, window, config.last_site().name, "" );
        }
      }); 
      g_album_player.render(url, imgs); 
  } else {
    g_album_player.render(url, imgs); 
  }
}

function clear_album_player() {
  if(g_album_player)
    g_album_player.close();
}


function display_all_valid_images( data, extension ) {
//  var filter_rule_is_enabled = extension.filter_rule_is_enabled();
  //const filter_rules = await config.filter_rule_get();
  //const block_images = await config.block_images_all();
  if( !data )
    return;
  wayixia_block_images = extension.block_images||{};
  wayixia.source_tab_id = data.ctx_tab_id;
  var packet = data.data || {};
  packet.imgs = packet.imgs || [];
  packet.data = packet.data || {};
  wayixia.request_data.imgs = packet.imgs;
  wayixia.request_data.data = packet.data;
  //var filter_rules =extension.filter_rules || {rules:{}};
  //extension.filter_rule_is_enabled
  if(wayixia.request_data.imgs) {
    window.display_valid_images( extension, wayixia.request_data.imgs, wayixia.request_data.data)();
  }
}


/** 挖图界面初始化 */
Q.ready(function() {  
  //Q.set_locale_text(locale_text);
  initialize();

  chrome.tabs.getCurrent( function( tab ) {

    worker.get_display_cache(tab.id, (data)=>{
      var names = {
        filter_rule_is_enabled: false, 
        filter_rules:[], 
        block_images:{}, 
        filter_width:0, 
        filter_height:0 
      };
      config.getall2( names, (extension)=>{
        display_all_valid_images(data, extension);
      });
    });

    /** initialize images data*/
//    chrome.runtime.sendMessage(
      //{action: "get_display_cache", tabid: tab.id}, 
      //(data)=>{
        //var names = {
          //filter_rule_is_enabled: false, 
          //filter_rules:[], 
          //block_images:{}, 
          //filter_width:0, 
          //filter_height:0 
        //};
        //config.getall2( names, (extension)=>{
            //display_all_valid_images(data, extension);
        //});
      //}
    //);
  } );
});

