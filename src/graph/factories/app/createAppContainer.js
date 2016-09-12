import {div} from 'react-dom'

// No need to promote DIV creation to TheGraph.js.
export default function createAppContainer(options, content) {
  var args = [options];

  if (Array.isArray(content)) {
    args = args.concat(content);
  }

  return div.apply(div, args);
}
