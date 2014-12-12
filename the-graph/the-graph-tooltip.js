(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  TheGraph.config.tooltip = {
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

  TheGraph.factories.tooltip = {
    createTooltipGroup: TheGraph.factories.createGroup,
    createTooltipRect: TheGraph.factories.createRect,
    createTooltipText: TheGraph.factories.createText
  };

  // Port view

  TheGraph.Tooltip = React.createFactory( React.createClass({
    displayName: "TheGraphTooltip",
    render: function() {

      var rectOptions = TheGraph.merge(TheGraph.config.tooltip.rect, {width: this.props.label.length * 6});
      var rect = TheGraph.factories.tooltip.createTooltipRect.call(this, rectOptions);

      var textOptions = TheGraph.merge(TheGraph.config.tooltip.text, { children: this.props.label });
      var text = TheGraph.factories.tooltip.createTooltipText.call(this, textOptions);

      var containerContents = [rect, text];

      var containerOptions = {
        className: "tooltip" + (this.props.visible ? "" : " hidden"),
        transform: "translate("+this.props.x+","+this.props.y+")",
      };
      containerOptions = TheGraph.merge(TheGraph.config.tooltip.container, containerOptions);
      return TheGraph.factories.tooltip.createTooltipGroup.call(this, containerOptions, containerContents);

    }
  }));


})(this);
