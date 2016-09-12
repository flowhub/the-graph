import React, {Component} from 'react'
import {merge} from './utils'
import Config from './Config'
import {
  createIIPPath,
createIIPText,
createIIPContainer
} from './factories/iip'
// Edge view

export default class TheGraphIIP extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    // Only rerender if changed

    return (
      nextProps.x !== this.props.x ||
      nextProps.y !== this.props.y ||
      nextProps.label !== this.props.label
    );
  }

  render () {
    var x = this.props.x;
    var y = this.props.y;

    var path = [
      "M", x, y,
      "L", x-10, y
    ].join(" ");

    // Make a string
    var label = this.props.label+"";
    // TODO make this smarter with ZUI
    if (label.length > 12) {
      label = label.slice(0, 9) + "...";
    }

    var pathOptions = merge(Config.iip.path, {d: path});
    var iipPath = createIIPPath.call(this, pathOptions);

    var textOptions = merge(Config.iip.text, {x: x - 10, y: y, text: label});
    var text = createIIPText.call(this, textOptions);

    var containerContents = [iipPath, text];

    var containerOptions = merge(Config.iip.container, {title: this.props.label});
    return createIIPContainer.call(this, containerOptions, containerContents);
  }
}
