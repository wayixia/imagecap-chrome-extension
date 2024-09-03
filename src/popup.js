
function deactive() {
  window.close();
}

function init(){
  // wayixia
  Q.$('wayixia-all-images').onclick = function() {
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
     function(tabs){
       extension.on_click_wa_all({track_from: 'from_popup'}, tabs[0]);
     }
    );
    deactive();
  }
  
  Q.$('wayixia-screenshot').onclick = function() {
    
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
     function(tabs){
       extension.on_click_screenshot(tabs[0]);
     }
    );
    deactive();
  }
  
  Q.$('wayixia-full-screenshot').onclick = function() {
    chrome.tabs.query( {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs) { chrome.tabs.sendRequest(tabs[0].id, { type : "bodysize" }, function(res) {
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
    extension.on_click_open_options();
  }  
  
  Q.$('wayixia-aboutus').onclick = function() {
    deactive();
    extension.on_click_open_about();
  }  

  extension = chrome.extension.getBackgroundPage();
  if( extension.nickname() != "" ) {
    Q.$('wayixia-login-text').innerHTML = extension.nickname().toUpperCase();
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


  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
   
   }
  );



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

