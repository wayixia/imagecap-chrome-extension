/** 简易的调色板，固定给出几组颜色
 *
 * @constructor
 * @param {Object} json - 构造参数
*/

Q.ColorTable = Q.DropWindow.extend({
  table : null,
  __init__ : function(json) {
    
    json = json || {};
    json.width = ( 12+3 )*16+2;
    json.height= ( 12+2 )*14+2;
    if( typeof json.onchange == "function" ) 
      this.onchange = json.onchange;
    
    /** color table */
    var defaultColors = [
      '990033', 'ff3366', 'cc0033', 'ff0033', 'ff9999', 'cc3366', 'ffccff', 'cc6699',
      '993366', '660033', 'cc3399', 'ff99cc', 'ff66cc', 'ff99ff', 'ff6699', 'cc0066',
      'ff0066', 'ff3399', 'ff0099', 'ff33cc', 'ff00cc', 'ff66ff', 'ff33ff', 'ff00ff',
      'cc0099', '990066', 'cc66cc', 'cc33cc', 'cc99ff', 'cc66ff', 'cc33ff', '993399',
      'cc00cc', 'cc00ff', '9900cc', '990099', 'cc99cc', '996699', '663366', '660099',
      '9933cc', '660066', '9900ff', '9933ff', '9966cc', '330033', '663399', '6633cc',
      '6600cc', '9966ff', '330066', '6600ff', '6633ff', 'ccccff', '9999ff', '9999cc',
      '6666cc', '6666ff', '666699', '333366', '333399', '330099', '3300cc', '3300ff',
      '3333ff', '3333cc', '0066ff', '0033ff', '3366ff', '3366cc', '000066', '000033',
      '0000ff', '000099', '0033cc', '0000cc', '336699', '0066cc', '99ccff', '6699ff',
      '003366', '6699cc', '006699', '3399cc', '0099cc', '66ccff', '3399ff', '003399',
      '0099ff', '33ccff', '00ccff', '99ffff', '66ffff', '33ffff', '00ffff', '00cccc',
      '009999', '669999', '99cccc', 'ccffff', '33cccc', '66cccc', '339999', '336666',
      '006666', '003333', '00ffcc', '33ffcc', '33cc99', '00cc99', '66ffcc', '99ffcc',
      '00ff99', '339966', '006633', '336633', '669966', '66cc66', '99ff99', '66ff66',
      '339933', '99cc99', '66ff99', '33ff99', '33cc66', '00cc66', '66cc99', '009966',
      '009933', '33ff66', '00ff66', 'ccffcc', 'ccff99', '99ff66', '99ff33', '00ff33',
      '33ff33', '00cc33', '33cc33', '66ff33', '00ff00', '66cc33', '006600', '003300',
      '009900', '33ff00', '66ff00', '99ff00', '66cc00', '00cc00', '33cc00', '339900',
      '99cc66', '669933', '99cc33', '336600', '669900', '99cc00', 'ccff66', 'ccff33',
      'ccff00', '999900', 'cccc00', 'cccc33', '333300', '666600', '999933', 'cccc66',
      '666633', '999966', 'cccc99', 'ffffcc', 'ffff99', 'ffff66', 'ffff33', 'ffff00',
      'ffcc00', 'ffcc66', 'ffcc33', 'cc9933', '996600', 'cc9900', 'ff9900', 'cc6600',
      '993300', 'cc6633', '663300', 'ff9966', 'ff6633', 'ff9933', 'ff6600', 'cc3300',
      '996633', '330000', '663333', '996666', 'cc9999', '993333', 'cc6666', 'ffcccc',
      'ff3333', 'cc3333', 'ff6666', '660000', '990000', 'cc0000', 'ff0000', 'ff3300',
      'cc9966', 'ffcc99', 'ffffff', 'cccccc', '999999', '666666', '333333', '000000',
      '000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000'
    ];
    
    /** init color table */
    this.table = document.createElement('table');
    var current_row = null;
    for(var i=0; i < defaultColors.length; i++) {
      if(i % 16 == 0) {
        current_row = this.table.insertRow(-1);
      }

      var td = current_row.insertCell(-1);
      td.style.width = "12px";
      td.style.height = "12px";
      td.style.backgroundColor = "#" + defaultColors[i];
      td.onclick = ( function(t, o) { return function( evt ) {
        t.onchange && t.onchange(o.style.backgroundColor);
        t.hide();
      } } )(this, td);
    }

    json.content = this.table;
    Q.DropWindow.prototype.__init__.call(this, json);
  }
});


/** line width window
 *
 */
Q.WidthSelector = Q.DropWindow.extend( {
__init__ : function( json ) {
  json = json || {};

  var line_width = [1, 2, 3, 4, 5];
  this.table = document.createElement('table');
  this.table.width = "100%";
  this.table.cellPadding = 3;
  this.table.cellSpacing = 0;
  for(var i=0; i < line_width.length; i++) {
    var row = this.table.insertRow(-1);
    var td1 = row.insertCell(-1);
    var td2 = row.insertCell(-1);
    var hr = document.createElement('hr');
    hr.style.height = line_width[i];
    hr.style.backgroundColor = "#515151";
    hr.style.borderWidth = 0;
    row.onclick = (function( t, e ) { return function() {
      if(t.onchange)
        t.onchange( parseInt(e.style.height, 10) );
      t.hide();
    } })(this, hr);
    row.onmouseover = function(evt) { 
      this.style.backgroundColor = "#EEE"; 
    }
    row.onmouseout = function(evt) { 
      this.style.backgroundColor = "transparent";
    }
    td1.style.width = "120"
    td1.appendChild(hr);
    td2.style.width = "30";
    td2.innerText = line_width[i] + "px";
  }
  
  if( typeof json.onchange == "function" )
    this.onchange = json.onchange;

  json.content = this.table;
  json.width = 122;
  json.height = 140;
  Q.DropWindow.prototype.__init__.call(this, json);
}

} );


/** font size drop window
 *
 */
Q.FontSizeSelector = Q.DropWindow.extend( {
__init__ : function( json ) {
  json = json || {};

  var line_width = [14, 16, 22, 28, 40];
  this.table = document.createElement('table');
  this.table.width = "100%";
  this.table.cellPadding = 3;
  this.table.cellSpacing = 0;
  for(var i=0; i < line_width.length; i++) {
    var row = this.table.insertRow(-1);
    var td1 = row.insertCell(-1);
    var td2 = row.insertCell(-1);
    td1.style.fontSize = line_width[i] + 'px';
    td1.innerText = "FontSize"
    row.onclick = (function( t, e ) { return function() {
      if(t.onchange)
        t.onchange( parseInt(e.style.fontSize, 10) );
      t.hide();
    } })(this, td1);
    row.onmouseover = function(evt) { 
      this.style.backgroundColor = "#EEE"; 
    }
    row.onmouseout = function(evt) { 
      this.style.backgroundColor = "transparent";
    }
    td1.style.width = "120"
    td2.style.width = "30";
    td2.innerText = line_width[i] + "px";
  }
  
  if( typeof json.onchange == "function" )
    this.onchange = json.onchange;

  json.content = this.table;
  json.width = 122;
  json.height = 200;
  Q.DropWindow.prototype.__init__.call(this, json);
}

} );