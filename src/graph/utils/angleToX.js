// SVG arc math
export default function angleToX (percent, radius) {
  return radius * Math.cos(2*Math.PI * percent);
};
