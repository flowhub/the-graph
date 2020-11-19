let clipboardContent = {}; // XXX: hidden state

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function makeNewId(label) {
  let num = 60466176; // 36^5
  num = Math.floor(Math.random() * num);
  const id = `${label}_${num.toString(36)}`;
  return id;
}

function copy(graph, keys) {
  // Duplicate all the nodes before putting them in clipboard
  // this will make this work also with cut/Paste and once we
  // decide if/how we will implement cross-document copy&paste will work there too
  clipboardContent = { nodes: [], edges: [] };
  const map = {};
  let i; let len;
  for (i = 0, len = keys.length; i < len; i += 1) {
    const node = graph.getNode(keys[i]);
    const newNode = cloneObject(node);
    newNode.id = makeNewId(node.component);
    clipboardContent.nodes.push(newNode);
    map[node.id] = newNode.id;
  }
  for (i = 0, len = graph.edges.length; i < len; i += 1) {
    const edge = graph.edges[i];
    const fromNode = edge.from.node;
    const toNode = edge.to.node;
    if (map[fromNode] && map[toNode]) {
      const newEdge = cloneObject(edge);
      newEdge.from.node = map[fromNode];
      newEdge.to.node = map[toNode];
      clipboardContent.edges.push(newEdge);
    }
  }
}

function paste(graph) {
  const map = {};
  const pasted = { nodes: [], edges: [] };
  let i; let
    len;
  for (i = 0, len = clipboardContent.nodes.length; i < len; i += 1) {
    const node = clipboardContent.nodes[i];
    const meta = cloneObject(node.metadata);
    meta.x += 36;
    meta.y += 36;
    const newNode = graph.addNode(makeNewId(node.component), node.component, meta);
    map[node.id] = newNode.id;
    pasted.nodes.push(newNode);
  }
  for (i = 0, len = clipboardContent.edges.length; i < len; i += 1) {
    const edge = clipboardContent.edges[i];
    const newEdgeMeta = cloneObject(edge.metadata);
    let newEdge;
    if (typeof edge.from.index === 'number' || typeof edge.to.index === 'number') {
      // One or both ports are addressable
      const fromIndex = edge.from.index || null;
      const toIndex = edge.to.index || null;
      newEdge = graph.addEdgeIndex(
        map[edge.from.node],
        edge.from.port,
        fromIndex,
        map[edge.to.node],
        edge.to.port,
        toIndex,
        newEdgeMeta,
      );
    } else {
      newEdge = graph.addEdge(
        map[edge.from.node],
        edge.from.port,
        map[edge.to.node],
        edge.to.port,
        newEdgeMeta,
      );
    }
    pasted.edges.push(newEdge);
  }
  return pasted;
}

module.exports = {
  copy,
  paste,
};
