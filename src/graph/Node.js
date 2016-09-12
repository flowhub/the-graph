import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {merge} from './utils'
import Config from './Config'
import {Tooltip} from './mixins'
import Menu from './Menu'
import NodeMenuPorts from './NodeMenuPorts'
import NodeMenu from './NodeMenu'
import {
  createNodeBorderRect,
  createNodeGroup,
  createNodeBackgroundRect,
  createNodeIconSVG,
  createNodeIconText,
  createNodeInnerRect,
  createNodeInportsGroup,
  createNodeLabelGroup,
  createNodeLabelRect,
  createNodeLabelText,
  createNodeOutportsGroup,
  createNodePort,
  createNodeSublabelGroup,
  createNodeSublabelRect,
  createNodeSublabelText
} from './factories/node'

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

// Node view
export default class TheGraphNode extends Component {
  mixins = [
    Tooltip
  ]

  componentDidMount () {
    var domNode = findDOMNode(this);

    // Dragging
    domNode.addEventListener("trackstart", this.onTrackStart);

    // Tap to select
    if (this.props.onNodeSelection) {
      domNode.addEventListener("tap", this.onNodeSelection, true);
    }

    // Context menu
    if (this.props.showContext) {
      findDOMNode(this).addEventListener("contextmenu", this.showContext);
      findDOMNode(this).addEventListener("hold", this.showContext);
    }

  }

  onNodeSelection (event) {
    // Don't tap app (unselect)
    event.stopPropagation();

    throw Error('FIX ME')
    var toggle = (TheGraph.metaKeyPressed || event.pointerType==="touch");
    this.props.onNodeSelection(this.props.nodeID, this.props.node, toggle);
  }

  onTrackStart (event) {
    // Don't drag graph
    event.stopPropagation();

    // Don't change selection
    event.preventTap();

    // Don't drag under menu
    if (this.props.app.menuShown) { return; }

    // Don't drag while pinching
    if (this.props.app.pinching) { return; }

    var domNode = findDOMNode(this);
    domNode.addEventListener("track", this.onTrack);
    domNode.addEventListener("trackend", this.onTrackEnd);

    // Moving a node should only be a single transaction
    if (this.props.export) {
      this.props.graph.startTransaction('moveexport');
    } else {
      this.props.graph.startTransaction('movenode');
    }
  }

  onTrack (event) {
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
      this.props.graph.setNodeMetadata(this.props.nodeID, {
        x: this.props.node.metadata.x + deltaX,
        y: this.props.node.metadata.y + deltaY
      });
    }
  }

  onTrackEnd (event) {
    // Don't fire on graph
    event.stopPropagation();

    var domNode = findDOMNode(this);
    domNode.removeEventListener("track", this.onTrack);
    domNode.removeEventListener("trackend", this.onTrackEnd);

    // Snap to grid
    var snapToGrid = true;
    var snap = Config.node.snap / 2;
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
        this.props.graph.setNodeMetadata(this.props.nodeID, {
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
  }

  showContext (event) {
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
      itemKey: (this.props.export ? this.props.exportKey : this.props.nodeID),
      item: (this.props.export ? this.props.export : this.props.node)
    });
  }

  getContext (menu, options, hide) {
    // If this node is an export
    if (this.props.export) {
      return Menu({
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
    var processKey = this.props.nodeID;
    var highlightPort = this.props.highlightPort;

    // If there is a preview edge started, only show connectable ports
    if (this.props.graphView.state.edgePreview) {
      if (this.props.graphView.state.edgePreview.isIn) {
        // Show outputs
        return NodeMenuPorts({
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
        return NodeMenuPorts({
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
    return NodeMenu({
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
  }

  getTooltipTrigger () {
    return findDOMNode(this);
  }

  shouldShowTooltip () {
    return (this.props.app.state.scale < Config.base.zbpNormal);
  }

  shouldComponentUpdate (nextProps, nextState) {
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
  }

  render () {
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
    var processKey = this.props.nodeID;
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
      return createNodePort(props);
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
      return createNodePort(props);
    });

    // Node Icon
    var icon = Config.FONT_AWESOME[ this.props.icon ];
    if (!icon) {
      icon = Config.FONT_AWESOME.cog;
    }

    var iconContent;
    if (this.props.iconsvg && this.props.iconsvg !== "") {
      var iconSVGOptions = merge(Config.node.iconsvg, {
        src: this.props.iconsvg,
        x: Config.base.config.nodeRadius - 4,
        y: Config.base.config.nodeRadius - 4,
        width: this.props.width - 10,
        height: this.props.height - 10
      });
      iconContent = createNodeIconSVG.call(this, iconSVGOptions);
    } else {
      var iconOptions = merge(Config.node.icon, {
        x: this.props.width / 2,
        y: this.props.height / 2,
        children: icon });
      iconContent = createNodeIconText.call(this, iconOptions);
    }

    var backgroundRectOptions = merge(Config.node.background, { width: this.props.width, height: this.props.height + 25 });
    var backgroundRect = createNodeBackgroundRect.call(this, backgroundRectOptions);

    var borderRectOptions = merge(Config.node.border, { width: this.props.width, height: this.props.height });
    var borderRect = createNodeBorderRect.call(this, borderRectOptions);

    var innerRectOptions = merge(Config.node.innerRect, { width: this.props.width - 6, height: this.props.height - 6 });
    var innerRect = createNodeInnerRect.call(this, innerRectOptions);

    var inportsOptions = merge(Config.node.inports, { children: inportViews });
    var inportsGroup = createNodeInportsGroup.call(this, inportsOptions);

    var outportsOptions = merge(Config.node.outports, { children: outportViews });
    var outportsGroup = createNodeOutportsGroup.call(this, outportsOptions);

    var labelTextOptions = merge(Config.node.labelText, { x: this.props.width / 2, y: this.props.height + 15, children: label });
    var labelText = createNodeLabelText.call(this, labelTextOptions);

    var labelRectX = this.props.width / 2;
    var labelRectY = this.props.height + 15;
    var labelRectOptions = buildLabelRectOptions(14, labelRectX, labelRectY, label.length, Config.node.labelRect.className);
    labelRectOptions = merge(Config.node.labelRect, labelRectOptions);
    var labelRect = createNodeLabelRect.call(this, labelRectOptions);
    var labelGroup = createNodeLabelGroup.call(this, Config.node.labelBackground, [labelRect, labelText]);

    var sublabelTextOptions = merge(Config.node.sublabelText, { x: this.props.width / 2, y: this.props.height + 30, children: sublabel });
    var sublabelText = createNodeSublabelText.call(this, sublabelTextOptions);

    var sublabelRectX = this.props.width / 2;
    var sublabelRectY = this.props.height + 30;
    var sublabelRectOptions = buildLabelRectOptions(9, sublabelRectX, sublabelRectY, sublabel.length, Config.node.sublabelRect.className);
    sublabelRectOptions = merge(Config.node.sublabelRect, sublabelRectOptions);
    var sublabelRect = createNodeSublabelRect.call(this, sublabelRectOptions);
    var sublabelGroup = createNodeSublabelGroup.call(this, Config.node.sublabelBackground, [sublabelRect, sublabelText]);

    var nodeContents = [
      backgroundRect,
      borderRect,
      innerRect,
      iconContent,
      inportsGroup,
      outportsGroup,
      labelGroup,
      sublabelGroup
    ];

    var nodeOptions = {
      className: "node drag"+
      (this.props.selected ? " selected" : "")+
      (this.props.error ? " error" : ""),
      name: this.props.nodeID,
      key: this.props.nodeID,
      title: label,
      transform: "translate("+x+","+y+")"
    };
    nodeOptions = merge(Config.node.container, nodeOptions);

    return createNodeGroup.call(this, nodeOptions, nodeContents);
  }
}
