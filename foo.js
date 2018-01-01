
// Generate some graph contents programatically
function addNode(graph) {
  var id = Math.round(Math.random()*100000).toString(36);
  var component = Math.random() > 0.5 ? 'basic' : 'basic';
  var metadata = {
    label: component,
    x: Math.round(Math.random()*800),
    y: Math.round(Math.random()*600)
  };
  var newNode = graph.addNode(id, component, metadata);
  return newNode;
};
function addEdge(graph, outNodeID) {
  var nodes = graph.nodes;
  var len = nodes.length;
  if ( len<1 ) { return; }
  var node1 = outNodeID || nodes[Math.floor(Math.random()*len)].id;
  var node2 = nodes[Math.floor(Math.random()*len)].id;
  var port1 = 'out' + Math.floor(Math.random()*3);
  var port2 = 'in' + Math.floor(Math.random()*12);
  var meta = { route: Math.floor(Math.random()*10) };
  var newEdge = graph.addEdge(node1, port1, node2, port2, meta);
  return newEdge;
};

function getTestData() {
    var componentLibrary = {
        basic: {
          name: 'basic',
          description: 'basic demo component',
          icon: 'eye',
          inports: [
            {'name': 'in0', 'type': 'all'},
            {'name': 'in1', 'type': 'all'},
            {'name': 'in2', 'type': 'all'}
          ],
          outports: [
            {'name': 'out', 'type': 'all'}
          ]
        },
    };
    var graph = new fbpGraph.Graph();
    addNode(graph);
    addNode(graph);
    addNode(graph);
    addEdge(graph);
    return { graph: graph, library: componentLibrary };
}




function applyStyleManual(element) {
    var style = getComputedStyle(element);
    var transferToAttribute = [

    ]
    var transferToStyle = [
        'fill',
        'stroke',
        'stroke-width',
        'opacity',
        'text-anchor',
        'font-size',
        'visibility',
    ]

    transferToAttribute.forEach(function (name) {
        var s = style.getPropertyValue(name);
        if (s) {
            element.setAttribute(name, s);
        }
    });
    transferToStyle.forEach(function (name) {
        var s = style.getPropertyValue(name);
        if (s) {
            element.style[name] = s;
        }
    }); 
}

// FIXME: background is missing
// FIXME: icons are broken
function applyStyle(tree) {
    var all = tree.getElementsByTagName("*")

    var ignoreStyle = calculateDefaultStyle();
    for (var i=0; i<all.length; i++) {
        applyStyleManual(all[i], ignoreStyle);
    }
    return tree;
}


function renderImage(svgNode, options, callback) {
    if (!options) { options = {}; }
    options.format |= 'png';

    console.log('ss', svgNode)
    if (svgNode.tagName.toLowerCase() != 'svg') {
        return callback(new Error('renderImage input must be SVG, got ' + svgNode.tagName));
    }

    // FIXME: make copy
    //svgNode = svgNode.cloneNode(true, true);

    // Note: alternative to inlining style is to inject the CSS file into SVG file?
    // https://stackoverflow.com/questions/18434094/how-to-style-svg-with-external-css
    var withStyle = applyStyle(svgNode);

    var serializer = new XMLSerializer();
    var svgData = serializer.serializeToString(withStyle);

    if (options.format == 'svg') {
        return callback(null, svgData);
    }

    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob([svgData], {type: 'image/svg+xml'});
    var svgUrl = DOMURL.createObjectURL(svg);   

    var canvas = document.createElement('canvas');
    canvas.width = svgNode.getAttribute('width');
    canvas.height = svgNode.getAttribute('height');
    console.log('s', canvas)

    // TODO: allow resizing?
    // TODO: support background
    var ctx = canvas.getContext('2d');
    img.onerror = function(err) {
        return callback(err);
    }
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(svgUrl);
        return callback(null, canvas.toDataURL(options.format))
    }
    //console.log('loading image', svgUrl);
    img.src = svgUrl;

    //document.body.appendChild(img)
}



function libraryFromGraph(graph) {
    return {}; // FIXME: implement
}

function renderGraph(graph, options) {
    //options.library = libraryFromGraph(graph);
    options.theme = 'the-graph-dark';
    
    // FIXME: also load CSS stylesheet

    // FIXME: Set zoom-level, width,height so that whole graph shows with all info 
    // TODO: allow to specify maxWidth/maxHeight

    var props = {
        readonly: true,
        width: 1200,
        height: 600,
        graph: graph,
        library: options.library,
    };
    //console.log('render', props);

    var wrapper = document.createElement('div');
    wrapper.className = options.theme;
    wrapper.width = props.width;
    wrapper.height = props.height;
    var element = React.createElement(TheGraph.App, props);
    ReactDOM.render(element, wrapper);

    var svgElement = wrapper.children[0].getElementsByTagName('svg')[0];
    return svgElement;
}

function testInteractive() {
    // TEMP: testing
    //var svgNode = document.getElementById('editor').children[0].getElementsByTagName('svg')[0];

    var testData = getTestData();
    var svgNode = renderGraph(testData.graph, { library: testData.library });
    console.log(svgNode);

    var options = {};
    renderImage(svgNode, options, function(err, imageUrl) {
        if (err) {
            console.error('image render error', err);
            return;
        }
        imageUrl = imageUrl.replace("image/png", "image/octet-stream"); // avoid browser complaining about unsupported
        window.location.href = imageUrl;
    })
}
testInteractive();


