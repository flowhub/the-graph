const React = require('react');

const SVGImage = require('./SVGImage');

// Standard functions for creating SVG/HTML elements
exports.createGroup = function (options, content) {
  let args = ['g', options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return React.createElement.apply(React, args);
};

exports.createRect = function (options) {
  return React.createElement('rect', options);
};

exports.createText = function (options) {
  return React.createElement('text', options);
};

exports.createCircle = function (options) {
  return React.createElement('circle', options);
};

exports.createPath = function (options) {
  return React.createElement('path', options);
};

exports.createPolygon = function (options) {
  return React.createElement('polygon', options);
};

exports.createImg = function (options) {
  return SVGImage(options);
};

exports.createCanvas = function (options) {
  return React.createElement('canvas', options);
};

exports.createSvg = function (options, content) {
  let args = ['svg', options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return React.createElement.apply(React, args);
};
