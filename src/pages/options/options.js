
var g_option_window = null;
var g_about_window = null;
var g_block_window = null;
var g_block_images_box = null;



//function display_block_images() {
  //g_block_window = new Q.Dialog({
    //parent: g_option_window,
    //width: 800,
    //height: 600,
    //title: locale_text('haveBlocked'),
    //content: Q.$('layer-block-images'),
    //buttons: [
      //{ text: locale_text('btnUnblock'), onclick: function() { block_images_remove(); return false; }  },
      //{ text: locale_text('qCancel'), style:'syscancelbtn', onclick: function() { return true; } 
      //},
    //]
  //});
  //Q.$('layer-block-images').style.visibility = 'visible';
  //g_block_window.domodal();
//}

function block_images_remove() {
  var extension = chrome.extension.getBackgroundPage();
  var remove_items = [];
  g_block_images_box.each_item(function(item) {
    if((item.className.indexOf("mouseselected") != -1) && item.style.display == '') {
      var url = item.getAttribute('data-url');
      extension.block_image_remove(url);
      remove_items.push(item);
    }
  });
  
  for(var i=0; i < remove_items.length; i++) {
    var item = remove_items[i];
    item.parentNode.removeChild(item);
  }
}

function display_filter_rules() {
  ui(function(t) {
    var tpl = t.template('wndx-filter-rules');
    // i18n 
    extract_document(tpl);
    filter_rules_window = new Q.Dialog({
      title: Q.locale_text('filterRulesList'),
      width: 400,
      height: 350, 
      wstyle: "q-attr-no-icon",
      content:  tpl,
      on_close: function() { delete filter_rules_window; filter_rules_window = null; },
      on_create: function() {
        // init dialog
        var d = this;
        
        var filter_rules = chrome.extension.getBackgroundPage().filter_rule_get();
        var rules = [];
        for(var name in filter_rules.rules) {
          rules.push(filter_rules.rules[name]);
        }
        var store = new Q.Store({
          data: rules
        });
        d.table = new Q.Table({ 
          title: Q.locale_text('filterRulesList'), 
          wstyle: "q-attr-no-title",
          id: d.item('list'),
          columns: [
            { name: 'url', title: Q.locale_text('stringName'), align:'left', fixed: true, width: 398, isHTML: true, renderer : function(record) {return record['name'];} }
          ],
          store: store,
          row_onclick : function(row) {
            var url = this.getRecord(row).url;
          },
          row_onmouseover : function(row) {},
          row_onmouseout : function(row) {},
        });
      },
      buttons: [
        {text: Q.locale_text('btnClose'), style: "syscancelbtn", onclick : function() { return true; }}
      ]
    });

    filter_rules_window.domodal();
    filter_rules_window.table.autosize();
  });


}

Q.ready(function() {
  var hash = location.hash;
  if(hash == "#about") {
    init_about();     
  } else {
    init_options(); 
  }
});


