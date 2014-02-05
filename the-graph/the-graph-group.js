(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Group view

  TheGraph.Group = React.createClass({
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      this.refs.label.getDOMNode().addEventListener("track", this.onTrack);
      this.refs.label.getDOMNode().addEventListener("trackend", this.onTrackEnd);
    },
    highlight: function () {
      var highlightEvent = new CustomEvent('the-graph-group-highlight', { 
        'detail': {
          index: this.props.index,
          x: this.mouseX,
          y: this.mouseY
        },
        'bubbles': true
      });
      this.getDOMNode().dispatchEvent(highlightEvent);
    },
    onTrack: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      var deltaX = Math.round( event.ddx / this.props.scale );
      var deltaY = Math.round( event.ddy / this.props.scale );

      var moveEvent = new CustomEvent('the-graph-group-move', { 
        detail: {
          nodes: this.props.nodes,
          x: deltaX,
          y: deltaY
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(moveEvent);
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      this.refs.label.getDOMNode().removeEventListener("track", this.onTrack);
      this.refs.label.getDOMNode().removeEventListener("trackend", this.onTrackEnd);
    },
    componentDidMount: function (rootNode) {
      // Pointer events for pan/zoom
      this.refs.label.getDOMNode().addEventListener("trackstart", this.onTrackStart);
    },
    render: function() {
      var x = this.props.minX - TheGraph.nodeSize/2;
      var y = this.props.minY - TheGraph.nodeSize/2;
      return (
        React.DOM.g(
          {
            className: "group"
            // transform: "translate("+x+","+y+")"
          },
          React.DOM.rect({
            className: "group-box",
            x: x,
            y: y,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius,
            width: this.props.maxX - this.props.minX + TheGraph.nodeSize*2,
            height: this.props.maxY - this.props.minY + TheGraph.nodeSize*2
          }),
          React.DOM.text({
            ref: "label",
            className: "group-label drag",
            x: x + TheGraph.nodeRadius,
            y: y,
            children: this.props.label
          }),
          React.DOM.text({
            className: "group-description",
            x: x + TheGraph.nodeRadius,
            y: y + 10 + TheGraph.nodeRadius,
            children: this.props.description
          })
        )
      );
    }
  });


})(this);