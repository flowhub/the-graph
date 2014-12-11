(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  TheGraph.config.menu = {
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
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius
    }
  };

  TheGraph.factories.menu = {
    createMenuGroup: TheGraph.factories.createGroup,
    createMenuSlice: createMenuSlice,
    createMenuSliceArcPath: TheGraph.factories.createPath,
    createMenuSliceText: TheGraph.factories.createText,
    createMenuSliceIconText: TheGraph.factories.createText,
    createMenuSliceLabelText: TheGraph.factories.createText,
    createMenuSliceIconLabelText: TheGraph.factories.createText,
    createMenuCircleXPath: TheGraph.factories.createPath,
    createMenuOutlineCircle: TheGraph.factories.createCircle,
    createMenuLabelText: TheGraph.factories.createText,
    createMenuMiddleIconRect: TheGraph.factories.createRect,
    createMenuMiddleIconText: TheGraph.factories.createText
  };

  function createMenuSlice(options) {
    /*jshint validthis:true */
    var direction = options.direction;
    var arcPathOptions = TheGraph.merge(TheGraph.config.menu.arcPath, { d: TheGraph.arcs[direction] });
    var children = [
      TheGraph.factories.menu.createMenuSliceArcPath(arcPathOptions)
    ];

    if (this.props.menu[direction]) {
      var slice = this.props.menu[direction];
      if (slice.icon) {
        var sliceIconTextOptions = {
          x: TheGraph.config.menu.positions[direction+"IconX"],
          y: TheGraph.config.menu.positions[direction+"IconY"],
          children: TheGraph.FONT_AWESOME[ slice.icon ]
        };
        sliceIconTextOptions = TheGraph.merge(TheGraph.config.menu.sliceIconText, sliceIconTextOptions);
        children.push(TheGraph.factories.menu.createMenuSliceIconText.call(this, sliceIconTextOptions));
      }
      if (slice.label) {
        var sliceLabelTextOptions = {
          x: TheGraph.config.menu.positions[direction+"IconX"],
          y: TheGraph.config.menu.positions[direction+"IconY"],
          children: slice.label
        };
        sliceLabelTextOptions = TheGraph.merge(TheGraph.config.menu.sliceLabelText, sliceLabelTextOptions);
        children.push(TheGraph.factories.menu.createMenuSliceLabelText.call(this, sliceLabelTextOptions));
      }
      if (slice.iconLabel) {
        var sliceIconLabelTextOptions = {
          x: TheGraph.config.menu.positions[direction+"LabelX"],
          y: TheGraph.config.menu.positions[direction+"LabelY"],
          children: slice.iconLabel
        };
        sliceIconLabelTextOptions = TheGraph.merge(TheGraph.config.menu.sliceIconLabelText, sliceIconLabelTextOptions);
        children.push(TheGraph.factories.menu.createMenuSliceIconLabelText.call(this, sliceIconLabelTextOptions));
      }
    }

    var containerOptions = {
      ref: direction,
      className: "context-slice context-node-info" + (this.state[direction+"tappable"] ? " click" : ""),
      children: children
    };
    containerOptions = TheGraph.merge(TheGraph.config.menu.container, containerOptions);
    return TheGraph.factories.menu.createMenuGroup.call(this, containerOptions);
  }

  TheGraph.Menu = React.createFactory( React.createClass({
    displayName: "TheGraphMenu",
    radius: TheGraph.config.menu.radius,
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
        this.refs.n4.getDOMNode().addEventListener("up", this.onTapN4);
      }
      if (this.state.s4tappable) {
        this.refs.s4.getDOMNode().addEventListener("up", this.onTapS4);
      }
      if (this.state.e4tappable) {
        this.refs.e4.getDOMNode().addEventListener("up", this.onTapE4);
      }
      if (this.state.w4tappable) {
        this.refs.w4.getDOMNode().addEventListener("up", this.onTapW4);
      }

      // Prevent context menu
      this.getDOMNode().addEventListener("contextmenu", function (event) {
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

      var circleXOptions = TheGraph.merge(TheGraph.config.menu.circleXPath, {});
      var outlineCircleOptions = TheGraph.merge(TheGraph.config.menu.outlineCircle, {r: this.radius });

      var children = [
        // Directional slices
        TheGraph.factories.menu.createMenuSlice.call(this, { direction: "n4" }),
        TheGraph.factories.menu.createMenuSlice.call(this, { direction: "s4" }),
        TheGraph.factories.menu.createMenuSlice.call(this, { direction: "e4" }),
        TheGraph.factories.menu.createMenuSlice.call(this, { direction: "w4" }),
        // Outline and X
        TheGraph.factories.menu.createMenuCircleXPath.call(this, circleXOptions),
        TheGraph.factories.menu.createMenuOutlineCircle.call(this, outlineCircleOptions)
      ];
      // Menu label
      if (this.props.label || menu.icon) {

        var labelTextOptions = {
          x: 0,
          y: 0 - this.radius - 15,
          children: (this.props.label ? this.props.label : menu.label)
        };

        labelTextOptions = TheGraph.merge(TheGraph.config.menu.labelText, labelTextOptions);
        children.push(TheGraph.factories.menu.createMenuLabelText.call(this, labelTextOptions));
      }
      // Middle icon
      if (this.props.icon || menu.icon) {
        var iconColor = (this.props.iconColor!==undefined ? this.props.iconColor : menu.iconColor);
        var iconStyle = "";
        if (iconColor) {
          iconStyle = " fill route"+iconColor;
        }

        var middleIconRectOptions = TheGraph.merge(TheGraph.config.menu.iconRect, {});
        var middleIcon = TheGraph.factories.menu.createMenuMiddleIconRect.call(this, middleIconRectOptions);

        var middleIconTextOptions = {
          className: "icon context-node-icon"+iconStyle,
          children: TheGraph.FONT_AWESOME[ (this.props.icon ? this.props.icon : menu.icon) ]
        };
        middleIconTextOptions = TheGraph.merge(TheGraph.config.menu.iconText, middleIconTextOptions);
        var iconText = TheGraph.factories.menu.createMenuMiddleIconText.call(this, middleIconTextOptions);

        children.push(middleIcon, iconText);
      }

      var containerOptions = {
        transform: "translate("+position.x+","+position.y+")",
        children: children
      };

      containerOptions = TheGraph.merge(TheGraph.config.menu.container, containerOptions);
      return TheGraph.factories.menu.createMenuGroup.call(this, containerOptions);

    }
  }));

  TheGraph.config.modalBG = {
    container: {},
    rect: {
      ref: "rect",
      className: "context-modal-bg"
    }
  };

  TheGraph.factories.modalBG = {
    createModalBackgroundGroup: TheGraph.factories.createGroup,
    createModalBackgroundRect: TheGraph.factories.createRect
  };


  TheGraph.ModalBG = React.createFactory( React.createClass({
    displayName: "TheGraphModalBG",
    componentDidMount: function () {
      var domNode = this.getDOMNode();
      var rectNode = this.refs.rect.getDOMNode();

      // Right-click on another item will show its menu
      domNode.addEventListener("down", function (event) {
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

      rectOptions = TheGraph.merge(TheGraph.config.modalBG.rect, rectOptions);
      var rect = TheGraph.factories.modalBG.createModalBackgroundRect.call(this, rectOptions);

      var containerContents = [rect, this.props.children];
      var containerOptions = TheGraph.merge(TheGraph.config.modalBG.container, {});
      return TheGraph.factories.modalBG.createModalBackgroundGroup.call(this, containerOptions, containerContents);
    }
  }));


})(this);
