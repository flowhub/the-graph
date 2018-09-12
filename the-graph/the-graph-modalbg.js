var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

var baseFactories = require('./factories');
var merge = require('./merge');

var config = {
  container: {},
  rect: {
    className: "context-modal-bg"
  }
};

var factories = {
  createModalBackgroundGroup: baseFactories.createGroup,
  createModalBackgroundRect: baseFactories.createRect
};


var ModalBG = React.createFactory( createReactClass({
  displayName: "TheGraphModalBG",
  getInitialState: function() {
    this.rectRef = React.createRef();
    return {};
  },
  componentDidMount: function () {
    var domNode = ReactDOM.findDOMNode(this);
    var rectNode = this.rectRef.current;

    // Right-click on another item will show its menu
    domNode.addEventListener("mousedown", function (event) {
      // Only if outside of menu
      if (event && event.target===rectNode) {
        this.hideModal();
      }
    }.bind(this));
  },
  hideModal: function (event) {
    this.props.triggerHideContext();
  },
  render: function () {
    var rectOptions = {
      width: this.props.width,
      height: this.props.height
    };

    rectOptions = merge(config.rect, rectOptions);
    var rect = factories.createModalBackgroundRect.call(this, rectOptions);
    rect.ref = this.rectRef;

    var containerContents = [rect, this.props.children];
    var containerOptions = merge(config.container, {});
    return factories.createModalBackgroundGroup.call(this, containerOptions, containerContents);
  }
}));

module.exports = {
  ModalBG: ModalBG,
  config: config,
  factories: factories,
};
