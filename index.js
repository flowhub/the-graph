
// Module object
var TheGraph = {};

// Bundle and expose fbp-graph as public API
TheGraph.fbpGraph = require('fbp-graph');

// Pull in Ease from NPM, react.animate needs it as a global
TheGraph.Ease = require('ease-component');
if (typeof window !== 'undefined' && typeof window.Ease === 'undefined') {
    window.Ease = TheGraph.Ease;
}

// HACK, goes away when everything is CommonJS compatible
var g = { TheGraph: TheGraph };

TheGraph.factories = require('./the-graph/factories.js');
TheGraph.merge = require('./the-graph/merge.js');

require("./the-graph/the-graph.js").register(g);
require("./the-graph/the-graph-app.js").register(g);
require("./the-graph/the-graph-graph.js").register(g);
require("./the-graph/the-graph-node.js").register(g);
require("./the-graph/the-graph-node-menu.js").register(g);
require("./the-graph/the-graph-node-menu-port.js").register(g);
require("./the-graph/the-graph-node-menu-ports.js").register(g);
require("./the-graph/the-graph-port.js").register(g);
require("./the-graph/the-graph-edge.js").register(g);
require("./the-graph/the-graph-iip.js").register(g);
require("./the-graph/the-graph-group.js").register(g);

TheGraph.menu = require("./the-graph/the-graph-menu.js");
// compat
TheGraph.Menu = TheGraph.menu.Menu;
TheGraph.factories.menu = TheGraph.menu.factories;
TheGraph.config.menu = TheGraph.menu.config;
TheGraph.config.menu.iconRect.rx = TheGraph.config.nodeRadius;
TheGraph.config.menu.iconRect.ry = TheGraph.config.nodeRadius;

TheGraph.modalbg = require("./the-graph/the-graph-modalbg.js");
// compat
TheGraph.ModalBG = TheGraph.modalbg.ModalBG;
TheGraph.config.ModalBG = TheGraph.config.factories;
TheGraph.factories.ModalBG = TheGraph.modalbg.factories;

TheGraph.FONT_AWESOME = require("./the-graph/font-awesome-unicode-map.js");


TheGraph.tooltip = require("./the-graph/the-graph-tooltip.js");
// compat
TheGraph.Tooltip = TheGraph.tooltip.Tooltip;
TheGraph.config.tooltip = TheGraph.tooltip.config;
TheGraph.factories.tooltip = TheGraph.tooltip.factories; 

TheGraph.mixins = require("./the-graph/mixins.js");
TheGraph.arcs = require('./the-graph/arcs.js');

TheGraph.TextBG = require('./the-graph/TextBG.js');
TheGraph.SVGImage = require('./the-graph/SVGImage.js');

TheGraph.thumb = require('./the-graph-thumb/the-graph-thumb.js');

TheGraph.nav = require('./the-graph-nav/the-graph-nav.js');

TheGraph.autolayout = require('./the-graph/the-graph-autolayout.js');
TheGraph.library = require('./the-graph/the-graph-library.js');

TheGraph.clipboard = require("./the-graph-editor/clipboard.js");
TheGraph.editor = require('./the-graph-editor/menus.js');

module.exports = TheGraph;
