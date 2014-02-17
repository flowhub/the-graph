(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Port view

  TheGraph.Port = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip,
      TheGraph.mixins.SavePointer
    ],
    componentDidMount: function () {
      // Preview edge start
      this.getDOMNode().addEventListener("tap", this.edgeStart);
      this.getDOMNode().addEventListener("trackstart", this.edgeStart);
      // Make edge
      this.getDOMNode().addEventListener("trackend", this.triggerDropOnTarget);
      this.getDOMNode().addEventListener("the-graph-edge-drop", this.edgeStart);

      // Show context menu
      this.getDOMNode().addEventListener("contextmenu", this.showContext);
      this.getDOMNode().addEventListener("hold", this.showContext);
    },
    getTooltipTrigger: function () {
      return this.getDOMNode();
    },
    shouldShowTooltip: function () {
      return (
        this.props.app.state.scale < TheGraph.zbpBig ||
        this.props.label.length > 8
      );
    },
    showContext: function (event) {
      // Don't show port menu on export node port
      if (this.props.isExport) {
        return;
      }
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

      var contextEvent = new CustomEvent('the-graph-context-show', { 
        detail: {
          element: this,
          x: x,
          y: y
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    getContext: function (x, y) {
      return TheGraph.PortMenu({
        graph: this.props.graph,
        isIn: this.props.isIn,
        processKey: this.props.processKey,
        portKey: this.props.label,
        portX: this.props.nodeX + this.props.x,
        portY: this.props.nodeY + this.props.y,
        x: x,
        y: y
      });
    },
    edgeStart: function (event) {
      // Don't start edge on export node port
      if (this.props.isExport) {
        return;
      }
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
    triggerDropOnTarget: function (event) {
      // If dropped on a child element will bubble up to port
      if (!event.relatedTarget) { return; }
      var dropEvent = new CustomEvent('the-graph-edge-drop', { 
        detail: null,
        bubbles: true
      });
      event.relatedTarget.dispatchEvent(dropEvent);      
    },
    componentDidUpdate: function (prevProps, prevState, rootNode) {
      // HACK til 0.9.0
      var c = "port-circle-small fill route"+this.props.route;
      this.refs.circleSmall.getDOMNode().setAttribute("class", c);
    },
    render: function() {
      var style;
      if (this.props.label.length > 7) {
        var fontSize = 6 * (30 / (4 * this.props.label.length));
        style = { "font-size": fontSize+"px" };
      }
      return (
        React.DOM.g(
          {
            className: "port arrow"
          },
          React.DOM.circle({
            className: "port-circle",
            cx: this.props.x,
            cy: this.props.y,
            r: this.props.r
          }),
          React.DOM.circle({
            ref: "circleSmall",
            className: "port-circle-small fill route"+this.props.route,
            cx: this.props.x,
            cy: this.props.y,
            r: this.props.r * 5/8
          }),
          React.DOM.text({
            className: "port-label",
            x: this.props.x + (this.props.isIn ? 5 : -5),
            y: this.props.y,
            style: style,
            children: this.props.label
          })
        )
      );
    }
  });


})(this);