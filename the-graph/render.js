const React = require('react');
const ReactDOM = require('react-dom');

const geometryutils = require('./geometryutils.js');
// var TheGraphApp = require('./the-graph-app.js');

// XXX: hack, goes away when the-graph-app.js can be CommonJS loaded
let TheGraphApp = null;
function register(context) {
  TheGraphApp = context.TheGraph.App;
}

function applyStyleManual(element) {
  const style = getComputedStyle(element);
  const transferToAttribute = [

  ];
  const transferToStyle = [
    'fill',
    'stroke',
    'stroke-width',
    'opacity',
    'text-anchor',
    'font-size',
    'visibility',
  ];

  transferToAttribute.forEach((name) => {
    const s = style.getPropertyValue(name);
    if (s) {
      element.setAttribute(name, s);
    }
  });
  transferToStyle.forEach((name) => {
    const s = style.getPropertyValue(name);
    if (s) {
      element.style[name] = s;
    }
  });
}

// FIXME: icons are broken
function applyStyle(tree) {
  const all = tree.getElementsByTagName('*');
  for (let i = 0; i < all.length; i += 1) {
    applyStyleManual(all[i]);
  }
  return tree;
}

function renderImage(graphElement, options, callback) {
  if (!options) { options = {}; }
  if (!options.format) { options.format = 'png'; }
  if (typeof options.background === 'undefined') { options.background = true; }
  if (typeof options.quality === 'undefined') { options.quality = 0.9; }

  const svgNode = graphElement.getElementsByTagName('svg')[0];
  const bgCanvas = graphElement.getElementsByTagName('canvas')[0];
  if (svgNode.tagName.toLowerCase() !== 'svg') {
    callback(new Error(`renderImage input must be SVG, got ${svgNode.tagName}`));
    return;
  }

  // FIXME: make copy
  // svgNode = svgNode.cloneNode(true, true);

  // Note: alternative to inlining style is to inject the CSS file into SVG file?
  // https://stackoverflow.com/questions/18434094/how-to-style-svg-with-external-css
  const withStyle = applyStyle(svgNode);

  // TODO: include background in SVG file
  // not that easy thougj, https://stackoverflow.com/questions/11293026/default-background-color-of-svg-root-element
  const serializer = new XMLSerializer();
  const svgData = serializer.serializeToString(withStyle);

  if (options.format === 'svg') {
    callback(null, svgData);
    return;
  }

  const DOMURL = window.URL || window.webkitURL || window;

  const img = new Image();
  const svg = new Blob([svgData], { type: 'image/svg+xml' });
  const svgUrl = DOMURL.createObjectURL(svg);

  const canvas = document.createElement('canvas');
  canvas.width = svgNode.getAttribute('width');
  canvas.height = svgNode.getAttribute('height');

  // TODO: allow resizing?
  const ctx = canvas.getContext('2d');

  if (options.background) {
    const bgColor = getComputedStyle(graphElement)['background-color'];
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvas, 0, 0);
  }

  img.onerror = (err) => {
    callback(err);
  };
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(svgUrl);
    const out = canvas.toDataURL(`image/${options.format}`, options.quality);
    callback(null, out);
  };
  img.src = svgUrl;
}

function libraryFromGraph(graph) {
  const components = {};
  const processComponents = {};

  graph.nodes.forEach((process) => {
    const name = process.component;
    processComponents[process.id] = name;
    components[name] = {
      name,
      description: name,
      icon: null,
      inports: [],
      outports: [],
    };
  });

  function addIfMissing(ports, name) {
    const found = ports.filter((p) => p.name === name);
    if (found.length === 0) {
      ports.push({ name, type: 'all' });
    }
  }

  graph.edges.forEach((conn) => {
    const tgt = processComponents[conn.to.node];
    addIfMissing(components[tgt].inports, conn.to.port);
    if (conn.from) {
      const src = processComponents[conn.from.node];
      addIfMissing(components[src].outports, conn.from.port);
    }
  });

  function componentsFromExports(exports, inports) {
    Object.keys(exports).forEach((exportedName) => {
      const internal = exports[exportedName];
      const comp = components[processComponents[internal.process]];
      const ports = (inports) ? comp.inports : comp.outports;
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
  if (!options.theme) { options.theme = 'the-graph-dark'; }
  if (!options.width) { options.width = 1200; }
  if (!options.margin) { options.margin = 72; }

  // TODO support doing autolayout. Default to on if graph is missing x/y positions
  // TODO: Set zoom-level, width,height so that whole graph shows with all info

  // fit based on width constrained (height near infinite)
  const fit = geometryutils.findFit(graph, options.width, options.width * 100, options.margin);
  const aspectRatio = fit.graphWidth / fit.graphHeight;
  if (!options.height) {
    // calculate needed aspect ratio
    options.height = options.width / aspectRatio;
  }
  console.log('f', aspectRatio, options.height, JSON.stringify(fit));

  const props = {
    readonly: true,
    width: options.width,
    height: options.height,
    graph,
    library: options.library,
  };
    // console.log('render', props);

  const wrapper = document.createElement('div');
  wrapper.className = options.theme;
  wrapper.width = props.width;
  wrapper.height = props.height;

  // FIXME: find a less intrusive way
  const container = document.body;
  removeAllChildren(container);
  container.appendChild(wrapper);

  const element = React.createElement(TheGraphApp, props);
  ReactDOM.render(element, wrapper);

  const svgElement = wrapper.children[0];
  return svgElement;
}

module.exports = {
  graphToDOM: renderGraph,
  exportImage: renderImage,
  register,
};
