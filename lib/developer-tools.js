"use strict";

const {Cc,Ci} = require("chrome");
const errors = require("api-utils/errors");
const apiUtils = require("api-utils/api-utils");
const observerServ = require("api-utils/observer-service");

exports.registerNodeTool = function(aTool) {
  tools.push(aTool);
}

let tools = [];

let browserManager = {
  init: function() {
    observerServ.add("inspector-opened", this.highlighterReady, this);
  },
  highlighterReady: function(aSubject, aTopic, aData) {
    let msg = "";
    let IUI = aSubject.wrappedJSObject;
    for (var i = 0; i < tools.length; i++) {
      new ToolWrapper(IUI, tools[i]);
    }
  },
}
browserManager.init();

function ToolWrapper(aInspector, aToolDef)
{
  this.IUI = aInspector;
  this.tool = aToolDef;
  this._init();
}

ToolWrapper.prototype = {
  _init: function()
  {
    let popupSet = this.IUI.chromeDoc.getElementById("mainPopupSet");

    let panel = this.IUI.chromeDoc.createElement("panel");
    panel.setAttribute("noautofocus", "true");
    panel.setAttribute("noautohide", "true");
    panel.setAttribute("close", "true");
    panel.setAttribute("titlebar", "normal");
    panel.setAttribute("label", this.tool.panel_title);

    let iframe = this.IUI.chromeDoc.createElement("iframe");
    iframe.setAttribute("src", this.tool.url);
    iframe.setAttribute("flex", "1");
    iframe.setAttribute("width", this.tool.width);
    iframe.setAttribute("height", this.tool.height);

    panel.appendChild(iframe);
    popupSet.appendChild(panel);

    this._iframe = iframe;
    this._iframeReady = false;

    this._boundIframeReady = this.onIframeReady.bind(this);
    this._iframe.addEventListener("load", this._boundIframeReady, true);
    this.panel = panel;

    this._dontupdate = true;

    this.IUI.registerTool({
      id: this.tool.id,
      context: this,
      label: this.tool.button_label,
      tooltiptext: this.tool.button_tooltip,
      accesskey: this.tool.button_accesskey,
      isOpen: this.isOpen,
      onSelect: this.onSelect,
      show: this.show,
      hide: this.hide,
      dim: this.dim,
      unregister: this.unregister,
      panel: this.panel,
    });
  },

  /**
   * Once the iframe is loaded, we compute the size of any pending node.
   */
  onIframeReady: function()
  {
    this._iframeReady = true;
    if (this._pendingNode)
      this.onSelect(this._pendingNode);
  },

  /**
   * Check if the tool is open.
   */
  isOpen: function()
  {
    return this.panel.state && this.panel.state == "open";
  },

  /**
   * Select a node.
   * @param aNode
   */
  onSelect: function(aNode)
  {
    if (this._iframeReady && !this._dontupdate && this._iframe.contentWindow) {
      let node = aNode;
      let document = aNode.ownerDocument;
      let window = document.defaultView;
      let msg = this.tool.onSelect(node, document, window);
      // Can't use postMessage???
      this._iframe.contentWindow.onmessage(msg);
      this._pendingNode = null;
      return;
    }
    this._pendingNode = aNode;
  },

  /**
   * Open the panel.
   * @param aNode The current selected node.
   */
  show: function(aNode)
  {
    this.panel.openPopup(null, "before_start", 0, 0, false, false);
    this.onSelect(aNode);
  },

  /**
   * Hide the panel.
   */
  hide: function()
  {
    this.panel.hidePopup();
  },

  /**
   * Dim or undim a panel.
   * @param aState
   *        true = dim, false = undim
   */
  dim: function(aState)
  {
    this._dontupdate = aState;

    if (this._iframe.contentWindow) {
      // Can't use postMessage???
      this._iframe.contentWindow.onmessage(this.tool.onDim());
    }
  },

  /**
   * Hide and destroy the popup.
   */
  unregister: function()
  {
    if (this.isOpen())
      this.hide();
    this._iframe.removeEventListener("load", this._boundIframeReady, true);
    this._boundIframeReady = null;
    this._iframe.parentNode.removeChild(this._iframe);
    this._iframe = null;
    this.panel.parentNode.removeChild(this.panel);
    this.panel = null;
  },
}
