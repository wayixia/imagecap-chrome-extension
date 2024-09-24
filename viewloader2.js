"use strict"

const cheerio = require('cheerio');


/** \brief replace template item, for example:  {#template}
 * 
 */
function template( tpl, record ) {
  return tpl.replace( /\{#([^\}]+)\}/ig, function(k) {
    return record[arguments[1]];
  });
};


module.exports = function (src) {
  console.log( "======" + src );
  //src = src.replace( /\"/g, "\\\"");
  //src = src.replace( /\s$/g, '');
  //src = src.replace(/\r|\n/g,"");
  if(1) {
    const $ = cheerio.load(src);
    //console.log( $('style').html() );
    //console.log( $('template').html() );
    //console.log( $('script').html() );
    let tpl = '<style>' + $('style').html()  + '</style>'+ $('template').html();

    let script = 'function( args ) { var cls = ' + $('script').html() + '; return new cls(args);  }';
    //script = $('script').html();
    script = template( script, { 
      template: tpl.replace(/\r|\n/g,"") 
    } );

    //console.log( script );
    return "module.exports = "+script;
    //return "exports = "+script;
  } else {
    src = src.replace(/\r|\n/g,"");
    return "module.exports = \""+src+"\"";
  }
}