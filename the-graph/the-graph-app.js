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
        contextElement: null
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

      this.zoomFactor += event.deltaY;
      this.zoomX = event.clientX;
      this.zoomY = event.clientY;
      requestAnimationFrame(this.scheduleWheelZoom);
    },
    scheduleWheelZoom: function () {
      if (isNaN(this.zoomFactor)) { return; }

      var scale = this.state.scale + (this.state.scale * this.zoomFactor/-500);
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
      this.getDOMNode().removeEventListener("track", this.onTrack);
      this.getDOMNode().removeEventListener("trackend", this.onTrackEnd);
    },
    showNodeContext: function (event) {
      this.setState({
        contextElement: event.detail.element,
        contextX: event.detail.x,
        contextY: event.detail.y,
        tooltipVisible: false
      });
    },
    hideContext: function (event) {
      this.setState({
        contextElement: null
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
    componentDidMount: function (rootNode) {
      // Pointer gesture events for pan/zoom
      this.getDOMNode().addEventListener("trackstart", this.onTrackStart);
      this.getDOMNode().addEventListener("pinch", this.onPinch);

      // Wheel to zoom
      this.getDOMNode().addEventListener("wheel", this.onWheel);

      // Tap to clear modal
      this.getDOMNode().addEventListener("tap", this.hideContext);

      // Tooltip listener
      this.getDOMNode().addEventListener("the-graph-tooltip", this.changeTooltip);
      this.getDOMNode().addEventListener("the-graph-tooltip-hide", this.hideTooltip);

      // Context menu listeners
      this.getDOMNode().addEventListener("the-graph-context-show", this.showNodeContext);
      this.getDOMNode().addEventListener("the-graph-context-hide", this.hideContext);
      this.getDOMNode().addEventListener("the-graph-edge-start", this.edgeStart);

      // Start zoom from middle if zoom before mouse move
      this.mouseX = Math.floor( this.props.width/2 );
      this.mouseY = Math.floor( this.props.height/2 );
    },
    componentDidUpdate: function (prevProps, prevState, rootNode) {
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
      if ( this.state.contextElement ) {
        contextMenu = this.state.contextElement.getContext(this.state.contextX, this.state.contextY);
      }
      if (contextMenu) {
        contextModal = [ 
          React.DOM.rect({
            className: "context-modal-bg",
            width: this.state.width,
            height: this.state.height
          }),
          contextMenu 
        ];
      }

      return React.DOM.div(
        {
          className: "the-graph " + scaleClass,
          name:"app", 
          style: {
            width: this.state.width,
            height: this.state.height
          }
        },
        React.DOM.svg(
          {
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
              library: this.props.library
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