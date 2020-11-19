const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');

const geometryutils = require('./geometryutils');

module.exports.register = function (context) {
  const { TheGraph } = context;

  TheGraph.config.graph = {
    container: {},
    groupsGroup: {
      className: 'groups',
    },
    edgesGroup: {
      className: 'edges',
    },
    iipsGroup: {
      className: 'iips',
    },
    nodesGroup: {
      className: 'nodes',
    },
    inportsGroup: {
      className: 'ex-inports',
    },
    outportsGroup: {
      className: 'ex-outports',
    },
    node: {},
    iip: {},
    inportEdge: {},
    inportNode: {},
    outportEdge: {},
    outportNode: {},
    nodeGroup: {},
    selectionGroup: {
      key: 'selectiongroup',
      isSelectionGroup: true,
      label: '',
      description: '',
    },
    edgePreview: {
      key: 'edge-preview',
      label: '',
    },
  };

  TheGraph.factories.graph = {
    createGraphContainerGroup: TheGraph.factories.createGroup,
    createGraphGroupsGroup: TheGraph.factories.createGroup,
    createGraphEdgesGroup: TheGraph.factories.createGroup,
    createGraphIIPGroup: TheGraph.factories.createGroup,
    createGraphNodesGroup: TheGraph.factories.createGroup,
    createGraphInportsGroup: TheGraph.factories.createGroup,
    createGraphOutportsGroup: TheGraph.factories.createGroup,
    createGraphNode,
    createGraphEdge,
    createGraphIIP,
    createGraphGroup,
    createGraphEdgePreview,
  };

  function createGraphNode(options) {
    return TheGraph.Node(options);
  }

  function createGraphEdge(options) {
    return TheGraph.Edge(options);
  }

  function createGraphIIP(options) {
    return TheGraph.IIP(options);
  }

  function createGraphGroup(options) {
    return TheGraph.Group(options);
  }

  function createGraphEdgePreview(options) {
    return TheGraph.Edge(options);
  }

  // Graph view

  TheGraph.Graph = React.createFactory(createReactClass({
    displayName: 'TheGraphGraph',
    mixins: [],
    getDefaultProps() {
      return {
        library: {},
        graph: null,
        app: null,
        offsetX: 0,
        offsetY: 0,
        nodeIcons: {}, // allows overriding icon of a node
      };
    },
    getInitialState() {
      return {
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
        offsetY: this.props.offsetY,
      };
    },
    componentDidMount() {
      this.mounted = true;
      this.subscribeGraph(null, this.props.graph);
      ReactDOM.findDOMNode(this).addEventListener('the-graph-node-remove', this.removeNode);
    },
    componentWillUnmount() {
      this.mounted = false;
    },
    componentWillReceiveProps(nextProps) {
      this.subscribeGraph(this.props.graph, nextProps.graph);
      this.markDirty();
    },
    subscribeGraph(previous, next) {
      if (previous) {
        previous.removeListener('addEdge', this.resetPortRoute);
        previous.removeListener('changeEdge', this.resetPortRoute);
        previous.removeListener('removeEdge', this.resetPortRoute);
        previous.removeListener('removeInitial', this.resetPortRoute);

        previous.removeListener('changeNode', this.markDirty);
        previous.removeListener('changeInport', this.markDirty);
        previous.removeListener('changeOutport', this.markDirty);
        previous.removeListener('endTransaction', this.markDirty);
      }
      if (next) {
        // To change port colors
        next.on('addEdge', this.resetPortRoute);
        next.on('changeEdge', this.resetPortRoute);
        next.on('removeEdge', this.resetPortRoute);
        next.on('removeInitial', this.resetPortRoute);

        // Listen to fbp-graph graph object's events
        next.on('changeNode', this.markDirty);
        next.on('changeInport', this.markDirty);
        next.on('changeOutport', this.markDirty);
        next.on('endTransaction', this.markDirty);
      }
    },
    edgePreview: null,
    edgeStart(event) {
      // Forwarded from App.edgeStart()

      // Port that triggered this
      const { port } = event.detail;

      // Complete edge if this is the second tap and ports are compatible
      if (this.state.edgePreview && this.state.edgePreview.isIn !== event.detail.isIn) {
        // TODO also check compatible types
        const halfEdge = this.state.edgePreview;
        if (event.detail.isIn) {
          halfEdge.to = port;
        } else {
          halfEdge.from = port;
        }
        this.addEdge(halfEdge);
        this.cancelPreviewEdge();
        return;
      }

      let edge;
      if (event.detail.isIn) {
        edge = { to: port };
      } else {
        edge = { from: port };
      }
      edge.isIn = event.detail.isIn;
      edge.metadata = { route: event.detail.route };
      edge.type = event.detail.port.type;

      const appDomNode = ReactDOM.findDOMNode(this.props.app);
      appDomNode.addEventListener('mousemove', this.renderPreviewEdge);
      appDomNode.addEventListener('panmove', this.renderPreviewEdge);
      // TODO tap to add new node here
      appDomNode.addEventListener('tap', this.cancelPreviewEdge);

      this.setState({ edgePreview: edge });
    },
    cancelPreviewEdge(event) {
      const appDomNode = ReactDOM.findDOMNode(this.props.app);
      appDomNode.removeEventListener('mousemove', this.renderPreviewEdge);
      appDomNode.removeEventListener('panmove', this.renderPreviewEdge);
      appDomNode.removeEventListener('tap', this.cancelPreviewEdge);
      if (this.state.edgePreview) {
        this.setState({ edgePreview: null });
        this.markDirty();
      }
    },
    renderPreviewEdge(event) {
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event
      }

      let x = event.x || event.clientX || 0;
      let y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      x -= this.props.app.state.offsetX || 0;
      y -= this.props.app.state.offsetY || 0;
      const { scale } = this.props.app.state;
      this.setState({
        edgePreviewX: (x - this.props.app.state.x) / scale,
        edgePreviewY: (y - this.props.app.state.y) / scale,
      });
      this.markDirty();
    },
    addEdge(edge) {
      this.props.graph.addEdge(edge.from.process, edge.from.port, edge.to.process, edge.to.port, edge.metadata);
    },
    moveGroup(nodes, dx, dy) {
      const { graph } = this.props;

      // Move each group member
      const len = nodes.length;
      for (let i = 0; i < len; i++) {
        const node = graph.getNode(nodes[i]);
        if (!node) { continue; }
        if (dx !== undefined) {
          // Move by delta
          graph.setNodeMetadata(node.id, {
            x: node.metadata.x + dx,
            y: node.metadata.y + dy,
          });
        } else {
          // Snap to grid
          const snap = TheGraph.config.nodeHeight / 2;
          graph.setNodeMetadata(node.id, {
            x: Math.round(node.metadata.x / snap) * snap,
            y: Math.round(node.metadata.y / snap) * snap,
          });
        }
      }
    },
    getComponentInfo(componentName) {
      console.error("DEPRECATED: getComponentInfo() will be removed in next version of the-graph. Use 'library' in props instead");
      return this.props.library[componentName];
    },
    portInfo: {},
    getPorts(graph, processName, componentName) {
      const node = graph.getNode(processName);

      let ports = this.portInfo[processName];
      if (!ports) {
        const inports = {};
        const outports = {};
        if (componentName && this.props.library) {
          // Copy ports from library object
          const component = this.props.library[componentName];
          if (!component) {
            return {
              inports,
              outports,
            };
          }

          let i; let port; let
            len;
          for (i = 0, len = component.outports.length; i < len; i++) {
            port = component.outports[i];
            if (!port.name) { continue; }
            outports[port.name] = {
              label: port.name,
              type: port.type,
              x: node.metadata.width,
              y: node.metadata.height / (len + 1) * (i + 1),
            };
          }
          for (i = 0, len = component.inports.length; i < len; i++) {
            port = component.inports[i];
            if (!port.name) { continue; }
            inports[port.name] = {
              label: port.name,
              type: port.type,
              x: 0,
              y: node.metadata.height / (len + 1) * (i + 1),
            };
          }
        }
        ports = {
          inports,
          outports,
        };
        this.portInfo[processName] = ports;
      }
      return ports;
    },
    getNodeOutport(graph, processName, portName, route, componentName) {
      const ports = this.getPorts(graph, processName, componentName);
      if (!ports.outports[portName]) {
        ports.outports[portName] = {
          label: portName,
          x: TheGraph.config.nodeWidth,
          y: TheGraph.config.nodeHeight / 2,
        };
        this.dirty = true;
      }
      const port = ports.outports[portName];
      // Port will have top edge's color
      if (route !== undefined) {
        port.route = route;
      }
      return port;
    },
    getNodeInport(graph, processName, portName, route, componentName) {
      const ports = this.getPorts(graph, processName, componentName);
      if (!ports.inports[portName]) {
        ports.inports[portName] = {
          label: portName,
          x: 0,
          y: TheGraph.config.nodeHeight / 2,
        };
        this.dirty = true;
      }
      const port = ports.inports[portName];
      // Port will have top edge's color
      if (route !== undefined) {
        port.route = route;
      }
      return port;
    },
    resetPortRoute(event) {
      // Trigger nodes with changed ports to rerender
      if (event.from && event.from.node) {
        const fromNode = this.portInfo[event.from.node];
        if (fromNode) {
          fromNode.dirty = true;
          const outport = fromNode.outports[event.from.port];
          if (outport) {
            outport.route = null;
          }
        }
      }
      if (event.to && event.to.node) {
        const toNode = this.portInfo[event.to.node];
        if (toNode) {
          toNode.dirty = true;
          const inport = toNode.inports[event.to.port];
          if (inport) {
            inport.route = null;
          }
        }
      }
    },
    graphOutports: {},
    getGraphOutport(key) {
      let exp = this.graphOutports[key];
      if (!exp) {
        exp = { inports: {}, outports: {} };
        exp.inports[key] = {
          label: key,
          type: 'all',
          route: 5,
          x: 0,
          y: TheGraph.config.nodeHeight / 2,
        };
        this.graphOutports[key] = exp;
      }
      return exp;
    },
    graphInports: {},
    getGraphInport(key) {
      let exp = this.graphInports[key];
      if (!exp) {
        exp = { inports: {}, outports: {} };
        exp.outports[key] = {
          label: key,
          type: 'all',
          route: 2,
          x: TheGraph.config.nodeWidth,
          y: TheGraph.config.nodeHeight / 2,
        };
        this.graphInports[key] = exp;
      }
      return exp;
    },
    setSelectedNodes(nodes) {
      this.setState({
        selectedNodes: nodes,
      });
      this.markDirty();
    },
    setErrorNodes(errors) {
      this.setState({
        errorNodes: errors,
      });
      this.markDirty();
    },
    setSelectedEdges(edges) {
      this.setState({
        selectedEdges: edges,
      });
      this.markDirty();
    },
    setAnimatedEdges(edges) {
      this.setState({
        animatedEdges: edges,
      });
      this.markDirty();
    },
    updateIcon(nodeId, icon) {
      console.error('DEPRECATED: updateIcon() will be removed in next version of the-graph. Pass nodeIcons through props instead');
      // FIXME: deprecated function, to be removed
      this.props.nodeIcons[nodeId] = icon;
      this.markDirty();
    },
    dirty: false,
    libraryDirty: false,
    markDirty(event) {
      if (event && event.libraryDirty) {
        this.libraryDirty = true;
      }
      window.requestAnimationFrame(this.triggerRender);
    },
    triggerRender(time) {
      if (!this.mounted) {
        return;
      }
      if (this.dirty) {
        return;
      }
      this.dirty = true;
      this.forceUpdate();
    },
    shouldComponentUpdate() {
      // If ports change or nodes move, then edges need to rerender, so we do the whole graph
      return this.dirty;
    },
    render() {
      this.dirty = false;

      const self = this;
      const { graph } = this.props;
      const { library } = this.props;
      const selectedIds = [];

      // Reset ports if library has changed
      if (this.libraryDirty) {
        this.libraryDirty = false;
        this.portInfo = {};
      }

      // Highlight compatible ports
      let highlightPort = null;
      if (this.state.edgePreview && this.state.edgePreview.type) {
        highlightPort = {
          type: this.state.edgePreview.type,
          isIn: !this.state.edgePreview.isIn,
        };
      }

      // Nodes
      const nodes = graph.nodes.map(function (node) {
        const componentInfo = self.props.library[node.component];
        if (!componentInfo) {
          throw new Error(`Component ${node.component} is not in library`);
        }
        const key = node.id;
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
          node.metadata.width = TheGraph.config.nodeWidth;
        }
        node.metadata.height = TheGraph.config.nodeHeight;
        if (TheGraph.config.autoSizeNode && componentInfo) {
          // Adjust node height based on number of ports.
          const portCount = Math.max(componentInfo.inports.length, componentInfo.outports.length);
          if (portCount > TheGraph.config.maxPortCount) {
            const diff = portCount - TheGraph.config.maxPortCount;
            node.metadata.height = TheGraph.config.nodeHeight + (diff * TheGraph.config.nodeHeightIncrement);
          }
        }
        if (!node.metadata.label || node.metadata.label === '') {
          node.metadata.label = key;
        }
        let icon = 'cog';
        let iconsvg = '';
        if (self.props.nodeIcons[key]) {
          icon = self.props.nodeIcons[key];
        } else if (componentInfo && componentInfo.icon) {
          icon = componentInfo.icon;
        } else if (componentInfo && componentInfo.iconsvg) {
          iconsvg = componentInfo.iconsvg;
        }
        const selected = (self.state.selectedNodes[key] === true);
        if (selected) {
          selectedIds.push(key);
        }

        let nodeOptions = {
          key,
          nodeID: key,
          x: node.metadata.x,
          y: node.metadata.y,
          label: node.metadata.label,
          sublabel: node.metadata.sublabel || node.component,
          width: node.metadata.width,
          height: node.metadata.height,
          app: self.props.app,
          graphView: self,
          graph,
          node,
          icon,
          iconsvg,
          ports: self.getPorts(graph, key, node.component),
          onNodeSelection: self.props.onNodeSelection,
          selected,
          error: (self.state.errorNodes[key] === true),
          showContext: self.props.showContext,
          highlightPort,
          allowEdgeStart: self.props.allowEdgeStart,
        };

        nodeOptions = TheGraph.merge(TheGraph.config.graph.node, nodeOptions);
        return TheGraph.factories.graph.createGraphNode.call(this, nodeOptions);
      });

      // Edges
      const edges = graph.edges.map(function (edge) {
        const source = graph.getNode(edge.from.node);
        const target = graph.getNode(edge.to.node);
        if (!source || !target) {
          return;
        }

        let route = 0;
        if (edge.metadata && edge.metadata.route) {
          route = edge.metadata.route;
        }

        // Initial ports from edges, and give port top/last edge color
        const sourcePort = self.getNodeOutport(graph, edge.from.node, edge.from.port, route, source.component);
        const targetPort = self.getNodeInport(graph, edge.to.node, edge.to.port, route, target.component);

        const label = `${source.metadata.label}() ${
          edge.from.port.toUpperCase()
        }${edge.from.hasOwnProperty('index') ? `[${edge.from.index}]` : ''} -> ${
          edge.to.port.toUpperCase()
        }${edge.to.hasOwnProperty('index') ? `[${edge.to.index}]` : ''} ${
          target.metadata.label}()`;
        const key = `${edge.from.node}() ${
          edge.from.port.toUpperCase()
        }${edge.from.hasOwnProperty('index') ? `[${edge.from.index}]` : ''} -> ${
          edge.to.port.toUpperCase()
        }${edge.to.hasOwnProperty('index') ? `[${edge.to.index}]` : ''} ${
          edge.to.node}()`;

        let edgeOptions = {
          key,
          edgeID: key,
          graph,
          edge,
          app: self.props.app,
          sX: source.metadata.x + source.metadata.width,
          sY: source.metadata.y + sourcePort.y,
          tX: target.metadata.x,
          tY: target.metadata.y + targetPort.y,
          label,
          route,
          onEdgeSelection: self.props.onEdgeSelection,
          selected: (self.state.selectedEdges.indexOf(edge) !== -1),
          animated: (self.state.animatedEdges.indexOf(edge) !== -1),
          showContext: self.props.showContext,
        };

        edgeOptions = TheGraph.merge(TheGraph.config.graph.edge, edgeOptions);
        return TheGraph.factories.graph.createGraphEdge.call(this, edgeOptions);
      });

      // IIPs
      const iips = graph.initializers.map(function (iip) {
        const target = graph.getNode(iip.to.node);
        if (!target) { return; }

        const targetPort = self.getNodeInport(graph, iip.to.node, iip.to.port, 0, target.component);
        const tX = target.metadata.x;
        const tY = target.metadata.y + targetPort.y;

        const { data } = iip.from;
        const type = typeof data;
        const label = data === true || data === false || type === 'number' || type === 'string' ? data : type;

        let iipOptions = {
          graph,
          label,
          x: tX,
          y: tY,
        };

        iipOptions = TheGraph.merge(TheGraph.config.graph.iip, iipOptions);
        return TheGraph.factories.graph.createGraphIIP.call(this, iipOptions);
      });

      // Inport exports
      const inports = Object.keys(graph.inports).map(function (key) {
        const inport = graph.inports[key];
        // Export info
        const label = key;
        const nodeKey = inport.process;
        const portKey = inport.port;
        if (!inport.metadata) {
          inport.metadata = { x: 0, y: 0 };
        }
        const { metadata } = inport;
        if (!metadata.x) { metadata.x = 0; }
        if (!metadata.y) { metadata.y = 0; }
        if (!metadata.width) { metadata.width = TheGraph.config.nodeWidth; }
        if (!metadata.height) { metadata.height = TheGraph.config.nodeHeight; }
        // Private port info
        const portInfo = self.portInfo[nodeKey];
        if (!portInfo) {
          console.warn(`Node ${nodeKey} not found for graph inport ${label}`);
          return;
        }
        const privatePort = portInfo.inports[portKey];
        if (!privatePort) {
          console.warn(`Port ${nodeKey}.${portKey} not found for graph inport ${label}`);
          return;
        }
        // Private node
        const privateNode = graph.getNode(nodeKey);
        if (!privateNode) {
          console.warn(`Node ${nodeKey} not found for graph inport ${label}`);
          return;
        }
        // Node view
        let expNode = {
          key: `inport.node.${key}`,
          export: inport,
          exportKey: key,
          x: metadata.x,
          y: metadata.y,
          width: metadata.width,
          height: metadata.height,
          label,
          app: self.props.app,
          graphView: self,
          graph,
          node: {},
          ports: self.getGraphInport(key),
          isIn: true,
          icon: (metadata.icon ? metadata.icon : 'sign-in'),
          showContext: self.props.showContext,
        };
        expNode = TheGraph.merge(TheGraph.config.graph.inportNode, expNode);
        // Edge view
        let expEdge = {
          key: `inport.edge.${key}`,
          export: inport,
          exportKey: key,
          graph,
          app: self.props.app,
          edge: {},
          route: (metadata.route ? metadata.route : 2),
          isIn: true,
          label: `export in ${label.toUpperCase()} -> ${portKey.toUpperCase()} ${privateNode.metadata.label}`,
          sX: expNode.x + TheGraph.config.nodeWidth,
          sY: expNode.y + TheGraph.config.nodeHeight / 2,
          tX: privateNode.metadata.x + privatePort.x,
          tY: privateNode.metadata.y + privatePort.y,
          showContext: self.props.showContext,
          allowEdgeStart: self.props.allowEdgeStart,
        };
        expEdge = TheGraph.merge(TheGraph.config.graph.inportEdge, expEdge);
        edges.unshift(TheGraph.factories.graph.createGraphEdge.call(this, expEdge));
        return TheGraph.factories.graph.createGraphNode.call(this, expNode);
      });

      // Outport exports
      const outports = Object.keys(graph.outports).map(function (key) {
        const outport = graph.outports[key];
        // Export info
        const label = key;
        const nodeKey = outport.process;
        const portKey = outport.port;
        if (!outport.metadata) {
          outport.metadata = { x: 0, y: 0 };
        }
        const { metadata } = outport;
        if (!metadata.x) { metadata.x = 0; }
        if (!metadata.y) { metadata.y = 0; }
        if (!metadata.width) { metadata.width = TheGraph.config.nodeWidth; }
        if (!metadata.height) { metadata.height = TheGraph.config.nodeHeight; }
        // Private port info
        const portInfo = self.portInfo[nodeKey];
        if (!portInfo) {
          console.warn(`Node ${nodeKey} not found for graph outport ${label}`);
          return;
        }
        const privatePort = portInfo.outports[portKey];
        if (!privatePort) {
          console.warn(`Port ${nodeKey}.${portKey} not found for graph outport ${label}`);
          return;
        }
        // Private node
        const privateNode = graph.getNode(nodeKey);
        if (!privateNode) {
          console.warn(`Node ${nodeKey} not found for graph outport ${label}`);
          return;
        }
        // Node view
        let expNode = {
          key: `outport.node.${key}`,
          export: outport,
          exportKey: key,
          x: metadata.x,
          y: metadata.y,
          width: metadata.width,
          height: metadata.height,
          label,
          app: self.props.app,
          graphView: self,
          graph,
          node: {},
          ports: self.getGraphOutport(key),
          isIn: false,
          icon: (metadata.icon ? metadata.icon : 'sign-out'),
          showContext: self.props.showContext,
        };
        expNode = TheGraph.merge(TheGraph.config.graph.outportNode, expNode);
        // Edge view
        let expEdge = {
          key: `outport.edge.${key}`,
          export: outport,
          exportKey: key,
          graph,
          app: self.props.app,
          edge: {},
          route: (metadata.route ? metadata.route : 4),
          isIn: false,
          label: `${privateNode.metadata.label} ${portKey.toUpperCase()} -> ${label.toUpperCase()} export out`,
          sX: privateNode.metadata.x + privatePort.x,
          sY: privateNode.metadata.y + privatePort.y,
          tX: expNode.x,
          tY: expNode.y + TheGraph.config.nodeHeight / 2,
          showContext: self.props.showContext,
          allowEdgeStart: self.props.allowEdgeStart,
        };
        expEdge = TheGraph.merge(TheGraph.config.graph.outportEdge, expEdge);
        edges.unshift(TheGraph.factories.graph.createGraphEdge.call(this, expEdge));
        return TheGraph.factories.graph.createGraphNode.call(this, expNode);
      });

      // Groups
      const groups = graph.groups.map(function (group) {
        if (group.nodes.length < 1) {
          return;
        }
        const limits = geometryutils.findMinMax(graph, group.nodes);
        if (!limits) {
          return;
        }
        let groupOptions = {
          key: `group.${group.name}`,
          graph,
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
          showContext: self.props.showContext,
        };
        groupOptions = TheGraph.merge(TheGraph.config.graph.nodeGroup, groupOptions);
        return TheGraph.factories.graph.createGraphGroup.call(this, groupOptions);
      });

      // Selection pseudo-group
      if (this.state.displaySelectionGroup
          && selectedIds.length >= 2) {
        const limits = geometryutils.findMinMax(graph, selectedIds);
        if (limits) {
          const pseudoGroup = {
            name: 'selection',
            nodes: selectedIds,
            metadata: { color: 1 },
          };
          let selectionGroupOptions = {
            graph,
            app: self.props.app,
            item: pseudoGroup,
            minX: limits.minX,
            minY: limits.minY,
            maxX: limits.maxX,
            maxY: limits.maxY,
            scale: self.props.scale,
            color: pseudoGroup.metadata.color,
            triggerMoveGroup: self.moveGroup,
            showContext: self.props.showContext,
          };
          selectionGroupOptions = TheGraph.merge(TheGraph.config.graph.selectionGroup, selectionGroupOptions);
          const selectionGroup = TheGraph.factories.graph.createGraphGroup.call(this, selectionGroupOptions);
          groups.push(selectionGroup);
        }
      }

      // Edge preview
      const { edgePreview } = this.state;
      if (edgePreview) {
        let edgePreviewOptions;
        if (edgePreview.from) {
          const source = graph.getNode(edgePreview.from.process);
          const sourcePort = this.getNodeOutport(graph, edgePreview.from.process, edgePreview.from.port);
          edgePreviewOptions = {
            sX: source.metadata.x + source.metadata.width,
            sY: source.metadata.y + sourcePort.y,
            tX: this.state.edgePreviewX,
            tY: this.state.edgePreviewY,
            route: edgePreview.metadata.route,
          };
        } else {
          const target = graph.getNode(edgePreview.to.process);
          const targetPort = this.getNodeInport(graph, edgePreview.to.process, edgePreview.to.port);
          edgePreviewOptions = {
            sX: this.state.edgePreviewX,
            sY: this.state.edgePreviewY,
            tX: target.metadata.x,
            tY: target.metadata.y + targetPort.y,
            route: edgePreview.metadata.route,
          };
        }
        edgePreviewOptions = TheGraph.merge(TheGraph.config.graph.edgePreview, edgePreviewOptions);
        const edgePreviewView = TheGraph.factories.graph.createGraphEdgePreview.call(this, edgePreviewOptions);
        edges.push(edgePreviewView);
      }

      const groupsOptions = TheGraph.merge(TheGraph.config.graph.groupsGroup, { children: groups });
      const groupsGroup = TheGraph.factories.graph.createGraphGroupsGroup.call(this, groupsOptions);

      const edgesOptions = TheGraph.merge(TheGraph.config.graph.edgesGroup, { children: edges });
      const edgesGroup = TheGraph.factories.graph.createGraphEdgesGroup.call(this, edgesOptions);

      const iipsOptions = TheGraph.merge(TheGraph.config.graph.iipsGroup, { children: iips });
      const iipsGroup = TheGraph.factories.graph.createGraphIIPGroup.call(this, iipsOptions);

      const nodesOptions = TheGraph.merge(TheGraph.config.graph.nodesGroup, { children: nodes });
      const nodesGroup = TheGraph.factories.graph.createGraphNodesGroup.call(this, nodesOptions);

      const inportsOptions = TheGraph.merge(TheGraph.config.graph.inportsGroup, { children: inports });
      const inportsGroup = TheGraph.factories.graph.createGraphInportsGroup.call(this, inportsOptions);

      const outportsOptions = TheGraph.merge(TheGraph.config.graph.outportsGroup, { children: outports });
      const outportsGroup = TheGraph.factories.graph.createGraphGroupsGroup.call(this, outportsOptions);

      const containerContents = [
        groupsGroup,
        edgesGroup,
        iipsGroup,
        nodesGroup,
        inportsGroup,
        outportsGroup,
      ];

      const selectedClass = (this.state.forceSelection
                           || selectedIds.length > 0) ? ' selection' : '';

      const containerOptions = TheGraph.merge(TheGraph.config.graph.container, { className: `graph${selectedClass}` });
      return TheGraph.factories.graph.createGraphContainerGroup.call(this, containerOptions, containerContents);
    },
  }));
};
