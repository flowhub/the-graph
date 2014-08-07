(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  var config = TheGraph.config.nodeMenuPorts = {
    container: {},
    linesGroup: {
      className: "context-ports-lines"
    },
    portsGroup: {
      className: "context-ports-ports"
    },
    portPath: {
      className: "context-port-path"
    },
    nodeMenuPort: {}
  };

  var factories = TheGraph.factories.menuPorts = {
    createNodeMenuPortsGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsLinesGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsPortsGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsPortPath: TheGraph.factories.createPath,
    createNodeMenuPortsNodeMenuPort: createNodeMenuPort
  };

  function createNodeMenuPort(options) {
    return TheGraph.NodeMenuPort(options);
  }

  TheGraph.NodeMenuPorts = React.createClass({
    render: function() {
      var portViews = [];
      var lines = [];

      var scale = this.props.scale;
      var ports = this.props.ports;
      var deltaX = this.props.deltaX;
      var deltaY = this.props.deltaY;

      var keys = Object.keys(this.props.ports);
      var h = keys.length * TheGraph.contextPortSize;
      var len = keys.length;
      for (var i=0; i<len; i++) {
        var key = keys[i];
        var port = ports[key];

        var x = (this.props.isIn ? -100 : 100);
        var y = 0 - h/2 + i*TheGraph.contextPortSize + TheGraph.contextPortSize/2;
        var ox = (port.x - this.props.nodeWidth/2) * scale + deltaX;
        var oy = (port.y - this.props.nodeHeight/2) * scale + deltaY;

        // Make path from graph port to menu port
        var lineOptions = TheGraph.merge(config.portPath, { d: [ "M", ox, oy, "L", x, y ].join(" ") });
        var line = factories.createNodeMenuPortsPortPath.call(this, lineOptions);

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
        portViewOptions = TheGraph.merge(config.nodeMenuPort, portViewOptions);
        var portView = factories.createNodeMenuPortsNodeMenuPort.call(this, portViewOptions);

        lines.push(line);
        portViews.push(portView);
      }

      var transform = "";
      if (this.props.translateX !== undefined) {
        transform = "translate("+this.props.translateX+","+this.props.translateY+")";
      }

      var linesGroupOptions = TheGraph.merge(config.linesGroup, { children: lines });
      var linesGroup = factories.createNodeMenuPortsLinesGroup.call(this, linesGroupOptions);

      var portsGroupOptions = TheGraph.merge(config.portsGroup, { children: portViews });
      var portsGroup = factories.createNodeMenuPortsGroup.call(this, portsGroupOptions);

      var containerContents = [linesGroup, portsGroup];
      var containerOptions = {
        className: "context-ports context-ports-"+(this.props.isIn ? "in" : "out"),
        transform: transform
      };
      containerOptions = TheGraph.merge(config.container, containerOptions);
      return factories.createNodeMenuPortsGroup.call(this, containerOptions, containerContents);
    }
  });


})(this);