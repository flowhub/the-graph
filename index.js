// Build required libs
fbpGraph = require('fbp-graph');

var g = { TheGraph: {} };

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
require("./the-graph/the-graph-tooltip.js").register(g);
require("./the-graph/the-graph-menu.js").register(g);
require("./the-graph/the-graph-clipboard.js").register(g);
require("./the-graph/font-awesome-unicode-map.js").register(g);

g.TheGraph.thumb = require('./the-graph-thumb/the-graph-thumb.js');
g.TheGraph.nav = require('./the-graph-nav/the-graph-nav.js');
g.TheGraph.autolayout = require('./the-graph/the-graph-autolayout.js');
g.TheGraph.library = require('./the-graph/the-graph-library.js');
g.TheGraph.editor = require('./the-graph-editor/the-graph-editor.js');

module.exports = g.TheGraph;
