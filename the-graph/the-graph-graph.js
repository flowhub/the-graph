(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Graph view

  TheGraph.Graph = React.createClass({
    mixins: [TheGraph.mixins.FakeMouse],
    getInitialState: function() {
      return {
        graph: this.props.graph,
        edgePreview: null,
        edgePreviewX: 0,
        edgePreviewY: 0,
        selectedNodes: [],
        selectedEdges: []
      };
    },
    componentDidMount: function () {
      // To change port colors
      this.props.graph.on("changeEdge", this.resetPortRoute);
      this.props.graph.on("removeEdge", this.resetPortRoute);
      this.props.graph.on("removeInitial", this.resetPortRoute);

      // Listen to noflo graph object's events
      this.props.graph.on("changeNode", this.markDirty);
      this.props.graph.on("changeInport", this.markDirty);
      this.props.graph.on("changeOutport", this.markDirty);
      this.props.graph.on("endTransaction", this.markDirty);

      this.getDOMNode().addEventListener("the-graph-node-remove", this.removeNode);
    },
    edgePreview: null,
    edgeStart: function (event) {
      // Forwarded from App.edgeStart()

      // Port that triggered this
      var port = {
        node: event.detail.process,
        port: event.detail.port
      };

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
      this.props.app.getDOMNode().addEventListener("pointermove", this.renderPreviewEdge);
      // TODO tap to add new node here
      this.props.app.getDOMNode().addEventListener("tap", this.cancelPreviewEdge);

      this.setState({edgePreview: edge});
    },
    cancelPreviewEdge: function (event) {
      this.props.app.getDOMNode().removeEventListener("pointermove", this.renderPreviewEdge);
      this.props.app.getDOMNode().removeEventListener("tap", this.cancelPreviewEdge);
      this.setState({edgePreview: null});
      this.markDirty();
    },
    renderPreviewEdge: function (event) {
      var scale = this.props.app.state.scale;
      this.setState({
        edgePreviewX: (event.clientX - this.props.app.state.x) / scale,
        edgePreviewY: (event.clientY - this.props.app.state.y) / scale
      });
      this.markDirty();
    },
    addEdge: function (edge) {
      this.state.graph.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata);
    },
    moveGroup: function (nodes, dx, dy) {
      var graph = this.state.graph;

      graph.startTransaction('movegroup');

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
          var snap = TheGraph.nodeSize/2;
          graph.setNodeMetadata(node.id, {
            x: Math.round(node.metadata.x/snap) * snap,
            y: Math.round(node.metadata.y/snap) * snap
          });
        }
      }

      graph.endTransaction('movegroup');
    },
    getComponentInfo: function (componentName) {
      return this.props.library[componentName];
    },
    portInfo: {},
    getPorts: function (processName, componentName) {
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
              x: TheGraph.nodeSize,
              y: TheGraph.nodeSize / (len+1) * (i+1)
            };
          }
          for (i=0, len=component.inports.length; i<len; i++) {
            port = component.inports[i];
            if (!port.name) { continue; }
            inports[port.name] = {
              label: port.name,
              type: port.type,
              x: 0,
              y: TheGraph.nodeSize / (len+1) * (i+1)
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
    },
    getNodeOutport: function (processName, portName, route, componentName) {
      var ports = this.getPorts(processName, componentName);
      if ( !ports.outports[portName] ) {
        ports.outports[portName] = {
          label: portName,
          x: TheGraph.nodeSize,
          y: TheGraph.nodeSize/2
        };
        this.dirty = true;
      }
      var port = ports.outports[portName];
      // Port will have top edge's color
      if (route !== undefined) {
        port.route = route;
      }
      return port;
    },
    getNodeInport: function (processName, portName, route, componentName) {
      var ports = this.getPorts(processName, componentName);
      if ( !ports.inports[portName] ) {
        ports.inports[portName] = {
          label: portName,
          x: 0,
          y: TheGraph.nodeSize/2
        };
        this.dirty = true;
      }
      var port = ports.inports[portName];
      // Port will have top edge's color
      if (route !== undefined) {
        port.route = route;
      }
      return port;
    },
    resetPortRoute: function (event) {
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
    },
    graphOutports: {},
    getGraphOutport: function (key) {
      var exp = this.graphOutports[key];
      if (!exp) {
        exp = {inports:{},outports:{}};
        exp.inports[key] = {
          label: key,
          type: "all",
          route: 5,
          x: 0,
          y: TheGraph.nodeSize/2
        };
        this.graphOutports[key] = exp;
      }
      return exp;
    },
    graphInports: {},
    getGraphInport: function (key) {
      var exp = this.graphInports[key];
      if (!exp) {
        exp = {inports:{},outports:{}};
        exp.outports[key] = {
          label: key,
          type: "all",
          route: 2,
          x: TheGraph.nodeSize,
          y: TheGraph.nodeSize/2
        };
        this.graphInports[key] = exp;
      }
      return exp;
    },
    setSelectedNodes: function (nodes) {
      this.setState({
        selectedNodes: nodes
      });
      this.markDirty();
    },
    setSelectedEdges: function (edges) {
      this.setState({
        selectedEdges: edges
      });
      this.markDirty();
    },
    dirty: false,
    libraryDirty: false,
    markDirty: function (event) {
      if (event && event.libraryDirty) {
        this.libraryDirty = true;
      }
      window.requestAnimationFrame(this.triggerRender);
    },
    triggerRender: function (time) {
      if (!this.isMounted()) {
        return;
      }
      if (this.dirty) {
        return;
      }
      this.dirty = true;
      this.setState({});
    },
    shouldComponentUpdate: function () {
      // If ports change or nodes move, then edges need to rerender, so we do the whole graph
      return this.dirty;
    },
    render: function() {
      this.dirty = false;

      var self = this;
      var graph = this.state.graph;
      var library = this.props.library;

      // Reset ports if library has changed
      if (this.libraryDirty) {
        this.libraryDirty = false;
        this.portInfo = {};
      }

      // Nodes
      var nodes = graph.nodes.map(function (node) {
        var key = node.id;
        if (!node.metadata) {
          node.metadata = {};
        }
        if (node.metadata.x === undefined) { node.metadata.x = 0; }
        if (node.metadata.y === undefined) { node.metadata.y = 0; }
        if (!node.metadata.label || node.metadata.label === "") {
          node.metadata.label = key;
        }
        var componentInfo = self.getComponentInfo(node.component);
        var icon = (componentInfo && componentInfo.icon ? componentInfo.icon : "cog");
        return TheGraph.Node({
          key: key,
          x: node.metadata.x,
          y: node.metadata.y,
          label: node.metadata.label,
          sublabel: node.component,
          app: self.props.app,
          graphView: self,
          graph: graph,
          node: node,
          icon: icon,
          ports: self.getPorts(key, node.component),
          onNodeSelection: self.props.onNodeSelection,
          selected: (self.state.selectedNodes.indexOf(node) !== -1),
          showContext: self.props.showContext
        });
      });

      // Edges
      var edges = graph.edges.map(function (edge) {
        var source = graph.getNode(edge.from.node);
        var target = graph.getNode(edge.to.node);
        if (!source || !target) {
          return;
        }

        var route = 0;
        if (edge.metadata && edge.metadata.route !== undefined) {
          route = edge.metadata.route;
        }

        // Initial ports from edges, and give port top/last edge color
        var sourcePort = self.getNodeOutport(edge.from.node, edge.from.port, route, source.component);
        var targetPort = self.getNodeInport(edge.to.node, edge.to.port, route, target.component);

        // Label
        var label = source.metadata.label + " " + edge.from.port.toUpperCase() + " -> " + 
          edge.to.port.toUpperCase() + " " + target.metadata.label;
        var key = edge.from.node + "() " + edge.from.port.toUpperCase() + " -> " + 
          edge.to.port.toUpperCase() + " " + edge.to.node + "()";

        return TheGraph.Edge({
          key: key,
          graph: graph,
          edge: edge,
          sX: source.metadata.x + TheGraph.nodeSize,
          sY: source.metadata.y + sourcePort.y,
          tX: target.metadata.x,
          tY: target.metadata.y + targetPort.y,
          label: label,
          route: route,
          onEdgeSelection: self.props.onEdgeSelection,
          selected: (self.state.selectedEdges.indexOf(edge) !== -1),
          showContext: self.props.showContext
        });
      });

      // IIPs
      var iips = graph.initializers.map(function (iip) {
        var target = graph.getNode(iip.to.node);
        if (!target) { return; }
        
        var targetPort = self.getNodeInport(iip.to.node, iip.to.port, 0, target.component);
        var tX = target.metadata.x;
        var tY = target.metadata.y + targetPort.y;

        var data = iip.from.data;
        var type = typeof data;
        var label = data === true || data === false || type === "number" || type === "string" ? data : type;

        return TheGraph.IIP({
          graph: graph,
          label: label,
          x: tX,
          y: tY
        });

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
          label: label,
          app: self.props.app,
          graphView: self,
          graph: graph,
          node: {},
          ports: self.getGraphInport(key),
          isIn: true,
          icon: "sign-in",
          showContext: self.props.showContext
        };
        // Edge view
        var expEdge = {
          key: "inport.edge."+key,
          export: inport,
          exportKey: key,
          graph: graph,
          edge: {},
          route: (metadata.route ? metadata.route : 2),
          isIn: true,
          label: "export in " + label.toUpperCase() + " -> " + portKey.toUpperCase() + " " + privateNode.metadata.label,
          sX: expNode.x + TheGraph.nodeSize,
          sY: expNode.y + TheGraph.nodeSize/2,
          tX: privateNode.metadata.x + privatePort.x,
          tY: privateNode.metadata.y + privatePort.y,
          showContext: self.props.showContext
        };
        edges.unshift(TheGraph.Edge(expEdge));
        return TheGraph.Node(expNode);
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
          label: label,
          app: self.props.app,
          graphView: self,
          graph: graph,
          node: {},
          ports: self.getGraphOutport(key),
          isIn: false,
          icon: "sign-out",
          showContext: self.props.showContext
        };
        // Edge view
        var expEdge = {
          key: "outport.edge."+key,
          export: outport,
          exportKey: key,
          graph: graph,
          edge: {},
          route: (metadata.route ? metadata.route : 4),
          isIn: false,
          label: privateNode.metadata.label + " " + portKey.toUpperCase() + " -> " + label.toUpperCase() + " export out",
          sX: privateNode.metadata.x + privatePort.x,
          sY: privateNode.metadata.y + privatePort.y,
          tX: expNode.x,
          tY: expNode.y + TheGraph.nodeSize/2,
          showContext: self.props.showContext
        };
        edges.unshift(TheGraph.Edge(expEdge));
        return TheGraph.Node(expNode);
      });


      // Groups
      var groups = graph.groups.map(function (group) {
        if (group.nodes.length < 1) {
          return;
        }
        var limits = TheGraph.findMinMax(graph, group.nodes);
        if (!limits) {
          return;
        }
        return TheGraph.Group({
          key: "group."+group.name,
          graph: graph,
          item: group,
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
        });
      });

      // Selection pseudo-group
      if (this.state.selectedNodes.length >= 2) {
        var selectedIds = this.state.selectedNodes.map(function (node) {
          return node.id;
        });
        var limits = TheGraph.findMinMax(graph, selectedIds);
        var pseudoGroup = {
          name: "selection",
          nodes: selectedIds,
          metadata: {color:1}
        };
        var selectionGroup = TheGraph.Group({
          key: "selectiongroup",
          isSelectionGroup: true,
          graph: graph,
          item: pseudoGroup,
          minX: limits.minX,
          minY: limits.minY,
          maxX: limits.maxX,
          maxY: limits.maxY,
          scale: self.props.scale,
          label: "",
          description: "",
          color: pseudoGroup.metadata.color,
          triggerMoveGroup: self.moveGroup,
          showContext: self.props.showContext
        });
        groups.push(selectionGroup);
      }


      // Edge preview
      var edgePreview = this.state.edgePreview;
      if (edgePreview) {
        var edgePreviewView;
        if (edgePreview.from) {
          var source = graph.getNode(edgePreview.from.node);
          var sourcePort = this.getNodeOutport(edgePreview.from.node, edgePreview.from.port);
          edgePreviewView = TheGraph.Edge({
            key: "edge-preview",
            sX: source.metadata.x + TheGraph.nodeSize,
            sY: source.metadata.y + sourcePort.y,
            tX: this.state.edgePreviewX,
            tY: this.state.edgePreviewY,
            label: "",
            route: edgePreview.metadata.route
          });
        } else {
          var target = graph.getNode(edgePreview.to.node);
          var targetPort = this.getNodeInport(edgePreview.to.node, edgePreview.to.port);
          edgePreviewView = TheGraph.Edge({
            key: "edge-preview",
            sX: this.state.edgePreviewX,
            sY: this.state.edgePreviewY,
            tX: target.metadata.x,
            tY: target.metadata.y + targetPort.y,
            label: "",
            route: edgePreview.metadata.route
          });
        }
        edges.push(edgePreviewView);
      }


      return React.DOM.g(
        {
          className: "graph"//,
          // onMouseDown: this.onMouseDown
        },
        React.DOM.g({
          className: "groups",
          children: groups
        }),
        React.DOM.g({
          className: "edges",
          children: edges
        }),
        React.DOM.g({
          className: "iips",
          children: iips
        }),
        React.DOM.g({
          className: "nodes", 
          children: nodes
        }),
        React.DOM.g({
          className: "ex-inports", 
          children: inports
        }),
        React.DOM.g({
          className: "ex-outports", 
          children: outports
        })
      );
    }
  });  

})(this);
