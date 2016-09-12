import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {merge} from './utils'
import Config from './Config'
import {
  createNodeMenuPortsGroup,
  createNodeMenuPortsLinesGroup,
  createNodeMenuPortsNodeMenuPort,
  createNodeMenuPortsPortPath
} from './factories/nodeMenuPorts'

export default class TheGraphNodeMenuPorts extends Component {
  render () {
    var portViews = [];
    var lines = [];

    var scale = this.props.scale;
    var ports = this.props.ports;
    var deltaX = this.props.deltaX;
    var deltaY = this.props.deltaY;

    var keys = Object.keys(this.props.ports);
    var h = keys.length * Config.base.contextPortSize;
    var len = keys.length;
    for (var i=0; i<len; i++) {
      var key = keys[i];
      var port = ports[key];

      var x = (this.props.isIn ? -100 : 100);
      var y = 0 - h / 2 + i * Config.base.contextPortSize + Config.base.contextPortSize / 2;
      var ox = (port.x - this.props.nodeWidth/2) * scale + deltaX;
      var oy = (port.y - this.props.nodeHeight/2) * scale + deltaY;

      // Make path from graph port to menu port
      var lineOptions = merge(Config.nodeMenuPorts.portPath, { d: [ "M", ox, oy, "L", x, y ].join(" ") });
      var line = createNodeMenuPortsPortPath.call(this, lineOptions);

      var portViewOptions = {
        label: key,
        port: port,
        processKey: this.props.processKey,
        isIn: this.props.isIn,
        x: x,
        y: y,
        route: port.route,
        highlightPort: this.props.highlightPort
      };
      portViewOptions = merge(Config.nodeMenuPorts.nodeMenuPort, portViewOptions);
      var portView = createNodeMenuPortsNodeMenuPort.call(this, portViewOptions);

      lines.push(line);
      portViews.push(portView);
    }

    var transform = "";
    if (this.props.translateX !== undefined) {
      transform = "translate("+this.props.translateX+","+this.props.translateY+")";
    }

    var linesGroupOptions = merge(Config.nodeMenuPorts.linesGroup, { children: lines });
    var linesGroup = createNodeMenuPortsLinesGroup.call(this, linesGroupOptions);

    var portsGroupOptions = merge(Config.nodeMenuPorts.portsGroup, { children: portViews });
    var portsGroup = createNodeMenuPortsGroup.call(this, portsGroupOptions);

    var containerContents = [linesGroup, portsGroup];
    var containerOptions = {
      className: "context-ports context-ports-"+(this.props.isIn ? "in" : "out"),
      transform: transform
    };
    containerOptions = merge(Config.nodeMenuPorts.container, containerOptions);
    return createNodeMenuPortsGroup.call(this, containerOptions, containerContents);
  }
}
