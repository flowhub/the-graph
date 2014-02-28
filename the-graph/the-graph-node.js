(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Polymer monkeypatch
  window.PointerGestures.dispatcher.recognizers.hold.HOLD_DELAY = 500;


  // Node view
  TheGraph.Node = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip,
      TheGraph.mixins.SavePointer
    ],
    componentDidMount: function () {
      // Dragging
      this.getDOMNode().addEventListener("trackstart", this.onTrackStart);

      // Tap to select
      if (this.props.onNodeSelection) {
        // Needs to be click (not tap) to get event.shiftKey
        this.getDOMNode().addEventListener("click", this.onNodeSelection);
      }

      // Context menu
      this.getDOMNode().addEventListener("pointerdown", this.stopPropagation);
      this.getDOMNode().addEventListener("pointerup", this.stopPropagation);
      this.getDOMNode().addEventListener("contextmenu", this.showContext);
      this.getDOMNode().addEventListener("hold", this.showContext);
    },
    onNodeSelection: function (event) {
      // Don't click app
      event.stopPropagation();

      this.props.onNodeSelection(this.props.key, this.props.node, event);
    },
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      // Don't drag under menu
      if (this.props.app.menuShown) { return; }

      this.getDOMNode().addEventListener("track", this.onTrack);
      this.getDOMNode().addEventListener("trackend", this.onTrackEnd);

      // Moving a node should only be a single transaction
      if (this.props.export) {
        this.props.graph.startTransaction('moveexport');
      } else {
        this.props.graph.startTransaction('movenode');
      }
    },
    onTrack: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      var scale = this.props.app.state.scale;
      var deltaX = Math.round( event.ddx / scale );
      var deltaY = Math.round( event.ddy / scale );

      // Fires a change event on noflo graph, which triggers redraw
      if (this.props.export) {
        var newPos = {
          x: this.props.export.metadata.x + deltaX,
          y: this.props.export.metadata.y + deltaY
        };
        if (this.props.isIn) {
          this.props.graph.setInportMetadata(this.props.exportKey, newPos);
        } else {
          this.props.graph.setOutportMetadata(this.props.exportKey, newPos);
        }
      } else {
        this.props.graph.setNodeMetadata(this.props.key, {
          x: this.props.node.metadata.x + deltaX,
          y: this.props.node.metadata.y + deltaY
        });
      }
    },
    onTrackEnd: function (event) {
      // Don't fire on graph
      event.stopPropagation();

      this.getDOMNode().removeEventListener("track", this.onTrack);
      this.getDOMNode().removeEventListener("trackend", this.onTrackEnd);

      // Moving a node should only be a single transaction
      if (this.props.export) {
        this.props.graph.endTransaction('moveexport');
      } else {
        this.props.graph.endTransaction('movenode');
      }
    },
    stopPropagation: function (event) {
      // HACK to keep context menu from cancelling preview edge
      if (event.buttons && event.buttons===2) {
        event.stopPropagation();
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

      var contextEvent = new CustomEvent('the-graph-context-show', { 
        detail: {
          element: this,
          type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "node"),
          x: x,
          y: y
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(contextEvent);
    },
    getContext: function (x, y, menu) {
      // If this node is an export
      if (this.props.export) {
        return TheGraph.Menu({
          graph: this.props.graph,
          label: this.props.exportKey,
          menu: menu,
          itemKey: this.props.exportKey,
          item: this.props.export,
          x: x,
          y: y
        });
      }

      // Absolute position of node
      var scale = this.props.app.state.scale;
      var appX = this.props.app.state.x;
      var appY = this.props.app.state.y;
      var nodeX = (this.props.x + TheGraph.nodeSize/2) * scale + appX;
      var nodeY = (this.props.y + TheGraph.nodeSize/2) * scale + appY;
      var deltaX = nodeX - x;
      var deltaY = nodeY - y;
      var ports = this.props.ports;
      var processKey = this.props.key;

      // If there is a preview edge started, only show connectable ports
      if (this.props.graphView.state.edgePreview) {
        if (this.props.graphView.state.edgePreview.isIn) {
          // Show outputs
          return TheGraph.NodeMenuPorts({
            ports: ports.outports,
            isIn: false,
            scale: scale,
            processKey: processKey,
            deltaX: deltaX,
            deltaY: deltaY,
            translateX: x,
            translateY: y
          });
        } else {
          // Show inputs
          return TheGraph.NodeMenuPorts({
            ports: ports.inports,
            isIn: true,
            scale: scale,
            processKey: processKey,
            deltaX: deltaX,
            deltaY: deltaY,
            translateX: x,
            translateY: y
          });
        }
      }

      // Default, show whole node menu
      return TheGraph.NodeMenu({
        key: "context." + this.props.key,
        modal: true,
        label: this.props.label,
        graph: this.props.graph,
        graphView: this.props.graphView,
        node: this,
        menu: menu,
        icon: this.props.icon,
        ports: ports,
        process: this.props.node,
        processKey: processKey,
        x: x,
        y: y,
        deltaX: deltaX,
        deltaY: deltaY
      });
    },
    getTooltipTrigger: function () {
      return this.getDOMNode();
    },
    shouldShowTooltip: function () {
      return (this.props.app.state.scale < TheGraph.zbpNormal);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.icon !== this.props.icon ||
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y ||
        nextProps.ports !== this.props.ports ||
        nextProps.selected !== this.props.selected ||
        nextProps.ports.dirty
      );
    },
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var groupClass = "node drag"+(this.props.selected ? " selected" : "");
      this.getDOMNode().setAttribute("class", groupClass);
    },
    render: function() {
      if (this.props.ports.dirty) {
        // This tag is set when an edge or iip changes port colors
        this.props.ports.dirty = false;
      }

      var label = this.props.label;
      var sublabel = this.props.sublabel;
      if (!sublabel || sublabel === label) {
        sublabel = "";
      }
      var x = this.props.x;
      var y = this.props.y;

      // Ports
      var keys, count;
      var processKey = this.props.key;
      var app = this.props.app;
      var graph = this.props.graph;
      var isExport = (this.props.export !== undefined);


      // Inports
      var inports = this.props.ports.inports;
      keys = Object.keys(inports);
      count = keys.length;
      // Make views
      var inportViews = keys.map(function(key){
        var info = inports[key];
        var props = {
          app: app,
          graph: graph,
          key: processKey + ".in." + info.label,
          label: info.label,
          processKey: processKey,
          isIn: true,
          isExport: isExport,
          nodeX: x,
          nodeY: y,
          x: info.x,
          y: info.y,
          port: {node:processKey, port:info.label},
          route: info.route
        };
        return TheGraph.Port(props);
      });

      // Outports
      var outports = this.props.ports.outports;
      keys = Object.keys(outports);
      count = keys.length;
      var outportViews = keys.map(function(key){
        var info = outports[key];
        var props = {
          app: app,
          graph: graph,
          key: processKey + ".out." + info.label,
          label: info.label,
          processKey: processKey,
          isIn: false,
          isExport: isExport,
          nodeX: x,
          nodeY: y,
          x: info.x,
          y: info.y,
          port: {node:processKey, port:info.label},
          route: info.route
        };
        return TheGraph.Port(props);
      });

      // Make sure icon exists
      var icon = TheGraph.FONT_AWESOME[ this.props.icon ];
      if (!icon) { 
        icon = TheGraph.FONT_AWESOME.cog;
      }

      return (
        React.DOM.g(
          {
            className: "node drag", // See componentDidUpdate
            name: this.props.key,
            key: this.props.key,
            title: label,
            transform: "translate("+x+","+y+")"
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
            ref: "icon",
            className: "icon node-icon drag",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize/2,
            children: icon
          }),
          React.DOM.g({
            className: "inports",
            children: inportViews
          }),
          React.DOM.g({
            className: "outports",
            children: outportViews
          }),
          TheGraph.TextBG({
            className: "node-label-bg",
            textClassName: "node-label",
            height: 14,
            halign: "center",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 15,
            text: label
          }),
          TheGraph.TextBG({
            className: "node-sublabel-bg",
            textClassName: "node-sublabel",
            height: 9,
            halign: "center",
            x: TheGraph.nodeSize/2,
            y: TheGraph.nodeSize + 30,
            text: sublabel
          })
        )
      );
    }
  });


})(this);
