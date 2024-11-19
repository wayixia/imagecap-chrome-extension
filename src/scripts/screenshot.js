// Copyright (c) 2014-2024 The Wayixia Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//


let imagecap=Module;

class screenshot {
  constructor() {

  }

  createTask(tab)
  {
    let guid = imagecap._createImage();
    console.log(guid);
    this.begin(tab, guid);
  }



  // Generate four random hex digits.  
  S4() {  
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);  
  }; 

  // Generate a pseudo-GUID by concatenating random hexadecimal.  
  guid() {  
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());  
  };  

  begin(tab, guid ) {
    var self = this;
    chrome.tabs.sendMessage(tab.id, { type : "screenshot-begin"}, (res) => {
      if(!res)
        return;
      var cols = Math.ceil(res.full_width*1.0 / res.page_width);
      var rows = Math.ceil(res.full_height*1.0 / res.page_height);
      var max_pos = { rows: rows, cols:cols };
      var canvas  = { 
        size: res, 
        table: max_pos, 
        screenshots: []
      };
      var current_pos = { row: 0, col: 0 };
      self.capture_page_task(tab, max_pos, current_pos, guid, canvas);
    }); 
  }


  copy_canvasinfo( canvas ) {
    return { size: canvas.size, table: canvas.table, screenshots: []};
  }

  
  capture_page_task(tab, max, pos, guid, canvas) {
    console.log('capture page (row='+pos.row+', col='+pos.col + ')' );
    var self = this;
    chrome.tabs.sendMessage(tab.id, { type : "screenshot-page", row:pos.row, col:pos.col}, function(res) {
      setTimeout(function() {
        chrome.tabs.captureVisibleTab( tab.windowId, {format:'png'}, function(screenshotUrl) {
          canvas.screenshots.push({row: pos.row, col: pos.col, data_url: screenshotUrl});
          //console.log( screenshotUrl );
          //canvas.screenshots.push({row: pos.row, col: pos.col});
          pos.col++;
          pos.col = pos.col % max.cols; 
          if(pos.col == 0) {
            pos.row++;
	          canvas.row = pos.row;
            if(pos.row % max.rows == 0) {
              self.screenshot_end(tab, guid, canvas );
              return;
            } else {
              self.merge_images_with_client( guid, canvas );
              canvas = self.copy_canvasinfo( canvas );
            }
          }

          // Process with client
          self.capture_page_task(tab, max, pos, guid, canvas);
        });
      }, 1000);
    }); 
  }

  screenshot_end(tab, guid, canvas ) {
    console.log('capture end');
    var self = this;
    chrome.tabs.sendMessage( tab.id, { type : "screenshot-end" }, (res) => {
      self.merge_images_with_client( guid, canvas, function() {
        imagecap._getImageUrl(guid);
        //Module.HEAP8.set(imageurl_ptr,1024)
        //const imageurl = new TextDecoder("utf8").decode(Module.HEAP8);
        //console.log(imageurl);
        //worker.create_display_screenshot(tab.id, imageurl, tab.url); 
      });
    });
  }

  merge_images_with_client( guid, canvas, fn ) {
    //canvas.screenshots.push({row: pos.row, col: pos.col, data_url: screenshotUrl});
    const info = JSON.stringify(canvas);
    console.log(info);
    const bytes = new TextEncoder().encode(info);
    const str_ptr = imagecap._malloc(bytes.length);
    imagecap.HEAP8.set(bytes, str_ptr);

    imagecap._drawImage(guid, str_ptr );
    if(fn) {
      fn();
    }
    imagecap._free(str_ptr);
  }

} // end class screenshot

export default new screenshot;