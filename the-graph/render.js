
var React = require('react');
var ReactDOM = require('react-dom');

var geometryutils = require('./geometryutils.js');
//var TheGraphApp = require('./the-graph-app.js');

// XXX: hack, goes away when the-graph-app.js can be CommonJS loaded
var TheGraphApp = null;
function register(context) {
    TheGraphApp = context.TheGraph.App;
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
    if (!options.format) { options.format = 'png'; }
    if (typeof options.background === 'undefined') { options.background = true; }
    if (typeof options.quality === 'undefined') { options.quality = 0.9; }

    var svgNode = graphElement.getElementsByTagName('svg')[0];
    var bgCanvas = graphElement.getElementsByTagName('canvas')[0];
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

    // TODO: allow resizing?
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
        var out = canvas.toDataURL('image/'+options.format, options.quality);
        return callback(null, out);
    }
    img.src = svgUrl;
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

    function addIfMissing(ports, name) {
        var found = ports.filter(function (p) { p.name == name; } );
        if (found.length == 0) {
            ports.push({ name: name, type: 'all' });
        }
    }

    graph.edges.forEach(function(conn) {
        var tgt = processComponents[conn.to.node];
        addIfMissing(components[tgt].inports, conn.to.port);
        if (conn.from) {
            var src = processComponents[conn.from.node];
            addIfMissing(components[src].outports, conn.from.port);
        }
    });

    function componentsFromExports(exports, inports) {
        Object.keys(exports).forEach(function (exportedName) {
            var internal = exports[exportedName];
            var comp = components[processComponents[internal.process]];
            var ports = (inports) ? comp.inports : comp.outports;
            addIfMissing(ports, internal.port);
        });
    }
    componentsFromExports(graph.inports, true);
    componentsFromExports(graph.outports, false);

    return components;
}

function removeAllChildren(n) {
    while (n.firstChild) {
        n.removeChild(n.firstChild);
    }
}

function renderGraph(graph, options) {
    if (!options.library) { options.library = libraryFromGraph(graph); } 
    if (!options.theme) { options.theme = 'the-graph-dark' };
    if (!options.width) { options.width = 1200; }
    if (!options.margin) { options.margin = 72; }

    // TODO support doing autolayout. Default to on if graph is missing x/y positions
    // TODO: Set zoom-level, width,height so that whole graph shows with all info 

    // fit based on width constrained (height near infinite)
    var fit = geometryutils.findFit(graph, options.width, options.width*100, options.margin);
    var aspectRatio = fit.graphWidth / fit.graphHeight;
    if (!options.height) {
        // calculate needed aspect ratio
        options.height = options.width / aspectRatio;
    }
    console.log('f', aspectRatio, options.height, JSON.stringify(fit));

    var props = {
        readonly: true,
        width: options.width,
        height: options.height,
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

    var element = React.createElement(TheGraphApp, props);
    ReactDOM.render(element, wrapper);

    var svgElement = wrapper.children[0];
    return svgElement;
}

module.exports = {
    graphToDOM: renderGraph,
    exportImage: renderImage,
    register: register,
};


