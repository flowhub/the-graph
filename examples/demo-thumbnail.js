const fbpGraph = require('fbp-graph');
const TheGraph = require('../index.js');

window.loadGraph = function (json) {
  // Load graph
  const graphData = json.data.files['noflo.json'].content;
  fbpGraph.graph.loadJSON(graphData, (err, graph) => {
    if (err) {
      throw err;
    }

    // Render the numbnail
    const thumb = document.getElementById('thumb');
    const properties = TheGraph.thumb.styleFromTheme('dark');
    properties.width = thumb.width;
    properties.height = thumb.height;
    properties.nodeSize = 60;
    properties.lineWidth = 1;
    const context = thumb.getContext('2d');
    const info = TheGraph.thumb.render(context, graph, properties);
  });
};
const body = document.querySelector('body');
const script = document.createElement('script');
script.type = 'application/javascript';
// Clock
script.src = 'https://api.github.com/gists/7135158?callback=loadGraph';
// Gesture object building (lots of ports!)
// script.src = 'https://api.github.com/gists/7022120?callback=loadGraph';
// Gesture data gathering (big graph)
// script.src = 'https://api.github.com/gists/7022262?callback=loadGraph';
// Edge algo test
// script.src = 'https://api.github.com/gists/6890344?callback=loadGraph';
body.appendChild(script);
