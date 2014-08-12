(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Port view

  TheGraph.Tooltip = React.createClass({
    render: function() {
      return (
        React.DOM.g(
          {
            className: "tooltip" + (this.props.visible ? "" : " hidden"),
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