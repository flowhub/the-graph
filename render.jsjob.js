// JsJob entrypoint for rendering a FBP graph to an SVG/JPEG/PNG

const TheGraph = require('./index');

require('./themes/the-graph-dark.styl');
require('./themes/the-graph-light.styl');

function waitForStyleLoad(callback) {
  // FIXME: check properly, https://gist.github.com/cvan/8a188df72a95a35888b70e5fda80450d
  setTimeout(callback, 500);
}

window.jsJobRun = function (inputdata, options, callback) {
  let loader = TheGraph.fbpGraph.graph.loadJSON;
  let graphData = inputdata;
  if (inputdata.fbp) {
    graphData = inputdata.fbp;
    loader = TheGraph.fbpGraph.graph.loadFBP;
  }

  loader(graphData, (err, graph) => {
    if (err) { return callback(err); }
    console.log('loaded graph');

    waitForStyleLoad(() => {
      try {
        var node = TheGraph.render.graphToDOM(graph, options);
      } catch (e) {
        return callback(e);
      }
      TheGraph.render.exportImage(node, options, (err, imageUrl) => callback(err, imageUrl));
    });
  });
};
