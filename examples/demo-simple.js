const fbpGraph = require('fbp-graph');
const React = require('react');
const ReactDOM = require('react-dom');
const TheGraph = require('../index.js');

require('font-awesome/css/font-awesome.css');
require('../themes/the-graph-dark.styl');
require('../themes/the-graph-light.styl');

// Remove loading message
document.body.removeChild(document.getElementById('loading'));

// The graph editor
const editor = document.getElementById('editor');

// Component library
const library = {
  basic: {
    name: 'basic',
    description: 'basic demo component',
    icon: 'eye',
    inports: [
      { name: 'in0', type: 'all' },
      { name: 'in1', type: 'all' },
      { name: 'in2', type: 'all' },
    ],
    outports: [
      { name: 'out', type: 'all' },
    ],
  },
  tall: {
    name: 'tall',
    description: 'tall demo component',
    icon: 'cog',
    inports: [
      { name: 'in0', type: 'all' },
      { name: 'in1', type: 'all' },
      { name: 'in2', type: 'all' },
      { name: 'in3', type: 'all' },
      { name: 'in4', type: 'all' },
      { name: 'in5', type: 'all' },
      { name: 'in6', type: 'all' },
      { name: 'in7', type: 'all' },
      { name: 'in8', type: 'all' },
      { name: 'in9', type: 'all' },
      { name: 'in10', type: 'all' },
      { name: 'in11', type: 'all' },
      { name: 'in12', type: 'all' },
    ],
    outports: [
      { name: 'out0', type: 'all' },
    ],
  },
};

// Load empty graph
let graph = new fbpGraph.Graph();

function renderEditor() {
  const props = {
    readonly: false,
    height: window.innerHeight,
    width: window.innerWidth,
    graph,
    library,
  };
  // console.log('render', props);
  const editor = document.getElementById('editor');
  editor.width = props.width;
  editor.height = props.height;
  const element = React.createElement(TheGraph.App, props);
  ReactDOM.render(element, editor);
}
graph.on('endTransaction', renderEditor); // graph changed
window.addEventListener('resize', renderEditor);

// Add node button
const addnode = function () {
  const id = Math.round(Math.random() * 100000).toString(36);
  const component = Math.random() > 0.5 ? 'basic' : 'tall';
  const metadata = {
    label: component,
    x: Math.round(Math.random() * 800),
    y: Math.round(Math.random() * 600),
  };
  const newNode = graph.addNode(id, component, metadata);
  return newNode;
};
document.getElementById('addnode').addEventListener('click', addnode);

// Add edge button
const addedge = function (outNodeID) {
  const { nodes } = graph;
  const len = nodes.length;
  if (len < 1) { return; }
  const node1 = outNodeID || nodes[Math.floor(Math.random() * len)].id;
  const node2 = nodes[Math.floor(Math.random() * len)].id;
  const port1 = `out${Math.floor(Math.random() * 3)}`;
  const port2 = `in${Math.floor(Math.random() * 12)}`;
  const meta = { route: Math.floor(Math.random() * 10) };
  const newEdge = graph.addEdge(node1, port1, node2, port2, meta);
  return newEdge;
};
document.getElementById('addedge').addEventListener('click', (event) => { addedge(); });

// Random graph button
document.getElementById('random').addEventListener('click', () => {
  graph.startTransaction('randomgraph');
  for (let i = 0; i < 20; i++) {
    const node = addnode();
    addedge(node.id);
    addedge(node.id);
  }
  graph.endTransaction('randomgraph');
});

// Get graph button
document.getElementById('get').addEventListener('click', () => {
  const graphJSON = JSON.stringify(graph.toJSON(), null, 2);
  alert(graphJSON);
  // you can use the var graphJSON to save the graph definition in a file/database
});

// Clear button
document.getElementById('clear').addEventListener('click', () => {
  graph = new fbpGraph.Graph();
  renderEditor();
});
