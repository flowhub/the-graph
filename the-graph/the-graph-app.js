(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.App = React.createClass({
    minZoom: 0.15,
    getInitialState: function() {
      // Autofit
      var fit = TheGraph.findFit(this.props.graph, this.props.width, this.props.height);

      return {
        x: fit.x,
        y: fit.y,
        scale: fit.scale,
        width: this.props.width,
        height: this.props.height,
        tooltip: "",
        tooltipX: 0,
        tooltipY: 0,
        tooltipVisible: false,
        contextElement: null,
        contextType: null
      };
    },
    zoomFactor: 0,
    zoomX: 0,
    zoomY: 0,
    onWheel: function (event) {
      // Don't bounce
      event.preventDefault();

      if (!this.zoomFactor) { // WAT
        this.zoomFactor = 0;
      }

      // Safari is wheelDeltaY
      this.zoomFactor += event.deltaY ? event.deltaY : 0-event.wheelDeltaY;
      this.zoomX = event.clientX;
      this.zoomY = event.clientY;
      requestAnimationFrame(this.scheduleWheelZoom);
    },
    scheduleWheelZoom: function () {
      if (isNaN(this.zoomFactor)) { return; }

      // Speed limit
      var zoomFactor = this.zoomFactor/-500;
      zoomFactor = Math.min(0.5, Math.max(-0.5, zoomFactor));
      var scale = this.state.scale + (this.state.scale * zoomFactor);
      this.zoomFactor = 0;

      if (scale < this.minZoom) { 
        scale = this.minZoom;
      }
      if (scale === this.state.scale) { return; }

      // Zoom and pan transform-origin equivalent
      var scaleD = scale / this.state.scale;
      var currentX = this.state.x;
      var currentY = this.state.y;
      var oX = this.zoomX;
      var oY = this.zoomY;
      var x = scaleD * (currentX - oX) + oX;
      var y = scaleD * (currentY - oY) + oY;

      this.setState({
        scale: scale,
        x: x,
        y: y,
        tooltipVisible: false
      });
    },
    // FIXME: waiting for scale delta: https://github.com/Polymer/PointerGestures/issues/16#issuecomment-33697553
    lastScale: 1,
    onPinch: function (event) {
      var ddScale = event.scale / this.lastScale;
      this.lastScale = event.scale;

      var scale = this.state.scale * ddScale;
      scale = Math.max(scale, this.minZoom);

      // Zoom and pan transform-origin equivalent
      var scaleD = scale / this.state.scale;
      var currentX = this.state.x;
      var currentY = this.state.y;
      var oX = event.centerX;
      var oY = event.centerY;
      var x = scaleD * (currentX - oX) + oX;
      var y = scaleD * (currentY - oY) + oY;

      this.setState({
        scale: scale,
        x: x,
        y: y,
        tooltipVisible: false
      });
    },
    onTrackStart: function (event) {
      event.preventTap();
      this.getDOMNode().addEventListener("track", this.onTrack);
      this.getDOMNode().addEventListener("trackend", this.onTrackEnd);
    },
    onTrack: function (event) {
      this.setState({
        x: this.state.x + event.ddx,
        y: this.state.y + event.ddy
      });
    },
    onTrackEnd: function (event) {
      // Don't click app (unselect)
      event.stopPropagation();

      this.getDOMNode().removeEventListener("track", this.onTrack);
      this.getDOMNode().removeEventListener("trackend", this.onTrackEnd);
    },
    showContext: function (options) {
      this.setState({
        contextMenu: options,
        tooltipVisible: false
      });
    },
    // showNodeContext: function (event) {
    //   this.setState({
    //     contextElement: event.detail.element,
    //     contextType: event.detail.type,
    //     contextX: event.detail.x,
    //     contextY: event.detail.y,
    //     tooltipVisible: false
    //   });
    // },
    hideContext: function (event) {
      this.setState({
        contextMenu: null
      });
    },
    changeTooltip: function (event) {
      var tooltip = event.detail.tooltip;

      // Don't go over right edge
      var x = event.detail.x + 10;
      var width = tooltip.length*6;
      if (x + width > this.props.width) {
        x = event.detail.x - width - 10;
      }

      this.setState({
        tooltip: tooltip,
        tooltipVisible: true,
        tooltipX: x,
        tooltipY: event.detail.y + 20
      });
    },
    hideTooltip: function (event) {
      this.setState({
        tooltip: "",
        tooltipVisible: false
      });
    },
    // onFit: function (event) {
    //   this.setState({
    //     x: event.detail.x,
    //     y: event.detail.y,
    //     scale: event.detail.scale
    //   });
    // },
    edgeStart: function (event) {
      // Listened from PortMenu.edgeStart() and Port.edgeStart()
      this.refs.graph.edgeStart(event);
      this.hideContext();
    },
    componentDidMount: function () {
      var domNode = this.getDOMNode();

      // Unselect edges and nodes
      if (this.props.onNodeSelection) {
        domNode.addEventListener("tap", this.unselectAll);
      }

      // Pointer gesture events for pan/zoom
      domNode.addEventListener("trackstart", this.onTrackStart);
      domNode.addEventListener("pinch", this.onPinch);

      // Wheel to zoom
      if (domNode.onwheel!==undefined) {
        // Chrome and Firefox
        domNode.addEventListener("wheel", this.onWheel);
      } else if (domNode.onmousewheel!==undefined) {
        // Safari
        domNode.addEventListener("mousewheel", this.onWheel);
      }

      // Tooltip listener
      domNode.addEventListener("the-graph-tooltip", this.changeTooltip);
      domNode.addEventListener("the-graph-tooltip-hide", this.hideTooltip);

      // Edge preview
      domNode.addEventListener("the-graph-edge-start", this.edgeStart);

      // Start zoom from middle if zoom before mouse move
      this.mouseX = Math.floor( this.props.width/2 );
      this.mouseY = Math.floor( this.props.height/2 );

      // HACK shiftKey global for taps https://github.com/Polymer/PointerGestures/issues/29
      document.addEventListener('keydown', function (event) {
        if (event.metaKey || event.ctrlKey) { 
          TheGraph.metaKeyPressed = true; 
        }
      });
      document.addEventListener('keyup', function (event) {
        if (TheGraph.metaKeyPressed) { 
          TheGraph.metaKeyPressed = false; 
        }
      });

      // Canvas background
      this.bgCanvas = unwrap(this.refs.canvas.getDOMNode());
      this.bgContext = unwrap(this.bgCanvas.getContext('2d'));
      this.componentDidUpdate();

      // Rerender graph once to fix edges
      setTimeout(function () {
        this.renderGraph();
      }.bind(this), 500);
    },
    unselectAll: function (event) {
      // No arguments = clear selection
      this.props.onNodeSelection();
      this.props.onEdgeSelection();
    },
    renderGraph: function () {
      this.refs.graph.markDirty();
    },
    componentDidUpdate: function () {
      this.renderCanvas(this.bgContext);
    },
    renderCanvas: function (c) {
      // Comment this line to go plaid
      c.clearRect(0, 0, this.state.width, this.state.height);

      // Background grid pattern
      var scale = this.state.scale;
      var g = TheGraph.nodeSize * scale;

      var dx = this.state.x % g;
      var dy = this.state.y % g;
      var cols = Math.floor(this.state.width / g) + 1;
      var row = Math.floor(this.state.height / g) + 1;
      // Origin row/col index
      var oc = Math.floor(this.state.x / g) + (this.state.x<0 ? 1 : 0);
      var or = Math.floor(this.state.y / g) + (this.state.y<0 ? 1 : 0);

      while (row--) {
        var col = cols; 
        while (col--) {
          var x = Math.round(col*g+dx);
          var y = Math.round(row*g+dy);
          if ((oc-col)%3===0 && (or-row)%3===0) {
            // 3x grid
            c.fillStyle = "white";
            c.fillRect(x, y, 1, 1);
          } else if (scale > 0.5) {
            // 1x grid
            c.fillStyle = "grey";
            c.fillRect(x, y, 1, 1);
          }
        }
      }

    },
    render: function() {
      // console.timeEnd("App.render");
      // console.time("App.render");

      // pan and zoom
      var sc = this.state.scale;
      var x = this.state.x;
      var y = this.state.y;
      var transform = "matrix("+sc+",0,0,"+sc+","+x+","+y+")";

      var scaleClass = sc > TheGraph.zbpBig ? "big" : ( sc > TheGraph.zbpNormal ? "normal" : "small");

      var contextMenu, contextModal;
      if ( this.state.contextMenu ) {
        var options = this.state.contextMenu;
        // the-graph-editor.getMenuDef
        var menu = this.props.getMenuDef(options);
        if (menu) {
          contextMenu = options.element.getContext(menu, options);
        }
      }
      if (contextMenu) {
        contextModal = [ 
          TheGraph.ModalBG({
            width: this.state.width,
            height: this.state.height,
            triggerHideContext: this.hideContext,
            children: contextMenu
          })
        ];
        this.menuShown = true;
      } else {
        this.menuShown = false;
      }

      return React.DOM.div(
        {
          className: "the-graph-app " + scaleClass,
          name:"app", 
          style: {
            width: this.state.width,
            height: this.state.height
          }
        },
        React.DOM.canvas({
          ref: "canvas",
          className: "app-canvas",
          width: this.state.width, 
          height: this.state.height
        }),
        React.DOM.svg(
          {
            className: "app-svg",
            width: this.state.width, 
            height: this.state.height
          },
          React.DOM.g(
            {
              className: "view",
              transform: transform
            },
            TheGraph.Graph({
              ref: "graph",
              graph: this.props.graph,
              scale: this.state.scale,
              app: this,
              library: this.props.library,
              onNodeSelection: this.props.onNodeSelection,
              onEdgeSelection: this.props.onEdgeSelection,
              showContext: this.showContext
            })
          ),
          TheGraph.Tooltip({
            ref: "tooltip",
            x: this.state.tooltipX,
            y: this.state.tooltipY,
            visible: this.state.tooltipVisible,
            label: this.state.tooltip
          }),
          React.DOM.g(
            {
              className: "context",
              children: contextModal
            }
          )
        )
      );
    }
  });


})(this);