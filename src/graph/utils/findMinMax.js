export default function findMinMax (graph, nodes) {
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
