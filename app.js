/*
 * app.js @wayixia.com 
 * author Q
 */
const { times } = require('lodash');

import "libq.js/dist/libq.js"
import "./src/scripts/imagesbox.js"
import {locale_text, extract_document} from "./src/scripts/i18n.js"
import {wayixia_track_event, wayixia_track_button_click} from "./src/scripts/tracker.js"
//import "./src/scripts/i18n.js"
//import "./src/scripts/tracker"
//import "./src/scripts/ui"
//import "./src/scripts/urls_filter"

import config from "./src/scripts/config.js"





//import {app_service} from "./service";
import  "./src/assets/scss/style.scss";



window.wayixia = {
  errors : [],
  source_tab_id: null,
  help_menu : null,
  tocloud_menu : null,
  save_menu : null,
  report_window : null,
  ui_wndx : null,
  request_data : {imgs: [], data: {}},
  i18n: extract_document
};


function wayixia_ui_init() 
{
  document.body.ondragstart  =function() { return false; }
  document.body.onselectstart=function() { return false; }

  // set locale
  Q.set_locale_text(locale_text);

// shortcut
//Q.addEvent(document, 'keyup', function(evt) {
  //var evt = evt || window.event;
  //var kcode = evt.which || evt.keyCode;
  //if(kcode == 27) {// ESC
  //  wayixia_track_event('deactive', 'shortcut-ESC');
  //  deactive();
  //}
//});

  // display and screenshot view
  if(Q.$('wayixia-bugs')) {
    Q.$('wayixia-bugs').title = Q.locale_text('extReportABug');
  } // Q.$('wayixia-bugs')


if(Q.$('wayixia-help')) { // wayixia-help

// init drop menu
wayixia.help_menu = new Q.Menu({
  style: "wayixia-menu", 
  on_popup: function(popup) {
    if(popup) {
      Q.addClass(Q.$('wayixia-help'), "q-active");
    } else {
      Q.removeClass(Q.$('wayixia-help'), "q-active");
    }
  }
}); 

var menu_help= new Q.MenuItem({
  text: Q.locale_text("extHelpFAQ"),
  callback : function(menuitem) {
    window.open("https://www.wayixia.com/extension/faq");
  }
});

var menu_report_a_bug = new Q.MenuItem( { 
  text : Q.locale_text( 'extReportABug' ),
  callback: function( menuitem ) {
    report_a_bug();
  }
} );

var menu_about = new Q.MenuItem( {
  text : Q.locale_text( 'extContact' ),
  callback : function( menuitem ) {
    window.open( 'https://www.wayixia.com/extension/about' );
  }
} );

wayixia.help_menu.addMenuItem(menu_report_a_bug);
wayixia.help_menu.addMenuItem(menu_help);
wayixia.help_menu.addMenuItem(menu_about);

if( /^zh(-)?/ig.test( navigator.language ) ) {
  var menu_qq_qun = new Q.MenuItem( {
    text : '加入QQ群',
    callback : function( menuitem ) {
      window.open( 'http://shang.qq.com/wpa/qunwpa?idkey=3c8fbe3b139d688a48eb8d1031f8d96bc9472d41904ecb78764170f4866b6e85' );
    }
  } );

  wayixia.help_menu.addMenuItem(menu_qq_qun);
}
wayixia.help_menu.hide();

// init menu button
Q.$('wayixia-help').onclick = function(evt) {
  wayixia.help_menu.showElement(this, evt);
}

} // wayixia-help


if( Q.$('wayixia-donate') ) {
  Q.$('wayixia-donate').onclick = function() {
    wayixia_track_button_click(this);
    window.open( 'https://www.wayixia.com/extension/about#donate' );
  }
}

}

function background_warning(o) {
  wayixia.errors.push(o);
  if(wayixia.errors.length > 0) {
    Q.$('wayixia-bugs-num').style.visibility = 'visible';
    Q.$('wayixia-bugs-num').innerText = (wayixia.errors.length>9)?'N':wayixia.errors.length;
    Q.$('wayixia-bugs').title = wayixia.errors.length + ' ' + Q.locale_text('stringDownloadError') ;
  } else {
    Q.$('wayixia-bugs-num').style.visibility = 'hidden';
    Q.$('wayixia-bugs').title = Q.locale_text('extReportABug');  //"feedback & suggestions to us.";
  }
}


function deactive() {
    back2page();
    window.close();
}

function back2page() {
  if(wayixia.source_tab_id) {
    chrome.tabs.update(wayixia.source_tab_id, {selected: true});
  }
}


function dismiss(d) {
  (new Q.Animate({ 
    tween: 'cubic', ease: 'easyin',
    max: 1000, begin: 0, duration: 100,
    bind : function(x) {
      if(x == this.max) {
        d.end();
      } else {
        d.wnd().style.opacity = ((this.max-x)*1.0) / this.max;
      }
    }
  })).play();
}

function message_box( json ) {
  var json = json || {};
  json.wstyle = "w-window";
  json.title = document.title;
  json.icon = json.icon || "info";
  json.content = "<div class=\"q-alert-content q-alert-"+json.icon+"\">"+json.content+"</div>";

  Q.alert( json );
}


/** \brief Check user is login
 *
 */
function check_login_dialog() 
{
  var extension = chrome.extension.getBackgroundPage();
  if( !extension.user_is_login() ) {
    // must login
    var wnd = window.open( 
      "https://www.wayixia.com/index.php?mod=user&action=login&refer=" + encodeURIComponent( 'https://www.wayixia.com/close.htm' ) );
    var timer = setInterval( function() {
    if(wnd.closed) {
      clearInterval(timer);
      chrome.extension.sendMessage( { action:"userstatus" } );
      }
    }, 1000 );
      
    return false;
  }

  return true;
}

function popup_tocloud_menu( e, evt, f ) 
{
  var extension = chrome.extension.getBackgroundPage();
  evt = evt || window.event;
  // init drop menu
  if( wayixia_tocloud_menu ) {
    wayixia_tocloud_menu = null;
  }
  wayixia_tocloud_menu = new Q.Menu({
    style: "wayixia-menu", 
    on_popup: function(popup) {
      if(popup) {
        Q.addClass( e, "checked");
      } else {
        Q.removeClass( e, "checked");
      }
    }
  });   
  wayixia_tocloud_menu.hide();
  var albums = [{id: -1, name: Q.locale_text("menuSaveToNewAlbum") } ];
  var last_album = extension.wayixia.last_album;
  if( last_album && ( last_album.id > 0 ) ) {
    albums.push( last_album );
  }
  albums.push({ type: "seperate" });
  albums = albums.concat( extension.wayixia.albums);
  var more_menu = null;

  for( var i=0; i < albums.length; i++ ) {
    // Add submenu item
    var album = albums[i];
    var item = new Q.MenuItem( {
      text : album.name,
      type: ( ( album.type && album.type=="seperate" ) ? MENU_SEPERATOR : MENU_ITEM ),
      callback : ( function(a) { return function( menuitem ) {
        if( a.id == -1 ) {
          // Save to new album
          create_newalbum_save( f );
        } else {
          // Save last album
          extension.set_last_album( a );
          f( a );
        }
      } } )(album)
    } );

    if( i > 22 ) {
      if( !more_menu ) {
        more_menu = new Q.MenuItem( {
          text: Q.locale_text('stringMoreBoards'),
          style: "wayixia-menu", 
          callback: function(menuitem) {
          
          }
        } );
        wayixia_tocloud_menu.addMenuItem( more_menu );
      }

      more_menu.addSubMenuItem( item );
      continue;
    }
    wayixia_tocloud_menu.addMenuItem( item );
  }

  wayixia_tocloud_menu.showElement( e, evt );
}

function popup_save_menu( e, evt, f ) 
{
  var extension = chrome.extension.getBackgroundPage();
  evt = evt || window.event;
  // init drop menu
  if( wayixia_save_menu ) {
    wayixia_save_menu = null;
  }
  wayixia_save_menu = new Q.Menu({
    style: "wayixia-menu", 
    on_popup: function(popup) {
      if(popup) {
        Q.addClass( e, "checked");
      } else {
        Q.removeClass( e, "checked");
      }
    }
  });   
  wayixia_save_menu.hide();
  var sites = [
    {id: -1, name: Q.locale_text("menuSaveToSiteFolder") }, 
    {id: -2, name: Q.locale_text("menuManageSiteFolder") } 
  ];
  var last_site = extension.last_site();
  if( last_site.name ) {
    sites.push( last_site );
  }
  sites.push({ type: "seperate" });
  sites = sites.concat( extension.sites() );
  var more_menu = null;

  for( var i=0; i < sites.length; i++ ) {
    // Add submenu item
    var site = sites[i];
    if( !site ) {
      continue;
    }
    var item = new Q.MenuItem( {
      text : site.name,
      type: ( ( site.type && site.type=="seperate" ) ? MENU_SEPERATOR : MENU_ITEM ),
      callback : ( function(a) { return function( menuitem ) {
        if( a.id == -1 ) {
          // Save to new site
          create_newsite_save( f );
        } else if( a.id == -2 ) {
          // Manage sites
          manage_sites_folder();
        } else {
          // Save last site
          extension.set_last_site( a );
          f( a );
        }
      } } )(site)
    } );

    if( i > 22 ) {
      if( !more_menu ) {
        more_menu = new Q.MenuItem( {
          text: Q.locale_text('stringMoreBoards'),
          style: "wayixia-menu", 
          callback: function(menuitem) {
          
          }
        } );
        wayixia_save_menu.addMenuItem( more_menu );
      }

      more_menu.addSubMenuItem( item );
      continue;
    }
    wayixia_save_menu.addMenuItem( item );
  }

  wayixia_save_menu.showElement( e, evt );
}



/** @brief Create new album and execute f when operation is ok 
 *
 */
function create_newalbum_save( f ) 
{
// load template
ui( function(t) {    
  var tpl = t.template('wndx-newalbum');
  // i18n 
  extract_document(tpl);
  var dlg = Q.alert({
    wstyle: 'w-window',
    title: Q.locale_text("menuSaveToNewAlbum"),
    content: tpl,
    width: 350,
    height: 200,
    on_ok : function() {
      var album_name = this.item( 'album-name' ).value;
      if(!album_name) {
        this.item('msg').innerText = Q.locale_text('stringBoardNameEmpty');
        return false;
      }

      Q.ajaxc({
        command: 'https://www.wayixia.com/?mod=album&action=create-new&inajax=true',
        withCredentials: true,
        noCache:true,
        method:"post",
        queue: true,
        continueError: true,
        data : {album_name:album_name},
        oncomplete : function(xmlhttp) {
          try {
          var res = Q.json_decode(xmlhttp.responseText);
          if( ( res.header == 0 ) && ( res.data.album_id > 0 ) ) {
            var extension = chrome.extension.getBackgroundPage();
            var newalbum = { id: res.data.album_id, name: res.data.album_name };
            extension.set_last_album( newalbum );
            f( newalbum );
            dismiss( dlg );
          } else {
            dlg.item('msg').innerText = res.data;
          }
          } catch (e) {
            dlg.item('msg').innerText = "error: " + e.message + "\n" + xmlhttp.responseText ;
          }        
        }
      }); // end ajax
      return false;
    }
  });
}); // end ui
} // end create_newalbum_save


/** @brief Create new site folder to save folder 
 *
 */
function create_newsite_save( f ) 
{
// load template
ui( function(t) {    
  var tpl = t.template('wndx-newsite');
  // i18n 
  extract_document(tpl);
  var dlg = Q.alert({
    wstyle: 'w-window',
    title: Q.locale_text("menuSaveToSiteFolder"),
    content: tpl,
    width: 350,
    height: 200,
    on_ok : function() {
      var album_name = this.item( 'site-name' ).value;
      if(!album_name) {
        this.item('msg').innerText = Q.locale_text('stringNameEmpty');
        return false;
      }

      var extension = chrome.extension.getBackgroundPage();
      var newsite = { id: 0, name: album_name };
      if( extension.is_site_exists( newsite ) ) {
        this.item('msg').innerText = Q.locale_text('stringNameExists');
      } else {
        extension.add_site( newsite );
        extension.set_last_site( newsite );
        f( newsite );
        extension.saveconfig();
        dismiss( dlg );
      }
      return false;
    }
  });
}); // end ui
} // end create_newsite_save


/** @brief Manage sites folder
 *
 */
function manage_sites_folder() {
// load template
ui( function( t ) {
  var tpl = t.template('wndx-sites');
  extract_document( tpl );
  var dlg = new Q.Dialog( {
    wstyle: 'w-window',
    title: Q.locale_text("menuManageSiteFolder"),
    content: tpl,
    width: 380,
    height: 300,
    on_create: function() {
      var extension = chrome.extension.getBackgroundPage();
      var columns = [
        { name: 'name', title: Q.locale_text('stringName'), align:'left', width: 280, isHTML: true },
        { name: 'name', title: Q.locale_text('stringOperation'), align:'center', width: 80, isHTML: true, renderer : function(record) { return "<font class=\"remove-site\" style=\"text-decoration: underline; cursor: hand;\"> " + Q.locale_text('stringRemove') + " </font>"; }, }
      ];

      var store = new Q.Store({
        data: extension.sites()
      });
    
      //init Q.table
      this.table = new Q.Table({ 
        id: tpl,
        title: "",
        wstyle: "q-attr-no-title",
        columns: columns,  
        store: store,
        row_height: 21,
        row_onclick : function( row, evt ) {
          var data = this.getRecord(row);
          var e = Q.isNS6() ? evt.target : evt.srcElement;
          if( e.className == "remove-site" ) {
            this.row_remove( row );
            extension.remove_site( data );
            if( data.name == extension.last_site().name ) {
              extension.set_last_site( { name : "" } );
            }
            extension.saveconfig();
          }
        }
      });
    
      
    },
    on_ok : function() {
      return true;
    }
  } );
  
  dlg.domodal();
  dlg.table.autosize();

} );

}





window.clear_errors = function() {
  wayixia.errors = [];
  Q.$('wayixia-bugs-num').style.visibility = 'hidden';
  Q.$('wayixia-bugs').title = Q.locale_text('extReportABug');
}

window.report_a_bug = function( evt ) {
  wayixia_track_event('report_a_bug', 'report_a_bug');
  wayixia.report_window = require('./src/views/report_a_bug.view')( {
    app: this,
    title:  Q.locale_text('extReportABug'), 
    on_close: function() {
        delete wayixia.report_window;
        wayixia.report_window=null; return true; 
    }
  } );

  wayixia.report_window.domodal();
}

///////////////// wayixia service ////////////////////////////////////


window.service = Q.extend({
api: null, 
__init__: function(json) {
  json = json || {};
  this.api = json.api;
},

call : function(method, params, f) {
  var invalid_data = -2;
  Q.ajaxc({
    command: this.api + method,
    data: params,
    oncomplete : function(xmlhttp) {
      var res = Q.json_decode(xmlhttp.responseText);
      if(!res)
        f(invalid_data, {});
      else
        f(res.header, res.data);
    },
    onerror : function(xmlhttp) {
      f(xmlhttp.status, {});
    }
  });

},

});


window.bugs_service = service.extend({
__init__: function(json) {
  json = {api: "https://www.wayixia.com/?mod=bugs&inajax=true&action="};
  service.prototype.__init__.call(this, json);
},

report_a_bug : function(props, f) {
  this.call("report_a_bug", {props: props}, f);
},

});

window.wayixia_bugs_service = new bugs_service;

///////////////// wayixia service end/////////////////////////////////

/* \brief options module */
window.init_about = function()
{
  wayixia.about_window = require( './src/views/about.view')({
    title: Q.locale_text('extAbout')
  });

  wayixia.about_window.domodal();
}




function init_setting_( extension )
{
  g_option_window = require('./src/views/settings.view')({
    title: locale_text('extOptions'),
    config: config
  });
  
  //Q.$('layer-options').style.visibility = 'visible';
  //g_option_window.domodal($GetDesktopWindow());
  g_option_window.domodal();

//  // block images
  //Q.$('manager_block_images').onclick = function() {
    //wayixia_track_button_click(this);
    //g_block_images_box = new Q.ImagesBox({id: 'wayixia-list'});
    //var extension = chrome.extension.getBackgroundPage();
    //var block_images = extension.block_images_all();
    //g_block_images_box.display_images(block_images, {})();  
    //display_block_images();
  //}
  
  //Q.$('manager_filter_rules').onclick = function() {
    //display_filter_rules();
  //}
}


window.init_setting = function() {
  chrome.runtime.sendMessage( { action: 'get', names: ['wayixia_assistant'] }, function(extension){
    init_setting_( extension );
  });
};

// fix page show slowly
Q.addEvent(window, 'DOMContentLoaded', function() {
  // hook locale_text
  Q.set_locale_text(locale_text);
  extract_document(document.childNodes[0]);
  wayixia_ui_init();
})
