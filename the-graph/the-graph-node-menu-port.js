(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.NodeMenuPort = React.createClass({
    // mixins: [
    //   TheGraph.mixins.SavePointer
    // ],
    componentDidMount: function () {
      this.getDOMNode().addEventListener("tap", this.edgeStart);

      // // Show context menu
      // this.getDOMNode().addEventListener("contextmenu", this.showContext);
      // this.getDOMNode().addEventListener("hold", this.showContext);
    },
    // showContext: function (event) {
    //   // Don't show native context menu
    //   event.preventDefault();

    //   // Don't tap graph on hold event
    //   event.stopPropagation();
    //   if (event.preventTap) { event.preventTap(); }

    //   // Get mouse position
    //   var x = event.clientX;
    //   var y = event.clientY;
    //   if (x === undefined) {
    //     x = this.pointerX;
    //     y = this.pointerY;
    //   }

    //   var contextEvent = new CustomEvent('the-graph-context-show', { 
    //     detail: {
    //       element: this,
    //       x: x,
    //       y: y
    //     },
    //     bubbles: true
    //   });
    //   this.getDOMNode().dispatchEvent(contextEvent);
    // },
    // getContext: function (x, y) {
    //   return TheGraph.PortMenu({
    //     graph: this.props.graph,
    //     isIn: this.props.isIn,
    //     processKey: this.props.processKey,
    //     portKey: this.props.label,
    //     portX: this.props.nodeX + this.props.x,
    //     portY: this.props.nodeY + this.props.y,
    //     x: x,
    //     y: y
    //   });
    // },
    edgeStart: function (event) {
      // Don't tap graph
      event.stopPropagation();

      var edgeStartEvent = new CustomEvent('the-graph-edge-start', { 
        detail: {
          isIn: this.props.isIn,
          port: this.props.label,
          process: this.props.processKey,
          route: this.props.route
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(edgeStartEvent);
    },
    render: function() {
      return (
        React.DOM.g(
          {
            className: "context-port click context-port-"+(this.props.isIn ? "in" : "out")
          },
          React.DOM.rect({
            className: "context-port-bg",
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius,
            x: this.props.x + (this.props.isIn ? -120 : 0),
            y: this.props.y - TheGraph.contextPortSize/2,
            width: 120,
            height: TheGraph.contextPortSize-1
          }),
          React.DOM.circle({
            className: "context-port-hole stroke route"+this.props.route,
            cx: this.props.x,
            cy: this.props.y,
            r: 10
          }),
          React.DOM.text({
            className: "context-port-label fill route"+this.props.route,
            x: this.props.x + (this.props.isIn ? -20 : 20),
            y: this.props.y,
            children: this.props.label
          })
        )
      );
    }
  });


})(this);