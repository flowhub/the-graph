(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.NodeMenu = React.createClass({
    radius: 72,
    arcs: (function(){
      var angleToX = function (percent, radius) {
        return radius * Math.cos(2*Math.PI * percent);
      };
      var angleToY = function (percent, radius) {
        return radius * Math.sin(2*Math.PI * percent);
      };
      var makeArcPath = function (startPercent, endPercent, radius) {
        return [ 
          "M", angleToX(startPercent, radius), angleToY(startPercent, radius),
          "A", radius, radius, 0, 0, 0, angleToX(endPercent, radius), angleToY(endPercent, radius)
        ].join(" ");
      };
      return {
        label: makeArcPath(7/8, 5/8, 36),
        ins: makeArcPath(5/8, 3/8, 36),
        outs: makeArcPath(1/8, -1/8, 36),
        remove: makeArcPath(3/8, 1/8, 36)
      };
    })(),
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    triggerRemove: function (event) {
      this.props.graph.removeNode( this.props.processKey );

      // Hide self (overkill?)
      var contextEvent = new CustomEvent('the-graph-context-hide', { 
        detail: null, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    render: function() {

      var inports, outports;

      // HACK
      var scale = this.props.node.props.app.state.scale;

      var ports = this.props.ports;
      var processKey = this.props.processKey;

      var inkeys = Object.keys(ports.inports);
      var h = inkeys.length * TheGraph.contextPortSize;
      var i = 0;
      inports = inkeys.map( function (key) {
        var inport = ports.inports[key];
        var y = 0 - h/2 + i*TheGraph.contextPortSize + TheGraph.contextPortSize/2;
        i++;
        return TheGraph.PortMenu({
          label: key,
          processKey: processKey,
          isIn: true,
          ox: (inport.x - TheGraph.nodeSize/2) * scale,
          oy: (inport.y - TheGraph.nodeSize/2) * scale,
          x: -100,
          y: y
        });
      });

      var outkeys = Object.keys(ports.outports);
      h = outkeys.length * TheGraph.contextPortSize;
      i = 0;
      outports = outkeys.map( function (key) {
        var outport = ports.outports[key];
        var y = 0 - h/2 + i*TheGraph.contextPortSize + TheGraph.contextPortSize/2;
        i++;
        return TheGraph.PortMenu({
          label: key,
          processKey: processKey,
          isIn: false,
          ox: (outport.x - TheGraph.nodeSize/2) * scale,
          oy: (outport.y - TheGraph.nodeSize/2) * scale,
          x: 100,
          y: y
        });
      });

      return (
        React.DOM.g(
          {
            className: "context-node",
            transform: "translate("+this.props.x+","+this.props.y+")"
          },
          React.DOM.text({
            className: "context-node-label",
            x: 0,
            y: 0 - this.radius - 25,
            children: this.props.label
          }),
          React.DOM.g({
            className: "context-inports",
            children: inports
          }),
          React.DOM.g({
            className: "context-outports",
            children: outports
          }),
          React.DOM.path({
            className: "context-arc context-node-ins-bg",
            d: this.arcs.ins
          }),
          React.DOM.path({
            className: "context-arc context-node-outs-bg",
            d: this.arcs.outs
          }),
          React.DOM.g(
            {
              className: "context-slice context-node-info click"
              // onMouseDown: this.stopPropagation,
              // onClick: this.triggerRemove
            },
            React.DOM.path({
              className: "context-arc context-node-info-bg",
              d: this.arcs.label
            }),
            React.DOM.text({
              className: "icon context-icon context-node-info-icon",
              x: 0,
              y: -48,
              children: TheGraph.FONT_AWESOME["info-circle"]
            })
          ),
          React.DOM.g(
            {
              className: "context-slice context-node-delete click",
              onMouseDown: this.stopPropagation,
              onClick: this.triggerRemove
            },
            React.DOM.path({
              className: "context-arc context-node-delete-bg",
              d: this.arcs.remove
            }),
            React.DOM.text({
              className: "icon context-icon context-node-delete-icon",
              x: 0,
              y: 48,
              children: TheGraph.FONT_AWESOME["trash-o"]
            })
          ),
          React.DOM.path({
            className: "context-circle-x",
            d: "M -51 -51 L 51 51 M -51 51 L 51 -51"
          }),
          React.DOM.circle({
            className: "context-circle",
            r: this.radius
          }),
          React.DOM.rect({
            className: "context-node-rect",
            x: -24,
            y: -24,
            width: 48,
            height: 48,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius
          }),
          React.DOM.text({
            className: "icon context-node-icon",
            children: TheGraph.FONT_AWESOME[this.props.node.state.icon]
          })
        )
      );
    }
  });


})(this);