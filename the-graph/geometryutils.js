function findMinMax(graph, nodes) {
  let inports; let
    outports;
  if (nodes === undefined) {
    nodes = graph.nodes.map((node) => node.id);
    // Only look at exports when calculating the whole graph
    inports = graph.inports;
    outports = graph.outports;
  }
  if (nodes.length < 1) {
    return undefined;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Loop through nodes
  let len = nodes.length;
  for (let i = 0; i < len; i += 1) {
    const key = nodes[i];
    const node = graph.getNode(key);
    if (node && node.metadata) {
      if (node.metadata.x < minX) { minX = node.metadata.x; }
      if (node.metadata.y < minY) { minY = node.metadata.y; }
      const x = node.metadata.x + node.metadata.width;
      const y = node.metadata.y + node.metadata.height;
      if (x > maxX) { maxX = x; }
      if (y > maxY) { maxY = y; }
    }
  }
  // Loop through exports
  let keys; let
    exp;
  if (inports) {
    keys = Object.keys(inports);
    len = keys.length;
    for (let i = 0; i < len; i += 1) {
      exp = inports[keys[i]];
      if (exp.metadata) {
        if (exp.metadata.x < minX) { minX = exp.metadata.x; }
        if (exp.metadata.y < minY) { minY = exp.metadata.y; }
        if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
        if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
      }
    }
  }
  if (outports) {
    keys = Object.keys(outports);
    len = keys.length;
    for (let i = 0; i < len; i += 1) {
      exp = outports[keys[i]];
      if (exp.metadata) {
        if (exp.metadata.x < minX) { minX = exp.metadata.x; }
        if (exp.metadata.y < minY) { minY = exp.metadata.y; }
        if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
        if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
      }
    }
  }

  if (!Number.isFinite(minX)
    || !Number.isFinite(minY)
    || !Number.isFinite(maxX)
    || !Number.isFinite(maxY)) {
    return null;
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

function findFit(graph, width, height, sizeLimit) {
  const limits = findMinMax(graph);
  if (!limits) {
    return { x: 0, y: 0, scale: 1 };
  }
  limits.minX -= sizeLimit;
  limits.minY -= sizeLimit;
  limits.maxX += sizeLimit * 2;
  limits.maxY += sizeLimit * 2;

  const gWidth = limits.maxX - limits.minX;
  const gHeight = limits.maxY - limits.minY;

  const scaleX = width / gWidth;
  const scaleY = height / gHeight;

  let scale; let x; let
    y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height - (gHeight * scale)) / 2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width - (gWidth * scale)) / 2;
    y = 0 - limits.minY * scale;
  }

  return {
    x,
    y,
    scale,
    graphWidth: gWidth,
    graphHeight: gHeight,
  };
}

function findAreaFit(point1, point2, width, height, sizeLimit) {
  const limits = {
    minX: point1.x < point2.x ? point1.x : point2.x,
    minY: point1.y < point2.y ? point1.y : point2.y,
    maxX: point1.x > point2.x ? point1.x : point2.x,
    maxY: point1.y > point2.y ? point1.y : point2.y,
  };

  limits.minX -= sizeLimit;
  limits.minY -= sizeLimit;
  limits.maxX += sizeLimit * 2;
  limits.maxY += sizeLimit * 2;

  const gWidth = limits.maxX - limits.minX;
  const gHeight = limits.maxY - limits.minY;

  const scaleX = width / gWidth;
  const scaleY = height / gHeight;

  let scale; let x; let
    y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height - (gHeight * scale)) / 2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width - (gWidth * scale)) / 2;
    y = 0 - limits.minY * scale;
  }

  return {
    x,
    y,
    scale,
  };
}

function findNodeFit(node, width, height, sizeLimit) {
  const limits = {
    minX: node.metadata.x - sizeLimit,
    minY: node.metadata.y - sizeLimit,
    maxX: node.metadata.x + sizeLimit * 2,
    maxY: node.metadata.y + sizeLimit * 2,
  };

  const gWidth = limits.maxX - limits.minX;
  const gHeight = limits.maxY - limits.minY;

  const scaleX = width / gWidth;
  const scaleY = height / gHeight;

  let scale; let x; let
    y;
  if (scaleX < scaleY) {
    scale = scaleX;
    x = 0 - limits.minX * scale;
    y = 0 - limits.minY * scale + (height - (gHeight * scale)) / 2;
  } else {
    scale = scaleY;
    x = 0 - limits.minX * scale + (width - (gWidth * scale)) / 2;
    y = 0 - limits.minY * scale;
  }

  return {
    x,
    y,
    scale,
  };
}

module.exports = {
  findMinMax,
  findNodeFit,
  findAreaFit,
  findFit,
};
