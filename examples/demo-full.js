const fbpGraph = require('fbp-graph');
const TheGraph = require('../index.js');
const React = require('react');
const ReactDOM = require('react-dom');

require('font-awesome/css/font-awesome.css');
require('../themes/the-graph-dark.styl');
require('../themes/the-graph-light.styl')

// Context menu specification
function deleteNode(graph, itemKey, item) {
    graph.removeNode(itemKey);
}
function deleteEdge(graph, itemKey, item) {
  graph.removeEdge(item.from.node, item.from.port, item.to.node, item.to.port);
}
var contextMenus = {
  main: null,
  selection: null,
  nodeInport: null,
  nodeOutport: null,
  graphInport: null,
  graphOutport: null,
  edge: {
    icon: "long-arrow-right",
    s4: {
      icon: "trash",
      iconLabel: "delete",
      action: deleteEdge
    }
  },
  node: {
    s4: {
      icon: "trash",
      iconLabel: "delete",
      action: deleteNode
    },
  },
  group: {
    icon: "th",
    s4: {
      icon: "trash",
      iconLabel: "ungroup",
      action: function (graph, itemKey, item) {
        graph.removeGroup(itemKey);
      },
    },
  },
};

var appState = {
  graph: new fbpGraph.Graph(),
  library: {},
  iconOverrides: {},
  theme: 'dark',
};

// Attach nav
function fitGraphInView() {
  editor.triggerFit();
}

function panEditorTo() {

}
function editorPanChanged(x, y, scale) {
  appState.editorViewX = -x;
  appState.editorViewY = -y;
  appState.editorScale = scale;
  renderNav();
}
function renderNav() {

  var view = [
      appState.editorViewX, appState.editorViewY,
      window.innerWidth, window.innerHeight,
  ];
  var props = {
      height: 162,
      width: 216,
      graph: appState.graph,
      onTap: fitGraphInView,
      onPanTo: panEditorTo,
      viewrectangle: view,
      viewscale: appState.editorScale,
  };

  var element = React.createElement(TheGraph.nav.Component, props);
  ReactDOM.render(element, document.getElementById('nav'));
}

function renderApp() {
  var editor = document.getElementById('editor');
  editor.className = 'the-graph-' + appState.theme;

  var props = {
    width: window.innerWidth,
    height: window.innerWidth,
    graph: appState.graph,
    library: appState.library,
    menus: contextMenus,
    nodeIcons: appState.iconOverrides,
    onPanScale: editorPanChanged,
  }

  console.log('render', props);

  var editor = document.getElementById('editor');
  editor.width = props.width;
  editor.height = props.height;
  var element = React.createElement(TheGraph.App, props);
  ReactDOM.render(element, editor);

  renderNav();
}
renderApp(); // initial

// Follow changes in window size
window.addEventListener("resize", renderApp);

// Toggle theme
var theme = "dark";
document.getElementById("theme").addEventListener("click", function () {
  theme = (theme==="dark" ? "light" : "dark");
  appState.theme = theme;
  renderApp();
});

// Autolayout button
document.getElementById("autolayout").addEventListener("click", function () {
  // TODO: support via React props
  editor.triggerAutolayout();
});

// Focus a node
document.getElementById("focus").addEventListener("click", function () {
  // TODO: support via React props
  var nodes = appState.graph.nodes;
  var randomNode = nodes[Math.floor(Math.random()*nodes.length)];
  editor.focusNode(randomNode);
});

// Simulate node icon updates
var iconKeys = Object.keys(TheGraph.FONT_AWESOME);
window.setInterval(function () {
  var nodes = appState.graph.nodes;
  if (nodes.length>0) {
    var randomNodeId = nodes[Math.floor(Math.random()*nodes.length)].id;
    var randomIcon = iconKeys[Math.floor(Math.random()*iconKeys.length)];
    console.log(randomIcon);
    appState.iconOverrides[randomNodeId] = randomIcon;
    renderApp();
  }
}, 1000);

// Simulate un/triggering errors
var errorNodeId = null;
var makeRandomError = function () {
  if (errorNodeId) {
    editor.removeErrorNode(errorNodeId);
  }
  var nodes = appState.graph.nodes;
  if (nodes.length>0) {
    errorNodeId = nodes[Math.floor(Math.random()*nodes.length)].id;
    editor.addErrorNode(errorNodeId);
    editor.updateErrorNodes();
  }
};
//window.setInterval(makeRandomError, 3551); // TODO: support error nodes via React props
//makeRandomError();

// Load initial graph
var loadingMessage = document.getElementById("loading-message");
window.loadGraph = function (json) {
  // Load graph
  loadingMessage.innerHTML = "loading graph data...";

  var graphData = json.data ? JSON.parse(json.data.files['noflo.json'].content) : json;

  fbpGraph.graph.loadJSON(JSON.stringify(graphData), function(err, graph){
    if (err) {
      loadingMessage.innerHTML = "error loading graph: " + err.toString();
      return;
    }
    // Synthesize component library from graph
    appState.library = TheGraph.library.libraryFromGraph(graph);
    // Set loaded graph
    appState.graph = graph;
    appState.graph.on('endTransaction', renderApp); // graph changed
    renderApp();
    // Remove loading message
    var loading = document.getElementById("loading");
    loading.parentNode.removeChild(loading);

    console.log('loaded', graph);
  });
};
require('./assets/photobooth.json.js');
