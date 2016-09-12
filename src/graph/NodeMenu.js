import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {merge} from './utils'
import Config from './Config'
import {
  createNodeMenuGroup,
  createNodeMenuInports,
  createNodeMenuMenu,
  createNodeMenuOutports
} from './factories/nodeMenu'

export default class TheGraphNodeMenu extends Component {
  radius = 72

  stopPropagation (event) {
    // Don't drag graph
    event.stopPropagation();
  }

  componentDidMount () {
    // Prevent context menu
    findDOMNode(this).addEventListener("contextmenu", function (event) {
      event.stopPropagation();
      event.preventDefault();
    }, false);
  }

  render () {
    var scale = this.props.node.props.app.state.scale;
    var ports = this.props.ports;
    var deltaX = this.props.deltaX;
    var deltaY = this.props.deltaY;

    var inportsOptions = {
      ports: ports.inports,
      isIn: true,
      scale: scale,
      processKey: this.props.processKey,
      deltaX: deltaX,
      deltaY: deltaY,
      nodeWidth: this.props.nodeWidth,
      nodeHeight: this.props.nodeHeight,
      highlightPort: this.props.highlightPort
    };

    inportsOptions = merge(Config.nodeMenu.inports, inportsOptions);
    var inports = createNodeMenuInports.call(this, inportsOptions);

    var outportsOptions = {
      ports: ports.outports,
      isIn: false,
      scale: scale,
      processKey: this.props.processKey,
      deltaX: deltaX,
      deltaY: deltaY,
      nodeWidth: this.props.nodeWidth,
      nodeHeight: this.props.nodeHeight,
      highlightPort: this.props.highlightPort
    };

    outportsOptions = merge(Config.nodeMenu.outports, outportsOptions);
    var outports = createNodeMenuOutports.call(this, outportsOptions);

    var menuOptions = {
      menu: this.props.menu,
      options: this.props.options,
      triggerHideContext: this.props.triggerHideContext,
      icon: this.props.icon,
      label: this.props.label
    };

    menuOptions = merge(Config.nodeMenu.menu, menuOptions);
    var menu = createNodeMenuMenu.call(this, menuOptions);

    var children = [
      inports, outports, menu
    ];

    var containerOptions = {
      transform: "translate("+this.props.x+","+this.props.y+")",
      children: children
    };
    containerOptions = merge(Config.nodeMenu.container, containerOptions);
    return createNodeMenuGroup.call(this, containerOptions);

  }
}
