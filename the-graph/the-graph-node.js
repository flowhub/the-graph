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

      // Context menu
      this.getDOMNode().addEventListener("contextmenu", this.showContext);
      this.getDOMNode().addEventListener("hold", this.showContext);
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
      this.props.process.metadata.x += deltaX;
      this.props.process.metadata.y += deltaY;

      var highlightEvent = new CustomEvent('the-graph-node-move', { 
        detail: null, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(highlightEvent);
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      this.getDOMNode().removeEventListener("track", this.onTrack);
      this.getDOMNode().removeEventListener("trackend", this.onTrackEnd);
    },
    triggerRemove: function () {
      var contextEvent = new CustomEvent('the-graph-node-remove', { 
        detail: this.props.key,
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
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
        node: this,
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
      // HACK
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
      var metadata = this.props.process.metadata;

      var label = this.props.label;
      var sublabel = this.props.process.component;
      if (sublabel === label) {
        sublabel = "";
      }
      var x = this.props.x;
      var y = this.props.y;

      // Ports
      var keys, count, index;

      // Inports
      var inports = metadata.ports.inports;
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
      var outports = metadata.ports.outports;
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



  TheGraph.NodeMenu = React.createClass({
    radius: 72,
    arcs: (function(){
      var angleToX = function (percent, radius) {
        return radius * Math.cos(2*Math.PI * percent);
      };
      var angleToY = function (percent, radius) {
        return radius * Math.sin(2*Math.PI * percent);
      };
      var makeArcPath = function (startPercent, endPercent, radius) {
        return [ 
          "M", angleToX(startPercent, radius), angleToY(startPercent, radius),
          "A", radius, radius, 0, 0, 0, angleToX(endPercent, radius), angleToY(endPercent, radius)
        ].join(" ");
      };
      return {
        label: makeArcPath(7/8, 5/8, 36),
        ins: makeArcPath(5/8, 3/8, 36),
        outs: makeArcPath(1/8, -1/8, 36),
        remove: makeArcPath(3/8, 1/8, 36)
      };
    })(),
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    triggerRemove: function (event) {
      this.props.node.triggerRemove();

      // Hide self (overkill?)
      var contextEvent = new CustomEvent('the-graph-context-hide', { 
        detail: null, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    render: function() {

      var inports, outports;

      if (this.props.process.metadata && this.props.process.metadata.ports) {
        // HACK
        var scale = this.props.node.props.app.state.scale;

        var ports = this.props.process.metadata.ports;
        var processKey = this.props.processKey;

        var inkeys = Object.keys(ports.inports);
        var h = inkeys.length * TheGraph.contextPortSize;
        var i = 0;
        inports = inkeys.map( function (key) {
          var inport = ports.inports[key];
          var y = 0 - h/2 + i*TheGraph.contextPortSize + TheGraph.contextPortSize/2;
          i++;
          return TheGraph.PortMenu({
            label: key,
            processKey: processKey,
            isIn: true,
            ox: (inport.x - TheGraph.nodeSize/2) * scale,
            oy: (inport.y - TheGraph.nodeSize/2) * scale,
            x: -100,
            y: y
          });
        });

        var outkeys = Object.keys(ports.outports);
        h = outkeys.length * TheGraph.contextPortSize;
        i = 0;
        outports = outkeys.map( function (key) {
          var outport = ports.outports[key];
          var y = 0 - h/2 + i*TheGraph.contextPortSize + TheGraph.contextPortSize/2;
          i++;
          return TheGraph.PortMenu({
            label: key,
            processKey: processKey,
            isIn: false,
            ox: (outport.x - TheGraph.nodeSize/2) * scale,
            oy: (outport.y - TheGraph.nodeSize/2) * scale,
            x: 100,
            y: y
          });
        });
      }

      return (
        React.DOM.g(
          {
            className: "context-node",
            transform: "translate("+this.props.x+","+this.props.y+")"
          },
          React.DOM.text({
            className: "context-node-label",
            x: 0,
            y: 0 - this.radius - 25,
            children: this.props.label
          }),
          React.DOM.g({
            className: "context-inports",
            children: inports
          }),
          React.DOM.g({
            className: "context-outports",
            children: outports
          }),
          React.DOM.path({
            className: "context-arc context-node-ins-bg",
            d: this.arcs.ins
          }),
          React.DOM.path({
            className: "context-arc context-node-outs-bg",
            d: this.arcs.outs
          }),
          React.DOM.g(
            {
              className: "context-slice context-node-info click"
              // onMouseDown: this.stopPropagation,
              // onClick: this.triggerRemove
            },
            React.DOM.path({
              className: "context-arc context-node-info-bg",
              d: this.arcs.label
            }),
            React.DOM.text({
              className: "icon context-icon context-node-info-icon",
              x: 0,
              y: -48,
              children: TheGraph.FONT_AWESOME["info-circle"]
            })
          ),
          React.DOM.g(
            {
              className: "context-slice context-node-delete click",
              onMouseDown: this.stopPropagation,
              onClick: this.triggerRemove
            },
            React.DOM.path({
              className: "context-arc context-node-delete-bg",
              d: this.arcs.remove
            }),
            React.DOM.text({
              className: "icon context-icon context-node-delete-icon",
              x: 0,
              y: 48,
              children: TheGraph.FONT_AWESOME["trash-o"]
            })
          ),
          React.DOM.path({
            className: "context-circle-x",
            d: "M -51 -51 L 51 51 M -51 51 L 51 -51"
          }),
          React.DOM.circle({
            className: "context-circle",
            r: this.radius
          }),
          React.DOM.rect({
            className: "context-node-rect",
            x: -24,
            y: -24,
            width: 48,
            height: 48,
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius
          }),
          React.DOM.text({
            className: "icon context-node-icon",
            children: TheGraph.FONT_AWESOME[this.props.node.state.icon]
          })
        )
      );
    }
  });


})(this);