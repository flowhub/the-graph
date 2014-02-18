(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.ExportMenu = React.createClass({
    radius: 72,
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    triggerRemove: function (event) {
      // TODO in/out ambiguity
      if (this.props.isIn) {
        this.props.graph.removeInport( this.props.exportKey );
      } else {
        this.props.graph.removeOutport( this.props.exportKey );
      }

      // Hide self
      var contextEvent = new CustomEvent('the-graph-context-hide', { 
        detail: null, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    render: function() {
      var exp = this.props.export;

      var labelOut = (this.props.isIn ? this.props.exportKey : exp.process+"."+exp.port);
      var labelIn = (this.props.isIn ? exp.process+"."+exp.port : this.props.exportKey);

      return (
        React.DOM.g(
          {
            className: "context-export",
            transform: "translate("+this.props.x+","+this.props.y+")"
          },
          React.DOM.path({
            className: "context-arc",
            d: TheGraph.arcs.w4
          }),
          React.DOM.path({
            className: "context-arc",
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
            className: "icon context-node-icon fill route"+this.props.route,
            children: TheGraph.FONT_AWESOME[ (this.props.isIn ? "sign-in" : "sign-out") ]
          }),
          TheGraph.TextBG({
            textClassName: "context-edge-label-out",
            height: 14,
            halign: "right",
            x: 0 - 30,
            y: 0,
            text: labelOut
          }),
          TheGraph.TextBG({
            textClassName: "context-edge-label-in",
            height: 14,
            halign: "left",
            x: 0 + 30,
            y: 0,
            text: labelIn
          })
        )
      );
    }
  });


})(this);