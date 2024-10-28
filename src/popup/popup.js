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


// Generate four random hex digits.  
function S4() {  
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);  
}; 

// Generate a pseudo-GUID by concatenating random hexadecimal.  
function guid() {  
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());  
};  


function on_click_full_screenshot(tab) {
  let wasmSupported = (typeof WebAssembly === "object");
 
  if (wasmSupported) {
    //const go = new Go(); // Go is a namespace defined by the emcc compiler
    WebAssembly.instantiateStreaming(fetch("../scripts/imagecap.wasm"), {}).then(module => {
      const wasmExports = module.instance.exports;
      console.log(wasmExports.hello()); // Logs "Hello, WebAssembly!"
    }).catch(e => {
      console.error(e);
    });
  } else {
    console.error("Your browser does not support WebAssembly.");
  }
}

function on_click_full_screenshot_begin(tab, wasmimg ) {
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
    merge_images_with_client( canvas, function() {
      create_display_full_screenshot(tab.id, canvas, tab.url); 
    });
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
      on_click_full_screenshot(currenttab);
      //worker.full_screenshot( currenttab, (res)=>{
        // do full screen capture
        
      //  console.log("do full screen shot");
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

