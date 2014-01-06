(function (context) {
  "use strict";

  // Boilerplate module setup
  if (!context.TheGraph) { context.TheGraph = {}; }
  var TheGraph = context.TheGraph;


  var ports = {};

  var getPorts = function (sourceProcess, sourcePort, targetProcess, targetPort) {
    var inport, outport;

    if (!ports[sourceProcess]) {
      ports[sourceProcess] = {
        inports: {length:0},
        outports: {length:0}
      };
    }
    outport = ports[sourceProcess].outports[sourcePort];
    if (!outport) {
      outport = {
        id: sourcePort,
        index: ports[sourceProcess].outports.length
      };
      ports[sourceProcess].outports[sourcePort] = outport;
      ports[sourceProcess].outports.length++;
    }
    if (!ports[targetProcess]) {
      ports[targetProcess] = {
        inports: {length:0},
        outports: {length:0}
      };
    }
    inport = ports[targetProcess].inports[targetPort];
    if (!inport) {
      inport = {
        id: targetPort,
        index: ports[targetProcess].inports.length
      };
      ports[targetProcess].inports[targetPort] = inport;
      ports[targetProcess].inports.length++;
    }

    return {
      source: outport,
      target: inport
    };

  };


  // Graph view

  TheGraph.Graph = React.createClass({
    minZoom: 0.04,
    getInitialState: function() {
      return {
        x: 0,
        y: 0,
        scale: 1,
        graph: this.props.graph
      };
    },
    onWheel: function (event) {
      // Don't bounce
      event.preventDefault();

      if (this.keyPan) {
        this.setState({
          x: this.state.x - event.deltaX,
          y: this.state.y + event.deltaY
        });
      } else {
        var scale = this.state.scale + (this.state.scale * event.deltaY/500);
        if (scale < this.minZoom) { return; }

        // Zoom and pan transform-origin equivalent
        var scaleD = scale / this.state.scale;
        var currentX = this.state.x;
        var currentY = this.state.y;
        var oX = this.mouseX;
        var oY = this.mouseY;
        var x = scaleD * (currentX - oX) + oX;
        var y = scaleD * (currentY - oY) + oY;

        this.setState({
          scale: scale,
          x: x,
          y: y
        });
      }
    },
    keyPan: false,
    onKeyUpDown: function (event) {
      // Don't scroll with space
      event.preventDefault();
      // console.log(event);
      if (event.keyCode === 32 /* space */) {
        this.keyPan = (event.type === "keydown");
      }
    },
    mouseX: 0,
    mouseY: 0,
    mousePressed: false,
    draggingElement: null,
    onMouseDown: function (event) {
      this.mousePressed = true;
      this.mouseX = event.pageX;
      this.mouseY = event.pageY;
    },
    onMouseMove: function (event) {
      // Pan
      if (this.mousePressed) {
        var deltaX = event.pageX - this.mouseX;
        var deltaY = event.pageY - this.mouseY;
        this.setState({
          x: this.state.x + deltaX,
          y: this.state.y + deltaY
        });
      }
      this.mouseX = event.pageX;
      this.mouseY = event.pageY;
    },
    onMouseUp: function (event) {
      this.mousePressed = false;
    },
    componentDidMount: function () {
      window.addEventListener("keydown", this.onKeyUpDown);
      window.addEventListener("keyup", this.onKeyUpDown);

      // Mouse listen to window for drag/release outside
      window.addEventListener("mousedown", this.onMouseDown);
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);

      // Start zoom from middle if zoom before mouse move
      this.mouseX = Math.floor( window.innerWidth/2 );
      this.mouseY = Math.floor( window.innerHeight/2 );
    },
    render: function() {
      // Nodes
      var processes = this.state.graph.processes;
      var nodeKeys = Object.keys(processes);
      var nodes = nodeKeys.map(function (key) {
        var process = processes[key];
        return TheGraph.Node({
          key: key,
          process: process
        });
      });

      // Edges
      var connections = this.state.graph.connections;
      var edges = connections.map(function (connection) {
        if (connection.data !== undefined) {
          // IIP
          return;
        }
        var source = processes[connection.src.process];
        var target = processes[connection.tgt.process];
        if (!source || !target) {
          throw new Error("Edge source or target not found.");
        }

        // Ports
        var ports = getPorts(connection.src.process, connection.src.port, connection.tgt.process, connection.tgt.port);

        var route;
        if (connection.metadata && connection.metadata.route) {
          route = connection.metadata.route;
        } else {
          route = 0;
        }
        return TheGraph.Edge({
          source: source,
          target: target,
          ports: ports,
          route: route
        });
      });

      // pan and zoom
      var sc = this.state.scale;
      var x = this.state.x;
      var y = this.state.y;
      var transform = "matrix("+sc+",0,0,"+sc+","+x+","+y+")";

      var group = React.DOM.div(
        {
          name:"app", 
          onWheel: this.onWheel
        },
        React.DOM.svg(
          {
            className: "graph", 
            width: this.props.width, 
            height: this.props.height
          },
          // React.DOM.defs({},
          //   React.DOM.pattern(
          //     {
          //       width: 216, height: 216
          //     },
          //     React.DOM.path({
          //       d: "M 0 216 L 0 0 L 216 0",
          //       stroke: "red"
          //     })
          //   )
          // ),
          React.DOM.g(
            {
              className: "view",
              transform: transform
            },
            React.DOM.g({
              className: "edges",
              children: edges
            }),
            React.DOM.g({
              className: "nodes", 
              children: nodes
            })
          )
        )
      );
      return group;
    }
  });  

})(this);