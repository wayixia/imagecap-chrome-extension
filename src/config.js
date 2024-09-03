/*!
 * wayixia chrome plugin config api
 */

function user_config_is_new() {
  var current_version = user_config_get('wayixia_version');
  console.log(current_version + ' -> ' + chrome.runtime.getManifest().version);
  var result = (parseFloat(current_version, 10) < parseFloat(chrome.runtime.getManifest().version, 10));
  //user_config_set('wayixia_version', chrome.runtime.getManifest().version);
  return result;
}

function user_config_version_ok() {
  user_config_set('wayixia_version', chrome.runtime.getManifest().version);
}

function user_config_load(data) {
	try {
	  var config = JSON.parse(data);
		user_config_load2( config );
	} catch( e ) {
		console.log(e);
	}
}

function user_config_load2(config) {
  if(config) {
    for(var name in config) {
      localStorage.setItem(name, config[name]);
    }
  }
}


function user_config_tostring() {
  var config_names = ['save_path', 'date_folder', 'view_type', 'save_lastconfig', 'site.items', 'site.last', 'filter.width', 'filter.height'];
  var config = {};
  for(var i=0; i<config_names.length; i++) {
    var name = config_names[i];
    config[name] = user_config_get(name);
  }

  return(JSON.stringify(config));
}

function user_config_set(key, value) {
  localStorage.setItem(key, value);
}

function user_config_get(key) {
  return localStorage.getItem(key);
}

/*!
 * add block image
 */
function block_image_add(url) {
  var images = JSON.parse(localStorage.getItem('block_images')) || {};
  images[url] = 1;
  localStorage.setItem('block_images', JSON.stringify(images));
}

/*!
 * remove block image
 */
function block_image_remove(url) {
  var images = JSON.parse(localStorage.getItem('block_images')) || {};
  delete images[url];
  localStorage.setItem('block_images', JSON.stringify(images));
}

/*!
 * check image is blocked
 * @param url {string} - image url
 */
function is_block_image(url) {
  var images = JSON.parse(localStorage.getItem('block_images')) || {};
  return !!images[url];
}

/*!
 * get all block images
 */
function block_images_all() {
  return JSON.parse(localStorage.getItem('block_images')) || {};
}

/*!
 * set view type of image box
 * @param t - view type, enum: size_1, size_2, size_3
 */
function view_type_set(t) {
  user_config_set('view_type', t);
}

/*!
 * get current view type of image box
 */
function view_type() {
  var type = user_config_get('view_type');
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
function filter_rule_version() {
  if(arguments.length > 0) {
    var v = parseInt(arguments[0], 10);
    if(!isNaN(v)) {
      user_config_set('filter_rule_version', v);
    }
  } else {
    return user_config_get('filter_rule_version');
  }
}

/*!
 * enable/disable filter rule
 * @param b {bool} - enable or disable filter rule
 */
function filter_rule_enable(b) {
  user_config_set('filter_rule_enable', b?1:0);
}

/*! 
 * filter rule is enabled
 */
function filter_rule_is_enabled() {
  var enabled = user_config_get('filter_rule_enable'); 
  return (parseInt(enabled, 10) != 0);
}

/*!
 * get all filter rules
 */
function filter_rule_get() {
  var rules_config = JSON.parse(user_config_get('filter_rules'));
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
function filter_rule_set(rules) {
  var rules_config = filter_rule_get();
  for(var name in rules) {
    rules_config.rules[name] = rules[name];
  }
  user_config_set('filter_rules', JSON.stringify(rules_config));
}


function save_lastconfig() {
  return user_config_get( "save_lastconfig" ) != '0';
}

function set_save_lastconfig( enabled ) {
  user_config_set( "save_lastconfig", enabled ? '1':'0' );
}


function sites() {
  var sites = user_config_get( 'site.items' ) || "[]";
	try {
  	sites = JSON.parse( sites );
	} catch(e) {
		return [];
	}
  return sites;
}

function last_site() {
  var site = user_config_get( "site.last" ) || "{ name: '' }";
	try {
		return JSON.parse( site );
	} catch(e) {
		return  { name: "" };
	}
}

function set_last_site( site ) {
  user_config_set( "site.last", JSON.stringify( site ) );
}

function is_site_exists( site ) {
  var sites = user_config_get( 'site.items' ) || "[]";
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

function add_site( site ) {
  var sites = user_config_get( 'site.items' ) || "[]";
	try {
  	sites = JSON.parse( sites );
  } catch( e ) {
		sites = [];
	}
  sites.push( site );
  user_config_set( "site.items", JSON.stringify( sites ) );
}


function remove_site( site ) {
  var sites = user_config_get( 'site.items' ) || "[]";
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
 
  user_config_set( "site.items", JSON.stringify( sites ) );

}


function filter_width() {
  var width = user_config_get( "filter.width" ) || "0";
  return parseInt( width, 10 );
}

function set_filter_width( width ) {
  user_config_set( "filter.width", width );
}


function filter_height() {
  var height = user_config_get( "filter.height" ) || "0";
  return parseInt( height, 10 );
}

function set_filter_height( height ) {
  user_config_set( "filter.height", height );
}



