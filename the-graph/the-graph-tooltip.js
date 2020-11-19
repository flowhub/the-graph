const React = require('react');
const createReactClass = require('create-react-class');
const defaultFactories = require('./factories.js');
const merge = require('./merge.js');

const config = {
  container: {},
  rect: {
    className: 'tooltip-bg',
    x: 0,
    y: -7,
    rx: 3,
    ry: 3,
    height: 16,
  },
  text: {
    className: 'tooltip-label',
    ref: 'label',
  },
};

const factories = {
  createTooltipGroup: defaultFactories.createGroup,
  createTooltipRect: defaultFactories.createRect,
  createTooltipText: defaultFactories.createText,
};

// Port view
const Tooltip = React.createFactory(createReactClass({
  displayName: 'TheGraphTooltip',
  render() {
    const rectOptions = merge(config.rect, { width: this.props.label.length * 6 });
    const rect = factories.createTooltipRect.call(this, rectOptions);

    const textOptions = merge(config.text, { children: this.props.label });
    const text = factories.createTooltipText.call(this, textOptions);

    const containerContents = [rect, text];

    let containerOptions = {
      className: `tooltip${this.props.visible ? '' : ' hidden'}`,
      transform: `translate(${this.props.x},${this.props.y})`,
    };
    containerOptions = merge(config.container, containerOptions);
    return factories.createTooltipGroup.call(this, containerOptions, containerContents);
  },
}));

module.exports = {
  config,
  factories,
  Tooltip,
};
