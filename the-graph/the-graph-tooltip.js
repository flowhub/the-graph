(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  var config = TheGraph.config.tooltip = {
    container: {},
    rect: {
      className: "tooltip-bg",
      x: 0,
      y: -7,
      rx: 3,
      ry: 3,
      height: 16
    },
    text: {
      className: "tooltip-label",
      ref: "label"
    }
  };

  var factories = TheGraph.factories.tooltip = {
    createTooltipGroup: TheGraph.factories.createGroup,
    createTooltipRect: TheGraph.factories.createRect,
    createTooltipText: TheGraph.factories.createText
  };

  // Port view

  TheGraph.Tooltip = React.createClass({
    render: function() {

      var rectOptions = TheGraph.merge(config.rect, {width: this.props.label.length * 6});
      var rect = factories.createTooltipRect.call(this, rectOptions);

      var textOptions = TheGraph.merge(config.text, { children: this.props.label });
      var text = factories.createTooltipText.call(this, textOptions);

      var containerContents = [rect, text];

      var containerOptions = {
        className: "tooltip" + (this.props.visible ? "" : " hidden"),
        transform: "translate("+this.props.x+","+this.props.y+")",
      };
      containerOptions = TheGraph.merge(config.container, containerOptions);
      return factories.createTooltipGroup.call(this, containerOptions, containerContents);

    }
  });


})(this);
