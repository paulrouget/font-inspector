var devtools = require("developer-tools");
var data = require('self').data;
var {Cc,Ci} = require("chrome");

var domUtils =
  Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);

devtools.registerNodeTool({
  id: "font-inspector",
  panel_title: "Font Inspector",
  button_label: "font",
  button_tooltip: "Font Inspector",
  button_accesskey: "f",
  height: 300,
  width: 300,
  url: data.url('tool.html'),
  onSelect: function(aNode, aDocument, aWindow) {
    var msg = {method: 'SELECT'};

    var rng = aDocument.createRange();
    rng.selectNode(aNode);
    let fonts = domUtils.getUsedFontFaces(rng);
    let fontsArray = [];
    for (var i = 0; i < fonts.length; i++) {
      fontsArray.push(fonts.item(i));
    }
    msg.fonts = fontsArray;

    let cstyle = aWindow.getComputedStyle(aNode, null);
    let props = ["color",
                "font-family",
                "font-size",
                "font-size-adjust",
                "font-stretch",
                "font-style",
                "font-variant",
                "font-weight",
                "letter-spacing",
                "line-height",
                "opacity",
                "text-align",
                "text-decoration",
                "text-indent",
                "text-overflow",
                "text-shadow",
                "text-transform",
                "vertical-align", 
                "white-space", 
                "word-spacing", 
                "word-wrap"];

    let style = {};
    for (var i = 0; i < props.length; i++) {
      var prop = props[i].replace("-", "_", "g");
      var val = cstyle.getPropertyValue(props[i]);
      style[prop] = val;
    }
    msg.computedStyle = style;

    return JSON.stringify(msg);
  },
  onDim: function() {
    return JSON.stringify({method: 'HIDE'});
  },
});
