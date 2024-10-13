
/*-------------------------------------------------------
 * \file:  worker.js
 * \date: 2024-10-10
 * \author: Q 
 * powered by wayixia.com
---------------------------------------------------------*/

class worker {

  constructor()
  {
    
  }


  download_image(url, view, folder, pageurl) {
    chrome.runtime.sendMessage( 
      { action: "download_image", url: url, view: null, folder:folder, pageurl:pageurl}, (res) => {

    });
  }

  get_display_cache(tabid, fn) {
    chrome.runtime.sendMessage( {action: "get_display_cache", tabid: tab.id}, fn );
  }

  get_all_images( track_from, tab, fn ) {
    chrome.runtime.sendMessage( { action: "wa_all", 
      track_from: track_from, tab: tab}, fn );
  }

}


export default new worker;


