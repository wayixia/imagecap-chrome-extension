import worker from "../scripts/worker.js";
import config from "../scripts/config.js";

function deactive() {
  window.close();
}

function send_message_with_noreply( action, data ) {
  chrome.runtime.sendMessage( { action: action, data: data||{}});
}

function get_current_tab( fn ) {
  chrome.tabs.query({'active': true, 
    'windowId': chrome.windows.WINDOW_ID_CURRENT},
    (tabs) => { 
      fn(tabs[0]); 
    }
  );
}

function init(){
  // wayixia
  Q.$('wayixia-all-images').onclick = function() {
    get_current_tab( (currenttab) => { 
      worker.get_all_images( "from_popup", currenttab, (res)=>{} );
      deactive();
    } );

  }
  
  Q.$('wayixia-screenshot').onclick = function() {
    get_current_tab( (currenttab) => {
      worker.screenshot(currenttab);
      deactive();
      //send_message_with_noreply( 'screenshot', { tab: tabs[0] } );
    } )
    /// send_message_with_noreply( 'screenshot', { tab: tabs[0] } );
    //deactive();
  }
  
  Q.$('wayixia-full-screenshot').onclick = function() {
    chrome.tabs.query( {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) { 
      chrome.tabs.sendRequest(tabs[0].id, { type : "bodysize" }, function(res) {
      // not support contentscript
      if( !res ) {
        extension.on_click_full_screenshot(tabs[0]);
        return;
      }

      if( extension.is_max_screenshot( res.width, res.height )  ) {
        extension.wayixia_assistant_isalive( function( supported ) {
          if( supported ) {
            show_tips_full_screenshot();
            extension.on_click_full_screenshot(tabs[0]);
          } else {
            // tell the page page is too large need install assistant of wayixia
	          chrome.tabs.sendRequest(tabs[0].id, { type : "screenshot-ismax", maxheight: extension.wayixia_screenshot_maxsize().height }, function(res) {} );
            deactive();
          }
        } );
      } else {
        // acceptable body size
        show_tips_full_screenshot();
        extension.on_click_full_screenshot(tabs[0]);
      } 
    } ); } );
  }

  Q.$('wayixia-options').onclick = function() {
    deactive();
    send_message_with_noreply('open_options', {});
  }  
  
  Q.$('wayixia-aboutus').onclick = function() {
    deactive();
    send_message_with_noreply('open_about', {});
  }  

  config.nickname( (nickname) => {
    nickname = nickname || ""; 
    console.log( nickname );
    if( nickname != "" ) {
      Q.$('wayixia-login-text').innerHTML = nickname;
      Q.$('wayixia-login-text').onclick = function() {
        deactive();
        window.open("https://www.wayixia.com/?mod=user&action=home");
      }
    } else {
      Q.$('wayixia-login-text').onclick = function() {
        deactive();
        window.open("https://www.wayixia.com/?mod=user&action=login");
      }
    }
  });

  document.body.style.visibility='visible';
};

function show_tips_full_screenshot() {
  //document.body.style.visibility='hidden';
  Q.$('wayixia-menu').style.display = 'none'; 
  document.documentElement.style.width = Q.$('wayixia-screen-capture').currentStyle.width; 
  document.documentElement.style.height = Q.$('wayixia-screen-capture').currentStyle.height; 
  document.body.style.width = Q.$('wayixia-screen-capture').currentStyle.width; 
  document.body.style.height = Q.$('wayixia-screen-capture').currentStyle.height; 
  Q.$('wayixia-screen-capture').style.visibility = 'visible'; 
 // document.body.style.visibility='visible';
}

Q.ready(function() {
  document.body.ondragstart  =function() { return false; }
  document.body.onselectstart=function() { return false; }
  init();
});

