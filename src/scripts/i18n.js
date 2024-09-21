
/*-------------------------------------------------------
 $ file:  i18n.js
 $ powered by wayixia.com
 $ date: 2014-12-20
 $ author: Q 
---------------------------------------------------------*/


export function locale_text(key, default_value) {
  var value = chrome.i18n.getMessage(key);
  if(!value)
    return default_value;
  return value;
};

function locale_text_node(textNode) {
  var value = textNode.nodeValue;
  if(value == "") 
    return;
  value = value.replace(/__MSG_(\w+)__/g, 
    function(w,w2,w3,w4) {
      return locale_text(w2);
    }  
  );

  textNode.nodeValue = value;
};

export function extract_document(e) {
  var childNodes = e.childNodes;
  for (var i = 0; i < childNodes.length; i ++) {
    var c = childNodes[i];
    switch(c.nodeType) {
    case Q.ELEMENT_NODE:
      extract_document(c);
      break;
    case Q.ELEMENT_TEXTNODE:
      locale_text_node(c);
      break;
    }
  }
};

// fix page show slowly
//document.addEventListener('DOMContentLoaded', function() {
//  // hook locale_text
//  Q.set_locale_text(locale_text);
//  extract_document(document.childNodes[0]);
//})

