// Copyright (c) 2014-2016 The Wayixia Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//

import config from "../scripts/config.js"
import Q from "./background_ajax.js"
//import "./background_ajax.js"

var plugin_name  = chrome.i18n.getMessage('menuDigImages');
var wayixia = {};


var block_images = {};
wayixia.nickname = "";
wayixia.uid = 0;
wayixia.albums = [];
wayixia.last_album = {};
wayixia.download_images = [];
wayixia.assistant = "http://127.0.0.1:8010";
wayixia.maxheight = 5000;

// check new version for helper
if(config.user_config_is_new()) {
  // display new features of wayixia extension
  setTimeout(create_upgrade_page(), 60*1000);
}

function user_is_login() {
  return ( wayixia.nickname != "" );
}

function nickname() {
  return wayixia.nickname;
}


function uid() {
  return wayixia.uid;
}


function albums() {
  return wayixia.albums;
}

function last_album() {
  return wayixia.last_album;
}

function set_last_album( album ) {
  wayixia.last_album = album;
}

function wayixia_assistant() {
  return wayixia.assistant;
}

function set_wayixia_assistant( port ) {
  if( port != "" ) {
    wayixia.assistant = "http://127.0.0.1:"+port;
  } else {
    wayixia.assistant = "http://127.0.0.1:8010";
  }
}

function wayixia_assistant_isalive( fn ) {
  var assistant_url =  wayixia_assistant();
  if( assistant_url != "" ) {
    Q.ajax( {
      command: assistant_url + '/keepalive',
      oncomplete: function(xml) {
        if( xml.responseText == 'connected') 
        {
          fn( true );
        }
        else
        {
          fn( false );
        }
      },
      onerror: function(xml) {
        fn( false );
      } 
    } );
  } else {
    fn( false );
  }
}

function wayixia_screenshot_maxsize()
{
  return { height: 5000 };
}

function is_max_screenshot( width, height ) {
  //return ( width * height ) > ( 200 * 160 );
  return height > 5000;
}



function saveconfig() {
  /*
 Q.ajaxc( { command: "https://www.wayixia.com/?mod=user&action=do-save-config&inajax=true",
    data: { config: user_config_tostring() },
    oncomplete : function( xmlhttp ) {
      try {
        console.log( xmlhttp.responseText );
      } catch(e) {
        console.log(e);
      }
    },
    onerror: function( xmlhttp ) {
      console.log("Problem save config");
    }
  } );
  */
}

/*
function ajax_execute( json ) {
  var http_call = new XMLHttpRequest();
  http_call.onreadystatechange = (function(callee) { return function() {
    if (this.readyState==4) {  // 4 = "loaded"
      if (this.status==200) { // 200 = OK
        console.log(this.responseText);
        json.oncomplete( this );
      } else {
        if( json.onerror ) {
          json.onerror( this );
        }
        console.log("Problem retrieving data");
      }
    }
  }})(arguments.callee); 
  if( json.command.indexOf("?") == -1 ) {
    http_call.open(json.method, json.command + "?rnd="+Math.floor(+new Date/1E7), true);
  } else {
    http_call.open(json.method, json.command + "&rnd="+Math.floor(+new Date/1E7), true);
  }
  http_call.send(null);
}

function ajax( json ) 
{
  var http_call = new XMLHttpRequest();
  http_call.onreadystatechange = (function(callee) { return function() {
    if (this.readyState==4) {  // 4 = "loaded"
      if (this.status==200) { // 200 = OK
        //console.log(this.responseText);
        try {
          var result = JSON.parse(this.responseText);
          if( json.oncomplete ) {
            json.oncomplete( result );
          }
        } catch(e) {
          console.log(e);
          if( json.onerror ) {
            json.onerror( this );
          }
        }
      } else {
        if( json.onerror ) {
          json.onerror( this );
        }
        console.log("Problem retrieving data");
      }
    }
  }})(arguments.callee); 
  if( json.command.indexOf("?") == -1 ) {
    http_call.open(json.method, json.command + "?rnd="+Math.floor(+new Date/1E7), true);
  } else {
    http_call.open(json.method, json.command + "&rnd="+Math.floor(+new Date/1E7), true);
  }
  //http_call.open("GET", "https://www.wayixia.com/?mod=user&action=status&inajax=true&rnd="+Math.floor(+new Date/1E7), true);
  http_call.send(null);
}

setTimeout(function() {
  // update per hour
  var callee = arguments.callee;
  ajax( { command: "https://www.wayixia.com/filter-rules.json",
    method: "GET",
    oncomplete : function( res ) {
      try {
        if( res ) {
          filter_rule_version(res.version);
          filter_rule_set(res.rules);
        }
      } catch(e) {
        console.log(e);
      }
      // update per hour
      setTimeout(callee, 60*60*1000);
    },
    onerror: function( xmlhttp ) {
      console.log("Problem retrieving data");
      // update per hour
      setTimeout(callee, 60*60*1000);
    }
  } );
}, 1000)
*/

function wayixia_logout( fn ) {
  /*
  ajax_execute( { command: "https://www.wayixia.com/?mod=user&action=logout",
    method: "GET",
    oncomplete : function( res ) {
      // Clear user data
      wayixia.nickname = "";
      wayixia.uid = 0;
      wayixia.albums = [];
      wayixia.last_album = {};
      fn( true );
    },
  } );
   */
}


function wayixia_statics_images( item, pageurl ) {
  return;
  var re = /data:(.+?);(\w+?),(.+)/;
  var url;
  var mime;
  if(re.test(item.url)) { // data
    url = pageurl;
    mime = "image/screenshot";
  } else {
    url = item.url;
    mime = item.mime;
  }

  Q.ajaxc( { command: "https://www.wayixia.com/?mod=statics&action=image&inajax=true",
    queue: true,
    data: [item.byExtensionId, url, mime, item.fileSize],
    oncomplete : function( res ) {
      console.log( res );
    },
  } );
}



function on_click_wa_single(info, tab) {
  download_image(info.srcUrl, null, "" );
}

function on_click_wa_all(info, tab) {  
  chrome.tabs.sendMessage(tab.id, { type : "display-all-images"}, function(res) {
    res = res || {};
    res.track_from = info.track_from;
    create_display_page(tab.id, res); 
  });
}

function on_click_open_options() {
  chrome.tabs.create({"url":chrome.runtime.getURL("pages/options/options.html"), "selected":true}, function(tab) {});
} 

function on_click_open_about() {
  chrome.tabs.create({"url":chrome.runtime.getURL("pages/options/options.html#about"), "selected":true}, function(tab) {});
} 

function on_click_screenshot(tab) {
  chrome.tabs.captureVisibleTab( null, {format:"png"}, function(screenshotUrl) {  
    create_display_screenshot(tab.id, screenshotUrl, tab.url); 
  });
}


// Generate four random hex digits.  
function S4() {  
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);  
}; 

// Generate a pseudo-GUID by concatenating random hexadecimal.  
function guid() {  
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());  
};  


function copy_canvasinfo( canvas ) {
  return { guid: canvas.guid, size: canvas.size, table: canvas.table, screenshots: []};
}

function on_click_full_screenshot(tab) {
  chrome.tabs.sendMessage(tab.id, { type : "screenshot-begin"}, function(res) {
    if(!res)
      return;

    var cols = Math.ceil(res.full_width*1.0 / res.page_width);
    var rows = Math.ceil(res.full_height*1.0 / res.page_height);
    var max_pos = { rows: rows, cols:cols };
    var canvas  = { guid: guid(), size: res, table: max_pos, screenshots: []};
    var current_pos = { row: 0, col: 0 };
    capture_page_task(tab, max_pos, current_pos, canvas);
  }); 
}

  
function capture_page_task(tab, max, pos, canvas) {
  console.log('capture page (row='+pos.row+', col='+pos.col + ')' );
  chrome.tabs.sendMessage(tab.id, { type : "screenshot-page", row:pos.row, col:pos.col}, function(res) {
    setTimeout(function() {
      chrome.tabs.captureVisibleTab( null, {format:'png'}, function(screenshotUrl) {
        canvas.screenshots.push({row: pos.row, col: pos.col, data_url: screenshotUrl});
        pos.col++;
        pos.col = pos.col % max.cols; 
        if(pos.col == 0) {
          pos.row++;
	        canvas.row = pos.row;
          if(pos.row % max.rows == 0) {
            screenshot_end(tab, canvas);
            return;
          } else {
            if( is_max_screenshot( canvas.size.full_width, canvas.size.full_height ) ) {
              merge_images_with_client( canvas );
              canvas = copy_canvasinfo( canvas );
            }
          }
        }

        // Process with client
        capture_page_task(tab, max, pos, canvas);
      });
    }, 1000);
  }); 
}


function screenshot_end(tab, canvas) {
  console.log('capture end');
  chrome.tabs.sendMessage( tab.id, { type : "screenshot-end" }, function(res) {
    // if size is too large then process with server
    var size = canvas.size;
    if( is_max_screenshot( size.full_width, size.full_height ) ) {
      // process with server
      merge_images_with_client( canvas, function() {
        // download image
        download_image( wayixia_assistant() + "/" + canvas.guid + ".png", null, "" );
      } );
    } else {
      create_display_full_screenshot(tab.id, canvas, tab.url); 
    }
  });
}

function merge_images_with_client( canvas, fn ) {
  /*
  Q.ajaxc( { command: wayixia_assistant() + "/merge?rid=" + canvas.row,
    queue: true,
    data: canvas,
    oncomplete: function( xmlhttp ) {
      if( fn ) {
        fn();
      }
      console.log( xmlhttp.responseText );
    }
  } );
   */
}

var cache_display = {};

function get_display_cache( tab_id ) {
  var obj = cache_display[tab_id];
  delete cache_display[tab_id];
  return obj;
}

function create_display_page(context_tab_id,  res) {  
  create_tab( { url: chrome.runtime.getURL("pages/display/display.html"), callback : ( function( id, res ) { return function( tab_id ) { 
    cache_display[tab_id] = {
      ctx_tab_id : id,
      data : res 
    }
  } } )( context_tab_id, res ) } ) ;
}

function create_display_screenshot(context_tab_id,  res, url) {  
  create_tab( { url : chrome.runtime.getURL("pages/screenshot/screenshot.html"), callback : ( function( id, res ) { return function( tab_id ) { 
    cache_display[tab_id] = {
      ctx_tab_id : id,
      data : res,
      url : url,
      type : "screenshot"
    };
  } } )( context_tab_id, res ) } );
}

function create_display_full_screenshot(context_tab_id,  res, url) {  
  create_tab( { url : chrome.runtime.getURL("pages/screenshot/screenshot.html"), callback : ( function( id, res ) { return function( tab_id ) { 
    cache_display[tab_id] = {
      ctx_tab_id : id,
      data : res,
      url : url,
      type : "full_screenshot"
    };
  } } )( context_tab_id, res ) } );
}

/** show features of the extension */
function create_upgrade_page() {  
  var manager_url = "https://www.wayixia.com/extension/#v."+chrome.runtime.getManifest().version;
  focus_or_create_tab(manager_url, function(view) { });
  config.user_config_version_ok();
}


function edit_image( url, view ) {
  focus_or_create_tab(chrome.runtime.getURL("pages/screenshot/screenshot.html") + "?img=" + url, function(view) { });
}

var download_items = {};

function download_image(url, view, folder, pageurl ) {
  get_save_path(folder, (save_path)=>{
    var options = {url: url};
    chrome.downloads.download( options, ( function( u, v, f ) { return function(id) {
      if(!id) {
        v.background_warning({
          error: chrome.runtime.lastError,
          page: v.location,
          url: u
        });
      } else {
        download_items[id] = {
          url: u,
          view: v,
          save_path: f,
          pageurl: pageurl
        };
      }
    } } )( url, view, save_path ) ); 
  })
 
}

function get_date_path() {
  var date = new Date();
  var month = date.getMonth()+1; 
  var day = date.getDate();   
  month = month>9?month:('0'+month);
  day   = day>9?day:('0'+day);
  var date_path = date.getFullYear()+month.toString(10)+day.toString(10);
  return date_path;
}

function get_save_path( folder, fn) {
  config.getall2(['save_path', 'date_folder'], (c)=>{
    var spath = c.save_path || "";
    var save_path = "wayixia/" + spath;
    var date_folder = !!c.date_folder;
    
    if( save_path != "" ) {
      save_path += "/";
    }
  
    if( folder != "" ) {
      save_path += folder + "/";
    }
  
    if(date_folder) {
      var date_path = get_date_path();
      if(date_path != "") {
        save_path += "/" + date_path + "/";
      }
    }
    save_path = save_path.replace(/[\\\/]+/g, '/');
    fn(save_path);
  });
}

function create_tab( json ) {
  var display_tab_id;
  // view is not created
  chrome.tabs.onUpdated.addListener( function listener( tab_id, changed_props ) {
    console.log(tab_id + "->" + changed_props.status );
    if(tab_id != display_tab_id || changed_props.status != "complete")
      return;
    chrome.tabs.onUpdated.removeListener(listener);
    chrome.tabs.update(tab_id, {active: true});
    // lookup views
    //chrome.tabs.get( tab_id, function( tab ) {
    //  var views = chrome.extension.getViews( { windowId: tab.windowId } );
    //  var view = views[0];
    //  view.focus();
    //} ); 
  });
  
  chrome.tabs.create( { "url" : json.url, "selected" : true }, function on_tab_created( tab ) {
    display_tab_id = tab.id; 
    json.callback( tab.id ); 
  } );
}

function focus_or_create_tab(url, func) {
  var display_tab_id;
  // view is not created
  chrome.tabs.onUpdated.addListener( function listener( tab_id, changed_props ) {
    console.log(tab_id + "->" + changed_props.status );
    if(tab_id != display_tab_id || changed_props.status != "complete")
      return;
    chrome.tabs.onUpdated.removeListener(listener);
    chrome.tabs.update(tab_id, {active: true});
    // lookup views
    //chrome.tabs.get( tab_id, function( tab ) {
      //var views = chrome.extension.getViews( { windowId: tab.windowId } );
      //var view = views[0];
      //view.focus();
      //func(view); 
    //} ); 
  });
  
  chrome.tabs.create( { "url" : url, "selected" : true}, function on_tab_created( tab ) { display_tab_id = tab.id; } );
}




chrome.downloads.onDeterminingFilename.addListener(async function(item, suggest) {
  // if downloaded not by wayixia, then use default
  if(item.byExtensionId == chrome.runtime.id) {
    console.log(item.id + ":" + item.state)
    var cfg = download_items[item.id];
    const save_path = cfg.save_path; //await get_save_path( cfg.folder );
    var filename = "";
    var re = /data:(.+?);(\w+?),(.+)/;
    if(re.test(item.url)) { // data
      filename = (new Date()).valueOf();      
    } else {
      // replace ilegal char
      filename = item.filename.replace(/\.\w+$/, '').replace(/[:*?\"<>|]/, "-") + "-w" + item.id;
    }

    var ftype = "";
    if( item.mime != "" ) {
       ftype = "." + item.mime.replace(/\w+\//, '');
    }
    wayixia_statics_images(item, cfg.pageurl);
    suggest({filename: save_path + filename + ftype , conflict_action: 'uniquify',conflictAction: 'uniquify'});
  } else {
    //suggest({conflict_action: 'uniquify',conflictAction: 'uniquify'});
  }
});

chrome.downloads.onChanged.addListener(function(download) {
  var item = download_items[download.id];
  if(item) {
    if(download.error && item.view) {
      item.error = download.error.current;
      item.view.background_warning({
        error: download.error.current,
        page: item.view.location,
        url: item.url,
      });
    }
    delete download_items[download.id];
  }
});

chrome.runtime.onMessage.addListener( function( o, sender, res ) {
  console.log(o.action);
  switch( o.action ) {
  case "userstatus":
    //if( wayixia.nickname == ""  ) {
    /*
      ajax( { command: "https://www.wayixia.com/?mod=user&action=status&withalbums=true&inajax=true",
        method: "GET",
        oncomplete : function( r ) {
          //console.log( r );
          wayixia.nickname = "";
          wayixia.uid = 0;
          wayixia.albums = [];
          if( r.header == 0 && r.data ) {
            if( r.data.nickname ) {
              wayixia.nickname = r.data.nickname;
            }
            if( r.data.uid ) {
              wayixia.uid = r.data.uid;
            }
            
            if( r.data.albums ) {
              wayixia.albums = wayixia.albums.concat( r.data.albums );
              // Clear old albums
              var last_album = wayixia.last_album;
              if( last_album.id && last_album.id > 0 ) {
                for( var i=0; i < wayixia.albums.length; i++) {
                  if( last_album.id == wayixia.albums[i].id ) {
                    return;
                  }
                }
                wayixia.last_album = {};
              }
            }

            if( r.data.chrome_plugin ) {
              config.user_config_load( r.data.chrome_plugin );
            }
          }
        }
      } );
    //}
    */
    break;
  
  case "assistant":
    console.log( o.port );
    set_wayixia_assistant( o.port );
    focus_or_create_tab(chrome.runtime.getURL("pages/options/options.html") + "#tab-screencapture", function(view) { });
    break;

  case "get_display_cache":
    var cache = get_display_cache(o.tabid);
    res( cache );
    break;

  case "wa_all":
    on_click_wa_all( o, o.tab );
    res({});
    break;
  case "full_screenshot":
    on_click_full_screenshot(o.tab);
    res({});
    break;
  case "screenshot":
    on_click_screenshot(o.tab);
    res({});
    break;
  case "open_options":
    on_click_open_options();
    res({});
    break;
  case "open_about":
    on_click_open_about();
    res({});
    break;
  case "get":
    var configs = {};
    o.names.map(function (name) {
      // 遍历数组，对每个元素进行操作
      console.log(name);
      if( name == "wayixia_assistant")
      {
        configs[name] = wayixia_assistant();
      }
      else if( name == "save_path") {
        configs[name] = config.user_config_get(name);
      }
    });

    res( configs );
    break;
  case "download_image":
    download_image(o.url, o.view, o.folder, o.pageurl);
    res({});
    break;
  }

  return true;
} );


/*

// Disable XCORS
const HEADERS_TO_STRIP_LOWERCASE = [
  //'content-security-policy',
  //'x-frame-options',
  'cross-origin-resource-policy',
];

chrome.webRequest.onHeadersReceived.addListener(
  details => ({
    responseHeaders: details.responseHeaders.filter(header =>
        !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase()))
  }),
  {
    urls: ['<all_urls>']
  },
  ['blocking', 'responseHeaders', 'extraHeaders']);

  */

// add commands listener
chrome.commands.onCommand.addListener(function(command) {
  if (command == "toggle-wa-all") {
    // Get the currently selected tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Toggle the wa all images
      on_click_wa_all({}, tabs[0]);
      //var current = tabs[0]
      //chrome.tabs.update(current.id, {'pinned': !current.pinned});
    });
  }
});

chrome.contextMenus.onClicked.addListener( function(info) {
  console.log( info );
  switch(info.menuItemId) {
  case "imagecap":
    if(info.mediaType == 'image') {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        on_click_wa_single(info, tabs[0]);
      });
    } else {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Toggle the wa all images
        on_click_wa_all({}, tabs[0]);
      });
    } 
    break;
  }

});


chrome.runtime.onInstalled.addListener( function() { 
  // create context menu
  var contexts = ["page", "image", "selection","editable","link","video","audio"];
  chrome.contextMenus.create({
    "title": plugin_name, 
    "contexts":contexts,  
    "id": "imagecap"
  });
});

console.log('background.js init');

