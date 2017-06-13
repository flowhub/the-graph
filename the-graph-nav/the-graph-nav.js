
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
    console.log('nav.renderThumb() start', props);
    var style = {};
    for (var name in props) {
      style[name] = props[name];
    }
    style.graph = null;
    style.lineWidth = props.nodeLineWidth;
    var info = thumb.render(context, props.graph, style);
    console.log('nav.renderThumb() done', info);
    return info;
}
function renderViewboxFromProps(context, viewbox, thumbInfo, props) {
    console.log('nav.renderViewbox() start', props);
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
    console.log('nav.renderViewbox() done', info);
    return info;
}

// https://toddmotto.com/react-create-class-versus-component/
var Component = React.createClass({
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
    var d = React.DOM;
    return d.div( { style: wrapperStyle }, [
      d.div( viewboxDiv ),
      d.canvas( viewboxCanvas ),
      d.canvas( thumbProps ),
    ]);
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
  componentDidUpdate: function() {
    console.log('nav componentDidUpdate');
    var t = renderThumbnailFromProps(this._thumbContext, this.props);
    renderViewboxFromProps(this._viewboxContext, this._viewboxElement, t, this.props);
  },
  componentDidMount: function() {
    console.log('nav componentMount');
    var t = renderThumbnailFromProps(this._thumbContext, this.props);
    renderViewboxFromProps(this._viewboxContext, this._viewboxElement, t, this.props);
  }
});


module.exports = {
  render: renderViewRectangle,
  calculateStyleFromTheme: calculateStyleFromTheme,
  Component: Component,
};
