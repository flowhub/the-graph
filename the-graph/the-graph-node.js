(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Font Awesome
  var faKeys = Object.keys(TheGraph.FONT_AWESOME);

  // Polymer monkeypatch
  window.PointerGestures.dispatcher.recognizers.hold.HOLD_DELAY = 500;

  // Node view
  TheGraph.Node = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip
    ],
    getInitialState: function() {
      return {
        // Random icon just for fun
        icon: faKeys[ Math.floor(Math.random()*faKeys.length) ]
      };
    },
    componentDidMount: function () {
      // Dragging
      this.getDOMNode().addEventListener("trackstart", this.onTrackStart);

      // Hover/tap when edge preview is active
      this.getDOMNode().addEventListener("mouseenter", this.edgeConnectOffer);
      // this.getDOMNode().addEventListener("pointerleave", this.showContext);

      // Context menu
      this.getDOMNode().addEventListener("contextmenu", this.showContext);
      this.getDOMNode().addEventListener("hold", this.showContext);
    },
    edgeConnectOffer: function (event) {
      // console.log(event);
    },
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      this.getDOMNode().addEventListener("track", this.onTrack);
      this.getDOMNode().addEventListener("trackend", this.onTrackEnd);
    },
    onTrack: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      var scale = this.props.app.state.scale;
      var deltaX = Math.round( event.ddx / scale );
      var deltaY = Math.round( event.ddy / scale );

      // Fires a changeNode event on graph
      this.props.graph.setNodeMetadata(this.props.key, {
        x: this.props.node.metadata.x + deltaX,
        y: this.props.node.metadata.y + deltaY
      });
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      this.getDOMNode().removeEventListener("track", this.onTrack);
      this.getDOMNode().removeEventListener("trackend", this.onTrackEnd);
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      var contextEvent = new CustomEvent('the-graph-node-context', { 
        detail: this, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    getContext: function () {
      var scale = this.props.app.state.scale;
      var appX = this.props.app.state.x;
      var appY = this.props.app.state.y;
      var x = (this.props.x + TheGraph.nodeSize/2) * scale + appX;
      var y = (this.props.y + TheGraph.nodeSize/2) * scale + appY;
      return TheGraph.NodeMenu({
        key: "context." + this.props.key,
        label: this.props.label,
        graph: this.props.graph,
        node: this,
        ports: this.props.ports,
        process: this.props.process,
        processKey: this.props.key,
        x: x,
        y: y
      });
    },
    getTooltipTrigger: function () {
      return this.getDOMNode();
    },
    shouldShowTooltip: function () {
      return (this.props.app.state.scale < TheGraph.zbpNormal);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if moved
      return (
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y
      );
    },
    render: function() {
      var metadata = this.props.node.metadata;

      var label = this.props.label;
      var sublabel = this.props.node.component;
      if (sublabel === label) {
        sublabel = "";
      }
      var x = this.props.x;
      var y = this.props.y;

      // Ports
      var keys, count, index;

      // Inports
      var inports = this.props.ports.inports;
      keys = Object.keys(inports);
      count = keys.length;
      index = 0;
      var inportViews = keys.map(function(key){
        index++;
        var info = inports[key];
        info.y = TheGraph.nodeRadius + (TheGraph.nodeSide / (count+1) * index);
        return TheGraph.Port(info);
      });

      // Outports
      var outports = this.props.ports.outports;
      keys = Object.keys(outports);
      count = keys.length;
      index = 0;
      var outportViews = keys.map(function(key){
        index++;
        var info = outports[key];
        info.y = TheGraph.nodeRadius + (TheGraph.nodeSide / (count+1) * index);
        return TheGraph.Port(info);
      });

      return (
        React.DOM.g(
          {
            className: "node drag",
            name: this.props.key,
            key: this.props.key,
            title: label,
            transform: "translate("+x+","+y+")"//,
            // onMouseDown: this.onMouseDown
          },
          React.DOM.rect({
            className: "node-bg", // HACK to make the whole g draggable
            width: TheGraph.nodeSize,
            height: TheGraph.nodeSize + 35
          }),
          React.DOM.rect({
            className: "node-rect drag",
            width: TheGraph.nodeSize,
            height: TheGraph.nodeSize,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius
          }),
          React.DOM.text({
            className: "icon node-icon drag",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize/2,
            children: TheGraph.FONT_AWESOME[this.state.icon]
          }),
          React.DOM.g({
            className: "inports",
            children: inportViews
          }),
          React.DOM.g({
            className: "outports",
            children: outportViews
          }),
          React.DOM.text({
            className: "node-label",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 20,
            children: label
          }),
          React.DOM.text({
            className: "node-sublabel",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 35,
            children: sublabel
          })
        )
      );
    }
  });


})(this);