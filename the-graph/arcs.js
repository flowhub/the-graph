// SVG arc math
const angleToX = function (percent, radius) {
  return radius * Math.cos(2 * Math.PI * percent);
};
const angleToY = function (percent, radius) {
  return radius * Math.sin(2 * Math.PI * percent);
};
const makeArcPath = function (startPercent, endPercent, radius) {
  return [
    'M', angleToX(startPercent, radius), angleToY(startPercent, radius),
    'A', radius, radius, 0, 0, 0, angleToX(endPercent, radius), angleToY(endPercent, radius),
  ].join(' ');
};
const arcs = {
  n4: makeArcPath(7 / 8, 5 / 8, 36),
  s4: makeArcPath(3 / 8, 1 / 8, 36),
  e4: makeArcPath(1 / 8, -1 / 8, 36),
  w4: makeArcPath(5 / 8, 3 / 8, 36),
  inport: makeArcPath(-1 / 4, 1 / 4, 4),
  outport: makeArcPath(1 / 4, -1 / 4, 4),
  inportBig: makeArcPath(-1 / 4, 1 / 4, 6),
  outportBig: makeArcPath(1 / 4, -1 / 4, 6),
};
module.exports = arcs;
