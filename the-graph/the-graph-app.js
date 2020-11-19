const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');
const Hammer = require('hammerjs');

const hammerhacks = require('./hammer.js');
const { ModalBG } = require('./the-graph-modalbg');
const geometryutils = require('./geometryutils');

// Trivial polyfill for Polymer/webcomponents/shadowDOM element unwrapping
const unwrap = (window.unwrap) ? window.unwrap : (e) => e;

const hotKeys = {
  // Escape
  27(app) {
    if (!app.refs.graph) {
      return;
    }
    app.refs.graph.cancelPreviewEdge();
  },
  // Delete
  46(app) {
    const { graph } = app.refs.graph.props;
    const { selectedNodes } = app.refs.graph.state;
    const { selectedEdges } = app.refs.graph.state;
    const { menus } = app.props;

    Object.keys(selectedNodes).forEach((nodeKey) => {
      const node = graph.getNode(nodeKey);
      menus.node.actions.delete(graph, nodeKey, node);
    });
    selectedEdges.forEach((edge) => {
      menus.edge.actions.delete(graph, null, edge);
    });
  },
  // f for fit
  70(app) {
    app.triggerFit();
  },
  // s for selected
  83(app) {
    const { graph } = app.refs.graph.props;
    const { selectedNodes } = app.refs.graph.state;

    Object.keys(selectedNodes).forEach((nodeKey) => {
      const node = graph.getNode(nodeKey);
      app.focusNode(node);
    });
  },
};
// these don't change state, so also allowed when readonly
const readOnlyActions = [70, 83, 27];

module.exports.register = function (context) {
  const { TheGraph } = context;

  TheGraph.config.app = {
    container: {
      className: 'the-graph-app',
      name: 'app',
    },
    canvas: {
      ref: 'canvas',
      className: 'app-canvas',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
    },
    svg: {
      className: 'app-svg',
      ref: 'svg',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
    },
    svgGroup: {
      className: 'view',
    },
    graph: {
      ref: 'graph',
    },
    tooltip: {
      ref: 'tooltip',
    },
    modal: {
      className: 'context',
    },
  };

  TheGraph.factories.app = {
    createAppContainer,
    createAppCanvas: TheGraph.factories.createCanvas,
    createAppSvg: TheGraph.factories.createSvg,
    createAppSvgGroup: TheGraph.factories.createGroup,
    createAppGraph,
    createAppTooltip,
    createAppModalGroup: TheGraph.factories.createGroup,
    createAppModalBackground,
  };

  // No need to promote DIV creation to TheGraph.js.
  function createAppContainer(options, content) {
    let args = ['div', options];

    if (Array.isArray(content)) {
      args = args.concat(content);
    }

    return React.createElement(...args);
  }

  function createAppGraph(options) {
    return TheGraph.Graph(options);
  }

  function createAppTooltip(options) {
    return TheGraph.Tooltip(options);
  }

  function createAppModalBackground(options) {
    return ModalBG(options);
  }

  const mixins = [];
  if (React.Animate) {
    mixins.push(React.Animate);
  }

  TheGraph.App = React.createFactory(createReactClass({
    displayName: 'TheGraphApp',
    mixins,
    getDefaultProps() {
      return {
        width: null,
        height: null,
        readonly: false,
        nodeIcons: {},
        minZoom: 0.15,
        maxZoom: 15.0,
        offsetX: 0.0,
        offsetY: 0.0,
        menus: null,
        enableHotKeys: false,
        getMenuDef: null,
        onPanScale: null,
        onNodeSelection: null,
        onEdgeSelection: null,
      };
    },
    getInitialState() {
      // Autofit
      const fit = geometryutils.findFit(
        this.props.graph,
        this.props.width,
        this.props.height,
        TheGraph.config.nodeSize,
      );

      return {
        x: fit.x,
        y: fit.y,
        scale: fit.scale,
        width: this.props.width,
        height: this.props.height,
        minZoom: this.props.minZoom,
        maxZoom: this.props.maxZoom,
        trackStartX: null,
        trackStartY: null,
        tooltip: '',
        tooltipX: 0,
        tooltipY: 0,
        tooltipVisible: false,
      };
    },
    zoomFactor: 0,
    zoomX: 0,
    zoomY: 0,
    onWheel(event) {
      // Don't bounce
      event.preventDefault();

      if (!this.zoomFactor) { // WAT
        this.zoomFactor = 0;
      }

      // Safari is wheelDeltaY
      this.zoomFactor += event.deltaY ? event.deltaY : 0 - event.wheelDeltaY;
      this.zoomX = event.clientX;
      this.zoomY = event.clientY;
      requestAnimationFrame(this.scheduleWheelZoom);
    },
    scheduleWheelZoom() {
      if (Number.isNaN(this.zoomFactor)) { return; }

      // Speed limit
      let zoomFactor = this.zoomFactor / -500;
      zoomFactor = Math.min(0.5, Math.max(-0.5, zoomFactor));
      let scale = this.state.scale + (this.state.scale * zoomFactor);
      this.zoomFactor = 0;

      if (scale < this.state.minZoom) {
        scale = this.state.minZoom;
      } else if (scale > this.state.maxZoom) {
        scale = this.state.maxZoom;
      }
      if (scale === this.state.scale) { return; }

      // Zoom and pan transform-origin equivalent
      const scaleD = scale / this.state.scale;
      const currentX = this.state.x;
      const currentY = this.state.y;
      const oX = this.zoomX;
      const oY = this.zoomY;
      const x = scaleD * (currentX - oX) + oX;
      const y = scaleD * (currentY - oY) + oY;

      this.setState({
        scale,
        x,
        y,
        tooltipVisible: false,
      });
    },
    lastScale: 1,
    lastX: 0,
    lastY: 0,
    pinching: false,
    onTransformStart(event) {
      // Don't drag nodes
      event.srcEvent.stopPropagation();
      event.srcEvent.stopImmediatePropagation();

      // Hammer.js
      this.lastScale = 1;
      this.lastX = event.center.x;
      this.lastY = event.center.y;
      this.pinching = true;
    },
    onTransform(event) {
      // Don't drag nodes
      event.srcEvent.stopPropagation();
      event.srcEvent.stopImmediatePropagation();

      // Hammer.js
      const currentScale = this.state.scale;
      const currentX = this.state.x;
      const currentY = this.state.y;

      const scaleEvent = event.scale;
      const scaleDelta = 1 + (scaleEvent - this.lastScale);
      this.lastScale = scaleEvent;
      let scale = scaleDelta * currentScale;
      scale = Math.max(scale, this.props.minZoom);

      // Zoom and pan transform-origin equivalent
      const oX = event.center.x;
      const oY = event.center.y;
      const deltaX = oX - this.lastX;
      const deltaY = oY - this.lastY;
      const x = scaleDelta * (currentX - oX) + oX + deltaX;
      const y = scaleDelta * (currentY - oY) + oY + deltaY;

      this.lastX = oX;
      this.lastY = oY;

      this.setState({
        scale,
        x,
        y,
        tooltipVisible: false,
      });
    },
    onTransformEnd(event) {
      // Don't drag nodes
      event.srcEvent.stopPropagation();
      event.srcEvent.stopImmediatePropagation();

      // Hammer.js
      this.pinching = false;
    },
    onTrackStart() {
      const domNode = ReactDOM.findDOMNode(this);
      domNode.addEventListener('panmove', this.onTrack);
      domNode.addEventListener('panend', this.onTrackEnd);

      this.setState({ trackStartX: this.state.x, trackStartY: this.state.y });
    },
    onTrack(event) {
      if (this.pinching) { return; }
      if (this.menuShown) { return; }
      this.setState({
        x: this.state.trackStartX + event.gesture.deltaX,
        y: this.state.trackStartY + event.gesture.deltaY,
      });
    },
    onTrackEnd(event) {
      // Don't click app (unselect)
      event.stopPropagation();

      const domNode = ReactDOM.findDOMNode(this);
      domNode.removeEventListener('panmove', this.onTrack);
      domNode.removeEventListener('panend', this.onTrackEnd);

      this.setState({ trackStartX: null, trackStartY: null });
    },
    onPanScale() {
      // Pass pan/scale out to the-graph
      if (this.props.onPanScale) {
        this.props.onPanScale(this.state.x, this.state.y, this.state.scale);
      }
    },
    defaultGetMenuDef(options) {
      // Options: type, graph, itemKey, item
      if (options.type && this.props.menus && this.props.menus[options.type]) {
        const defaultMenu = this.props.menus[options.type];
        if (defaultMenu.callback) {
          return defaultMenu.callback(defaultMenu, options);
        }
        return defaultMenu;
      }
      return null;
    },
    showContext(options) {
      this.setState({
        contextMenu: options,
        tooltipVisible: false,
      });
    },
    hideContext(event) {
      this.setState({
        contextMenu: null,
      });
    },
    changeTooltip(event) {
      const { tooltip } = event.detail;

      // Don't go over right edge
      let x = event.detail.x + 10;
      const width = tooltip.length * 6;
      if (x + width > this.props.width) {
        x = event.detail.x - width - 10;
      }

      this.setState({
        tooltip,
        tooltipVisible: true,
        tooltipX: x,
        tooltipY: event.detail.y + 20,
      });
    },
    hideTooltip(event) {
      this.setState({
        tooltip: '',
        tooltipVisible: false,
      });
    },
    triggerFit(event) {
      const fit = geometryutils.findFit(this.props.graph, this.props.width, this.props.height, TheGraph.config.nodeSize);
      this.setState({
        x: fit.x,
        y: fit.y,
        scale: fit.scale,
      });
    },
    focusNode(node) {
      const duration = TheGraph.config.focusAnimationDuration;
      const fit = geometryutils.findNodeFit(node, this.state.width, this.state.height, TheGraph.config.nodeSize);
      const start_point = {
        x: -(this.state.x - this.state.width / 2) / this.state.scale,
        y: -(this.state.y - this.state.height / 2) / this.state.scale,
      }; const
        end_point = {
          x: node.metadata.x,
          y: node.metadata.y,
        };
      const graphfit = geometryutils.findAreaFit(start_point, end_point, this.state.width, this.state.height, TheGraph.config.nodeSize);
      const scale_ratio_1 = Math.abs(graphfit.scale - this.state.scale);
      const scale_ratio_2 = Math.abs(fit.scale - graphfit.scale);
      const scale_ratio_diff = scale_ratio_1 + scale_ratio_2;

      // Animation not available, jump right there
      if (!this.animate) {
        this.setState({ x: fit.x, y: fit.y, scale: fit.scale });
        return;
      }

      // Animate zoom-out then zoom-in
      this.animate({
        x: graphfit.x,
        y: graphfit.y,
        scale: graphfit.scale,
      }, duration * (scale_ratio_1 / scale_ratio_diff), 'in-quint', () => {
        this.animate({
          x: fit.x,
          y: fit.y,
          scale: fit.scale,
        }, duration * (scale_ratio_2 / scale_ratio_diff), 'out-quint');
      });
    },
    edgeStart(event) {
      // Listened from PortMenu.edgeStart() and Port.edgeStart()
      this.refs.graph.edgeStart(event);
      this.hideContext();
    },
    componentDidMount() {
      const domNode = ReactDOM.findDOMNode(this.refs.svg);

      // Unselect edges and nodes
      if (this.props.onNodeSelection) {
        domNode.addEventListener('tap', this.unselectAll);
      }

      // Setup Hammer.js events for this and all children
      // The events are injected into the DOM to follow regular propagation rules
      const hammertime = new Hammer.Manager(domNode, {
        domEvents: true,
        inputClass: hammerhacks.Input,
        recognizers: [
          [Hammer.Tap, { }],
          [Hammer.Press, { time: 500 }],
          [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 5 }],
          [Hammer.Pinch, { }],
        ],
      });

      // Gesture event for pan
      domNode.addEventListener('panstart', this.onTrackStart);

      const isTouchDevice = 'ontouchstart' in document.documentElement;
      if (isTouchDevice && hammertime) {
        hammertime.on('pinchstart', this.onTransformStart);
        hammertime.on('pinch', this.onTransform);
        hammertime.on('pinchend', this.onTransformEnd);
      }

      // Wheel to zoom
      if ('onwheel' in domNode) {
        // Chrome and Firefox
        domNode.addEventListener('wheel', this.onWheel);
      } else if ('onmousewheel' in domNode) {
        // Safari
        domNode.addEventListener('mousewheel', this.onWheel);
      }

      // Tooltip listener
      domNode.addEventListener('the-graph-tooltip', this.changeTooltip);
      domNode.addEventListener('the-graph-tooltip-hide', this.hideTooltip);

      // Edge preview
      domNode.addEventListener('the-graph-edge-start', this.edgeStart);

      domNode.addEventListener('contextmenu', this.onShowContext);

      // Start zoom from middle if zoom before mouse move
      this.mouseX = Math.floor(this.props.width / 2);
      this.mouseY = Math.floor(this.props.height / 2);

      // FIXME: instead access the shiftKey of event instead of keeping metaKey
      document.addEventListener('keydown', this.keyDown);
      document.addEventListener('keyup', this.keyUp);

      // Canvas background
      bgCanvas = unwrap(ReactDOM.findDOMNode(this.refs.canvas));
      this.bgContext = unwrap(bgCanvas.getContext('2d'));
      this.componentDidUpdate();

      // Rerender graph once to fix edges
      setTimeout(() => {
        this.renderGraph();
      }, 500);
    },
    onShowContext(event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      let x = event.x || event.clientX || 0;
      let y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.showContext({
        element: this,
        type: 'main',
        x,
        y,
        graph: this.props.graph,
        itemKey: 'graph',
        item: this.props.graph,
      });
    },
    keyDown(event) {
      // HACK metaKey global for taps
      if (event.metaKey || event.ctrlKey) {
        TheGraph.metaKeyPressed = true;
      }

      const code = event.keyCode;
      const handler = hotKeys[code];
      if (handler && this.props.enableHotKeys) {
        const { readonly } = this.props;
        if (!readonly || (readonly && readOnlyActions[code])) {
          handler(this);
        }
      }
    },
    keyUp(event) {
      // HACK metaKey global for taps
      if (TheGraph.metaKeyPressed) {
        TheGraph.metaKeyPressed = false;
      }
    },
    unselectAll(event) {
      // No arguments = clear selection
      this.props.onNodeSelection();
      this.props.onEdgeSelection();
    },
    renderGraph() {
      this.refs.graph.markDirty();
    },
    componentDidUpdate(prevProps, prevState) {
      setTimeout(() => {
        this.renderCanvas(this.bgContext);
        if (!prevState || prevState.x !== this.state.x || prevState.y !== this.state.y || prevState.scale !== this.state.scale) {
          this.onPanScale();
        }
      }, 0);
    },
    renderCanvas(c) {
      // Comment this line to go plaid
      c.clearRect(0, 0, this.state.width, this.state.height);

      // Background grid pattern
      const { scale } = this.state;
      const g = TheGraph.config.nodeSize * scale;

      const dx = this.state.x % g;
      const dy = this.state.y % g;
      const cols = Math.floor(this.state.width / g) + 1;
      let row = Math.floor(this.state.height / g) + 1;
      // Origin row/col index
      const oc = Math.floor(this.state.x / g) + (this.state.x < 0 ? 1 : 0);
      const or = Math.floor(this.state.y / g) + (this.state.y < 0 ? 1 : 0);

      while (row--) {
        let col = cols;
        while (col--) {
          const x = Math.round(col * g + dx);
          const y = Math.round(row * g + dy);
          if ((oc - col) % 3 === 0 && (or - row) % 3 === 0) {
            // 3x grid
            c.fillStyle = 'white';
            c.fillRect(x, y, 1, 1);
          } else if (scale > 0.5) {
            // 1x grid
            c.fillStyle = 'grey';
            c.fillRect(x, y, 1, 1);
          }
        }
      }
    },

    getContext(menu, options, hide) {
      return TheGraph.Menu({
        menu,
        options,
        triggerHideContext: hide,
        label: 'Hello',
        graph: this.props.graph,
        node: this,
        ports: [],
        process: [],
        processKey: null,
        x: options.x,
        y: options.y,
        nodeWidth: this.props.width,
        nodeHeight: this.props.height,
        deltaX: 0,
        deltaY: 0,
        highlightPort: false,
      });
    },
    render() {
      // console.timeEnd("App.render");
      // console.time("App.render");

      // pan and zoom
      const sc = this.state.scale;
      const { x } = this.state;
      const { y } = this.state;
      const transform = `matrix(${sc},0,0,${sc},${x},${y})`;

      const scaleClass = sc > TheGraph.zbpBig ? 'big' : (sc > TheGraph.zbpNormal ? 'normal' : 'small');

      let contextMenu = null;
      const getMenuDef = this.props.getMenuDef || this.defaultGetMenuDef;
      if (this.state.contextMenu) {
        const options = this.state.contextMenu;
        const menu = getMenuDef(options);
        if (menu && Object.keys(menu).length) {
          contextMenu = options.element.getContext(menu, options, this.hideContext);
        }
      }
      let contextModal = null;
      if (contextMenu) {
        const modalBGOptions = {
          width: this.state.width,
          height: this.state.height,
          triggerHideContext: this.hideContext,
          children: contextMenu,
        };

        contextModal = [
          TheGraph.factories.app.createAppModalBackground(modalBGOptions),
        ];
        this.menuShown = true;
      } else {
        this.menuShown = false;
      }

      let graphElementOptions = {
        graph: this.props.graph,
        scale: this.state.scale,
        app: this,
        library: this.props.library,
        nodeIcons: this.props.nodeIcons,
        onNodeSelection: this.props.onNodeSelection,
        onEdgeSelection: this.props.onEdgeSelection,
        enableHotKeys: this.props.enableHotKeys,
        showContext: this.showContext,
        allowEdgeStart: !this.props.readonly,
      };
      graphElementOptions = TheGraph.merge(TheGraph.config.app.graph, graphElementOptions);
      const graphElement = TheGraph.factories.app.createAppGraph.call(this, graphElementOptions);

      const svgGroupOptions = TheGraph.merge(TheGraph.config.app.svgGroup, { transform });
      const svgGroup = TheGraph.factories.app.createAppSvgGroup.call(this, svgGroupOptions, [graphElement]);

      let tooltipOptions = {
        x: this.state.tooltipX,
        y: this.state.tooltipY,
        visible: this.state.tooltipVisible,
        label: this.state.tooltip,
      };

      tooltipOptions = TheGraph.merge(TheGraph.config.app.tooltip, tooltipOptions);
      const tooltip = TheGraph.factories.app.createAppTooltip.call(this, tooltipOptions);

      const modalGroupOptions = TheGraph.merge(TheGraph.config.app.modal, { children: contextModal });
      const modalGroup = TheGraph.factories.app.createAppModalGroup.call(this, modalGroupOptions);

      const svgContents = [
        svgGroup,
        tooltip,
        modalGroup,
      ];

      const svgOptions = TheGraph.merge(TheGraph.config.app.svg, { width: this.state.width, height: this.state.height });
      const svg = TheGraph.factories.app.createAppSvg.call(this, svgOptions, svgContents);

      const canvasOptions = TheGraph.merge(TheGraph.config.app.canvas, { width: this.state.width, height: this.state.height });
      const canvas = TheGraph.factories.app.createAppCanvas.call(this, canvasOptions);

      const appContents = [
        canvas,
        svg,
      ];
      const containerOptions = TheGraph.merge(TheGraph.config.app.container, { style: { width: this.state.width, height: this.state.height } });
      containerOptions.className += ` ${scaleClass}`;
      return TheGraph.factories.app.createAppContainer.call(this, containerOptions, appContents);
    },
  }));
};
