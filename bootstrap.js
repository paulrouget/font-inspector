const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/devtools/gDevTools.jsm");

/* Depending on the version of Firefox, promise module can have different path */
try { Cu.import("resource://gre/modules/commonjs/promise/core.js"); } catch(e) {}
try { Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js"); } catch(e) {}

XPCOMUtils.defineLazyGetter(this, "osString", function() Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS);

const fontinspectorProps = "chrome://fontinspector/locale/fonts.properties";
let fontinspectorStrings = Services.strings.createBundle(fontinspectorProps);

let fontinspectorDefinition = {
  id: "fontinspector",
  ordinal: 0,
  url: "chrome://fontinspector/content/fonts.xhtml",
  label: fontinspectorStrings.GetStringFromName("fontinspector.label"),
  tooltip: fontinspectorStrings.GetStringFromName("fontinspector.tooltip"),
  isTargetSupported: function(target) {
    return target.isLocalTab;
  },
  build: function(iframeWindow, toolbox) {
    let ui = iframeWindow.fontinspectorUI;
    ui.init(toolbox.target);
    return Promise.resolve(ui);
  }
};

function startup() {
  gDevTools.registerTool(fontinspectorDefinition);
}

function shutdown() {
  gDevTools.unregisterTool(fontinspectorDefinition);
}

function install() {}
function uninstall() {}
