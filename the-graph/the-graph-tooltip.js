(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Port view

  TheGraph.Tooltip = React.createClass({
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      if (prevProps.visible != this.props.visible) {
        var c = "tooltip" + (this.props.visible ? "" : " hidden");
        this.getDOMNode().setAttribute("class", c);
      }
    },
    render: function() {
      return (
        React.DOM.g(
          {
            // className: "tooltip" + (this.props.visible ? "" : " hidden"),  // See componentDidUpdate
            transform: "translate("+this.props.x+","+this.props.y+")",
          },
          React.DOM.rect({
            className: "tooltip-bg",
            x: 0,
            y: -7,
            rx: 3,
            ry: 3,
            height: 16,
            width: this.props.label.length * 6
          }),
          React.DOM.text({
            className: "tooltip-label",
            ref: "label",
            children: this.props.label
          })
        )
      );
    }
  });


})(this);