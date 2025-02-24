// Copyright (c) 2014-2016 The Wayixia Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//

import config from "../scripts/config.js"
import Q from "./background_ajax.js"


//importScripts("./imagecap.js")
//import screenshot from "./screenshot.js";


var plugin_name  = chrome.i18n.getMessage('menuDigImages');
var wayixia = {};
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



function on_start_get_images( tabid ) {
  var command = pop_command(tabid);
  chrome.tabs.update(tabid, {active: true});
  if( command.cmd == "alltabs") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type : "display-all-images" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log(`Tab ${tab.id} 未响应`);
          } else {
            console.log(`Tab ${tab.id} 回复:`, response);
            response = response || {};
            chrome.tabs.sendMessage(tabid, {type:"display-all-images", data: response }, (r)=>{});
          }
        });
      });
    });
  } else if(command.cmd == "currenttab" ) {
    chrome.tabs.sendMessage(command.context_tab_id, { type : "display-all-images" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log(`Tab ${command.context_tab_id} 未响应`);
      } else {
        console.log(`Tab ${command.context_tab_id} 回复:`, response);
        response = response || {};
        chrome.tabs.sendMessage(tabid, {type:"display-all-images", data: response }, (r)=>{});
      }
    });
  }
}

function on_click_wa_single(info, tab) {
  download_image(info.srcUrl, null, "" );
}


async function create_display_page2(context_tab_index, useglobaltab, fn) { 
  
  var display_tabid=-1;

  if( useglobaltab ) {
    // Get global tab id from config
    const c = await config.async_get_globaltab();
    if( c.globaltab >=0 ) {
      // Check global tab exist
      try {
        const t = await chrome.tabs.get(c.globaltab);
        if(t) {
          display_tabid = c.globaltab;
        }
      } catch(e) {
        
      }
    }
  }
  
  if( display_tabid == -1 ) {
    create_tab( chrome.runtime.getURL("pages/display/display.html"), context_tab_index, ( tab_id ) => { 
      fn(true, tab_id);
      config.set_globaltab(tab_id);
    } );
  } else {
    fn( false, display_tabid);
  }
}

function on_click_get_all_images(context_tab_id, contex_tab_index, useglobaltab) {
  // Create tab
  create_display_page2(contex_tab_index, useglobaltab, (isnewtab, tab_id)=>{
    save_display_command(tab_id, context_tab_id );
    if( !isnewtab ) {
      on_start_get_images( tab_id );
    }
  });
}




function on_click_get_alltabs_images(useglobaltab) {  
  create_display_page2(-1, useglobaltab, (isnewtab, tab_id)=>{
    save_display_alltabs_command(tab_id);
    if( !isnewtab ) {
      on_start_get_images(tab_id);
    }
  });
}


function on_click_open_options() {
  chrome.tabs.create({"url":chrome.runtime.getURL("pages/options/options.html"), "selected":true}, function(tab) {});
} 

function on_click_open_about() {
  chrome.tabs.create({"url":chrome.runtime.getURL("pages/options/options.html#about"), "selected":true}, function(tab) {});
} 

function on_click_screenshot(tab, pageinfo ) {
  chrome.tabs.captureVisibleTab( null, {format:"png"}, function(screenshotUrl) {  
    create_display_screenshot(tab.id, tab.index, screenshotUrl, tab.url, pageinfo); 
  });
}



var command_cache = {};

function save_display_command( tabid, context_tab_id )
{
  command_cache[tabid] = { context_tab_id: context_tab_id, cmd:"currenttab"};
}

function save_display_alltabs_command( tabid)
{
  command_cache[tabid] = {cmd:"alltabs"};
}



function pop_command( cid ) {
  var command = command_cache[cid];
  if( command ) {
    //delete command_cache[cid];
  }
  return command;
}


var cache_display = {};


function get_display_cache( tab_id ) {
  var obj = cache_display[tab_id];
  //delete cache_display[tab_id];
  return obj;
}

function create_display_screenshot(context_tab_id, context_tab_index,  res, taburl, pageinfo) {  
  create_tab( chrome.runtime.getURL("pages/screenshot/screenshot.html"), context_tab_index, ( function( id, res ) { return function( tab_id ) { 
    cache_display[tab_id] = {
      ctx_tab_id : id,
      data : res,
      url : taburl,
      type : "screenshot",
      pageinfo: pageinfo,
    };
  } } )( context_tab_id, res ) );
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

function create_tab( url, index, fn ) {
  var display_tab_id;
  // view is not created
  chrome.tabs.onUpdated.addListener( function listener( tab_id, changed_props ) {
    console.log(tab_id + "->" + changed_props.status );
    if(tab_id != display_tab_id || changed_props.status != "complete")
      return;
    chrome.tabs.onUpdated.removeListener(listener);
    chrome.tabs.update(tab_id, {active: true});
  });
 
  var createProps = { "url" : url, "selected" : true };
  if( index >= 0 ) {
    createProps["index"] = index+1;
  }

  chrome.tabs.create( createProps, ( tab ) => {
    display_tab_id = tab.id; 
    fn( tab.id ); 
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

function userstatus() {
  config.nickname( ( nickname ) => {
    if( nickname == ""  ) {
      Q.ajax({ 
        command: "https://www.wayixia.com/?mod=user&action=status&withalbums=true&inajax=true",
        method: "GET",
        oncomplete : function( res ) {
          var r = JSON.parse(res.responseText);
          if( r.header == 0 && r.data ) {
            config.userinfo_set(r.data);
          }
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener( function( o, sender, res ) {
  console.log(o.action);
  switch( o.action ) {
  case "userstatus":
    userstatus();
    res({});
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

  case "get_alltabs_images":
    //on_click_get_alltabs_images( o, o.globaltab );
    on_click_get_alltabs_images( o.globaltab );
    res({});
    break;

  case "get_all_images":
    on_click_get_all_images( o.tab.id, o.tab.index, o.globaltab );
    res({});
    break;

  case "start_get_images":
    on_start_get_images(o.tabid);
    res({});
    break;

  case "screenshot":
    on_click_screenshot(o.tab, o.pageinfo );
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
  case "display_screenshot":
    create_display_screenshot(o.tab.id, o.tab.index, o.imageUrl, o.tab.url, o.pageinfo  );
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
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      // Toggle the wa all images
      const c = await config.useglobaltab_get();
      on_click_get_all_images(tabs[0].id, tabs[0].index, c.useglobaltab);
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
      chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        // Toggle the wa all images
        const c = await config.useglobaltab_get();
        on_click_get_all_images(tabs[0].id, tabs[0].index, c.useglobaltab);
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

