
function drawEdge(context, scale, source, target, route, properties) {
  // Draw path
  try {
    context.strokeStyle = properties.edgeColors[0];
    if (route) {
      // Color if route defined
      context.strokeStyle = properties.edgeColors[route];
    }
    var fromX = Math.round(source.metadata.x*scale)-0.5;
    var fromY = Math.round(source.metadata.y*scale)-0.5;
    var toX = Math.round(target.metadata.x*scale)-0.5;
    var toY = Math.round(target.metadata.y*scale)-0.5;
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  } catch (error) {
    // FIXME: handle?
  }
}

function styleFromTheme(theme) {
  var style = {};
  if (theme === "dark") {
    style.fill = "hsl(184, 8%, 10%)";
    style.stroke = "hsl(180, 11%, 70%)";
    style.edgeColors = [
      "white",
      "hsl(  0, 100%, 46%)",
      "hsl( 35, 100%, 46%)",
      "hsl( 60, 100%, 46%)",
      "hsl(135, 100%, 46%)",
      "hsl(160, 100%, 46%)",
      "hsl(185, 100%, 46%)",
      "hsl(210, 100%, 46%)",
      "hsl(285, 100%, 46%)",
      "hsl(310, 100%, 46%)",
      "hsl(335, 100%, 46%)"
    ];

  } else {
    // Light
    style.fill = "hsl(184, 8%, 75%)";
    style.stroke = "hsl(180, 11%, 20%)";
    // Tweaked to make thin lines more visible
    style.edgeColors = [
      "hsl(  0,   0%, 50%)",
      "hsl(  0, 100%, 40%)",
      "hsl( 29, 100%, 40%)",
      "hsl( 47, 100%, 40%)",
      "hsl(138, 100%, 40%)",
      "hsl(160,  73%, 50%)",
      "hsl(181, 100%, 40%)",
      "hsl(216, 100%, 40%)",
      "hsl(260, 100%, 40%)",
      "hsl(348, 100%, 50%)",
      "hsl(328, 100%, 40%)"
    ];
  }
  return style;
}

function renderThumbnail(context, graph, properties) {

    // Reset origin
    context.setTransform(1,0,0,1,0,0);
    // Clear
    context.clearRect(0, 0, properties.width, properties.height);
    context.lineWidth = properties.lineWidth;

    // Find dimensions
    var toDraw = [];
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var nodes = {};

    // Process nodes
    graph.nodes.forEach(function(process){
      if ( process.metadata && !isNaN(process.metadata.x) && !isNaN(process.metadata.y) ) {
        toDraw.push(process);
        nodes[process.id] = process;
        minX = Math.min(minX, process.metadata.x);
        minY = Math.min(minY, process.metadata.y);
        maxX = Math.max(maxX, process.metadata.x);
        maxY = Math.max(maxY, process.metadata.y);
      }
    }.bind(this));

    // Process exported ports
    if (graph.inports) {
      Object.keys(graph.inports).forEach(function(key){
        var exp = graph.inports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          toDraw.push(exp);
          minX = Math.min(minX, exp.metadata.x);
          minY = Math.min(minY, exp.metadata.y);
          maxX = Math.max(maxX, exp.metadata.x);
          maxY = Math.max(maxY, exp.metadata.y);
        }
      }.bind(this));
    }
    if (graph.outports) {
      Object.keys(graph.outports).forEach(function(key){
        var exp = graph.outports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          toDraw.push(exp);
          minX = Math.min(minX, exp.metadata.x);
          minY = Math.min(minY, exp.metadata.y);
          maxX = Math.max(maxX, exp.metadata.x);
          maxY = Math.max(maxY, exp.metadata.y);
        }
      }.bind(this));
    }

    // Sanity check graph size
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY) ) {
      return;
    }

    minX -= properties.nodeSize;
    minY -= properties.nodeSize;
    maxX += properties.nodeSize*2;
    maxY += properties.nodeSize*2;
    var w = maxX - minX;
    var h = maxY - minY;
    // For the-graph-nav to bind
    var thumbrectangle = [];
    thumbrectangle[0] = minX;
    thumbrectangle[1] = minY;
    thumbrectangle[2] = w;
    thumbrectangle[3] = h;
    // Scale dimensions
    var scale = (w > h) ? properties.width/w : properties.height/h;
    var thumbscale = scale;
    var size = Math.round(properties.nodeSize * scale);
    var sizeHalf = size / 2;
    // Translate origin to match
    context.setTransform(1,0,0,1,0-minX*scale,0-minY*scale);

    // Draw connection from inports to nodes
    if (graph.inports) {
      Object.keys(graph.inports).forEach(function(key){
        var exp = graph.inports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          var target = nodes[exp.process];
          if (!target) {
            return;
          }
          drawEdge(context, scale, exp, target, 2, properties);
        }
      }.bind(this));
    }
    // Draw connection from nodes to outports
    if (graph.outports) {
      Object.keys(graph.outports).forEach(function(key){
        var exp = graph.outports[key];
        if ( exp.metadata && !isNaN(exp.metadata.x) && !isNaN(exp.metadata.y) ) {
          var source = nodes[exp.process];
          if (!source) {
            return;
          }
          drawEdge(context, scale, source, exp, 5, properties);
        }
      }.bind(this));
    }

    // Draw edges
    graph.edges.forEach(function (connection){
      var source = nodes[connection.from.node];
      var target = nodes[connection.to.node];
      if (!source || !target) {
        return;
      }
      drawEdge(context, scale, source, target, connection.metadata.route, properties);
    }.bind(this));

    // Draw nodes
    toDraw.forEach(function (node){
      var x = Math.round(node.metadata.x * scale);
      var y = Math.round(node.metadata.y * scale);

      // Outer circle
      context.strokeStyle = properties.strokeStyle;
      context.fillStyle = properties.fillStyle;
      context.beginPath();
      if (node.process && !node.component) {
        context.arc(x, y, sizeHalf / 2, 0, 2*Math.PI, false);
      } else {
        context.arc(x, y, sizeHalf, 0, 2*Math.PI, false);
      }
      context.fill();
      context.stroke();

      // Inner circle
      context.beginPath();
      var smallRadius = Math.max(sizeHalf-1.5, 1);
      if (node.process && !node.component) {
        // Exported port
        context.arc(x, y, smallRadius / 2, 0, 2*Math.PI, false);
      } else {
        // Regular node
        context.arc(x, y, smallRadius, 0, 2*Math.PI, false);
      }
      context.fill();

    }.bind(this));

    return {
      rectangle: thumbrectangle,
      scale: thumbscale
    };
}

module.exports = {
  render: renderThumbnail,
  styleFromTheme: styleFromTheme,
};
