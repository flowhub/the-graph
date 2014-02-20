(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Const
  var CURVE = 50;


  // Edge view

  TheGraph.IIP = React.createClass({
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y ||
        nextProps.label !== this.props.label
      );
    },
    render: function () {
      var x = this.props.x;
      var y = this.props.y;

      var path = [
        "M", x, y,
        "L", x-10, y
      ].join(" ");

      // Make a string
      var label = this.props.label+"";
      // TODO make this smarter with ZUI
      if (label.length > 12) {
        label = label.slice(0, 9) + "...";
      }

      return (
        React.DOM.g(
          {
            className: "iip",
            title: this.props.label
          },
          React.DOM.path({
            className: "iip-path",
            d: path
          }),
          TheGraph.TextBG({
            className: "iip-info",
            height: 5,
            halign: "right",
            x: x - 10,
            y: y,
            text: label
          })
        )
      );
    }
  });

})(this);