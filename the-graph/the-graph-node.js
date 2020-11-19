const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');
const TooltipMixin = require('./mixins').Tooltip;

module.exports.register = function (context) {
  const { TheGraph } = context;

  // Initialize namespace for configuration and factory functions.
  TheGraph.config.node = {
    snap: TheGraph.config.nodeSize,
    container: {},
    background: {
      className: 'node-bg',
    },
    border: {
      className: 'node-border drag',
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius,
    },
    innerRect: {
      className: 'node-rect drag',
      x: 3,
      y: 3,
      rx: TheGraph.config.nodeRadius - 2,
      ry: TheGraph.config.nodeRadius - 2,
    },
    icon: {
      ref: 'icon',
      className: 'icon node-icon drag',
    },
    iconsvg: {
      className: 'icon node-icon drag',
    },
    inports: {
      className: 'inports',
    },
    outports: {
      className: 'outports',
    },
    labelBackground: {
      className: 'node-label-bg',
    },
    labelRect: {
      className: 'text-bg-rect',
    },
    labelText: {
      className: 'node-label',
    },
    sublabelBackground: {
      className: 'node-sublabel-bg',
    },
    sublabelRect: {
      className: 'text-bg-rect',
    },
    sublabelText: {
      className: 'node-sublabel',
    },
  };

  // These factories use generic factories from the core, but
  // each is called separately allowing developers to intercept
  // individual elements of the node creation.
  TheGraph.factories.node = {
    createNodeGroup: TheGraph.factories.createGroup,
    createNodeBackgroundRect: TheGraph.factories.createRect,
    createNodeBorderRect: TheGraph.factories.createRect,
    createNodeInnerRect: TheGraph.factories.createRect,
    createNodeIconText: TheGraph.factories.createText,
    createNodeIconSVG: TheGraph.factories.createImg,
    createNodeInportsGroup: TheGraph.factories.createGroup,
    createNodeOutportsGroup: TheGraph.factories.createGroup,
    createNodeLabelGroup: TheGraph.factories.createGroup,
    createNodeLabelRect: TheGraph.factories.createRect,
    createNodeLabelText: TheGraph.factories.createText,
    createNodeSublabelGroup: TheGraph.factories.createGroup,
    createNodeSublabelRect: TheGraph.factories.createRect,
    createNodeSublabelText: TheGraph.factories.createText,
    createNodePort,
  };

  function createNodePort(options) {
    return TheGraph.Port(options);
  }

  // Node view
  TheGraph.Node = React.createFactory(createReactClass({
    displayName: 'TheGraphNode',
    mixins: [
      TooltipMixin,
    ],
    getInitialState() {
      return {
        moving: false,
        lastTrackX: null,
        lastTrackY: null,
      };
    },
    componentDidMount() {
      const domNode = ReactDOM.findDOMNode(this);

      // Dragging
      domNode.addEventListener('panstart', this.onTrackStart);

      // Tap to select
      if (this.props.onNodeSelection) {
        domNode.addEventListener('tap', this.onNodeSelection);
      }

      // Context menu
      if (this.props.showContext) {
        domNode.addEventListener('contextmenu', this.showContext);
        domNode.addEventListener('press', this.showContext);
      }
    },
    onNodeSelection(event) {
      // Don't tap app (unselect)
      event.stopPropagation();

      const toggle = (TheGraph.metaKeyPressed || event.pointerType === 'touch');
      this.props.onNodeSelection(this.props.nodeID, this.props.node, toggle);
    },
    onTrackStart(event) {
      // Don't drag graph
      event.stopPropagation();

      // Don't drag under menu
      if (this.props.app.menuShown) { return; }

      // Don't drag while pinching
      if (this.props.app.pinching) { return; }

      const domNode = ReactDOM.findDOMNode(this);
      domNode.addEventListener('panmove', this.onTrack);
      domNode.addEventListener('panend', this.onTrackEnd);
      domNode.addEventListener('pancancel', this.onTrackEnd);

      // Moving a node should only be a single transaction
      if (this.props.export) {
        this.props.graph.startTransaction('moveexport');
      } else {
        if (this.state.moving === true) {
          this.setState({ moving: false });
          this.setState({ lastTrackX: null, lastTrackY: null });
          this.props.graph.endTransaction('movenode');
        }
        this.props.graph.startTransaction('movenode');
      }
      this.setState({ moving: true });
      this.setState({ lastTrackX: 0, lastTrackY: 0 });
    },
    onTrack(event) {
      // Don't fire on graph
      event.stopPropagation();

      // Reconstruct relative motion since last event
      const x = event.gesture.deltaX;
      const y = event.gesture.deltaY;
      const movementX = x - this.state.lastTrackX;
      const movementY = y - this.state.lastTrackY;
      this.setState({ lastTrackX: x, lastTrackY: y });

      const { scale } = this.props.app.state;
      const deltaX = Math.round(movementX / scale);
      const deltaY = Math.round(movementY / scale);

      // Fires a change event on fbp-graph graph, which triggers redraw
      if (this.props.export) {
        const newPos = {
          x: this.props.export.metadata.x + deltaX,
          y: this.props.export.metadata.y + deltaY,
        };
        if (this.props.isIn) {
          this.props.graph.setInportMetadata(this.props.exportKey, newPos);
        } else {
          this.props.graph.setOutportMetadata(this.props.exportKey, newPos);
        }
      } else {
        this.props.graph.setNodeMetadata(this.props.nodeID, {
          x: this.props.node.metadata.x + deltaX,
          y: this.props.node.metadata.y + deltaY,
        });
      }
    },
    onTrackEnd(event) {
      // Don't fire on graph
      event.stopPropagation();
      this.setState({ moving: false });
      this.setState({ lastTrackX: null, lastTrackY: null });

      const domNode = ReactDOM.findDOMNode(this);
      domNode.removeEventListener('panmove', this.onTrack);
      domNode.removeEventListener('panend', this.onTrackEnd);
      domNode.removeEventListener('pancanel', this.onTrackEnd);

      // Snap to grid
      const snapToGrid = true;
      const snap = TheGraph.config.node.snap / 2;
      if (snapToGrid) {
        let x; let
          y;
        if (this.props.export) {
          const newPos = {
            x: Math.round(this.props.export.metadata.x / snap) * snap,
            y: Math.round(this.props.export.metadata.y / snap) * snap,
          };
          if (this.props.isIn) {
            this.props.graph.setInportMetadata(this.props.exportKey, newPos);
          } else {
            this.props.graph.setOutportMetadata(this.props.exportKey, newPos);
          }
        } else {
          this.props.graph.setNodeMetadata(this.props.nodeID, {
            x: Math.round(this.props.node.metadata.x / snap) * snap,
            y: Math.round(this.props.node.metadata.y / snap) * snap,
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
    showContext(event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event
      }
      let x = event.x || event.clientX || 0;
      let y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.export ? (this.props.isIn ? 'graphInport' : 'graphOutport') : 'node'),
        x,
        y,
        graph: this.props.graph,
        itemKey: (this.props.export ? this.props.exportKey : this.props.nodeID),
        item: (this.props.export ? this.props.export : this.props.node),
      });
    },
    getContext(menu, options, hide) {
      // If this node is an export
      if (this.props.export) {
        return TheGraph.Menu({
          menu,
          options,
          triggerHideContext: hide,
          label: this.props.exportKey,
        });
      }

      // Absolute position of node
      const { x } = options;
      const { y } = options;
      const { scale } = this.props.app.state;
      const appX = this.props.app.state.x;
      const appY = this.props.app.state.y;
      const nodeX = (this.props.x + this.props.width / 2) * scale + appX;
      const nodeY = (this.props.y + this.props.height / 2) * scale + appY;
      const deltaX = nodeX - x;
      const deltaY = nodeY - y;
      const { ports } = this.props;
      const processKey = this.props.nodeID;
      const { highlightPort } = this.props;

      // If there is a preview edge started, only show connectable ports
      if (this.props.graphView.state.edgePreview) {
        if (this.props.graphView.state.edgePreview.isIn) {
          // Show outputs
          return TheGraph.NodeMenuPorts({
            ports: ports.outports,
            triggerHideContext: hide,
            isIn: false,
            scale,
            processKey,
            deltaX,
            deltaY,
            translateX: x,
            translateY: y,
            nodeWidth: this.props.width,
            nodeHeight: this.props.height,
            highlightPort,
          });
        }
        // Show inputs
        return TheGraph.NodeMenuPorts({
          ports: ports.inports,
          triggerHideContext: hide,
          isIn: true,
          scale,
          processKey,
          deltaX,
          deltaY,
          translateX: x,
          translateY: y,
          nodeWidth: this.props.width,
          nodeHeight: this.props.height,
          highlightPort,
        });
      }

      // Default, show whole node menu
      return TheGraph.NodeMenu({
        menu,
        options,
        triggerHideContext: hide,
        label: this.props.label,
        graph: this.props.graph,
        graphView: this.props.graphView,
        node: this,
        icon: this.props.icon,
        ports,
        process: this.props.node,
        processKey,
        x,
        y,
        nodeWidth: this.props.width,
        nodeHeight: this.props.height,
        deltaX,
        deltaY,
        highlightPort,
      });
    },
    getTooltipTrigger() {
      return ReactDOM.findDOMNode(this);
    },
    shouldShowTooltip() {
      return (this.props.app.state.scale < TheGraph.zbpNormal);
    },
    shouldComponentUpdate(nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.x !== this.props.x
        || nextProps.y !== this.props.y
        || nextProps.icon !== this.props.icon
        || nextProps.label !== this.props.label
        || nextProps.sublabel !== this.props.sublabel
        || nextProps.ports !== this.props.ports
        || nextProps.selected !== this.props.selected
        || nextProps.error !== this.props.error
        || nextProps.highlightPort !== this.props.highlightPort
        || nextProps.ports.dirty === true
      );
    },
    render() {
      if (this.props.ports.dirty) {
        // This tag is set when an edge or iip changes port colors
        this.props.ports.dirty = false;
      }

      const { label } = this.props;
      let { sublabel } = this.props;
      if (!sublabel || sublabel === label) {
        sublabel = '';
      }
      const { x } = this.props;
      const { y } = this.props;
      const { width } = this.props;
      const { height } = this.props;

      // Ports
      let keys; let
        count;
      const processKey = this.props.nodeID;
      const { app } = this.props;
      const { graph } = this.props;
      const { node } = this.props;
      const isExport = (this.props.export !== undefined);
      const { showContext } = this.props;
      const { highlightPort } = this.props;

      // Inports
      const { inports } = this.props.ports;
      keys = Object.keys(inports);
      count = keys.length;
      // Make views
      const inportViews = keys.map((key) => {
        const info = inports[key];
        const props = {
          app,
          graph,
          node,
          key: `${processKey}.in.${info.label}`,
          label: info.label,
          processKey,
          isIn: true,
          isExport,
          nodeX: x,
          nodeY: y,
          nodeWidth: width,
          nodeHeight: height,
          x: info.x,
          y: info.y,
          port: { process: processKey, port: info.label, type: info.type },
          highlightPort,
          route: info.route,
          showContext,
          allowEdgeStart: this.props.allowEdgeStart,
        };
        return TheGraph.factories.node.createNodePort(props);
      });

      // Outports
      const { outports } = this.props.ports;
      keys = Object.keys(outports);
      count = keys.length;
      const outportViews = keys.map((key) => {
        const info = outports[key];
        const props = {
          app,
          graph,
          node,
          key: `${processKey}.out.${info.label}`,
          label: info.label,
          processKey,
          isIn: false,
          isExport,
          nodeX: x,
          nodeY: y,
          nodeWidth: width,
          nodeHeight: height,
          x: info.x,
          y: info.y,
          port: { process: processKey, port: info.label, type: info.type },
          highlightPort,
          route: info.route,
          showContext,
          allowEdgeStart: this.props.allowEdgeStart,
        };
        return TheGraph.factories.node.createNodePort(props);
      });

      // Node Icon
      let icon = TheGraph.FONT_AWESOME[this.props.icon];
      if (!icon) {
        icon = TheGraph.FONT_AWESOME.cog;
      }

      let iconContent;
      if (this.props.iconsvg && this.props.iconsvg !== '') {
        const iconSVGOptions = TheGraph.merge(TheGraph.config.node.iconsvg, {
          src: this.props.iconsvg,
          x: TheGraph.config.nodeRadius - 4,
          y: TheGraph.config.nodeRadius - 4,
          width: this.props.width - 10,
          height: this.props.height - 10,
        });
        iconContent = TheGraph.factories.node.createNodeIconSVG.call(this, iconSVGOptions);
      } else {
        const iconOptions = TheGraph.merge(TheGraph.config.node.icon, {
          x: this.props.width / 2,
          y: this.props.height / 2,
          children: icon,
        });
        iconContent = TheGraph.factories.node.createNodeIconText.call(this, iconOptions);
      }

      const backgroundRectOptions = TheGraph.merge(TheGraph.config.node.background, { width: this.props.width, height: this.props.height + 25 });
      const backgroundRect = TheGraph.factories.node.createNodeBackgroundRect.call(this, backgroundRectOptions);

      const borderRectOptions = TheGraph.merge(TheGraph.config.node.border, { width: this.props.width, height: this.props.height });
      const borderRect = TheGraph.factories.node.createNodeBorderRect.call(this, borderRectOptions);

      const innerRectOptions = TheGraph.merge(TheGraph.config.node.innerRect, { width: this.props.width - 6, height: this.props.height - 6 });
      const innerRect = TheGraph.factories.node.createNodeInnerRect.call(this, innerRectOptions);

      const inportsOptions = TheGraph.merge(TheGraph.config.node.inports, { children: inportViews });
      const inportsGroup = TheGraph.factories.node.createNodeInportsGroup.call(this, inportsOptions);

      const outportsOptions = TheGraph.merge(TheGraph.config.node.outports, { children: outportViews });
      const outportsGroup = TheGraph.factories.node.createNodeOutportsGroup.call(this, outportsOptions);

      const labelTextOptions = TheGraph.merge(TheGraph.config.node.labelText, { x: this.props.width / 2, y: this.props.height + 15, children: label });
      const labelText = TheGraph.factories.node.createNodeLabelText.call(this, labelTextOptions);

      const labelRectX = this.props.width / 2;
      const labelRectY = this.props.height + 15;
      let labelRectOptions = buildLabelRectOptions(14, labelRectX, labelRectY, label.length, TheGraph.config.node.labelRect.className);
      labelRectOptions = TheGraph.merge(TheGraph.config.node.labelRect, labelRectOptions);
      const labelRect = TheGraph.factories.node.createNodeLabelRect.call(this, labelRectOptions);
      const labelGroup = TheGraph.factories.node.createNodeLabelGroup.call(this, TheGraph.config.node.labelBackground, [labelRect, labelText]);

      const sublabelTextOptions = TheGraph.merge(TheGraph.config.node.sublabelText, { x: this.props.width / 2, y: this.props.height + 30, children: sublabel });
      const sublabelText = TheGraph.factories.node.createNodeSublabelText.call(this, sublabelTextOptions);

      const sublabelRectX = this.props.width / 2;
      const sublabelRectY = this.props.height + 30;
      let sublabelRectOptions = buildLabelRectOptions(9, sublabelRectX, sublabelRectY, sublabel.length, TheGraph.config.node.sublabelRect.className);
      sublabelRectOptions = TheGraph.merge(TheGraph.config.node.sublabelRect, sublabelRectOptions);
      const sublabelRect = TheGraph.factories.node.createNodeSublabelRect.call(this, sublabelRectOptions);
      const sublabelGroup = TheGraph.factories.node.createNodeSublabelGroup.call(this, TheGraph.config.node.sublabelBackground, [sublabelRect, sublabelText]);

      // When moving, expand bounding box of element
      // to catch events when pointer moves faster than we can move the element
      const { scale } = this.props.app.state;
      const eventSize = this.props.width * 12 / scale;
      const eventOptions = {
        r: eventSize,
        className: 'eventcatcher',
      };
      const eventRect = TheGraph.factories.createCircle(eventOptions);

      const nodeContents = [
        backgroundRect,
        borderRect,
        innerRect,
        iconContent,
        inportsGroup,
        outportsGroup,
        labelGroup,
        sublabelGroup,
      ];
      if (this.state.moving) {
        nodeContents.push(eventRect);
      }

      let nodeOptions = {
        className: `node drag${
          this.props.selected ? ' selected' : ''
        }${this.props.error ? ' error' : ''}`,
        name: this.props.nodeID,
        key: this.props.nodeID,
        title: label,
        transform: `translate(${x},${y})`,
      };
      nodeOptions = TheGraph.merge(TheGraph.config.node.container, nodeOptions);

      return TheGraph.factories.node.createNodeGroup.call(this, nodeOptions, nodeContents);
    },
  }));

  function buildLabelRectOptions(height, x, y, len, className) {
    const width = len * height * 2 / 3;
    const radius = height / 2;
    x -= width / 2;
    y -= height / 2;

    const result = {
      className,
      height: height * 1.1,
      width,
      rx: radius,
      ry: radius,
      x,
      y,
    };

    return result;
  }
};
