(function (){
"use strict";

if (window.theGraph) {
  return window.theGraph;
}

var theGraph = {};
window.theGraph = theGraph;

theGraph.nodeWidth  = 72;
theGraph.nodeHeight = 72;
theGraph.gridSize   = 72;


theGraph.origin = function (el, x, y) {
  var origin = x+"px "+y+"px";
  
  // TODO prefix test
  el.style.webkitTransformOrigin = origin;
  el.style.MozTransformOrigin = origin;
  el.style.msTransformOrigin = origin;
  el.style.OTransformOrigin = origin;
  el.style.transformOrigin = origin;
  return el;
};

theGraph.transform = function (el, x, y, scale) {
  if (scale === undefined) { scale = 1; }
  x = Math.round(x);
  y = Math.round(y);
  var move = "translate3d("+x+"px,"+y+"px,0px) scale("+scale+")";
  // var move = "translate("+x+"px,"+y+"px) scale("+scale+")";
  
  // TODO prefix test
  el.style.webkitTransform = move;
  el.style.MozTransform = move;
  el.style.msTransform = move;
  el.style.OTransform = move;
  el.style.transform = move;
  return el;
};

theGraph.transformOrigin = function (el, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  var origin = x+"px "+y+"px";
  
  // TODO prefix test
  el.style.webkitTransformOrigin = origin;
  el.style.MozTransformOrigin = origin;
  el.style.msTransformOrigin = origin;
  el.style.OTransformOrigin = origin;
  el.style.transformOrigin = origin;
  return el;
};

theGraph.clip = function (num, min, max) {
  return Math.max(Math.min(num, max), min);
};


})();