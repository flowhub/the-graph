(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  var config = TheGraph.config.iip = {
    container: {
      className: "iip"
    },
    path: {
      className: "iip-path"
    },
    text: {
      className: "iip-info",
      height: 5,
      halign: "right"
    }
  };

  var factories = TheGraph.factories.iip = {
    createIIPContainer: TheGraph.factories.createGroup,
    createIIPPath: TheGraph.factories.createPath,
    createIIPText: createIIPText
  };

  function createIIPText(options) {
    return TheGraph.TextBG(options);
  }

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

      var pathOptions = TheGraph.merge(config.path, {d: path});
      var iipPath = factories.createIIPPath.call(this, pathOptions);

      var textOptions = TheGraph.merge(config.text, {x: x - 10, y: y, text: label});
      var text = factories.createIIPText.call(this, textOptions);

      var containerContents = [iipPath, text];

      var containerOptions = TheGraph.merge(config.container, {title: this.props.label});
      return factories.createIIPContainer.call(this, containerOptions, containerContents);
    }
  });

})(this);