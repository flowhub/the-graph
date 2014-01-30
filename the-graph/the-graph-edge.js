(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Const
  var CURVE = 50;


  // Edge view

  TheGraph.Edge = React.createClass({
    mixins: [TheGraph.mixins.Tooltip],
    componentWillMount: function() {
      // Todo: listen for source/target moving; change state
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.sX !== this.props.sX || 
        nextProps.sY !== this.props.sY ||
        nextProps.tX !== this.props.tX || 
        nextProps.tY !== this.props.tY ||
        nextProps.route !== this.props.route
      );
    },
    getTooltipTrigger: function () {
      return this.refs.touch.getDOMNode();
    },
    shouldShowTooltip: function () {
      return true;
    },
    render: function () {
      var sourceX = this.props.sX;
      var sourceY = this.props.sY;
      var targetX = this.props.tX;
      var targetY = this.props.tY;

      var c1X, c1Y, c2X, c2Y;
      if (targetX < sourceX+CURVE && Math.abs(targetY-sourceY) > TheGraph.nodeSize) {
        // Stick out some
        c1X = sourceX + CURVE;
        c1Y = sourceY;
        c2X = targetX - CURVE;
        c2Y = targetY;
      } else {
        // Controls halfway between
        c1X = sourceX + (targetX - sourceX)/2;
        c1Y = sourceY;
        c2X = c1X;
        c2Y = targetY;
      }

      var path = [
        "M",
        sourceX, sourceY,
        "C",
        c1X, c1Y,
        c2X, c2Y,
        targetX, targetY
      ].join(" ");

      return (
        React.DOM.g(
          {
            className: "edge route"+this.props.route,
            title: this.props.label
          },
          React.DOM.path({
            className: "edge-bg",
            d: path
          }),
          React.DOM.path({
            className: "edge-fg",
            d: path
          }),
          React.DOM.path({
            className: "edge-touch",
            ref: "touch",
            d: path
          })
        )
      );
    }
  });

})(this);