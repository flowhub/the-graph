// Point along cubic bezier curve
// See http://en.wikipedia.org/wiki/File:Bezier_3_big.gif
export default function findPointOnCubicBezier (p, sx, sy, c1x, c1y, c2x, c2y, ex, ey) {
  // p is percentage from 0 to 1
  var op = 1 - p;
  // 3 green points between 4 points that define curve
  var g1x = sx * p + c1x * op;
  var g1y = sy * p + c1y * op;
  var g2x = c1x * p + c2x * op;
  var g2y = c1y * p + c2y * op;
  var g3x = c2x * p + ex * op;
  var g3y = c2y * p + ey * op;
  // 2 blue points between green points
  var b1x = g1x * p + g2x * op;
  var b1y = g1y * p + g2y * op;
  var b2x = g2x * p + g3x * op;
  var b2y = g2y * p + g3y * op;
  // Point on the curve between blue points
  var x = b1x * p + b2x * op;
  var y = b1y * p + b2y * op;
  return [x, y];
};
