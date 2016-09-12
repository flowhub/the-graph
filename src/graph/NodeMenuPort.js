import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {merge} from './utils'
import Config from './Config'
import {
  createNodeMenuBackgroundRect,
  createNodeMenuPortCircle,
  createNodeMenuPortGroup,
  createNodeMenuPortText
} from './factories/nodeMenuPort'

export default class TheGraphNodeMenuPort extends Component {
  componentDidMount () {
    findDOMNode(this).addEventListener("up", this.edgeStart);
  }

  edgeStart (event) {
    // Don't tap graph
    event.stopPropagation();

    var port = {
      process: this.props.processKey,
      port: this.props.label,
      type: this.props.port.type
    };

    var edgeStartEvent = new CustomEvent('the-graph-edge-start', {
      detail: {
        isIn: this.props.isIn,
        port: port,
        route: this.props.route
      },
      bubbles: true
    });
    findDOMNode(this).dispatchEvent(edgeStartEvent);
  }

  render () {
    var labelLen = this.props.label.length;
    var bgWidth = (labelLen>12 ? labelLen*8+40 : 120);
    // Highlight compatible port
    var highlightPort = this.props.highlightPort;
    var highlight = (highlightPort && highlightPort.isIn === this.props.isIn && highlightPort.type === this.props.port.type);

    var rectOptions = {
      className: "context-port-bg"+(highlight ? " highlight" : ""),
      x: this.props.x + (this.props.isIn ? -bgWidth : 0),
      y: this.props.y - Config.base.contextPortSize/2,
      width: bgWidth
    };

    rectOptions = merge(Config.nodeMenuPort.backgroundRect, rectOptions);
    var rect = createNodeMenuBackgroundRect.call(this, rectOptions);

    var circleOptions = {
      className: "context-port-hole stroke route"+this.props.route,
      cx: this.props.x,
      cy: this.props.y,
    };
    circleOptions = merge(Config.nodeMenuPort.circle, circleOptions);
    var circle = createNodeMenuPortCircle.call(this, circleOptions);

    var textOptions = {
      className: "context-port-label fill route"+this.props.route,
      x: this.props.x + (this.props.isIn ? -20 : 20),
      y: this.props.y,
      children: this.props.label.replace(/(.*)\/(.*)(_.*)\.(.*)/, '$2.$4')
    };

    textOptions = merge(Config.nodeMenuPort.text, textOptions);
    var text = createNodeMenuPortText.call(this, textOptions);

    var containerContents = [rect, circle, text];

    var containerOptions = merge(Config.nodeMenuPort.container, { className: "context-port click context-port-"+(this.props.isIn ? "in" : "out") });
    return createNodeMenuPortGroup.call(this, containerOptions, containerContents);

  }
}
