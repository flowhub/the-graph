(function (){

var util = {};
window.theGraph = util;

util.transform = function (el, x, y, scale) {
  if (scale === undefined) { scale = 1; }
  x = Math.round(x);
  y = Math.round(y);
  var move = "translate3d("+x+"px,"+y+"px,0px) scale("+scale+")";
  
  // TODO prefix test
  el.style.webkitTransform = move;
  el.style.MozTransform = move;
  el.style.msTransform = move;
  el.style.OTransform = move;
  el.style.transform = move;
  return el;
};

// util.debounce = function(func, wait, immediate) {
//   var timeout;
//   return function() {
//     var context = this, args = arguments;
//     var later = function() {
//       timeout = null;
//       if (!immediate) func.apply(context, args);
//     };
//     var callNow = immediate && !timeout;
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//     if (callNow) func.apply(context, args);
//   };
// };

})();