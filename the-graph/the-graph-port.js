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
      if (this.props.showContext) {
        this.getDOMNode().addEventListener("contextmenu", this.showContext);
        this.getDOMNode().addEventListener("hold", this.showContext);
      }

      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      this.componentDidUpdate();
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
      // Click on label, pass context menu to node
      if (event && (event.target === this.refs.label.getDOMNode())) {
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

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isIn ? "nodeInport" : "nodeOutport"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.port
      });
    },
    getContext: function (menu, options) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label
      });
    },
    edgeStart: function (event) {
      // Don't start edge on export node port
      if (this.props.isExport) {
        return;
      }
      // Click on label, pass context menu to node
      if (event && (event.target === this.refs.label.getDOMNode())) {
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
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var c = "port-circle-small fill route"+this.props.route;
      this.refs.circleSmall.getDOMNode().setAttribute("class", c);
    },
    render: function() {
      var style;
      if (this.props.label.length > 7) {
        var fontSize = 6 * (30 / (4 * this.props.label.length));
        style = { "font-size": fontSize+"px" };
      }
      var r = 3.5;
      return (
        React.DOM.g(
          {
            className: "port arrow",
            title: this.props.label
          },
          React.DOM.circle({
            className: "port-circle",
            cx: this.props.x,
            cy: this.props.y,
            r: r
          }),
          React.DOM.circle({
            ref: "circleSmall",
            // className: "port-circle-small fill route"+this.props.route,  // See componentDidUpdate
            cx: this.props.x,
            cy: this.props.y,
            r: r * 5/8
          }),
          React.DOM.text({
            ref: "label",
            className: "port-label drag",
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