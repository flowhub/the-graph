// JsJob entrypoint for rendering a FBP graph to an SVG/JPEG/PNG

var TheGraph = require('./index');

var darkTheme = require('./themes/the-graph-dark.styl');
var lightTheme = require('./themes/the-graph-light.styl');

function waitForStyleLoad(callback) {
    // FIXME: check properly, https://gist.github.com/cvan/8a188df72a95a35888b70e5fda80450d
    setTimeout(callback, 500);
}

window.jsJobRun = function(inputdata, options, callback) {

    var loader = TheGraph.fbpGraph.graph.loadJSON;
    var graphData = inputdata;
    if (inputdata.fbp) {
        graphData = inputdata.fbp;
        loader = TheGraph.fbpGraph.graph.loadFBP;
    }

    loader(graphData, function(err, graph) {
        if (err) { return callback(err); }
        console.log('loaded graph');

        waitForStyleLoad(function() {

            try {
                var node = TheGraph.render.graphToDOM(graph, options);
            } catch (e) {
                return callback(e);
            }
            TheGraph.render.exportImage(node, options, function(err, imageUrl) {
                return callback(err, imageUrl);
            })
        });
    });
};

