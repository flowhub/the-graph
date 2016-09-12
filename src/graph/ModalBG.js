import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {merge} from './utils'
import Config from './Config'
import {
  createModalBackgroundGroup,
  createModalBackgroundRect
} from './factories/modalBG'

export default class TheGraphModalBG extends Component {
  componentDidMount () {
    var domNode = findDOMNode(this);
    var rectNode = this.refs.rect;

    // Right-click on another item will show its menu
    domNode.addEventListener("down", function (event) {
      // Only if outside of menu
      if (event && event.target===rectNode) {
        this.hideModal();
      }
    }.bind(this));
  }

  hideModal (/* event */) {
    this.props.triggerHideContext();
  }

  render () {
    var rectOptions = {
      width: this.props.width,
      height: this.props.height
    };

    rectOptions = merge(Config.modalBG.rect, rectOptions);
    var rect = createModalBackgroundRect.call(this, rectOptions);

    var containerContents = [rect, this.props.children];
    var containerOptions = merge(Config.modalBG.container, {});
    return createModalBackgroundGroup.call(this, containerOptions, containerContents);
  }
};
