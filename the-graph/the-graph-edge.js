(function (context) {
  "use strict";

  // Boilerplate module setup
  if (!context.TheGraph) { context.TheGraph = {}; }
  var TheGraph = context.TheGraph;


  // Edge view

  TheGraph.Edge = React.createClass({
    componentWillMount: function() {
      // Todo: listen for source/target moving; change state
    },
    render: function() {
      var sourceX = this.props.source.metadata.x + 72;
      var sourceY = this.props.source.metadata.y + 8 + this.props.ports.source.index*15;
      var targetX = this.props.target.metadata.x + 0;
      var targetY = this.props.target.metadata.y + 8 + this.props.ports.target.index*15;
      var curve = 50;
      var path = [
        "M",
        sourceX, sourceY,
        "C",
        sourceX + curve, sourceY,
        targetX - curve, targetY,
        targetX, targetY
      ].join(" ");
      return (
        React.DOM.g(
          {className: "edge route"+this.props.route},
          React.DOM.path({
            className: "edge-bg",
            d: path
          }),
          React.DOM.path({
            className: "edge-fg",
            d: path
          })
        )
      );
    }
  });

})(this);