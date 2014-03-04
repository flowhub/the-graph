(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  var positions = {
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
  };


  TheGraph.Menu = React.createClass({
    radius: 72,
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
    },
    onTapS4: function () {
      var options = this.props.options;
      this.props.menu.s4.action(options.graph, options.itemKey, options.item);
    },
    onTapE4: function () {
      var options = this.props.options;
      this.props.menu.e4.action(options.graph, options.itemKey, options.item);
    },
    onTapW4: function () {
      var options = this.props.options;
      this.props.menu.w4.action(options.graph, options.itemKey, options.item);
    },
    componentDidMount: function () {
      if (this.state.n4tappable) {
        this.refs.n4.getDOMNode().addEventListener("tap", this.onTapN4);
      }
      if (this.state.s4tappable) {
        this.refs.s4.getDOMNode().addEventListener("tap", this.onTapS4);
      }
      if (this.state.e4tappable) {
        this.refs.e4.getDOMNode().addEventListener("tap", this.onTapE4);
      }
      if (this.state.w4tappable) {
        this.refs.w4.getDOMNode().addEventListener("tap", this.onTapW4);
      }

      // Prevent context menu
      this.getDOMNode().addEventListener("contextmenu", function (event) {
        event.stopPropagation();
        event.preventDefault();
      }, false);
    },
    renderSlice: function (direction) {
      var children = [
        React.DOM.path({
          className: "context-arc context-node-info-bg",
          d: TheGraph.arcs[direction]
        }),
      ];
      if (this.props.menu[direction]) {
        var slice = this.props.menu[direction];
        if (slice.icon) {
          children.push(
            React.DOM.text({
              className: "icon context-icon context-node-info-icon",
              x: positions[direction+"IconX"],
              y: positions[direction+"IconY"],
              children: TheGraph.FONT_AWESOME[ slice.icon ]
            })
          );
        }
        if (slice.label) {
          children.push(
            React.DOM.text({
              className: "context-arc-label",
              x: positions[direction+"IconX"],
              y: positions[direction+"IconY"],
              children: slice.label
            })
          );
        }
        if (slice.iconLabel) {
          children.push(
            React.DOM.text({
              className: "context-arc-icon-label",
              x: positions[direction+"LabelX"],
              y: positions[direction+"LabelY"],
              children: slice.iconLabel
            })
          );
        }
      }
      return React.DOM.g(
        {
          ref: direction,
          className: "context-slice context-node-info" + (this.state[direction+"tappable"] ? " click" : ""),
          children: children
        }
      );
    },
    render: function() {
      var menu = this.props.menu;
      var options = this.props.options;
      var x = this.props.x !== undefined ? this.props.x : options.x;
      var y = this.props.y !== undefined ? this.props.y : options.y;

      var children = [
        // Directional slices
        this.renderSlice("n4"),
        this.renderSlice("s4"),
        this.renderSlice("e4"),
        this.renderSlice("w4"),
        // Outline and X
        React.DOM.path({
          className: "context-circle-x",
          d: "M -51 -51 L 51 51 M -51 51 L 51 -51"
        }),
        React.DOM.circle({
          className: "context-circle",
          r: this.radius
        }),
      ];
      // Menu label
      if (this.props.label || menu.icon) {
        children.push(
          React.DOM.text({
            className: "context-node-label",
            x: 0,
            y: 0 - this.radius - 15,
            children: (this.props.label ? this.props.label : menu.label)
          })
        );
      }
      // Middle icon
      if (this.props.icon || menu.icon) {
        var iconColor = (this.props.iconColor!==undefined ? this.props.iconColor : menu.iconColor);
        var iconStyle = "";
        if (iconColor) {
          iconStyle = " fill route"+iconColor;
        }
        children.push(
          React.DOM.rect({
            className: "context-node-rect",
            x: -24,
            y: -24,
            width: 48,
            height: 48,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius
          }),
          React.DOM.text({
            className: "icon context-node-icon"+iconStyle,
            children: TheGraph.FONT_AWESOME[ (this.props.icon ? this.props.icon : menu.icon) ]
          })
        );
      }
      return React.DOM.g({
        className: "context-menu",
        transform: "translate("+x+","+y+")",
        children: children
      });
    }
  });


  TheGraph.ModalBG = React.createClass({
    componentDidMount: function () {
      var domNode = this.getDOMNode();
      var rectNode = this.refs.rect.getDOMNode();

      // Right-click on another item will show its menu
      domNode.addEventListener("pointerdown", function (event) {
        // Only if outside of menu
        if (event.target===rectNode) {
          this.hideModal();
        }
      }.bind(this));

      // Hide menu tapping on any menu button
      domNode.addEventListener("tap", this.hideModal);
    },
    hideModal: function (event) {
      this.props.triggerHideContext();
    },
    render: function () {
      return React.DOM.g(
        {},
        React.DOM.rect({
          ref: "rect",
          className: "context-modal-bg",
          width: this.props.width,
          height: this.props.height
        }),
        this.props.children
      );
    }
  });


})(this);
