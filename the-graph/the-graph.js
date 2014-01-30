(function (context) {
  "use strict";

  // Dumb module setup
  var TheGraph = context.TheGraph = {
    nodeSize: 72,
    nodeRadius: 8,
    nodeSide: 56,
    // Context menus
    contextPortSize: 36,
    // Zoom breakpoints
    zbpBig: 1.2,
    zbpNormal: 0.4,
    zbpSmall: 0.01
  }; 

  // React setup
  React.initializeTouchEvents(true);

  // rAF shim
  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  // Mixins to use throughout project
  TheGraph.mixins = {};

  // Touch to mouse
  // Class must have onMouseDown onMouseMove onMouseUp
  TheGraph.mixins.FakeMouse = {
    onTouchStart: function (event) {
      event.preventDefault();
      if (event.touches && event.touches.length === 1) {
        this.onMouseDown(event);
      }
    },
    onTouchMove: function (event) {
      event.preventDefault();
      this.onMouseMove(event);
    },
    onTouchEnd: function (event) {
      event.preventDefault();
      if (event.touches && event.touches.length === 0) {
        this.onMouseUp(event);
      }
    },
    componentDidMount: function (rootNode) {
      // First touch maps to mouse
      this.getDOMNode().addEventListener("touchstart", this.onTouchStart);
      this.getDOMNode().addEventListener("touchmove", this.onTouchMove);
      this.getDOMNode().addEventListener("touchend", this.onTouchEnd);
      this.getDOMNode().addEventListener("touchcancel", this.onTouchEnd);
    }
  };

  // Show fake tooltip
  // Class must have getTooltipTrigger (dom node) and shouldShowTooltip (boolean)
  TheGraph.mixins.Tooltip = {
    showTooltip: function (event) {
      if ( !this.shouldShowTooltip() ) { return; }

      var tooltipEvent = new CustomEvent('the-graph-tooltip', { 
        detail: {
          tooltip: this.props.label,
          x: event.pageX,
          y: event.pageY
        }, 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(tooltipEvent);
    },
    hideTooltip: function (event) {
      if ( !this.shouldShowTooltip() ) { return; }

      var tooltipEvent = new CustomEvent('the-graph-tooltip-hide', { 
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(tooltipEvent);
    },
    componentDidMount: function (rootNode) {
      if (navigator && navigator.userAgent.indexOf("Firefox") !== -1) {
        // HACK Ff does native tooltips on svg elements
        return;
      }
      var tooltipper = this.getTooltipTrigger();
      tooltipper.addEventListener("mouseenter", this.showTooltip);
      tooltipper.addEventListener("mouseleave", this.hideTooltip);
    }
  };

  TheGraph.findMinMax = function (graph, nodes) {
    if (nodes === undefined) {
      nodes = Object.keys(graph.processes);
    }
    if (nodes.length < 1) {
      return undefined;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    var len = nodes.length;
    for (var i=0; i<len; i++) {
      var key = nodes[i];
      var process = graph.processes[ key ];
      if (!process) {
        throw new Error("Didn't find process "+key);
      }
      if (process.metadata.x < minX) { minX = process.metadata.x; }
      if (process.metadata.y < minY) { minY = process.metadata.y; }
      if (process.metadata.x > maxX) { maxX = process.metadata.x; }
      if (process.metadata.y > maxY) { maxY = process.metadata.y; }
    }
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      minX = 0;
      minY = 0;
      maxX = 0;
      maxY = 0;
      return;
    }
    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
    };
  };

  TheGraph.findFit = function (graph, width, height) {
    var limits = TheGraph.findMinMax(graph);
    if (!limits) {
      return {x:0, y:0, scale:1};
    }
    limits.minX -= TheGraph.nodeSize;
    limits.minY -= TheGraph.nodeSize;
    limits.maxX += TheGraph.nodeSize * 2;
    limits.maxY += TheGraph.nodeSize * 2;

    var gWidth = limits.maxX - limits.minX;
    var gHeight = limits.maxY - limits.minY;

    var scaleX = width / gWidth;
    var scaleY = height / gHeight;

    var scale, x, y;
    if (scaleX < scaleY) {
      scale = scaleX;
      x = 0 - limits.minX * scale;
      y = 0 - limits.minY * scale + (height-(gHeight*scale))/2;
    } else {
      scale = scaleY;
      x = 0 - limits.minX * scale + (width-(gWidth*scale))/2;
      y = 0 - limits.minY * scale;
    }

    return {
      x: x,
      y: y,
      scale: scale
    };
  };


})(this);