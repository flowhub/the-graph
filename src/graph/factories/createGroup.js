import {g} from 'react-dom'

export default function createGroup (options, content) {
  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return g.apply(g, args);
};
