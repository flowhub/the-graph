(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.NodeMenu = React.createClass({
    radius: 72,
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    triggerRemove: function (event) {
      this.props.graph.removeNode( this.props.processKey );
    },
    componentDidMount: function () {
      this.refs.south.getDOMNode().addEventListener("tap", this.triggerRemove);
    },
    render: function() {
      var scale = this.props.node.props.app.state.scale;
      var ports = this.props.ports;
      var processKey = this.props.processKey;
      var deltaX = this.props.deltaX;
      var deltaY = this.props.deltaY;

      var children = [
        React.DOM.text({
          className: "context-node-label",
          x: 0,
          y: 0 - this.radius - 25,
          children: this.props.label
        }),
        TheGraph.NodeMenuPorts({
          ports: ports.inports,
          isIn: true,
          scale: scale,
          processKey: processKey,
          deltaX: deltaX,
          deltaY: deltaY
        }),
        TheGraph.NodeMenuPorts({
          ports: ports.outports,
          isIn: false,
          scale: scale,
          processKey: processKey,
          deltaX: deltaX,
          deltaY: deltaY
        }),
        React.DOM.path({
          className: "context-arc context-node-ins-bg",
          d: TheGraph.arcs.w4
        }),
        React.DOM.path({
          className: "context-arc context-node-outs-bg",
          d: TheGraph.arcs.e4
        }),
        React.DOM.g(
          {
            className: "context-slice context-node-info click"
          },
          React.DOM.path({
            className: "context-arc context-node-info-bg",
            d: TheGraph.arcs.n4
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
            ref: "south",
            className: "context-slice context-node-delete click"
          },
          React.DOM.path({
            className: "context-arc context-node-delete-bg",
            d: TheGraph.arcs.s4
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
          children: TheGraph.FONT_AWESOME[this.props.icon]
        })
      ];

      return (
        React.DOM.g(
          {
            className: "context-node",
            transform: "translate("+this.props.x+","+this.props.y+")",
            children: children
          }
        )
      );
    }
  });


})(this);