
var TheGraph = require('./index');
var React = require('react');
var ReactDOM = require('react-dom');

var darkTheme = require('./themes/the-graph-dark.css');
var lightTheme = require('./themes/the-graph-light.css');

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

    for (var i=0; i<all.length; i++) {
        applyStyleManual(all[i]);
    }
    return tree;
}


function renderImage(graphElement, options, callback) {
    if (!options) { options = {}; }
    options.format |= 'png';
    if (typeof options.background === 'undefined') { options.background = true; }

    var svgNode = graphElement.getElementsByTagName('svg')[0];
    var bgCanvas = graphElement.getElementsByTagName('canvas')[0];
    console.log('ss', svgNode)
    if (svgNode.tagName.toLowerCase() != 'svg') {
        return callback(new Error('renderImage input must be SVG, got ' + svgNode.tagName));
    }

    // FIXME: make copy
    //svgNode = svgNode.cloneNode(true, true);

    // Note: alternative to inlining style is to inject the CSS file into SVG file?
    // https://stackoverflow.com/questions/18434094/how-to-style-svg-with-external-css
    var withStyle = applyStyle(svgNode);

    // TODO: include background in SVG file
    // not that easy thougj, https://stackoverflow.com/questions/11293026/default-background-color-of-svg-root-element

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

    if (options.background) {
        var bgColor = getComputedStyle(graphElement)['background-color'];
        ctx.fillStyle = bgColor;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(bgCanvas, 0, 0);
    }

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
    var components = {};
    var processComponents = {}; 

    graph.nodes.forEach(function(process) {
        var name = process.component;
        processComponents[process.id] = name;
        components[name] = {
            name: name,
            description: name,
            icon: null,
            inports: [],
            outports: [],
        };
    });

    graph.edges.forEach(function(conn) {
        var tgt = processComponents[conn.to.node];
        console.log('tgt', conn.to.node, tgt);
        components[tgt].inports.push({
            name: conn.to.port,
            type: 'all',
        })
        if (conn.from) {
            var src = processComponents[conn.from.node];
            components[src].outports.push({
                name: conn.from.port,
                type: 'all',
            })
        }
    });

    console.log('l', components);
    return components;
}

function removeAllChildren(n) {
    while (n.firstChild) {
        n.removeChild(n.firstChild);
    }
}

function renderGraph(graph, options) {
    if (!options.library) { options.library = libraryFromGraph(graph); } 
    options.theme = 'the-graph-dark';

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

    // FIXME: find a less intrusive way  
    var container = document.body;
    removeAllChildren(container);
    container.appendChild(wrapper);

    var element = React.createElement(TheGraph.App, props);
    ReactDOM.render(element, wrapper);

    var svgElement = wrapper.children[0];
    return svgElement;
}

function waitForStyleLoad(callback) {
    // FIXME: check properly, https://gist.github.com/cvan/8a188df72a95a35888b70e5fda80450d
    setTimeout(callback, 500);
}

window.jsJobRun = function(inputdata, options, callback) {
    // FIXME: respect input/options

    console.log('f', inputdata);

    var loader = TheGraph.fbpGraph.graph.loadJSON;
    var graphData = inputdata;
    if (inputdata.fbp) {
        graphData = inputdata.fbp;
        loader = TheGraph.fbpGraph.graph.loadFBP;
    }

    loader(graphData, function(err, graph) {
        if (err) { return callback(err); }
        console.log('loaded graph');

        var svgNode = renderGraph(graph, options);
        console.log('rendered graph to DOM');
        waitForStyleLoad(function() {
            console.log('themes loaded');

            renderImage(svgNode, options, function(err, imageUrl) {
                return callback(err, imageUrl);
            })
        });

    });
};

