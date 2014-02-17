(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


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
        var ox = (port.x - TheGraph.nodeSize/2) * scale + deltaX;
        var oy = (port.y - TheGraph.nodeSize/2) * scale + deltaY;

        // Make path from graph port to menu port
        var line = React.DOM.path({
          className: "context-port-path",
          d: [ "M", ox, oy, "L", x, y ].join(" ")
        });

        var portView = TheGraph.NodeMenuPort({
          label: key,
          processKey: this.props.processKey,
          isIn: this.props.isIn,
          x: x,
          y: y,
          route: port.route
        });

        lines.push(line);
        portViews.push(portView);
      }

      var transform = "";
      if (this.props.translateX !== undefined) {
        transform = "translate("+this.props.translateX+","+this.props.translateY+")";
      }

      return (
        React.DOM.g(
          {
            className: "context-ports context-ports-"+(this.props.isIn ? "in" : "out"),
            transform: transform
          },
          React.DOM.g({
            className: "context-ports-lines",
            children: lines
          }),
          React.DOM.g({
            className: "context-ports-ports",
            children: portViews
          })
        )
      );
    }
  });


})(this);