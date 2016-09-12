import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import {FakeMouse} from './mixins'
import {findMinMax, merge} from './utils'
import Config from './Config'
import {
  createGraphNode,
  createGraphEdge,
  createGraphIIP,
  createGraphGroup,
  createGraphEdgesGroup,
  createGraphEdgePreview,
  createGraphIIPGroup,
  createGraphNodesGroup,
  createGraphInportsGroup,
  createGraphGroupsGroup,
  createGraphContainerGroup
} from './factories/graph'

// Graph view
export default class TheGraphGraph extends Component {
  mixins = [FakeMouse]
  edgePreview = null
  portInfo = {}
  graphOutports = {}
  graphInports = {}
  updatedIcons = {}
  dirty = false
  libraryDirty = false

  getInitialState () {
    return {
      graph: this.props.graph,
      displaySelectionGroup: true,
      edgePreview: null,
      edgePreviewX: 0,
      edgePreviewY: 0,
      forceSelection: false,
      selectedNodes: [],
      errorNodes: [],
      selectedEdges: [],
      animatedEdges: [],
      offsetX: this.props.offsetX,
      offsetY: this.props.offsetY
    };
  }

  componentDidMount () {
    // To change port colors
    this.props.graph.on("addEdge", this.resetPortRoute);
    this.props.graph.on("changeEdge", this.resetPortRoute);
    this.props.graph.on("removeEdge", this.resetPortRoute);
    this.props.graph.on("removeInitial", this.resetPortRoute);

    // Listen to noflo graph object's events
    this.props.graph.on("changeNode", this.markDirty);
    this.props.graph.on("changeInport", this.markDirty);
    this.props.graph.on("changeOutport", this.markDirty);
    this.props.graph.on("endTransaction", this.markDirty);

    findDOMNode(this).addEventListener("the-graph-node-remove", this.removeNode);
  }

  edgeStart (event) {
    // Forwarded from App.edgeStart()

    // Port that triggered this
    var port = event.detail.port;

    // Complete edge if this is the second tap and ports are compatible
    if (this.state.edgePreview && this.state.edgePreview.isIn !== event.detail.isIn) {
      // TODO also check compatible types
      var halfEdge = this.state.edgePreview;
      if (event.detail.isIn) {
        halfEdge.to = port;
      } else {
        halfEdge.from = port;
      }
      this.addEdge(halfEdge);
      this.cancelPreviewEdge();
      return;
    }

    var edge;
    if (event.detail.isIn) {
      edge = { to: port };
    } else {
      edge = { from: port };
    }
    edge.isIn = event.detail.isIn;
    edge.metadata = { route: event.detail.route };
    edge.type = event.detail.port.type;

    var appDomNode = findDOMNode(this.props.app);
    appDomNode.addEventListener("mousemove", this.renderPreviewEdge);
    appDomNode.addEventListener("track", this.renderPreviewEdge);
    // TODO tap to add new node here
    appDomNode.addEventListener("tap", this.cancelPreviewEdge);

    this.setState({edgePreview: edge});
  }

  cancelPreviewEdge (event) {
    var appDomNode = findDOMNode(this.props.app);
    appDomNode.removeEventListener("mousemove", this.renderPreviewEdge);
    appDomNode.removeEventListener("track", this.renderPreviewEdge);
    appDomNode.removeEventListener("tap", this.cancelPreviewEdge);
    if (this.state.edgePreview) {
      this.setState({edgePreview: null});
      this.markDirty();
    }
  }

  renderPreviewEdge (event) {
    var x = event.x || event.clientX || 0;
    var y = event.y || event.clientY || 0;
    x -= this.props.app.state.offsetX || 0;
    y -= this.props.app.state.offsetY || 0;
    var scale = this.props.app.state.scale;
    this.setState({
      edgePreviewX: (x - this.props.app.state.x) / scale,
      edgePreviewY: (y - this.props.app.state.y) / scale
    });
    this.markDirty();
  }

  addEdge (edge) {
    this.state.graph.addEdge(edge.from.process, edge.from.port, edge.to.process, edge.to.port, edge.metadata);
  }

  moveGroup (nodes, dx, dy) {
    var graph = this.state.graph;

    // Move each group member
    var len = nodes.length;
    for (var i=0; i<len; i++) {
      var node = graph.getNode(nodes[i]);
      if (!node) { continue; }
      if (dx !== undefined) {
        // Move by delta
        graph.setNodeMetadata(node.id, {
          x: node.metadata.x + dx,
          y: node.metadata.y + dy
        });
      } else {
        // Snap to grid
        var snap = Config.base.nodeHeight / 2;
        graph.setNodeMetadata(node.id, {
          x: Math.round(node.metadata.x/snap) * snap,
          y: Math.round(node.metadata.y/snap) * snap
        });
      }
    }
  }

  getComponentInfo (componentName) {
    return this.props.library[componentName];
  }

  getPorts (graph, processName, componentName) {
    var node = graph.getNode(processName);

    var ports = this.portInfo[processName];
    if (!ports) {
      var inports = {};
      var outports = {};
      if (componentName && this.props.library) {
        // Copy ports from library object
        var component = this.getComponentInfo(componentName);
        if (!component) {
          return {
            inports: inports,
            outports: outports
          };
        }

        var i, port, len;
        for (i=0, len=component.outports.length; i<len; i++) {
          port = component.outports[i];
          if (!port.name) { continue; }
          outports[port.name] = {
            label: port.name,
            type: port.type,
            x: node.metadata.width,
            y: node.metadata.height / (len+1) * (i+1)
          };
        }
        for (i=0, len=component.inports.length; i<len; i++) {
          port = component.inports[i];
          if (!port.name) { continue; }
          inports[port.name] = {
            label: port.name,
            type: port.type,
            x: 0,
            y: node.metadata.height / (len+1) * (i+1)
          };
        }
      }
      ports = {
        inports: inports,
        outports: outports
      };
      this.portInfo[processName] = ports;
    }
    return ports;
  }

  getNodeOutport (graph, processName, portName, route, componentName) {
    var ports = this.getPorts(graph, processName, componentName);
    if ( !ports.outports[portName] ) {
      ports.outports[portName] = {
        label: portName,
        x: Config.base.config.nodeWidth,
        y: Config.base.config.nodeHeight / 2
      };
      this.dirty = true;
    }
    var port = ports.outports[portName];
    // Port will have top edge's color
    if (route !== undefined) {
      port.route = route;
    }
    return port;
  }

  getNodeInport (graph, processName, portName, route, componentName) {
    var ports = this.getPorts(graph, processName, componentName);
    if ( !ports.inports[portName] ) {
      ports.inports[portName] = {
        label: portName,
        x: 0,
        y: Config.base.config.nodeHeight / 2
      };
      this.dirty = true;
    }
    var port = ports.inports[portName];
    // Port will have top edge's color
    if (route !== undefined) {
      port.route = route;
    }
    return port;
  }

  resetPortRoute (event) {
    // Trigger nodes with changed ports to rerender
    if (event.from && event.from.node) {
      var fromNode = this.portInfo[event.from.node];
      if (fromNode) {
        fromNode.dirty = true;
        var outport = fromNode.outports[event.from.port];
        if (outport) {
          outport.route = null;
        }
      }
    }
    if (event.to && event.to.node) {
      var toNode = this.portInfo[event.to.node];
      if (toNode) {
        toNode.dirty = true;
        var inport = toNode.inports[event.to.port];
        if (inport) {
          inport.route = null;
        }
      }
    }
  }

  getGraphOutport (key) {
    var exp = this.graphOutports[key];
    if (!exp) {
      exp = {inports:{},outports:{}};
      exp.inports[key] = {
        label: key,
        type: "all",
        route: 5,
        x: 0,
        y: Config.base.config.nodeHeight / 2
      };
      this.graphOutports[key] = exp;
    }
    return exp;
  }
  getGraphInport (key) {
    var exp = this.graphInports[key];
    if (!exp) {
      exp = {inports:{},outports:{}};
      exp.outports[key] = {
        label: key,
        type: "all",
        route: 2,
        x: Config.base.config.nodeWidth,
        y: Config.base.config.nodeHeight / 2
      };
      this.graphInports[key] = exp;
    }
    return exp;
  }
  setSelectedNodes (nodes) {
    this.setState({
      selectedNodes: nodes
    });
    this.markDirty();
  }
  setErrorNodes (errors) {
    this.setState({
      errorNodes: errors
    });
    this.markDirty();
  }
  setSelectedEdges (edges) {
    this.setState({
      selectedEdges: edges
    });
    this.markDirty();
  }
  setAnimatedEdges (edges) {
    this.setState({
      animatedEdges: edges
    });
    this.markDirty();
  }
  updateIcon (nodeId, icon) {
    this.updatedIcons[nodeId] = icon;
    this.markDirty();
  }
  markDirty (event) {
    if (event && event.libraryDirty) {
      this.libraryDirty = true;
    }
    window.requestAnimationFrame(this.triggerRender);
  }

  triggerRender (time) {
    if (!this.isMounted()) {
      return;
    }
    if (this.dirty) {
      return;
    }
    this.dirty = true;
    this.forceUpdate();
  }

  shouldComponentUpdate () {
    // If ports change or nodes move, then edges need to rerender, so we do the whole graph
    return this.dirty;
  }

  render () {
    this.dirty = false;

    var self = this;
    var graph = this.state.graph;
    var library = this.props.library;
    var selectedIds = [];

    // Reset ports if library has changed
    if (this.libraryDirty) {
      this.libraryDirty = false;
      this.portInfo = {};
    }

    // Highlight compatible ports
    var highlightPort = null;
    if (this.state.edgePreview && this.state.edgePreview.type) {
      highlightPort = {
        type: this.state.edgePreview.type,
        isIn: !this.state.edgePreview.isIn
      };
    }

    // Nodes
    var nodes = graph.nodes.map(function (node) {
      var componentInfo = self.getComponentInfo(node.component);
      var key = node.id;
      if (!node.metadata) {
        node.metadata = {};
      }
      if (node.metadata.x === undefined) {
        node.metadata.x = 0;
      }
      if (node.metadata.y === undefined) {
        node.metadata.y = 0;
      }
      if (node.metadata.width === undefined) {
        node.metadata.width = Config.base.config.nodeWidth;
      }
      node.metadata.height = Config.base.config.nodeHeight;
      if (Config.base.config.autoSizeNode && componentInfo) {
        // Adjust node height based on number of ports.
        var portCount = Math.max(componentInfo.inports.length, componentInfo.outports.length);
        if (portCount > Config.base.config.maxPortCount) {
          var diff = portCount - Config.base.config.maxPortCount;
          node.metadata.height = Config.base.config.nodeHeight + (diff * Config.base.config.nodeHeightIncrement);
        }
      }
      if (!node.metadata.label || node.metadata.label === "") {
        node.metadata.label = key;
      }
      var icon = "cog";
      var iconsvg = "";
      if (self.updatedIcons[key]) {
        icon = self.updatedIcons[key];
      } else if (componentInfo && componentInfo.icon) {
        icon = componentInfo.icon;
      } else if (componentInfo && componentInfo.iconsvg) {
        iconsvg = componentInfo.iconsvg;
      }
      var selected = (self.state.selectedNodes[key] === true);
      if (selected) {
        selectedIds.push(key);
      }

      var nodeOptions = {
        key: key,
        nodeID: key,
        x: node.metadata.x,
        y: node.metadata.y,
        label: node.metadata.label,
        sublabel: node.metadata.sublabel || node.component,
        width: node.metadata.width,
        height: node.metadata.height,
        app: self.props.app,
        graphView: self,
        graph: graph,
        node: node,
        icon: icon,
        iconsvg: iconsvg,
        ports: self.getPorts(graph, key, node.component),
        onNodeSelection: self.props.onNodeSelection,
        selected: selected,
        error: (self.state.errorNodes[key] === true),
        showContext: self.props.showContext,
        highlightPort: highlightPort
      };

      nodeOptions = merge(Config.node, nodeOptions);
      return createGraphNode.call(this, nodeOptions);
    });

    // Edges
    var edges = graph.edges.map(function (edge) {
      var source = graph.getNode(edge.from.node);
      var target = graph.getNode(edge.to.node);
      if (!source || !target) {
        return;
      }

      var route = 0;
      if (edge.metadata && edge.metadata.route) {
        route = edge.metadata.route;
      }

      // Initial ports from edges, and give port top/last edge color
      var sourcePort = self.getNodeOutport(graph, edge.from.node, edge.from.port, route, source.component);
      var targetPort = self.getNodeInport(graph, edge.to.node, edge.to.port, route, target.component);

      var label = source.metadata.label + '() ' +
        edge.from.port.toUpperCase() +
        (edge.from.hasOwnProperty('index') ? '['+edge.from.index+']' : '') + ' -> ' +
        edge.to.port.toUpperCase() +
        (edge.to.hasOwnProperty('index') ? '['+edge.to.index+']' : '') + ' ' +
        target.metadata.label + '()';
      var key = edge.from.node + '() ' +
        edge.from.port.toUpperCase() +
        (edge.from.hasOwnProperty('index') ? '['+edge.from.index+']' : '') + ' -> ' +
        edge.to.port.toUpperCase() +
        (edge.to.hasOwnProperty('index') ? '['+edge.to.index+']' : '') + ' ' +
        edge.to.node + '()';

      var edgeOptions = {
        key: key,
        edgeID: key,
        graph: graph,
        edge: edge,
        app: self.props.app,
        sX: source.metadata.x + source.metadata.width,
        sY: source.metadata.y + sourcePort.y,
        tX: target.metadata.x,
        tY: target.metadata.y + targetPort.y,
        label: label,
        route: route,
        onEdgeSelection: self.props.onEdgeSelection,
        selected: (self.state.selectedEdges.indexOf(edge) !== -1),
        animated: (self.state.animatedEdges.indexOf(edge) !== -1),
        showContext: self.props.showContext
      };

      edgeOptions = merge(Config.graph.edge, edgeOptions);
      return createGraphEdge.call(this, edgeOptions);
    });

    // IIPs
    var iips = graph.initializers.map(function (iip) {
      var target = graph.getNode(iip.to.node);
      if (!target) { return; }

      var targetPort = self.getNodeInport(graph, iip.to.node, iip.to.port, 0, target.component);
      var tX = target.metadata.x;
      var tY = target.metadata.y + targetPort.y;

      var data = iip.from.data;
      var type = typeof data;
      var label = data === true || data === false || type === "number" || type === "string" ? data : type;

      var iipOptions = {
        graph: graph,
        label: label,
        x: tX,
        y: tY
      };

      iipOptions = merge(Config.graph.iip, iipOptions);
      return createGraphIIP.call(this, iipOptions);

    });


    // Inport exports
    var inports = Object.keys(graph.inports).map(function (key) {
      var inport = graph.inports[key];
      // Export info
      var label = key;
      var nodeKey = inport.process;
      var portKey = inport.port;
      if (!inport.metadata) {
        inport.metadata = {x:0, y:0};
      }
      var metadata = inport.metadata;
      if (!metadata.x) { metadata.x = 0; }
      if (!metadata.y) { metadata.y = 0; }
      if (!metadata.width) { metadata.width = Config.base.config.nodeWidth; }
      if (!metadata.height) { metadata.height = Config.base.config.nodeHeight; }
      // Private port info
      var portInfo = self.portInfo[nodeKey];
      if (!portInfo) {
        console.warn("Node "+nodeKey+" not found for graph inport "+label);
        return;
      }
      var privatePort = portInfo.inports[portKey];
      if (!privatePort) {
        console.warn("Port "+nodeKey+"."+portKey+" not found for graph inport "+label);
        return;
      }
      // Private node
      var privateNode = graph.getNode(nodeKey);
      if (!privateNode) {
        console.warn("Node "+nodeKey+" not found for graph inport "+label);
        return;
      }
      // Node view
      var expNode = {
        key: "inport.node."+key,
        export: inport,
        exportKey: key,
        x: metadata.x,
        y: metadata.y,
        width: metadata.width,
        height: metadata.height,
        label: label,
        app: self.props.app,
        graphView: self,
        graph: graph,
        node: {},
        ports: self.getGraphInport(key),
        isIn: true,
        icon: (metadata.icon ? metadata.icon : "sign-in"),
        showContext: self.props.showContext
      };
      expNode = merge(Config.graph.inportNode, expNode);
      // Edge view
      var expEdge = {
        key: "inport.edge."+key,
        export: inport,
        exportKey: key,
        graph: graph,
        app: self.props.app,
        edge: {},
        route: (metadata.route ? metadata.route : 2),
        isIn: true,
        label: "export in " + label.toUpperCase() + " -> " + portKey.toUpperCase() + " " + privateNode.metadata.label,
        sX: expNode.x + Config.base.config.nodeWidth,
        sY: expNode.y + Config.base.config.nodeHeight / 2,
        tX: privateNode.metadata.x + privatePort.x,
        tY: privateNode.metadata.y + privatePort.y,
        showContext: self.props.showContext
      };
      expEdge = merge(Config.graph.inportEdge, expEdge);
      edges.unshift(createGraphEdge.call(this, expEdge));
      return createGraphNode.call(this, expNode);
    });


    // Outport exports
    var outports = Object.keys(graph.outports).map(function (key) {
      var outport = graph.outports[key];
      // Export info
      var label = key;
      var nodeKey = outport.process;
      var portKey = outport.port;
      if (!outport.metadata) {
        outport.metadata = {x:0, y:0};
      }
      var metadata = outport.metadata;
      if (!metadata.x) { metadata.x = 0; }
      if (!metadata.y) { metadata.y = 0; }
      if (!metadata.width) { metadata.width = Config.base.config.nodeWidth; }
      if (!metadata.height) { metadata.height = Config.base.config.nodeHeight; }
      // Private port info
      var portInfo = self.portInfo[nodeKey];
      if (!portInfo) {
        console.warn("Node "+nodeKey+" not found for graph outport "+label);
        return;
      }
      var privatePort = portInfo.outports[portKey];
      if (!privatePort) {
        console.warn("Port "+nodeKey+"."+portKey+" not found for graph outport "+label);
        return;
      }
      // Private node
      var privateNode = graph.getNode(nodeKey);
      if (!privateNode) {
        console.warn("Node "+nodeKey+" not found for graph outport "+label);
        return;
      }
      // Node view
      var expNode = {
        key: "outport.node."+key,
        export: outport,
        exportKey: key,
        x: metadata.x,
        y: metadata.y,
        width: metadata.width,
        height: metadata.height,
        label: label,
        app: self.props.app,
        graphView: self,
        graph: graph,
        node: {},
        ports: self.getGraphOutport(key),
        isIn: false,
        icon: (metadata.icon ? metadata.icon : "sign-out"),
        showContext: self.props.showContext
      };
      expNode = merge(Config.graph.outportNode, expNode);
      // Edge view
      var expEdge = {
        key: "outport.edge."+key,
        export: outport,
        exportKey: key,
        graph: graph,
        app: self.props.app,
        edge: {},
        route: (metadata.route ? metadata.route : 4),
        isIn: false,
        label: privateNode.metadata.label + " " + portKey.toUpperCase() + " -> " + label.toUpperCase() + " export out",
        sX: privateNode.metadata.x + privatePort.x,
        sY: privateNode.metadata.y + privatePort.y,
        tX: expNode.x,
        tY: expNode.y + Config.base.config.nodeHeight / 2,
        showContext: self.props.showContext
      };
      expEdge = merge(Config.graph.outportEdge, expEdge);
      edges.unshift(createGraphEdge.call(this, expEdge));
      return createGraphNode.call(this, expNode);
    });

    // Groups
    var groups = graph.groups.map(function (group) {
      if (group.nodes.length < 1) {
        return;
      }
      var limits = findMinMax(graph, group.nodes);
      if (!limits) {
        return;
      }
      var groupOptions = {
        key: "group."+group.name,
        graph: graph,
        item: group,
        app: self.props.app,
        minX: limits.minX,
        minY: limits.minY,
        maxX: limits.maxX,
        maxY: limits.maxY,
        scale: self.props.scale,
        label: group.name,
        nodes: group.nodes,
        description: group.metadata.description,
        color: group.metadata.color,
        triggerMoveGroup: self.moveGroup,
        showContext: self.props.showContext
      };
      groupOptions = merge(Config.graph.nodeGroup, groupOptions);
      return createGraphGroup.call(this, groupOptions);
    });

    // Selection pseudo-group
    if (this.state.displaySelectionGroup &&
      selectedIds.length >= 2) {
      var limits = findMinMax(graph, selectedIds);
      if (limits) {
        var pseudoGroup = {
          name: "selection",
          nodes: selectedIds,
          metadata: {color:1}
        };
        var selectionGroupOptions = {
          graph: graph,
          app: self.props.app,
          item: pseudoGroup,
          minX: limits.minX,
          minY: limits.minY,
          maxX: limits.maxX,
          maxY: limits.maxY,
          scale: self.props.scale,
          color: pseudoGroup.metadata.color,
          triggerMoveGroup: self.moveGroup,
          showContext: self.props.showContext
        };
        selectionGroupOptions = merge(Config.graph.selectionGroup, selectionGroupOptions);
        var selectionGroup = createGraphGroup.call(this, selectionGroupOptions);
        groups.push(selectionGroup);
      }
    }


    // Edge preview
    var edgePreview = this.state.edgePreview;
    if (edgePreview) {
      var edgePreviewOptions;
      if (edgePreview.from) {
        var source = graph.getNode(edgePreview.from.process);
        var sourcePort = this.getNodeOutport(graph, edgePreview.from.process, edgePreview.from.port);
        edgePreviewOptions = {
          sX: source.metadata.x + source.metadata.width,
          sY: source.metadata.y + sourcePort.y,
          tX: this.state.edgePreviewX,
          tY: this.state.edgePreviewY,
          route: edgePreview.metadata.route
        };
      } else {
        var target = graph.getNode(edgePreview.to.process);
        var targetPort = this.getNodeInport(graph, edgePreview.to.process, edgePreview.to.port);
        edgePreviewOptions = {
          sX: this.state.edgePreviewX,
          sY: this.state.edgePreviewY,
          tX: target.metadata.x,
          tY: target.metadata.y + targetPort.y,
          route: edgePreview.metadata.route
        };
      }
      edgePreviewOptions = merge(Config.graph.edgePreview, edgePreviewOptions);
      var edgePreviewView = createGraphEdgePreview.call(this, edgePreviewOptions);
      edges.push(edgePreviewView);
    }

    var groupsOptions = merge(Config.graph.groupsGroup, { children: groups });
    var groupsGroup = createGraphGroupsGroup.call(this, groupsOptions);

    var edgesOptions = merge(Config.graph.edgesGroup, { children: edges });
    var edgesGroup = createGraphEdgesGroup.call(this, edgesOptions);

    var iipsOptions = merge(Config.graph.iipsGroup, { children: iips });
    var iipsGroup = createGraphIIPGroup.call(this, iipsOptions);

    var nodesOptions = merge(Config.graph.nodesGroup, { children: nodes });
    var nodesGroup = createGraphNodesGroup.call(this, nodesOptions);

    var inportsOptions = merge(Config.graph.inportsGroup, { children: inports });
    var inportsGroup = createGraphInportsGroup.call(this, inportsOptions);

    var outportsOptions = merge(Config.graph.outportsGroup, { children: outports });
    var outportsGroup = createGraphGroupsGroup.call(this, outportsOptions);

    var containerContents = [
      groupsGroup,
      edgesGroup,
      iipsGroup,
      nodesGroup,
      inportsGroup,
      outportsGroup
    ];

    var selectedClass = (this.state.forceSelection || selectedIds.length > 0) ? ' selection' : '';

    var containerOptions = merge(Config.graph.container, { className: 'graph' + selectedClass });
    return createGraphContainerGroup.call(this, containerOptions, containerContents);

  }
}
