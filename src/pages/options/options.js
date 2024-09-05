
var g_option_window = null;
var g_about_window = null;
var g_block_window = null;
var g_block_images_box = null;

function init_about() {
  g_about_window = Q.alert({
    title: locale_text('extAbout'),
    width: 500,
    height: 380, 
    wstyle: "w-window",
    content: Q.$('layer-about'),
    on_close: function() {window.close();},
    on_ok: function() {window.close();}
  });

  Q.$('layer-about').style.visibility = 'visible';
  Q.$('layer-about-version').innerText = locale_text('extVersion') + ': v.' + chrome.runtime.getManifest().version;

  
  Q.$('donate-with-alipay').onclick = function() {
    wayixia_track_button_click(this);
    Q.alert({
      title: '[资助]支付宝二维码',
      wstyle: 'w-window',
      width: 256, height: 355,
      content: '<img src="https://www.wayixia.com/themes/default/donate-with-alipay-code.png">'
    });
  } // donate-with-alipay
}

function init_setting() {

  var tabactive = Q.$(location.hash.replace( /^#/g, "" ) );
  if( !tabactive ) {
    tabactive = Q.$('tab-basic');
  }
  
  var t2 = new Q.tabs({
    action: "click",
    active: tabactive,
    onactive: function( tid ) {
      var stateObject = {};
      var newUrl = "#" + tid.id;
      history.pushState(stateObject,tid.innerText,newUrl);
    },
    items: [
      {tab: Q.$('tab-basic'), content: Q.$('panel-1-1')},
      {tab: Q.$('tab-download'), content: Q.$('panel-1-2')},
      {tab: Q.$('tab-screencapture'), content: Q.$('panel-1-3')},
      {tab: Q.$('tab-shortcut'), content: Q.$('panel-1-4')},
    ]  
  });

  var extension = chrome.extension.getBackgroundPage();

  var assistant_url = extension.wayixia_assistant();
  if( assistant_url != "" ) {
    Q.$('wayixia-assistant-ing').style.display = '';
    Q.ajax( {
      command: assistant_url + '/keepalive',
      oncomplete: function(xml) {
        if( xml.responseText == "connected") {
          Q.$('wayixia-assistant-ing').style.display = 'none';
          Q.$('wayixia-assistant-ok').style.display = '';
          Q.$('wayixia-assistant-error').style.display = 'none';
        } else{
          Q.$('wayixia-assistant-ing').style.display = 'none';
          Q.$('wayixia-assistant-ok').style.display = 'none';
          Q.$('wayixia-assistant-error').style.display = '';
        }

      },
      onerror: function(xml) {
        Q.$('wayixia-assistant-ing').style.display = 'none';
        Q.$('wayixia-assistant-ok').style.display = 'none';
        Q.$('wayixia-assistant-error').style.display = '';
      } 
    } );
  } else {
    Q.$('wayixia-assistant-ing').style.display = 'none';
    Q.$('wayixia-assistant-ok').style.display = 'none';
    Q.$('wayixia-assistant-error').style.display = '';
  }


  // save path
  Q.$('save_path').value = extension.user_config_get('save_path');
  new Q.PlaceHolder( {
      holder: "label_save_path", 
      id: "save_path", 
  } );
  
  // date folder
  var option_date_folder = (extension.user_config_get('date_folder') != '0');
  var date_folder = new Q.CheckBox({ id : "date_folder", checked: option_date_folder});

  // Sitename folder
  var save_lastconfig = new Q.CheckBox({ id : "save_lastconfig", checked: extension.save_lastconfig() });

  // filter rules
  var option_filter_rules = extension.filter_rule_is_enabled();
  Q.$('manager_filter_rules').disabled = !option_filter_rules;
  var filter_rules = new Q.CheckBox({ id : "filter_rules_enable",
    checked: option_filter_rules,
    onchange : function(checked) {
      Q.$('manager_filter_rules').disabled = !checked;
    }
  });

  // Account buttons
  var wayixia_account_text = "" ;
  if( extension.nickname() != "" ) {
    wayixia_account_text = locale_text('stringAccountLogout') + " ( " + extension.nickname().toUpperCase() + " )";
  } else {
    wayixia_account_text = locale_text('stringAccountLogin');
  }
  Q.$('wayixia_account').innerHTML = wayixia_account_text;  
  Q.$('wayixia_account').onclick = ( function( ext ) { return function() {
    wayixia_track_button_click(this);
    if( extension.nickname() != "" ) {
      ext.wayixia_logout( function(ok) {
        location.reload(); 
      } );
    } else {
      // login
      window.open("https://www.wayixia.com/?mod=user&action=login&refer="+location.href);
    }
  } } )( extension );


  g_option_window = new Q.Dialog({
    width: 706,
    height: 480,
    wstyle: "w-window",
    title: locale_text('extOptions'),
    content: Q.$('layer-options'),
    on_close: function() { window.close(); },
    buttons : [
      { text: locale_text('btnSave'), onclick: function() {
         wayixia_track_event('option', 'save');
         wayixia_track_event('option-date-folder', date_folder.checked()?'checked':'unchecked');
         // save settings
         extension.user_config_set('save_path', Q.$('save_path').value);
         extension.user_config_set('date_folder', (date_folder.checked())?1:0);
         extension.set_save_lastconfig( save_lastconfig.checked() );
         if( !save_lastconfig.checked() ) {
           // reset default value
           extension.set_filter_width( 0 );
           extension.set_filter_height( 0 );
         }
         extension.filter_rule_enable(filter_rules.checked());
         extension.saveconfig();
         message_box( {title: locale_text('extShortName'), content: locale_text('saveOptions'), icon: "ok" } );
         return false;
        }
      },
      { text: locale_text('qCancel'), style: 'q-syscancelbtn', onclick: function() {
          wayixia_track_event('option', 'cancel');
          return true; 
        }
      },
    ]  
  });
  Q.$('layer-options').style.visibility = 'visible';
  g_option_window.domodal($GetDesktopWindow());

  // block images
  Q.$('manager_block_images').onclick = function() {
    wayixia_track_button_click(this);
    g_block_images_box = new Q.ImagesBox({id: 'wayixia-list'});
    var extension = chrome.extension.getBackgroundPage();
    var block_images = extension.block_images_all();
    g_block_images_box.display_images(block_images, {})();  
    display_block_images();
  }
  
  Q.$('manager_filter_rules').onclick = function() {
    display_filter_rules();
  }
}

function display_block_images() {
  g_block_window = new Q.Dialog({
    parent: g_option_window,
    width: 800,
    height: 600,
    title: locale_text('haveBlocked'),
    content: Q.$('layer-block-images'),
    buttons: [
      { text: locale_text('btnUnblock'), onclick: function() { block_images_remove(); return false; }  },
      { text: locale_text('qCancel'), style:'syscancelbtn', onclick: function() { return true; } 
      },
    ]
  });
  Q.$('layer-block-images').style.visibility = 'visible';
  g_block_window.domodal();
}

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
    init_setting(); 
  }
});


