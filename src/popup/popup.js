import worker from "../scripts/worker.js";
import config from "../scripts/config.js";
import screenshot from "../scripts/screenshot.js"

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


window.outputImage = function( guid, imageurl, len)
{
  console.log( "outputImage called guid " + guid);
  const ptr = new Uint8Array(wasmMemory.buffer, imageurl, len );
  var imgdata = (new TextDecoder()).decode( ptr );
  var url = "data:image/png;base64, " + imgdata;
  get_current_tab( (tab) => {
    worker.create_display_screenshot( tab, url, screenshot.get_pageinfo(guid), (res)=>{
      console.log("create display screenshot end.");
    });
  });
  //console.log( "guid: " + guid + ", len:" + len + ", url: \ndata:image/png;base64," + url);
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
      worker.screenshot(currenttab, (res) => {
        deactive();
      });
    } )
  }
  
  Q.$('wayixia-full-screenshot').onclick = function() {
    get_current_tab( (currenttab) => {
      show_tips_full_screenshot();
      //on_click_full_screenshot(currenttab);
      screenshot.createTask(currenttab);
//      worker.full_screenshot( currenttab, (res)=>{
        //// do full screen capture
        //console.log("do full screen shot");
      //} );
    } );
  }

  Q.$('wayixia-options').onclick = function() {
    deactive();
    send_message_with_noreply('open_options', {});
  }  
  
  Q.$('wayixia-aboutus').onclick = function() {
    deactive();
    send_message_with_noreply('open_about', {});
  }  

  worker.userstatus( config, (nickname) => {
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
  Module.onRuntimeInitialized = function() {
    console.log("imagecap wasm module loaded.");
  }
});



