
function urls_filter(url, rules) {
  try { // try

  //var re = /^\w+:\/\/[0-9a-zA-z\-]+\.([0-9a-zA-Z\-\.]+)\//i;
  var re = /^\w+:\/\/[0-9a-zA-z\-]+\.([^\/]+)\//i;
  if(re.test(url)) {
    var domain = RegExp.$1;
    //console.log( domain );
    re.lastIndex = 0;
    var rule = rules[domain];
    if(rule) {
      var re2 = new RegExp(rule.rule, "i");
      var url2 = url.replace(re2, rule.fmt);
      console.log(url + "->" + url2);
      return url2;
    }
  }

  } catch(e) { // catch
    return url;
  } 

  return url;
}
