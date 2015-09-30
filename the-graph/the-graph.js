(function (context) {
  "use strict";

  var defaultNodeSize = 72;
  var defaultNodeRadius = 8;

  // Dumb module setup
  var TheGraph = context.TheGraph = {
    // nodeSize and nodeRadius are deprecated, use TheGraph.config.(nodeSize/nodeRadius)
    nodeSize: defaultNodeSize,
    nodeRadius: defaultNodeRadius,
    nodeSide: 56,
    // Context menus
    contextPortSize: 36,
    // Zoom breakpoints
    zbpBig: 1.2,
    zbpNormal: 0.4,
    zbpSmall: 0.01,
    config: {
      nodeSize: defaultNodeSize,
      nodeWidth: defaultNodeSize,
      nodeRadius: defaultNodeRadius,
      nodeHeight: defaultNodeSize,
      autoSizeNode: true,
      maxPortCount: 9,
      nodeHeightIncrement: 12,
      focusAnimationDuration: 1500
    },
    factories: {}
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

  // Show fake tooltip
  // Class must have getTooltipTrigger (dom node) and shouldShowTooltip (boolean)
  TheGraph.mixins.Tooltip = {
    showTooltip: function (event) {
      if ( !this.shouldShowTooltip() ) { return; }

      var tooltipEvent = new CustomEvent('the-graph-tooltip', { 
        detail: {
          tooltip: this.props.label,
          x: event.clientX,
          y: event.clientY
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
      if (this.isMounted()) {
        this.getDOMNode().dispatchEvent(tooltipEvent);
      }
    },
    componentDidMount: function () {
      if (navigator && navigator.userAgent.indexOf("Firefox") !== -1) {
        // HACK Ff does native tooltips on svg elements
        return;
      }
      var tooltipper = this.getTooltipTrigger();
      tooltipper.addEventListener("tap", this.showTooltip);
      tooltipper.addEventListener("mouseenter", this.showTooltip);
      tooltipper.addEventListener("mouseleave", this.hideTooltip);
    }
  };

  TheGraph.findMinMax = function (graph, nodes) {
    var inports, outports;
    if (nodes === undefined) {
      nodes = graph.nodes.map( function (node) {
        return node.id;
      });
      // Only look at exports when calculating the whole graph
      inports = graph.inports;
      outports = graph.outports;
    }
    if (nodes.length < 1) {
      return undefined;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    // Loop through nodes
    var len = nodes.length;
    for (var i=0; i<len; i++) {
      var key = nodes[i];
      var node = graph.getNode(key);
      if (!node || !node.metadata) {
        continue;
      }
      if (node.metadata.x < minX) { minX = node.metadata.x; }
      if (node.metadata.y < minY) { minY = node.metadata.y; }
      var x = node.metadata.x + node.metadata.width;
      var y = node.metadata.y + node.metadata.height;
      if (x > maxX) { maxX = x; }
      if (y > maxY) { maxY = y; }
    }
    // Loop through exports
    var keys, exp;
    if (inports) {
      keys = Object.keys(inports);
      len = keys.length;
      for (i=0; i<len; i++) {
        exp = inports[keys[i]];
        if (!exp.metadata) { continue; }
        if (exp.metadata.x < minX) { minX = exp.metadata.x; }
        if (exp.metadata.y < minY) { minY = exp.metadata.y; }
        if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
        if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
      }
    }
    if (outports) {
      keys = Object.keys(outports);
      len = keys.length;
      for (i=0; i<len; i++) {
        exp = outports[keys[i]];
        if (!exp.metadata) { continue; }
        if (exp.metadata.x < minX) { minX = exp.metadata.x; }
        if (exp.metadata.y < minY) { minY = exp.metadata.y; }
        if (exp.metadata.x > maxX) { maxX = exp.metadata.x; }
        if (exp.metadata.y > maxY) { maxY = exp.metadata.y; }
      }
    }

    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      return null;
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
    limits.minX -= TheGraph.config.nodeSize;
    limits.minY -= TheGraph.config.nodeSize;
    limits.maxX += TheGraph.config.nodeSize * 2;
    limits.maxY += TheGraph.config.nodeSize * 2;

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

  TheGraph.findAreaFit = function (point1, point2, width, height) {
    var limits = {
      minX: point1.x < point2.x ? point1.x : point2.x,
      minY: point1.y < point2.y ? point1.y : point2.y,
      maxX: point1.x > point2.x ? point1.x : point2.x,
      maxY: point1.y > point2.y ? point1.y : point2.y
    };

    limits.minX -= TheGraph.config.nodeSize;
    limits.minY -= TheGraph.config.nodeSize;
    limits.maxX += TheGraph.config.nodeSize * 2;
    limits.maxY += TheGraph.config.nodeSize * 2;

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

  TheGraph.findNodeFit = function (node, width, height) {
    var limits = {
      minX: node.metadata.x - TheGraph.config.nodeSize,
      minY: node.metadata.y - TheGraph.config.nodeSize,
      maxX: node.metadata.x + TheGraph.config.nodeSize * 2,
      maxY: node.metadata.y + TheGraph.config.nodeSize * 2
    };

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

  // SVG arc math
  var angleToX = function (percent, radius) {
    return radius * Math.cos(2*Math.PI * percent);
  };
  var angleToY = function (percent, radius) {
    return radius * Math.sin(2*Math.PI * percent);
  };
  var makeArcPath = function (startPercent, endPercent, radius) {
    return [ 
      "M", angleToX(startPercent, radius), angleToY(startPercent, radius),
      "A", radius, radius, 0, 0, 0, angleToX(endPercent, radius), angleToY(endPercent, radius)
    ].join(" ");
  };
  TheGraph.arcs = {
    n4: makeArcPath(7/8, 5/8, 36),
    s4: makeArcPath(3/8, 1/8, 36),
    e4: makeArcPath(1/8, -1/8, 36),
    w4: makeArcPath(5/8, 3/8, 36),
    inport: makeArcPath(-1/4, 1/4, 4),
    outport: makeArcPath(1/4, -1/4, 4),
    inportBig: makeArcPath(-1/4, 1/4, 6),
    outportBig: makeArcPath(1/4, -1/4, 6),
  };


  // Reusable React classes
  TheGraph.SVGImage = React.createFactory( React.createClass({
    displayName: "TheGraphSVGImage",
    render: function() {
        var html = '<image ';
        html = html +'xlink:href="'+ this.props.src + '"';
        html = html +'x="' + this.props.x + '"';
        html = html +'y="' + this.props.y + '"';
        html = html +'width="' + this.props.width + '"';
        html = html +'height="' + this.props.height + '"';
        html = html +'/>';

        return React.DOM.g({
            className: this.props.className,
            dangerouslySetInnerHTML:{__html: html}
        });
    }
  }));

  TheGraph.TextBG = React.createFactory( React.createClass({
    displayName: "TheGraphTextBG",
    render: function() {
      var text = this.props.text;
      if (!text) {
        text = "";
      }
      var height = this.props.height;
      var width = text.length * this.props.height * 2/3;
      var radius = this.props.height/2;

      var textAnchor = "start";
      var dominantBaseline = "central";
      var x = this.props.x;
      var y = this.props.y - height/2;

      if (this.props.halign === "center") {
        x -= width/2;
        textAnchor = "middle";
      }
      if (this.props.halign === "right") {
        x -= width;
        textAnchor = "end";
      }

      return React.DOM.g(
        {
          className: (this.props.className ? this.props.className : "text-bg"),
        },
        React.DOM.rect({
          className: "text-bg-rect",
          x: x,
          y: y,
          rx: radius,
          ry: radius,
          height: height * 1.1,
          width: width
        }),
        React.DOM.text({
          className: (this.props.textClassName ? this.props.textClassName : "text-bg-text"),
          x: this.props.x,
          y: this.props.y,
          children: text
        })
      );
    }
  }));

  // The `merge` function provides simple property merging.
  TheGraph.merge = function(src, dest, overwrite) {
    // Do nothing if neither are true objects.
    if (Array.isArray(src) || Array.isArray(dest) || typeof src !== 'object' || typeof dest !== 'object')
      return dest;

    // Default overwriting of existing properties to false.
    overwrite = overwrite || false;

    for (var key in src) {
      // Only copy properties, not functions.
      if (typeof src[key] !== 'function' && (!dest[key] || overwrite))
        dest[key] = src[key];
    }

    return dest;
  };

  TheGraph.factories.createGroup = function(options, content) {
    var args = [options];

    if (Array.isArray(content)) {
      args = args.concat(content);
    }

    return React.DOM.g.apply(React.DOM.g, args);
  };

  TheGraph.factories.createRect = function(options) {
    return React.DOM.rect(options);
  };

  TheGraph.factories.createText = function(options) {
    return React.DOM.text(options);
  };

  TheGraph.factories.createCircle = function(options) {
    return React.DOM.circle(options);
  };

  TheGraph.factories.createPath = function(options) {
    return React.DOM.path(options);
  };

  TheGraph.factories.createImg = function(options) {
    return TheGraph.SVGImage(options);
  };

  TheGraph.factories.createCanvas = function(options) {
    return React.DOM.canvas(options);
  };

  TheGraph.factories.createSvg = function(options, content) {

    var args = [options];

    if (Array.isArray(content)) {
      args = args.concat(content);
    }

    return React.DOM.svg.apply(React.DOM.svg, args);
  };
  
  TheGraph.getOffset = function(domNode){
    var getElementOffset = function(element){
      var offset = { top: 0, left: 0},
          parentOffset;
      if(!element){
        return offset;
      }
      offset.top += (element.offsetTop || 0);
      offset.left += (element.offsetLeft || 0);
      parentOffset = getElementOffset(element.offsetParent);
      offset.top += parentOffset.top;
      offset.left += parentOffset.left;
      return offset;
    };
    try{
      return getElementOffset( domNode );
    }catch(e){
      return getElementOffset();
    }
  };

})(this);
