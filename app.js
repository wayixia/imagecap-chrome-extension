/*
 * app.js @wayixia.com 
 * author Q
 */

import "libq.js/dist/libq.js"
import "./src/scripts/imagesbox.js"

import "./src/scripts/i18n.js"
import "./src/scripts/tracker"
import "./src/scripts/ui"
import "./src/scripts/urls_filter"







//import {app_service} from "./service";
import  "./src/assets/scss/style.scss";

//import {app_service} from "./service";
//import  "../deps/libq.js/css/ui.css"


// fix page show slowly
Q.addEvent('DOMContentLoaded', function() {
  // hook locale_text
  Q.set_locale_text(locale_text);
  extract_document(document.childNodes[0]);
  wayixia_ui_init();
})
