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

      // Hide self (overkill?)
      var contextEvent = new CustomEvent('the-graph-context-hide', { 
        detail: null, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    render: function() {
      var scale = this.props.node.props.app.state.scale;
      var ports = this.props.ports;
      var processKey = this.props.processKey;
      var deltaX = this.props.deltaX;
      var deltaY = this.props.deltaY;
      var inports, outports;

      // If there is a preview edge started, only show connectable ports
      var onlyShow;
      if (this.props.graphView.state.edgePreview) {
        onlyShow = this.props.graphView.state.edgePreview.isIn ? "out" : "in";
      }

      if (!onlyShow || onlyShow === "in") {
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
            ox: (inport.x - TheGraph.nodeSize/2) * scale + deltaX,
            oy: (inport.y - TheGraph.nodeSize/2) * scale + deltaY,
            x: -100,
            y: y,
            route: inport.route
          });
        });
      }

      if (!onlyShow || onlyShow === "out") {
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
            ox: (outport.x - TheGraph.nodeSize/2) * scale + deltaX,
            oy: (outport.y - TheGraph.nodeSize/2) * scale + deltaY,
            x: 100,
            y: y,
            route: outport.route
          });
        });
      }

      var children = [];
      if (onlyShow === "in") {
        children.push(
          React.DOM.g({
            className: "context-inports",
            children: inports
          })
        );
      } else if (onlyShow === "out") {
        children.push(
          React.DOM.g({
            className: "context-outports",
            children: outports
          })
        );
      } else {
        // Full context menu
        children = [
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
              className: "context-slice context-node-delete click",
              onMouseDown: this.stopPropagation,
              onClick: this.triggerRemove
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
            children: TheGraph.FONT_AWESOME[this.props.node.state.icon]
          })
        ];
      }

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