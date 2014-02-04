(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  // Graph view

  TheGraph.Graph = React.createClass({
    mixins: [TheGraph.mixins.FakeMouse],
    getInitialState: function() {
      return {
        graph: this.props.graph,
        edgePreview: null,
        edgePreviewX: 0,
        edgePreviewY: 0
      };
    },
    componentDidMount: function () {
      this.getDOMNode().addEventListener("the-graph-node-move", this.markDirty);
      this.getDOMNode().addEventListener("the-graph-group-move", this.moveGroup);
      this.getDOMNode().addEventListener("the-graph-node-remove", this.removeNode);
      this.getDOMNode().addEventListener("the-graph-edge-start", this.edgeStart);
    },
    edgePreview: null,
    edgeStart: function (event) {
      var port = {
        process: event.detail.process,
        port: event.detail.port
      };
      var edge;
      if (event.detail.isIn) {
        edge = { tgt: port };
      } else {
        edge = { src: port };
      }
      this.setState({edgePreview: edge});
      this.props.app.getDOMNode().addEventListener("track", this.renderPreviewEdge);
    },
    renderPreviewEdge: function (event) {
      var scale = this.props.app.state.scale;
      this.setState({
        edgePreviewX: (event.pageX - this.props.app.state.x) / scale,
        edgePreviewY: (event.pageY - this.props.app.state.y) / scale
      });
      this.markDirty();
    },
    // triggerFit: function () {
    //   // Zoom to fit
    //   var fit = TheGraph.findFit(this.state.graph);
    //   var fitEvent = new CustomEvent('the-graph-fit', { 
    //     detail: fit, 
    //     bubbles: true
    //   });
    //   this.getDOMNode().dispatchEvent(fitEvent);
    // },
    moveGroup: function (event) {
      var graph = this.state.graph;
      var group = graph.groups[ event.detail.index ];
      var nodes = group.nodes;

      // Move each group member
      var len = nodes.length;
      for (var i=0; i<len; i++) {
        var node = graph.processes[ nodes[i] ];
        node.metadata.x += event.detail.x;
        node.metadata.y += event.detail.y;
      }

      this.markDirty();
    },
    getOutport: function (processName, portName) {
      var ports = this.getPorts(processName);
      if ( !ports.outports[portName] ) {
        ports.outports[portName] = {
          label: portName,
          x: TheGraph.nodeSize,
          y: TheGraph.nodeSize/2
        };
        this.dirty = true;
      }
      return ports.outports[portName];
    },
    getInport: function (processName, portName) {
      var ports = this.getPorts(processName);
      if ( !ports.inports[portName] ) {
        ports.inports[portName] = {
          label: portName,
          x: 0,
          y: TheGraph.nodeSize/2
        };
        this.dirty = true;
      }
      return ports.inports[portName];
    },
    getPorts: function (processName) {
      var process = this.state.graph.processes[processName];
      if (!process) {
        throw new Error("No process in the current graph with key: "+ processName);
      }
      if (!process.metadata.ports) {
        process.metadata.ports = {
          inports: {},
          outports: {}
        };
      }
      return process.metadata.ports;
    },
    removeNode: function (event) {
      var removeKey = event.detail;

      // Remove from groups
      var groups = this.state.graph.groups;
      var filterOutKey = function (member) {
        return (member !== removeKey);
      };
      for (var i=0; i<groups.length; i++) {
        var nodes = groups[i].nodes;
        var filtered = nodes.filter(filterOutKey);
        groups[i].nodes = filtered;
      }

      // Remove related edges
      var remainingEdges = this.state.graph.connections.filter( function (edge) {
        var remove = (edge.tgt.process === removeKey || (edge.src && edge.src.process && edge.src.process === removeKey));
        return !remove;
      });
      this.state.graph.connections = remainingEdges;

      // Remove node
      delete this.state.graph.processes[removeKey];

      this.markDirty();
    },
    dirty: false,
    markDirty: function () {
      this.setState({
        graph: this.state.graph
      });
      this.dirty = true;
    },
    shouldComponentUpdate: function () {
      // If ports change or nodes move, then edges need to rerender, so we do the whole graph
      return this.dirty;
    },
    render: function() {
      this.dirty = false;

      var self = this;
      var graph = this.state.graph;
      var processes = graph.processes;

      // Nodes
      var nodes = Object.keys(processes).map(function (key) {
        var process = processes[key];
        if (!process.metadata) {
          process.metadata = {x:0, y:0};
        }
        if (!process.metadata.label || process.metadata.label === "") {
          process.metadata.label = key;
        }
        return TheGraph.Node({
          key: key,
          x: process.metadata.x,
          y: process.metadata.y,
          label: process.metadata.label,
          app: self.props.app,
          process: process
        });
      });

      // Groups
      var index = 0;
      var groups = graph.groups.map(function (group) {
        if (group.nodes.length < 1) {
          return;
        }
        var limits = TheGraph.findMinMax(graph, group.nodes);
        var g = TheGraph.Group({
          index: index,
          minX: limits.minX,
          minY: limits.minY,
          maxX: limits.maxX,
          maxY: limits.maxY,
          scale: self.props.scale,
          label: group.name,
          description: group.metadata.description
        });
        index++;
        return g;
      });

      // Edges
      var connections = graph.connections;
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

        // Initial ports from edges
        var sourcePort = self.getOutport(connection.src.process, connection.src.port);
        var targetPort = self.getInport(connection.tgt.process, connection.tgt.port);

        var route;
        if (connection.metadata && connection.metadata.route) {
          route = connection.metadata.route;
        } else {
          route = 0;
        }

        // Label
        var label = source.metadata.label + " " + connection.src.port.toUpperCase() + " -> " + 
          connection.tgt.port.toUpperCase() + " " + target.metadata.label;
        var key = connection.src.process + "() " + connection.src.port.toUpperCase() + " -> " + 
          connection.tgt.port.toUpperCase() + " " + connection.tgt.process + "()";

        return TheGraph.Edge({
          key: key,
          sX: source.metadata.x + TheGraph.nodeSize,
          sY: source.metadata.y + sourcePort.y,
          tX: target.metadata.x,
          tY: target.metadata.y + targetPort.y,
          label: label,
          route: route
        });
      });

      // Edge preview
      var edgePreview = this.state.edgePreview;
      if (edgePreview) {
        var edgePreviewView;
        if (edgePreview.src) {
          var source = processes[edgePreview.src.process];
          var sourcePort = this.getOutport(edgePreview.src.process, edgePreview.src.port);
          edgePreviewView = TheGraph.Edge({
            key: "edge-preview",
            sX: source.metadata.x + TheGraph.nodeSize,
            sY: source.metadata.y + sourcePort.y,
            tX: this.state.edgePreviewX,
            tY: this.state.edgePreviewY,
            label: "",
            route: 0
          });
        } else {
          var target = processes[edgePreview.tgt.process];
          var targetPort = this.getInport(edgePreview.tgt.process, edgePreview.tgt.port);
          edgePreviewView = TheGraph.Edge({
            key: "edge-preview",
            sX: this.state.edgePreviewX,
            sY: this.state.edgePreviewY,
            tX: target.metadata.x,
            tY: target.metadata.y + targetPort.y,
            label: "",
            route: 0
          });
        }
        edges.push(edgePreviewView);
      }

      return React.DOM.g(
        {
          className: "graph"//,
          // onMouseDown: this.onMouseDown
        },
        React.DOM.g({
          className: "groups",
          children: groups
        }),
        React.DOM.g({
          className: "edges",
          children: edges
        }),
        React.DOM.g({
          className: "nodes", 
          children: nodes
        })
      );
    }
  });  

})(this);