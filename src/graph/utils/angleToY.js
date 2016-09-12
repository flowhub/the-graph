export default function angleToY (percent, radius) {
  return radius * Math.sin(2*Math.PI * percent);
};
