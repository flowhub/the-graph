const fbpGraph = require('fbp-graph');
const TheGraph = require('../index.js');

window.loadGraph = function (json) {
  // Load graph
  var graphData = json.data.files['noflo.json'].content;
  fbpGraph.graph.loadJSON(graphData, function(err, graph) {
    if (err) {
      throw err;
    }

    // Render the numbnail
    var thumb = document.getElementById('thumb');
    var properties = TheGraph.thumb.styleFromTheme('dark');
    properties.width = thumb.width;
    properties.height = thumb.height;
    properties.nodeSize = 60;
    properties.lineWidth = 1;
    var context = thumb.getContext("2d");
    var info = TheGraph.thumb.render(context, graph, properties);
  });
}
var body = document.querySelector('body');
var script = document.createElement('script');
script.type = 'application/javascript';
// Clock
script.src = 'https://api.github.com/gists/7135158?callback=loadGraph';
// Gesture object building (lots of ports!)
//script.src = 'https://api.github.com/gists/7022120?callback=loadGraph';
// Gesture data gathering (big graph)
//script.src = 'https://api.github.com/gists/7022262?callback=loadGraph';
// Edge algo test
// script.src = 'https://api.github.com/gists/6890344?callback=loadGraph';
body.appendChild(script);
