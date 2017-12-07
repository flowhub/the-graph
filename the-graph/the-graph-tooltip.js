var React = require('react');
var defaultFactories = require('./factories.js');
var merge = require('./merge.js');

var config = {
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


var factories = {
  createTooltipGroup: defaultFactories.createGroup,
  createTooltipRect: defaultFactories.createRect,
  createTooltipText: defaultFactories.createText
};

// Port view
var Tooltip = React.createFactory( React.createClass({
  displayName: "TheGraphTooltip",
  render: function() {

    var rectOptions = merge(config.rect, {width: this.props.label.length * 6});
    var rect = factories.createTooltipRect.call(this, rectOptions);

    var textOptions = merge(config.text, { children: this.props.label });
    var text = factories.createTooltipText.call(this, textOptions);

    var containerContents = [rect, text];

    var containerOptions = {
      className: "tooltip" + (this.props.visible ? "" : " hidden"),
      transform: "translate("+this.props.x+","+this.props.y+")",
    };
    containerOptions = merge(config.container, containerOptions);
    return factories.createTooltipGroup.call(this, containerOptions, containerContents);

  }
}));

module.exports = {
  config: config,
  factories: factories,
  Tooltip: Tooltip,
};
