const fbpGraph = require('fbp-graph');
const React = require('react');
const ReactDOM = require('react-dom');
const TheGraph = require('../index.js');

require('font-awesome/css/font-awesome.css');
require('../themes/the-graph-dark.styl');
require('../themes/the-graph-light.styl');

// Context menu specification
function deleteNode(graph, itemKey, item) {
  graph.removeNode(itemKey);
}
function deleteEdge(graph, itemKey, item) {
  graph.removeEdge(item.from.node, item.from.port, item.to.node, item.to.port);
}
const contextMenus = {
  main: null,
  selection: null,
  nodeInport: null,
  nodeOutport: null,
  graphInport: null,
  graphOutport: null,
  edge: {
    icon: 'long-arrow-right',
    s4: {
      icon: 'trash',
      iconLabel: 'delete',
      action: deleteEdge,
    },
  },
  node: {
    s4: {
      icon: 'trash',
      iconLabel: 'delete',
      action: deleteNode,
    },
  },
  group: {
    icon: 'th',
    s4: {
      icon: 'trash',
      iconLabel: 'ungroup',
      action(graph, itemKey, item) {
        graph.removeGroup(itemKey);
      },
    },
  },
};

const appState = {
  graph: new fbpGraph.Graph(),
  library: {},
  iconOverrides: {},
  theme: 'dark',
  editorViewX: 0,
  editorViewY: 0,
  editorScale: 1,
};

// Attach nav
function fitGraphInView() {
  editor.triggerFit();
}

function panEditorTo() {
}

function renderNav() {
  const view = [
    appState.editorViewX, appState.editorViewY,
    window.innerWidth, window.innerHeight,
  ];
  const props = {
    height: 162,
    width: 216,
    graph: appState.graph,
    onTap: fitGraphInView,
    onPanTo: panEditorTo,
    viewrectangle: view,
    viewscale: appState.editorScale,
  };

  const element = React.createElement(TheGraph.nav.Component, props);
  ReactDOM.render(element, document.getElementById('nav'));
}
function editorPanChanged(x, y, scale) {
  appState.editorViewX = -x;
  appState.editorViewY = -y;
  appState.editorScale = scale;
  renderNav();
}

function renderApp() {
  const editor = document.getElementById('editor');
  editor.className = `the-graph-${appState.theme}`;

  const props = {
    width: window.innerWidth,
    height: window.innerWidth,
    graph: appState.graph,
    library: appState.library,
    menus: contextMenus,
    nodeIcons: appState.iconOverrides,
    onPanScale: editorPanChanged,
  };

  editor.width = props.width;
  editor.height = props.height;
  const element = React.createElement(TheGraph.App, props);
  ReactDOM.render(element, editor);

  renderNav();
}
renderApp(); // initial

// Follow changes in window size
window.addEventListener('resize', renderApp);

// Toggle theme
let theme = 'dark';
document.getElementById('theme').addEventListener('click', () => {
  theme = (theme === 'dark' ? 'light' : 'dark');
  appState.theme = theme;
  renderApp();
});

// Autolayout button
document.getElementById('autolayout').addEventListener('click', () => {
  // TODO: support via React props
  editor.triggerAutolayout();
});

// Focus a node
document.getElementById('focus').addEventListener('click', () => {
  // TODO: support via React props
  const { nodes } = appState.graph;
  const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
  editor.focusNode(randomNode);
});

// Simulate node icon updates
const iconKeys = Object.keys(TheGraph.FONT_AWESOME);
window.setInterval(() => {
  const { nodes } = appState.graph;
  if (nodes.length > 0) {
    const randomNodeId = nodes[Math.floor(Math.random() * nodes.length)].id;
    const randomIcon = iconKeys[Math.floor(Math.random() * iconKeys.length)];
    appState.iconOverrides[randomNodeId] = randomIcon;
    renderApp();
  }
}, 1000);

// Simulate un/triggering errors
let errorNodeId = null;
const makeRandomError = function () {
  if (errorNodeId) {
    editor.removeErrorNode(errorNodeId);
  }
  const { nodes } = appState.graph;
  if (nodes.length > 0) {
    errorNodeId = nodes[Math.floor(Math.random() * nodes.length)].id;
    editor.addErrorNode(errorNodeId);
    editor.updateErrorNodes();
  }
};
// window.setInterval(makeRandomError, 3551); // TODO: support error nodes via React props
// makeRandomError();

// Load initial graph
const loadingMessage = document.getElementById('loading-message');
window.loadGraph = function (json) {
  // Load graph
  loadingMessage.innerHTML = 'loading graph data...';

  const graphData = json.data ? JSON.parse(json.data.files['noflo.json'].content) : json;

  fbpGraph.graph.loadJSON(JSON.stringify(graphData), (err, graph) => {
    if (err) {
      loadingMessage.innerHTML = `error loading graph: ${err.toString()}`;
      return;
    }
    // Remove loading message
    const loading = document.getElementById('loading');
    loading.parentNode.removeChild(loading);
    // Synthesize component library from graph
    appState.library = TheGraph.library.libraryFromGraph(graph);
    // Set loaded graph
    appState.graph = graph;
    appState.graph.on('endTransaction', renderApp); // graph changed
    renderApp();

    console.log('loaded', graph);
  });
};
require('./assets/photobooth.json.js');
