/*!
 * wayixia chrome plugin config api
 */


class config 
{
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
    var config_names = ['save_path', 'date_folder', 'view_type', 'save_lastconfig', 'sites', 'last_site', 'filter_width', 'filter_height'];
    var config = {};
    for(var i=0; i<config_names.length; i++) {
      var name = config_names[i];
      config[name] = this.get(name);
    }

    return(JSON.stringify(config));
  }

  set(key, value) {
    var c = {};
    c[key] = value;
    chrome.storage.local.set(c);
  }

  async get(key) {
    const data = await chrome.storage.local.get(key);
    return data;
  }

  getall(callback) {
    chrome.storage.local.get( null, callback );
  }

  getall2( key, fn ) {
    chrome.storage.local.get( key, fn );
  }

  /*!
   * add block image
   */
  block_image_add(url) {
    var self = this;
    this.getall2( { block_images:{} }, (c)=>{
      c.block_images[url] = 1;
      self.set('block_images', c.block_images);
    });
  }

/*!
 * remove block image
 */
block_image_remove(url) {
  var self = this;
  this.getall2( { block_images:{} }, (c)=>{
    delete c.block_images[url];
    self.set('block_images', c.block_images);
  });
}

/*!
 * check image is blocked
 * @param url {string} - image url
 */
is_block_image(url, fn) {
  this.getall2( { block_images:{} }, (c)=>{
    fn(!!c.block_images[url]);
  });
}

/*!
 * get all block images
 */
get_block_images(fn) {
  this.getall2({block_images:{}}, fn);
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
  this.set('filter_rule_is_enabled', b);
}

/*! 
 * filter rule is enabled
 */
filter_rule_is_enabled(fn) {
  this.getall2('filter_rule_is_enabled', fn); 
}

/*!
 * get all filter rules
 */
get_filter_rule( fn ) {
  this.getall2('filter_rules', (rules_config)=>{
    //var rules_config = data; //JSON.parse(data);
    if(rules_config && (typeof rules_config == "object")) {
    } else {
      rules_config = {version: 0, rules: {}};
    }
    
    if(rules_config.version === undefined || isNaN(rules_config.version))
      rules_config.version = 0;
    if(rules_config.rules === undefined)
      rules_config.rules = {};
    //return rules_config; 
    fn(rules_config);
  } );
}

/*!
 * set filter rules
 * @param {Array} - rule list
 */
filter_rule_set(rules) {
  this.get_filter_rule( (rules_config)=>{
    for(var name in rules) {
      rules_config.rules[name] = rules[name];
    }

    this.set('filter_rules', rules_config);
  });
}


save_lastconfig(fn) {
  this.getall2( {save_lastconfig:false}, (c)=>{ fn(c.save_lastconfig)} );
}

set_save_lastconfig( enabled ) {
  this.set( "save_lastconfig", enabled);
}


sites(fn) {
  var sites = this.getall2( 'sites', (c)=>{
    var sites = c || [];
    fn(sites);
  } );
}

last_site(fn) {
  this.getall2( {last_site: ''}, fn );
}

set_last_site( site ) {
  this.set( "last_site", site );
}

site_is_exists( site, fn ) {
  this.sites( (sites)=>{
    for( var i=0; i < sites.length; i++ ) {
      if( sites[i].name == site.name ) {
        fn(true);
        return;
      }
    }
    fn(false);
  } );
}

add_site( site ) {
  var self = this;
  this.sites( (sites)=>{
    sites.push( site );
    self.set( "sites", sites );
  } );
}


remove_site( site ) {
  this.sites( (sites)=>{
    for( var i=0; i < sites.length; i++ ) {
      if( sites[i].name == site.name ) {
        sites.splice( i, 1 );
        this.set( "sites", sites );
        break;
      }
    }
  });
}

filter_width(fn) {
  this.getall2({filter_width:0}, (c)=>{ fn(c.filter_width)});
}

set_filter_width( width ) {
  this.set( 'filter_width', width );
}


filter_height(fn) {
  this.getall2({filter_height:0}, (c)=>{ fn(c.filter_height)});
}

set_filter_height( height ) {
  this.set( "filter_height", height );
}


nickname(fn) {
  this.getall2({nickname:''}, (c)=>{fn(c.nickname);});
}

};

export default new config;