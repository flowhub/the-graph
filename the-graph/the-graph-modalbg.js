const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');

const baseFactories = require('./factories');
const merge = require('./merge');

const config = {
  container: {},
  rect: {
    ref: 'rect',
    className: 'context-modal-bg',
  },
};

const factories = {
  createModalBackgroundGroup: baseFactories.createGroup,
  createModalBackgroundRect: baseFactories.createRect,
};

const ModalBG = React.createFactory(createReactClass({
  displayName: 'TheGraphModalBG',
  componentDidMount() {
    const domNode = ReactDOM.findDOMNode(this);
    const rectNode = this.refs.rect;

    // Right-click on another item will show its menu
    domNode.addEventListener('mousedown', (event) => {
      // Only if outside of menu
      if (event && event.target === rectNode) {
        this.hideModal();
      }
    });
  },
  hideModal(event) {
    this.props.triggerHideContext();
  },
  render() {
    let rectOptions = {
      width: this.props.width,
      height: this.props.height,
    };

    rectOptions = merge(config.rect, rectOptions);
    const rect = factories.createModalBackgroundRect.call(this, rectOptions);

    const containerContents = [rect, this.props.children];
    const containerOptions = merge(config.container, {});
    return factories.createModalBackgroundGroup.call(this, containerOptions, containerContents);
  },
}));

module.exports = {
  ModalBG,
  config,
  factories,
};
