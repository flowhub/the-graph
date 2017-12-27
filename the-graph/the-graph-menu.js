var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

var arcs = require('./arcs');
var merge = require('./merge');
var FONT_AWESOME = require('./font-awesome-unicode-map.js');
var baseFactories = require('./factories');

var config = {
  radius: 72,
  positions: {
    n4IconX: 0,
    n4IconY: -52,
    n4LabelX: 0,
    n4LabelY: -35,
    s4IconX: 0,
    s4IconY: 52,
    s4LabelX: 0,
    s4LabelY: 35,
    e4IconX: 45,
    e4IconY: -5,
    e4LabelX: 45,
    e4LabelY: 15,
    w4IconX: -45,
    w4IconY: -5,
    w4LabelX: -45,
    w4LabelY: 15
  },
  container: {
    className: "context-menu"
  },
  arcPath: {
    className: "context-arc context-node-info-bg"
  },
  sliceIconText: {
    className: "icon context-icon context-node-info-icon"
  },
  sliceLabelText: {
    className: "context-arc-label"
  },
  sliceIconLabelText: {
    className: "context-arc-icon-label"
  },
  circleXPath: {
    className: "context-circle-x",
    d: "M -51 -51 L 51 51 M -51 51 L 51 -51"
  },
  outlineCircle: {
    className: "context-circle"
  },
  labelText: {
    className: "context-node-label"
  },
  iconRect: {
    className: "context-node-rect",
    x: -24,
    y: -24,
    width: 48,
    height: 48,
    rx: 8,
    ry: 8,
  }
};

var factories = {
  createMenuGroup: baseFactories.createGroup,
  createMenuSlice: createMenuSlice,
  createMenuSliceArcPath: baseFactories.createPath,
  createMenuSliceText: baseFactories.createText,
  createMenuSliceIconText: baseFactories.createText,
  createMenuSliceLabelText: baseFactories.createText,
  createMenuSliceIconLabelText: baseFactories.createText,
  createMenuCircleXPath: baseFactories.createPath,
  createMenuOutlineCircle: baseFactories.createCircle,
  createMenuLabelText: baseFactories.createText,
  createMenuMiddleIconRect: baseFactories.createRect,
  createMenuMiddleIconText: baseFactories.createText
};

function createMenuSlice(options) {
  /*jshint validthis:true */
  var direction = options.direction;
  var arcPathOptions = merge(config.arcPath, { d: arcs[direction] });
  var children = [
    factories.createMenuSliceArcPath(arcPathOptions)
  ];

  if (this.props.menu[direction]) {
    var slice = this.props.menu[direction];
    if (slice.icon) {
      var sliceIconTextOptions = {
        x: config.positions[direction+"IconX"],
        y: config.positions[direction+"IconY"],
        children: FONT_AWESOME[ slice.icon ]
      };
      sliceIconTextOptions = merge(config.sliceIconText, sliceIconTextOptions);
      children.push(factories.createMenuSliceIconText.call(this, sliceIconTextOptions));
    }
    if (slice.label) {
      var sliceLabelTextOptions = {
        x: config.positions[direction+"IconX"],
        y: config.positions[direction+"IconY"],
        children: slice.label
      };
      sliceLabelTextOptions = merge(config.sliceLabelText, sliceLabelTextOptions);
      children.push(factories.createMenuSliceLabelText.call(this, sliceLabelTextOptions));
    }
    if (slice.iconLabel) {
      var sliceIconLabelTextOptions = {
        x: config.positions[direction+"LabelX"],
        y: config.positions[direction+"LabelY"],
        children: slice.iconLabel
      };
      sliceIconLabelTextOptions = merge(config.sliceIconLabelText, sliceIconLabelTextOptions);
      children.push(factories.createMenuSliceIconLabelText.call(this, sliceIconLabelTextOptions));
    }
  }

  var containerOptions = {
    ref: direction,
    className: "context-slice context-node-info" + (this.state[direction+"tappable"] ? " click" : ""),
    children: children
  };
  containerOptions = merge(config.container, containerOptions);
  return factories.createMenuGroup.call(this, containerOptions);
}

var Menu = React.createFactory( createReactClass({
  displayName: "TheGraphMenu",
  radius: config.radius,
  getInitialState: function() {
    // Use these in CSS for cursor and hover, and to attach listeners
    return {
      n4tappable: (this.props.menu.n4 && this.props.menu.n4.action),
      s4tappable: (this.props.menu.s4 && this.props.menu.s4.action),
      e4tappable: (this.props.menu.e4 && this.props.menu.e4.action),
      w4tappable: (this.props.menu.w4 && this.props.menu.w4.action),
    };
  },
  onTapN4: function () {
    var options = this.props.options;
    this.props.menu.n4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  onTapS4: function () {
    var options = this.props.options;
    this.props.menu.s4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  onTapE4: function () {
    var options = this.props.options;
    this.props.menu.e4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  onTapW4: function () {
    var options = this.props.options;
    this.props.menu.w4.action(options.graph, options.itemKey, options.item);
    this.props.triggerHideContext();
  },
  componentDidMount: function () {
    if (this.state.n4tappable) {
      this.refs.n4.addEventListener("tap", this.onTapN4);
    }
    if (this.state.s4tappable) {
      this.refs.s4.addEventListener("tap", this.onTapS4);
    }
    if (this.state.e4tappable) {
      this.refs.e4.addEventListener("tap", this.onTapE4);
    }
    if (this.state.w4tappable) {
      this.refs.w4.addEventListener("tap", this.onTapW4);
    }

    // Prevent context menu
    ReactDOM.findDOMNode(this).addEventListener("contextmenu", function (event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }, false);
  },
  getPosition: function () {
    return {
      x: this.props.x !== undefined ? this.props.x : this.props.options.x || 0,
      y: this.props.y !== undefined ? this.props.y : this.props.options.y || 0
    };
  },
  render: function() {
    var menu = this.props.menu;
    var options = this.props.options;
    var position = this.getPosition();

    var circleXOptions = merge(config.circleXPath, {});
    var outlineCircleOptions = merge(config.outlineCircle, {r: this.radius });

    var children = [
      // Directional slices
      factories.createMenuSlice.call(this, { direction: "n4" }),
      factories.createMenuSlice.call(this, { direction: "s4" }),
      factories.createMenuSlice.call(this, { direction: "e4" }),
      factories.createMenuSlice.call(this, { direction: "w4" }),
      // Outline and X
      factories.createMenuCircleXPath.call(this, circleXOptions),
      factories.createMenuOutlineCircle.call(this, outlineCircleOptions)
    ];
    // Menu label
    if (this.props.label || menu.icon) {

      var labelTextOptions = {
        x: 0,
        y: 0 - this.radius - 15,
        children: (this.props.label ? this.props.label : menu.label)
      };

      labelTextOptions = merge(config.labelText, labelTextOptions);
      children.push(factories.createMenuLabelText.call(this, labelTextOptions));
    }
    // Middle icon
    if (this.props.icon || menu.icon) {
      var iconColor = (this.props.iconColor!==undefined ? this.props.iconColor : menu.iconColor);
      var iconStyle = "";
      if (iconColor) {
        iconStyle = " fill route"+iconColor;
      }

      var middleIconRectOptions = merge(config.iconRect, {});
      var middleIcon = factories.createMenuMiddleIconRect.call(this, middleIconRectOptions);

      var middleIconTextOptions = {
        className: "icon context-node-icon"+iconStyle,
        children: FONT_AWESOME[ (this.props.icon ? this.props.icon : menu.icon) ]
      };
      middleIconTextOptions = merge(config.iconText, middleIconTextOptions);
      var iconText = factories.createMenuMiddleIconText.call(this, middleIconTextOptions);

      children.push(middleIcon, iconText);
    }

    var containerOptions = {
      transform: "translate("+position.x+","+position.y+")",
      children: children
    };

    containerOptions = merge(config.container, containerOptions);
    return factories.createMenuGroup.call(this, containerOptions);

  }
}));

module.exports = {
  Menu: Menu,
  config: config,
  factories: factories,
};

