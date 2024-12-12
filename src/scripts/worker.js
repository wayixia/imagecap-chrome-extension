
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
    chrome.runtime.sendMessage( {action: "get_display_cache", tabid: tabid}, fn );
  }

  get_all_images( track_from, tab, fn ) {
    chrome.runtime.sendMessage( { action: "wa_all", 
      track_from: track_from, tab: tab}, fn );
  }

  screenshot( tab, fn ) {
    chrome.runtime.sendMessage( { action: "screenshot",  
      tab: tab }, fn );
  }

  full_screenshot(tab, fn) {
    chrome.runtime.sendMessage( { action: "full_screenshot",  
      tab: tab }, fn );
  }

  create_display_screenshot( tab, imageUrl, fn ) {
    chrome.runtime.sendMessage( { action: "display_screenshot", 
      tab:tab, imageUrl: imageUrl }, fn );
  }

  userstatus(cfg, fn) {
    cfg.nickname( ( nickname ) => {
      if( nickname == ""  ) {
        Q.ajax( { 
          command: "https://www.wayixia.com/?mod=user&action=status&withalbums=true&inajax=true",
          method: "GET",
          oncomplete : function( res ) {
            var r = JSON.parse(res.responseText);
            if( r.header == 0 && r.data ) {
              cfg.userinfo_set(r.data);
              fn( r.data.nickname);
              console.log( wayixia );
            }
          },

          onerror: (r) => {
            fn("");
          }
        } );
      } else {
        fn(nickname);
      }
    });
  }
}


export default new worker;


