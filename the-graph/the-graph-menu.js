(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


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
      this.props.menu.n4.action(this.props.graph, this.props.itemKey, this.props.item);
    },
    onTapS4: function () {
      this.props.menu.s4.action(this.props.graph, this.props.itemKey, this.props.item);
    },
    onTapE4: function () {
      this.props.menu.e4.action(this.props.graph, this.props.itemKey, this.props.item);
    },
    onTapW4: function () {
      this.props.menu.w4.action(this.props.graph, this.props.itemKey, this.props.item);
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
              x: 0,
              y: 52,
              children: TheGraph.FONT_AWESOME[ slice.icon ]
            })
          );
        }
        if (slice.iconLabel) {
          children.push(
            React.DOM.text({
              className: "context-arc-icon-label",
              x: 0,
              y: 35,
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
      // Middle icon
      var menu = this.props.menu;
      if (menu.icon) {
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
            className: "icon context-node-icon",
            children: TheGraph.FONT_AWESOME[ menu.icon ]
          })
        );
      }
      return React.DOM.g({
        className: "context-menu",
        transform: "translate("+this.props.x+","+this.props.y+")",
        children: children
      });
    }
  });


})(this);
