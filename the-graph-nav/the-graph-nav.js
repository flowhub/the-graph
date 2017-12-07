
var React = require('react');
var createReactClass = require('create-react-class');
var thumb = require('../the-graph-thumb/the-graph-thumb.js');

function calculateStyleFromTheme(theme) {
  var style = {};
  if (theme === "dark") {
    style.viewBoxBorder =  "hsla(190, 100%, 80%, 0.4)";
    style.viewBoxBorder2 = "hsla( 10,  60%, 32%, 0.3)";
    style.outsideFill = "hsla(0, 0%, 0%, 0.4)";
    style.backgroundColor = "hsla(0, 0%, 0%, 0.9)";
  } else {
    style.viewBoxBorder =  "hsla(190, 100%, 20%, 0.8)";
    style.viewBoxBorder2 = "hsla( 10,  60%, 80%, 0.8)";
    style.outsideFill = "hsla(0, 0%, 100%, 0.4)";
    style.backgroundColor = "hsla(0, 0%, 100%, 0.9)";
  }
  return style;
}

function renderViewRectangle(context, viewrect, props) {

  context.clearRect(0, 0, props.width, props.height);
  context.fillStyle = props.outsideFill;

  // Scaled view rectangle
  var x = Math.round( (props.viewrectangle[0]/props.scale - props.thumbrectangle[0]) * props.thumbscale );
  var y = Math.round( (props.viewrectangle[1]/props.scale - props.thumbrectangle[1]) * props.thumbscale );
  var w = Math.round( props.viewrectangle[2] * props.thumbscale / props.scale );
  var h = Math.round( props.viewrectangle[3] * props.thumbscale / props.scale );

  var hide = false;
  if (x<0 && y<0 && w>props.width-x && h>props.height-y) {
    // Hide map
    hide = true;
    return {
      hide: hide
    };
  } else {
    // Show map
    hide = false;
  }

  // Clip to bounds
  // Left
  if (x < 0) { 
    w += x; 
    x = 0;
    viewrect.style.borderLeftColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderLeftColor = props.viewBoxBorder;
    context.fillRect(0, 0, x, props.height);
  }
  // Top
  if (y < 0) { 
    h += y; 
    y = 0;
    viewrect.style.borderTopColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderTopColor = props.viewBoxBorder;
    context.fillRect(x, 0, w, y);
  }
  // Right
  if (w > props.width-x) { 
    w = props.width-x;
    viewrect.style.borderRightColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderRightColor = props.viewBoxBorder;
    context.fillRect(x+w, 0, props.width-(x+w), props.height);
  }
  // Bottom
  if (h > props.height-y) { 
    h = props.height-y;
    viewrect.style.borderBottomColor = props.viewBoxBorder2;
  } else {
    viewrect.style.borderBottomColor = props.viewBoxBorder;
    context.fillRect(x, y+h, w, props.height-(y+h));
  }

  // Size and translate rect
  viewrect.style.left = x+"px";
  viewrect.style.top = y+"px";
  viewrect.style.width = w+"px";
  viewrect.style.height = h+"px";

  return {
    hide: hide
  };

}

function renderThumbnailFromProps(context, props) {
    var style = {};
    for (var name in props) {
      style[name] = props[name];
    }
    style.graph = null;
    style.lineWidth = props.nodeLineWidth;
    var info = thumb.render(context, props.graph, style);
    return info;
}
function renderViewboxFromProps(context, viewbox, thumbInfo, props) {
    var style = {};
    for (var name in props) {
      style[name] = props[name];
    }
    style.graph = null;
    style.scale = props.viewscale;
    var thumbW = thumbInfo.rectangle[2];
    var thumbH = thumbInfo.rectangle[3];
    style.thumbscale = (thumbW>thumbH) ? props.width/thumbW : props.height/thumbH;
    style.thumbrectangle = thumbInfo.rectangle;
    var info = renderViewRectangle(context, viewbox, style);
    return info;
}

// https://toddmotto.com/react-create-class-versus-component/
var Component = createReactClass({
  propTypes: {
  },
  getDefaultProps: function() {
    return {
      width: 200,
      height: 150,
      hidden: false, // FIXME: drop??
      backgroundColor: "hsla(184, 8%, 75%, 0.9)",
      outsideFill: "hsla(0, 0%, 0%, 0.4)",
      nodeSize: 60,
      nodeLineWidth: 1,
      viewrectangle: [0, 0, 0, 0],
      viewscale: 1.0,
      viewBoxBorder: "hsla(190, 100%, 80%, 0.4)",
      viewBoxBorder2: "hsla( 10,  60%, 32%, 0.3)",
      viewBoxBorderStyle: 'dotted',
      graph: null, // NOTE: should not attach to events, that is responsibility of outer code
    };
  },
  getInitialState: function() {
    return {
      thumbscale: 1.0,
      currentPan: [0.0, 0.0],
    };
  },
  render: function() {
    var p = this.props;
    var thumbStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
    };
    var wrapperStyle = {
      height: p.height,
      width: p.width,
      overflow: "hidden",
      cursor: "move",
      backgroundColor: p.backgroundColor,
    };
    var thumbProps = {
      key: 'thumb',
      ref: this._refThumbCanvas,
      width: p.width,
      height: p.height,
      style: thumbStyle,
    };
    var viewboxCanvas = {
      key: 'viewbox',
      ref: this._refViewboxCanvas,
      width: p.width,
      height: p.height,
      style: thumbStyle,
    };
    // FIXME: find better way to populate the props from render function
    var viewboxDiv = {
      key: 'viewboxdiv',
      ref: this._refViewboxElement,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: p.width,
        height: p.height,
        borderStyle: 'dotted',
        borderWidth: 1,
      },
    };
    // Elements
    return React.createElement('div', { key: 'nav', style: wrapperStyle, ref: this._refTopElement }, [
      React.createElement('div', viewboxDiv ),
      React.createElement('canvas', viewboxCanvas ),
      React.createElement('canvas', thumbProps ),
    ]);
  },
  componentDidUpdate: function() {
    this._updatePan();
    this._renderElements();
  },
  componentDidMount: function() {
    this._updatePan();
    this._renderElements();
    this._setupEvents();
  },
  _refThumbCanvas: function(canvas) {
      this._thumbContext = canvas.getContext('2d');
  },
  _refViewboxCanvas: function(canvas) {
      this._viewboxContext = canvas.getContext('2d');
  },
  _refViewboxElement: function(el) {
      this._viewboxElement = el;
  },
  _refTopElement: function(el) {
      this._topElement = el;
  },
  _renderElements: function() {
    var t = renderThumbnailFromProps(this._thumbContext, this.props);
    //this.state.thumbscale = t.scale;
    renderViewboxFromProps(this._viewboxContext, this._viewboxElement, t, this.props);
  },
  _updatePan: function() {
    this.state.currentPan = [
      -(this.props.viewrectangle[0]),
      -(this.props.viewrectangle[1]),
    ];
  },
  _setupEvents: function() {
    this.hammer = new Hammer.Manager(this._topElement, {
      recognizers: [
        [ Hammer.Tap ],
        [ Hammer.Pan, { direction: Hammer.DIRECTION_ALL } ],
      ],
    });
    this.hammer.on('tap', (function(event) {
      if (this.props.onTap) {
        this.props.onTap(null, event);
      }
    }).bind(this));
    this.hammer.on('panmove', (function(event) {
      if (this.props.onPanTo) {
        // Calculate where event pans to, in editor coordinates
        var x = this.state.currentPan[0];
        var y = this.state.currentPan[1];
        var panscale = this.state.thumbscale / this.props.viewscale;
        x -= event.deltaX / panscale;
        y -= event.deltaY / panscale;
        var panTo = { x: Math.round(x), y: Math.round(y) };
        // keep track of the current pan, because prop/component update
        // may be delayed, or never arrive.
        this.state.currentPan[0] = panTo.x;
        this.state.currentPan[1] = panTo.y;
        this.props.onPanTo(panTo, event);
      }
    }).bind(this));
  }
});


module.exports = {
  render: renderViewRectangle,
  calculateStyleFromTheme: calculateStyleFromTheme,
  Component: Component,
};
