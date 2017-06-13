// Standard functions for creating SVG/HTML elements
exports.createGroup = function(options, content) {
  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return React.DOM.g.apply(React.DOM.g, args);
};

exports.createRect = function(options) {
  return React.DOM.rect(options);
};

exports.createText = function(options) {
  return React.DOM.text(options);
};

exports.createCircle = function(options) {
  return React.DOM.circle(options);
};

exports.createPath = function(options) {
  return React.DOM.path(options);
};

exports.createPolygon = function(options) {
  return React.DOM.polygon(options);
};

exports.createImg = function(options) {
  return TheGraph.SVGImage(options);
};

exports.createCanvas = function(options) {
  return React.DOM.canvas(options);
};

exports.createSvg = function(options, content) {

  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return React.DOM.svg.apply(React.DOM.svg, args);
};
