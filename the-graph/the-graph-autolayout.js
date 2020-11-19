// NOTE: caller should wrap in a graph transaction, to group all changes made to @graph
function applyAutolayout(graph, keilerGraph, props) {
  console.error('DEPRECATED: TheGraph.autolayout.applyAutolayout() will be removed in next version');

  // Update original graph nodes with the new coordinates from KIELER graph
  const children = keilerGraph.children.slice();

  let i; let
    len;
  for (i = 0, len = children.length; i < len; i++) {
    const klayNode = children[i];
    const fbpNode = graph.getNode(klayNode.id);

    // Encode nodes inside groups
    if (klayNode.children) {
      const klayChildren = klayNode.children;
      var idx;
      for (idx in klayChildren) {
        const klayChild = klayChildren[idx];
        if (klayChild.id) {
          graph.setNodeMetadata(klayChild.id, {
            x: Math.round((klayNode.x + klayChild.x) / props.snap) * props.snap,
            y: Math.round((klayNode.y + klayChild.y) / props.snap) * props.snap,
          });
        }
      }
    }

    // Encode nodes outside groups
    if (fbpNode) {
      graph.setNodeMetadata(klayNode.id, {
        x: Math.round(klayNode.x / props.snap) * props.snap,
        y: Math.round(klayNode.y / props.snap) * props.snap,
      });
    } else {
      // Find inport or outport
      const idSplit = klayNode.id.split(':::');
      const expDirection = idSplit[0];
      const expKey = idSplit[1];
      if (expDirection === 'inport' && graph.inports[expKey]) {
        graph.setInportMetadata(expKey, {
          x: Math.round(klayNode.x / props.snap) * props.snap,
          y: Math.round(klayNode.y / props.snap) * props.snap,
        });
      } else if (expDirection === 'outport' && graph.outports[expKey]) {
        graph.setOutportMetadata(expKey, {
          x: Math.round(klayNode.x / props.snap) * props.snap,
          y: Math.round(klayNode.y / props.snap) * props.snap,
        });
      }
    }
  }
}

module.exports = {
  applyToGraph: applyAutolayout,
};
