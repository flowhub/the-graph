(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.PortMenu = React.createClass({
    radius: 72,
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    componentDidMount: function () {
      this.refs.north.getDOMNode().addEventListener("tap", this.exportThisPort);
    },
    exportThisPort: function () {
      var graph = this.props.graph;
      var collection = this.props.isIn ? graph.inports : graph.outports;

      var pub = this.props.portKey;
      var count = 0;
      // Make sure public is unique
      while (collection[pub]) {
        pub = this.props.portKey + count;
        count++;
      } 
      var metadata = {
        x: this.props.portX + (this.props.isIn ? -144 : 72),
        y: this.props.portY - TheGraph.nodeSize/2
      };
      if (this.props.isIn) {
        this.props.graph.addInport(pub, this.props.processKey, this.props.portKey, metadata);
      } else {
        this.props.graph.addOutport(pub, this.props.processKey, this.props.portKey, metadata);
      }
    },
    render: function() {
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
              ref: "north",
              className: "context-slice context-node-info click",
              onMouseDown: this.stopPropagation
            },
            React.DOM.path({
              className: "context-arc context-node-info-bg",
              d: TheGraph.arcs.n4
            }),
            React.DOM.text({
              className: "icon context-icon context-node-info-icon",
              x: 0,
              y: -48,
              children: TheGraph.FONT_AWESOME[ (this.props.isIn ? "sign-in" : "sign-out") ]
            }),
            React.DOM.text({
              className: "context-arc-icon-label",
              x: 0,
              y: -35,
              children: "export"
            })
          ),
          React.DOM.path({
            className: "context-arc context-node-delete-bg",
            d: TheGraph.arcs.s4
          }),
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
          React.DOM.text({
            className: "context-node-label",
            x: 0,
            y: 35,
            children: this.props.portKey
          })
        )
      );
    }
  });


})(this);