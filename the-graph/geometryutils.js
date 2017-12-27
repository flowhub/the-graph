var findMinMax = function (graph, nodes) {
  var inports, outports;
  if (nodes === undefined) {
    nodes = graph.nodes.map( function (node) {
      return node.id;
    });
    // Only look at exports when calculating the whole graph
    inports = graph.inports;
    outports = graph.outports;
  }
  if (nodes.length < 1) {
    return undefined;
  }
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;

  // Loop through nodes
  var len = nodes.length;
  for (var i=0; i<len; i++) {
    var key = nodes[i];
    var node = graph.getNode(key);
    if (!node || !node.metadata) {
      continue;
    }
    if (node.metadata.x < minX) { minX = node.metadata.x; }
    if (node.metadata.y < minY) { minY = node.metadata.y; }
    var x = node.metadata.x + node.metadata.width;
    var y = node.metadata.y + node.metadata.height;
    if (x > maxX) { maxX = x; }
    if (y > maxY) { maxY = y; }
  }
  // Loop through exports
  var keys, exp;
  if (inports) {
    keys = Object.keys(inports);
    len = keys.length;
    for (i=0; i<len; i++) {
      exp = inports[keys[i]];
      if (!exp.metadata) { continue; }
      if (exp.metadata.x < minX) { minX = exp.metadata.x; }
      if (exp.metadata.y < minY) { minY = exp.metadata.y; }
      if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
      if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
    }
  }
  if (outports) {
    keys = Object.keys(outports);
    len = keys.length;
    for (i=0; i<len; i++) {
      exp = outports[keys[i]];
      if (!exp.metadata) { continue; }
      if (exp.metadata.x < minX) { minX = exp.metadata.x; }
      if (exp.metadata.y < minY) { minY = exp.metadata.y; }
      if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
      if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
    }
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return null;
  }
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
};

var findFit = function (graph, width, height, sizeLimit) {
  var limits = findMinMax(graph);
  if (!limits) {
    return {x:0, y:0, scale:1};
  }
  limits.minX -= sizeLimit;
  limits.minY -= sizeLimit;
  limits.maxX += sizeLimit * 2;
  limits.maxY += sizeLimit * 2;

  var gWidth = limits.maxX - limits.minX;
  var gHeight = limits.maxY - limits.minY;

  var scaleX = width / gWidth;
  var scaleY = height / gHeight;

  var scale, x, y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
    y = 0 - limits.minY * scale;
  }

  return {
    x: x,
    y: y,
    scale: scale
  };
};

var findAreaFit = function (point1, point2, width, height, sizeLimit) {
  var limits = {
    minX: point1.x < point2.x ? point1.x : point2.x,
    minY: point1.y < point2.y ? point1.y : point2.y,
    maxX: point1.x > point2.x ? point1.x : point2.x,
    maxY: point1.y > point2.y ? point1.y : point2.y
  };

  limits.minX -= sizeLimit;
  limits.minY -= sizeLimit;
  limits.maxX += sizeLimit * 2;
  limits.maxY += sizeLimit * 2;

  var gWidth = limits.maxX - limits.minX;
  var gHeight = limits.maxY - limits.minY;

  var scaleX = width / gWidth;
  var scaleY = height / gHeight;

  var scale, x, y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
    y = 0 - limits.minY * scale;
  }

  return {
    x: x,
    y: y,
    scale: scale
  };
};

var findNodeFit = function (node, width, height, sizeLimit) {
  var limits = {
    minX: node.metadata.x - sizeLimit,
    minY: node.metadata.y - sizeLimit,
    maxX: node.metadata.x + sizeLimit * 2,
    maxY: node.metadata.y + sizeLimit * 2
  };

  var gWidth = limits.maxX - limits.minX;
  var gHeight = limits.maxY - limits.minY;

  var scaleX = width / gWidth;
  var scaleY = height / gHeight;

  var scale, x, y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
    y = 0 - limits.minY * scale;
  }

  return {
    x: x,
    y: y,
    scale: scale
  };
};

module.exports = {
  findMinMax: findMinMax,
  findNodeFit: findNodeFit,
  findFit: findFit,
};
