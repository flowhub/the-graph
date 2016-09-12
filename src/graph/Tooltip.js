import React, {Component} from 'react'
import {merge} from './utils'
import Config from './Config'
import {
  createTooltipGroup,
  createTooltipRect,
  createTooltipText
} from './factories/tooltip'

// Port view
export default class TheGraphTooltip extends Component {
  render () {
    var rectOptions = merge(Config.tooltip.rect, {width: this.props.label.length * 6});
    var rect = createTooltipRect.call(this, rectOptions);

    var textOptions = merge(Config.tooltip.text, { children: this.props.label });
    var text = createTooltipText.call(this, textOptions);

    var containerContents = [rect, text];

    var containerOptions = {
      className: 'tooltip' + (this.props.visible ? '' : ' hidden'),
      transform: 'translate('+this.props.x+','+this.props.y+')',
    };
    containerOptions = merge(Config.tooltip.container, containerOptions);
    return createTooltipGroup.call(this, containerOptions, containerContents);

  }
}
