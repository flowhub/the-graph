(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Group view

  TheGraph.Group = React.createClass({
    mixins: [
      TheGraph.mixins.SavePointer
    ],
    componentDidMount: function () {
      var label = this.refs.label.getDOMNode();

      // Move group
      label.addEventListener("trackstart", this.onTrackStart);

      // Context menu
      if (this.props.showContext) {
        this.getDOMNode().addEventListener("contextmenu", this.showContext);
        this.getDOMNode().addEventListener("hold", this.showContext);
      }
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      var x = event.clientX;
      var y = event.clientY;
      if (x === undefined) {
        x = this.pointerX;
        y = this.pointerY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: "group",
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.item
      });
    },
    getContext: function (menu, options) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label
      });
    },
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      this.refs.label.getDOMNode().addEventListener("track", this.onTrack);
      this.refs.label.getDOMNode().addEventListener("trackend", this.onTrackEnd);
    },
    onTrack: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      var deltaX = Math.round( event.ddx / this.props.scale );
      var deltaY = Math.round( event.ddy / this.props.scale );

      this.props.triggerMoveGroup(this.props.nodes, deltaX, deltaY);
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      this.refs.label.getDOMNode().removeEventListener("track", this.onTrack);
      this.refs.label.getDOMNode().removeEventListener("trackend", this.onTrackEnd);
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
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var color = (this.props.color ? this.props.color : 0);
      var c = "group-box color"+color;
      this.refs.box.getDOMNode().setAttribute("class", c);
    },
    render: function() {
      var x = this.props.minX - TheGraph.nodeSize/2;
      var y = this.props.minY - TheGraph.nodeSize/2;
      var color = (this.props.color ? this.props.color : 0);
      return (
        React.DOM.g(
          {
            className: "group"
            // transform: "translate("+x+","+y+")"
          },
          React.DOM.rect({
            ref: "box",
            // className: "group-box color"+color, // See componentDidUpdate
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