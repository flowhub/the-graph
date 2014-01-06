(function (context) {
  "use strict";

  // Boilerplate module setup
  if (!context.TheGraph) { context.TheGraph = {}; }
  var TheGraph = context.TheGraph;


  // Node view

  TheGraph.Node = React.createClass({
    render: function() {
      var label = this.props.process.metadata.label;
      if (label === undefined || label === "") {
        label = this.props.process.key;
      }
      var x = this.props.process.metadata.x;
      var y = this.props.process.metadata.y;
      return (
        React.DOM.g(
          {
            name: label,
            key: this.props.key,
            transform: "translate("+x+","+y+")"
          },
          React.DOM.rect({
            width: 72,
            height: 72,
            rx: 8,
            ry: 8
          }),
          React.DOM.text({
            x: 36,
            y: 92,
            children: label
          })
        )
      );
    }
  });


})(this);