/*!
 * wayixia chrome plugin config api
 */


class config {

  constructor()
  {

  }

  user_config_is_new() {
    var current_version = this.get('wayixia_version');
    console.log(current_version + ' -> ' + chrome.runtime.getManifest().version);
    var result = (parseFloat(current_version, 10) < parseFloat(chrome.runtime.getManifest().version, 10));
    //set('wayixia_version', chrome.runtime.getManifest().version);
    return result;
  }

  user_config_version_ok() {
    this.set('wayixia_version', chrome.runtime.getManifest().version);
  }

  user_config_load(data) {
	  try {
	    var cfg = JSON.parse(data);
		  this.user_config_load2( cfg );
	  } catch( e ) {
		  console.log(e);
	  }
  }

  user_config_load2(cfg) {
    if(cfg) {
      for(var name in cfg) {
        localStorage.setItem(name, cfg[name]);
      }
    }
  }


  user_config_tostring() {
    var config_names = ['save_path', 'date_folder', 'view_type', 'save_lastconfig', 'site.items', 'site.last', 'filter.width', 'filter.height'];
    var config = {};
    for(var i=0; i<config_names.length; i++) {
      var name = config_names[i];
      config[name] = this.get(name);
    }

    return(JSON.stringify(config));
  }

  set(key, value) {
    chrome.storage.local.set({key, value});
  }

  async get(key) {
    const data = await chrome.storage.local.get(key);
    return data;
  }

  /*!
   * add block image
   */
  block_image_add(url) {
    chrome.storage.local.get('block_images', (data)=>{
      var images = JSON.parse() || {};
      images[url] = 1;
      chrome.storage.local.set('block_images', JSON.stringify(images));
    });
  }

/*!
 * remove block image
 */
block_image_remove(url) {
  var images = JSON.parse(localStorage.getItem('block_images')) || {};
  delete images[url];
  localStorage.setItem('block_images', JSON.stringify(images));
}

/*!
 * check image is blocked
 * @param url {string} - image url
 */
async is_block_image(url) {
  const images = await this.get('block_images');
  //var images = JSON.parse(localStorage.getItem('block_images')) || {};
  return !!images[url];
}

/*!
 * get all block images
 */
async block_images_all() {
  return await this.get('block_images');
}

/*!
 * set view type of image box
 * @param t - view type, enum: size_1, size_2, size_3
 */
view_type_set(t) {
  this.set('view_type', t);
}

/*!
 * get current view type of image box
 */
view_type() {
  var type = this.get('view_type');
  if( type == "size_1" 
     || type == "size_2" 
     || type == "size_3") 
  {
    return type;;
  } 

  return "size_2";
}

/*!
 * filter rules api
 */

/*! 
 * set/get version of filter rules
 */
filter_rule_version() {
  if(arguments.length > 0) {
    var v = parseInt(arguments[0], 10);
    if(!isNaN(v)) {
      this.set('filter_rule_version', v);
    }
  } else {
    return this.get('filter_rule_version');
  }
}

/*!
 * enable/disable filter rule
 * @param b {bool} - enable or disable filter rule
 */
filter_rule_enable(b) {
  this.set('filter_rule_enable', b?1:0);
}

/*! 
 * filter rule is enabled
 */
filter_rule_is_enabled() {
  var enabled = this.get('filter_rule_enable'); 
  return (parseInt(enabled, 10) != 0);
}

/*!
 * get all filter rules
 */
async filter_rule_get() {
  const data = await this.get('filter_rules');
  var rules_config = data; //JSON.parse(data);
  if(rules_config && (typeof rules_config == "object")) {
  } else {
    rules_config = {version: 0, rules: {}};
  }
  if(rules_config.version === undefined || isNaN(rules_config.version))
    rules_config.version = 0;

  if(rules_config.rules === undefined)
    rules_config.rules = {};
  return rules_config; 
}

/*!
 * set filter rules
 * @param {Array} - rule list
 */
async filter_rule_set(rules) {
  var rules_config = await filter_rule_get();
  for(var name in rules) {
    rules_config.rules[name] = rules[name];
  }
  this.set('filter_rules', JSON.stringify(rules_config));
}


save_lastconfig() {
  return this.get( "save_lastconfig" ) != '0';
}

set_save_lastconfig( enabled ) {
  this.set( "save_lastconfig", enabled ? '1':'0' );
}


sites() {
  var sites = this.get( 'site.items' ) || "[]";
	try {
  	sites = JSON.parse( sites );
	} catch(e) {
		return [];
	}
  return sites;
}

last_site() {
  var site = this.get( "site.last" ) || "{ name: '' }";
	try {
		return JSON.parse( site );
	} catch(e) {
		return  { name: "" };
	}
}

set_last_site( site ) {
  this.set( "site.last", JSON.stringify( site ) );
}

is_site_exists( site ) {
  var sites = this.get( 'site.items' ) || "[]";
	try {
		sites = JSON.parse( sites );
	} catch( e ) {
		sites = [];
	}
  for( var i=0; i < sites.length; i++ ) {
    if( sites[i].name == site.name ) {
      return true;
    }
  } 

  return false;
}

add_site( site ) {
  var sites = this.get( 'site.items' ) || "[]";
	try {
  	sites = JSON.parse( sites );
  } catch( e ) {
		sites = [];
	}
  sites.push( site );
  this.set( "site.items", JSON.stringify( sites ) );
}


remove_site( site ) {
  var sites = this.get( 'site.items' ) || "[]";
  try {
  	sites = JSON.parse( sites );
  } catch( e ) {
		sites = [];
	}
 
  for( var i=0; i < sites.length; i++ ) {
    if( sites[i].name == site.name ) {
      sites.splice( i, 1 );
      break;
    }
  } 
 
  this.set( "site.items", JSON.stringify( sites ) );

}


filter_width() {
  var width = this.get( "filter.width" ) || "0";
  return parseInt( width, 10 );
}

set_filter_width( width ) {
  this.set( "filter.width", width );
}


filter_height() {
  var height = this.get( "filter.height" ) || "0";
  return parseInt( height, 10 );
}

set_filter_height( height ) {
  this.set( "filter.height", height );
}


};

export default new config;