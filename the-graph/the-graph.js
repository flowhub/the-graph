
module.exports.register = function (context) {

  var defaultNodeSize = 72;
  var defaultNodeRadius = 8;

  var TheGraph = context.TheGraph;

  var moduleVars = {
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
  };
  for (var key in moduleVars) {
    TheGraph[key] = moduleVars[key];
  }

  if (typeof window !== 'undefined') {
    // rAF shim
    window.requestAnimationFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame;
  }

};
