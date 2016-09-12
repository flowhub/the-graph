const defaultNodeSize = 72;
const defaultNodeRadius = 8;

// Dumb module setup
export default {
  // nodeSize and nodeRadius are deprecated, use TheGraph.config.(nodeSize/nodeRadius)
  nodeSize: defaultNodeSize,
  nodeRadius: defaultNodeRadius,
  nodeSide: 56,
  // Context menus
  contextPortSize: 36,
  // Zoom breakpoints
  zbpBig: 1.2,
  zbpNormal: 0.4,
  zbpSmall: 0.01,
  config: {
    nodeSize: defaultNodeSize,
    nodeWidth: defaultNodeSize,
    nodeRadius: defaultNodeRadius,
    nodeHeight: defaultNodeSize,
    autoSizeNode: true,
    maxPortCount: 9,
    nodeHeightIncrement: 12,
    focusAnimationDuration: 1500
  },
  factories: {}
};
