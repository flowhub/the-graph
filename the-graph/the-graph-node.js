(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Initialize namespace for configuration and factory functions.
  var config = TheGraph.config.node = {
    snap: TheGraph.config.nodeSize,
    container: {
      className: "node drag"
    },
    background: {
      className: "node-bg"
    },
    border: {
      className: "node-border drag",
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius
    },
    innerRect: {
      className: "node-rect drag",
      x: 3,
      y: 3,
      rx: TheGraph.config.nodeRadius - 2,
      ry: TheGraph.config.nodeRadius - 2
    },
    icon: {
      ref: "icon",
      className: "icon node-icon drag"
    },
    inports: {
      className: "inports"
    },
    outports: {
      className: "outports"
    },
    labelBackground: {
      className: "node-label-bg"
    },
    labelRect: {
      className: "text-bg-rect"
    },
    labelText: {
      className: "node-label"
    },
    sublabelBackground: {
      className: "node-sublabel-bg"
    },
    sublabelRect: {
      className: "text-bg-rect"
    },
    sublabelText: {
      className: "node-sublabel"
    }
  };

  // These factories use generic factories from the core, but
  // each is called separately allowing developers to intercept
  // individual elements of the node creation.
  var factories = TheGraph.factories.node = {
    createNodeGroup: TheGraph.factories.createGroup,
    createNodeBackgroundRect: TheGraph.factories.createRect,
    createNodeBorderRect: TheGraph.factories.createRect,
    createNodeInnerRect: TheGraph.factories.createRect,
    createNodeIconText: TheGraph.factories.createText,
    createNodeInportsGroup: TheGraph.factories.createGroup,
    createNodeOutportsGroup: TheGraph.factories.createGroup,
    createNodeLabelGroup: TheGraph.factories.createGroup,
    createNodeLabelRect: TheGraph.factories.createRect,
    createNodeLabelText: TheGraph.factories.createText,
    createNodeSublabelGroup: TheGraph.factories.createGroup,
    createNodeSublabelRect: TheGraph.factories.createRect,
    createNodeSublabelText: TheGraph.factories.createText,
    createNodePort: createNodePort
  };

  function createNodePort(options) {
    return TheGraph.Port(options);
  }

  // PolymerGestures monkeypatch
  PolymerGestures.dispatcher.gestures.forEach( function (gesture) {
    // hold
    if (gesture.HOLD_DELAY) {
      gesture.HOLD_DELAY = 500;
    }
    // track
    if (gesture.WIGGLE_THRESHOLD) {
      gesture.WIGGLE_THRESHOLD = 8;
    }
  });

  // Node view
  TheGraph.Node = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip
    ],
    componentDidMount: function () {
      // Dragging
      this.getDOMNode().addEventListener("trackstart", this.onTrackStart);

      // Tap to select
      if (this.props.onNodeSelection) {
        this.getDOMNode().addEventListener("tap", this.onNodeSelection, true);
      }

      // Context menu
      if (this.props.showContext) {
        this.getDOMNode().addEventListener("contextmenu", this.showContext);
        this.getDOMNode().addEventListener("hold", this.showContext);
      }

    },
    onNodeSelection: function (event) {
      // Don't tap app (unselect)
      event.stopPropagation();

      var toggle = (TheGraph.metaKeyPressed || event.pointerType==="touch");
      this.props.onNodeSelection(this.props.key, this.props.node, toggle);
    },
    onTrackStart: function (event) {
      // Don't drag graph
      event.stopPropagation();

      // Don't change selection
      event.preventTap();

      // Don't drag under menu
      if (this.props.app.menuShown) { return; }

      // Don't drag while pinching
      if (this.props.app.pinching) { return; }

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

      // Don't drag while pinching
      if (this.props.app.pinching) { return; }

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

      // Snap to grid
      var snapToGrid = true;
      var snap = config.snap / 2;
      if (snapToGrid) {
        var x, y;
        if (this.props.export) {
          var newPos = {
            x: Math.round(this.props.export.metadata.x/snap) * snap,
            y: Math.round(this.props.export.metadata.y/snap) * snap
          };
          if (this.props.isIn) {
            this.props.graph.setInportMetadata(this.props.exportKey, newPos);
          } else {
            this.props.graph.setOutportMetadata(this.props.exportKey, newPos);
          }
        } else {
          this.props.graph.setNodeMetadata(this.props.key, {
            x: Math.round(this.props.node.metadata.x/snap) * snap,
            y: Math.round(this.props.node.metadata.y/snap) * snap
          });
        }
      }

      // Moving a node should only be a single transaction
      if (this.props.export) {
        this.props.graph.endTransaction('moveexport');
      } else {
        this.props.graph.endTransaction('movenode');
      }
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "node"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: (this.props.export ? this.props.exportKey : this.props.key),
        item: (this.props.export ? this.props.export : this.props.node)
      });
    },
    getContext: function (menu, options, hide) {
      // If this node is an export
      if (this.props.export) {
        return TheGraph.Menu({
          menu: menu,
          options: options,
          triggerHideContext: hide,
          label: this.props.exportKey
        });
      }

      // Absolute position of node
      var x = options.x;
      var y = options.y;
      var scale = this.props.app.state.scale;
      var appX = this.props.app.state.x;
      var appY = this.props.app.state.y;
      var nodeX = (this.props.x + this.props.width / 2) * scale + appX;
      var nodeY = (this.props.y + this.props.height / 2) * scale + appY;
      var deltaX = nodeX - x;
      var deltaY = nodeY - y;
      var ports = this.props.ports;
      var processKey = this.props.key;
      var highlightPort = this.props.highlightPort;

      // If there is a preview edge started, only show connectable ports
      if (this.props.graphView.state.edgePreview) {
        if (this.props.graphView.state.edgePreview.isIn) {
          // Show outputs
          return TheGraph.NodeMenuPorts({
            ports: ports.outports,
            triggerHideContext: hide,
            isIn: false,
            scale: scale,
            processKey: processKey,
            deltaX: deltaX,
            deltaY: deltaY,
            translateX: x,
            translateY: y,
            nodeWidth: this.props.width,
            nodeHeight: this.props.height,
            highlightPort: highlightPort
          });
        } else {
          // Show inputs
          return TheGraph.NodeMenuPorts({
            ports: ports.inports,
            triggerHideContext: hide,
            isIn: true,
            scale: scale,
            processKey: processKey,
            deltaX: deltaX,
            deltaY: deltaY,
            translateX: x,
            translateY: y,
            nodeWidth: this.props.width,
            nodeHeight: this.props.height,
            highlightPort: highlightPort
          });
        }
      }

      // Default, show whole node menu
      return TheGraph.NodeMenu({
        menu: menu,
        options: options,
        triggerHideContext: hide,
        label: this.props.label,
        graph: this.props.graph,
        graphView: this.props.graphView,
        node: this,
        icon: this.props.icon,
        ports: ports,
        process: this.props.node,
        processKey: processKey,
        x: x,
        y: y,
        nodeWidth: this.props.width,
        nodeHeight: this.props.height,
        deltaX: deltaX,
        deltaY: deltaY,
        highlightPort: highlightPort
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
        nextProps.x !== this.props.x || 
        nextProps.y !== this.props.y ||
        nextProps.icon !== this.props.icon ||
        nextProps.label !== this.props.label ||
        nextProps.sublabel !== this.props.sublabel ||
        nextProps.ports !== this.props.ports ||
        nextProps.selected !== this.props.selected ||
        nextProps.error !== this.props.error ||
        nextProps.highlightPort !== this.props.highlightPort ||
        nextProps.ports.dirty === true
      );
    },
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var groupClass = "node drag"+(this.props.selected ? " selected" : "");
      groupClass += (this.props.error ? " error" : "");
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
      var width = this.props.width;
      var height = this.props.height;

      // Ports
      var keys, count;
      var processKey = this.props.key;
      var app = this.props.app;
      var graph = this.props.graph;
      var node = this.props.node;
      var isExport = (this.props.export !== undefined);
      var showContext = this.props.showContext;
      var highlightPort = this.props.highlightPort;

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
          node: node,
          key: processKey + ".in." + info.label,
          label: info.label,
          processKey: processKey,
          isIn: true,
          isExport: isExport,
          nodeX: x,
          nodeY: y,
          nodeWidth: width,
          nodeHeight: height,
          x: info.x,
          y: info.y,
          port: {process:processKey, port:info.label, type:info.type},
          highlightPort: highlightPort,
          route: info.route,
          showContext: showContext
        };
        return factories.createNodePort(props);
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
          node: node,
          key: processKey + ".out." + info.label,
          label: info.label,
          processKey: processKey,
          isIn: false,
          isExport: isExport,
          nodeX: x,
          nodeY: y,
          nodeWidth: width,
          nodeHeight: height,
          x: info.x,
          y: info.y,
          port: {process:processKey, port:info.label, type:info.type},
          highlightPort: highlightPort,
          route: info.route,
          showContext: showContext
        };
        return factories.createNodePort(props);
      });

      // Make sure icon exists
      var icon = TheGraph.FONT_AWESOME[ this.props.icon ];
      if (!icon) { 
        icon = TheGraph.FONT_AWESOME.cog;
      }

      var backgroundRectOptions = TheGraph.merge(config.background, { width: this.props.width, height: this.props.height + 25 });
      var backgroundRect = factories.createNodeBackgroundRect.call(this, backgroundRectOptions);

      var borderRectOptions = TheGraph.merge(config.border, { width: this.props.width, height: this.props.height });
      var borderRect = factories.createNodeBorderRect.call(this, borderRectOptions);
      
      var innerRectOptions = TheGraph.merge(config.innerRect, { width: this.props.width - 6, height: this.props.height - 6 });
      var innerRect = factories.createNodeInnerRect.call(this, innerRectOptions);

      var iconOptions = TheGraph.merge(config.icon, { x: this.props.width / 2, y: this.props.height / 2, children: icon });
      var iconText = factories.createNodeIconText.call(this, iconOptions);
      
      var inportsOptions = TheGraph.merge(config.inports, { children: inportViews });
      var inportsGroup = factories.createNodeInportsGroup.call(this, inportsOptions);

      var outportsOptions = TheGraph.merge(config.outports, { children: outportViews });
      var outportsGroup = factories.createNodeOutportsGroup.call(this, outportsOptions);

      var labelTextOptions = TheGraph.merge(config.labelText, { x: this.props.width / 2, y: this.props.height + 15, children: label });
      var labelText = factories.createNodeLabelText.call(this, labelTextOptions);

      var labelRectX = this.props.width / 2;
      var labelRectY = this.props.height + 15;
      var labelRectOptions = buildLabelRectOptions(14, labelRectX, labelRectY, label.length, config.labelRect.className);
      labelRectOptions = TheGraph.merge(config.labelRect, labelRectOptions);
      var labelRect = factories.createNodeLabelRect.call(this, labelRectOptions);
      var labelGroup = factories.createNodeLabelGroup.call(this, config.labelBackground, [labelRect, labelText]);

      var sublabelTextOptions = TheGraph.merge(config.sublabelText, { x: this.props.width / 2, y: this.props.height + 30, children: sublabel });
      var sublabelText = factories.createNodeSublabelText.call(this, sublabelTextOptions);

      var sublabelRectX = this.props.width / 2;
      var sublabelRectY = this.props.height + 30;
      var sublabelRectOptions = buildLabelRectOptions(9, sublabelRectX, sublabelRectY, sublabel.length, config.sublabelRect.className);
      sublabelRectOptions = TheGraph.merge(config.sublabelRect, sublabelRectOptions);
      var sublabelRect = factories.createNodeSublabelRect.call(this, sublabelRectOptions);
      var sublabelGroup = factories.createNodeSublabelGroup.call(this, config.sublabelBackground, [sublabelRect, sublabelText]);

      var nodeContents = [
        backgroundRect,
        borderRect,
        innerRect,
        iconText,
        inportsGroup,
        outportsGroup,
        labelGroup,
        sublabelGroup
      ];

      var nodeOptions = {
        name: this.props.key,
        key: this.props.key,
        title: label,
        transform: "translate("+x+","+y+")"
      };
      nodeOptions = TheGraph.merge(config.container, nodeOptions);

      return factories.createNodeGroup.call(this, nodeOptions, nodeContents);
    }
  });

  function buildLabelRectOptions(height, x, y, len, className) {

    var width = len * height * 2/3;
    var radius = height / 2;
    x -= width / 2;
    y -= height / 2;

    var result = {
      className: className,
      height: height * 1.1,
      width: width,
      rx: radius,
      ry: radius,
      x: x,
      y: y
    };

    return result;
  }

})(this);
