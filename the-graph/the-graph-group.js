(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Group view

  TheGraph.Group = React.createClass({
    mouseX: 0,
    mouseY: 0,
    onMouseDown: function (event) {
      // Don't drag graph
      event.stopPropagation();

      // Touch to mouse
      var x, y;
      if (event.touches) {
        x = event.touches[0].pageX;
        y = event.touches[0].pageY;
      } else {
        x = event.pageX;
        y = event.pageY;
      }

      this.mouseX = x;
      this.mouseY = y;

      if (event.button !== 0) {
        // Show context menu
        this.highlight();
        return;
      }

      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);

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
    onMouseMove: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      // Touch to mouse
      var x, y;
      if (event.touches) {
        x = event.touches[0].pageX;
        y = event.touches[0].pageY;
      } else {
        x = event.pageX;
        y = event.pageY;
      }

      var deltaX = Math.round( (x - this.mouseX) / this.props.scale );
      var deltaY = Math.round( (y - this.mouseY) / this.props.scale );
      this.mouseX = x;
      this.mouseY = y;

      var moveEvent = new CustomEvent('the-graph-group-move', { 
        detail: {
          index: this.props.index,
          x: deltaX,
          y: deltaY
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(moveEvent);
    },
    onMouseUp: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("mouseup", this.onMouseUp);
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
            className: "group-label drag",
            x: x + TheGraph.nodeRadius,
            y: y,
            children: this.props.label,
            onMouseDown: this.onMouseDown
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