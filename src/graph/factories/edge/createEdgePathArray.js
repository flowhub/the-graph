export default function createEdgePathArray(sourceX, sourceY, c1X, c1Y, c2X, c2Y, targetX, targetY) {
  return [
    'M',
    sourceX, sourceY,
    'C',
    c1X, c1Y,
    c2X, c2Y,
    targetX, targetY
  ];
}
