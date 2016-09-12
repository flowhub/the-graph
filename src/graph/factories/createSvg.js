import {svg} from 'react-dom'

export default function createSvg (options, content) {
  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return svg.apply(svg, args);
};
