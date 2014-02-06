(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Port view

  TheGraph.Port = React.createClass({
    componentDidMount: function () {
      // Context menu
      this.getDOMNode().addEventListener("tap", this.edgeStart);
    },
    edgeStart: function (event) {
      var edgeStartEvent = new CustomEvent('the-graph-edge-start', { 
        detail: {
          isIn: this.props.isIn,
          port: this.props.label,
          process: this.props.processKey
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(edgeStartEvent);      
    },
    render: function() {
      return (
        React.DOM.g(
          {
            className: "port"
          },
          React.DOM.circle({
            className: "port-circle",
            cx: this.props.x,
            cy: this.props.y,
            r: 4
          }),
          React.DOM.text({
            className: "port-label port-label-"+this.props.label.length,
            x: this.props.x + (this.props.isIn ? 5 : -5),
            y: this.props.y,
            children: this.props.label
          })
        )
      );
    }
  });


})(this);