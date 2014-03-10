function klayinit () {
  "use strict";

  Array.prototype.clean = function() {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === null || this[i] === undefined) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };

  // Encode the original NoFlo graph as a KGraph (KIELER Graph) JSON
  var toKieler = function (graph, portInfo, direction) {
    // Default direction is left to right
    direction = direction || 'RIGHT';
    var portConstraints = 'FIXED_POS';
    // Default port and node properties
    var portProperties = {
      inportSide: 'WEST',
      outportSide: 'EAST',
      width: 10,
      height: 10
    };
    if (direction === 'DOWN') {
      portProperties.inportSide = 'NORTH';
      portProperties.outportSide = 'SOUTH';
    }
    var nodeProperties = {
      width: 72,
      height: 108
    };
    // Start KGraph building
    var kGraph = {
      id: graph.name,
      children: [], 
      edges: []
    };
    // Encode nodes
    var nodes = graph.nodes;
    var idx = {};
    var countIdx = 0;
    var nodeChildren = nodes.map(function (node) {
      var inPorts = portInfo[node.id].inports;
      var inPortsKeys = Object.keys(inPorts);
      var inPortsTemp = inPortsKeys.map(function (key) {
        return {
          id: node.id + '_' + key,
          width: portProperties.width,
          height: portProperties.height,
          properties: {
            'de.cau.cs.kieler.portSide': portProperties.inportSide
          }
        };
      });
      var outPorts = portInfo[node.id].outports;
      var outPortsKeys = Object.keys(outPorts);
      var outPortsTemp = outPortsKeys.map(function (key) {
        return {
          id: node.id + '_' + key,
          width: portProperties.width,
          height: portProperties.height,
          properties: {
            'de.cau.cs.kieler.portSide': portProperties.outportSide
          }
        };
      });

      var kChild = {
        id: node.id,
        labels: [{text: node.metadata.label}],
        width: nodeProperties.width,
        height: nodeProperties.height,
        ports: inPortsTemp.concat(outPortsTemp),
        properties: {
          'portConstraints': portConstraints
        }
      };
      idx[node.id] = countIdx++;
      return kChild;
    });

    // Graph i/o to kGraph nodes
    var inports = graph.inports;
    var inportsKeys = Object.keys(inports);
    var inportChildren = inportsKeys.map(function(key){
      var inport = inports[key];
      var tempId = "inport:::"+key;
      // Inports just has only one output port
      var uniquePort = {
        id: inport.port,
        width: portProperties.width,
        height: portProperties.height,
        properties: {
          'de.cau.cs.kieler.portSide': portProperties.outportSide
        }
      };
      
      var kChild = {
        id: tempId, 
        labels: [{text: key}],
        width: nodeProperties.width, 
        height: nodeProperties.height,
        ports: [uniquePort],
        properties: {
          'portConstraints': portConstraints,
          "de.cau.cs.kieler.klay.layered.layerConstraint": "FIRST_SEPARATE"
        }
      };
      idx[tempId] = countIdx++;
      return kChild;
    });
    var outports = graph.outports;
    var outportsKeys = Object.keys(outports);
    var outportChildren = outportsKeys.map(function(key){
      var outport = outports[key];
      var tempId = "outport:::"+key;
      // Outports just has only one input port
      var uniquePort = {
        id: outport.port,
        width: portProperties.width,
        height: portProperties.height,
        properties: {
          'de.cau.cs.kieler.portSide': portProperties.inportSide
        }
      };

      var kChild = {
        id: tempId, 
        labels: [{text: key}],
        width: nodeProperties.width, 
        height: nodeProperties.height,
        ports: [uniquePort],
        properties: {
          'portConstraints': portConstraints,
          "de.cau.cs.kieler.klay.layered.layerConstraint": "LAST_SEPARATE"
        }
      };
      idx[tempId] = countIdx++;
      return kChild;
    });

    // Combine nodes, inports, outports to one array
    kGraph.children = nodeChildren.concat(inportChildren, outportChildren);

    // Encode edges (together with ports on both edges and already encoded nodes)
    var currentEdge = 0;
    var edges = graph.edges;
    edges.map(function (edge) {
      if (edge.data !== undefined) {
        return;
      }
      var source = edge.from.node;
      var sourcePort = edge.from.port;
      var target = edge.to.node;
      var targetPort = edge.to.port;
      kGraph.edges.push({
        id: 'e' + currentEdge++, 
        source: source,
        sourcePort: source + '_' + sourcePort,
        target: target,
        targetPort: target + '_' + targetPort
      });
    });
    
    // Graph i/o to kGraph edges
    var inportEdges = inportsKeys.map(function (key) {
      var inport = inports[key];
      var source = "inport:::"+key;
      var sourcePort = key;
      var target = inport.process;
      var targetPort = inport.port;
      var inportEdge = {
        id: 'e' + currentEdge++,
        source: source,
        sourcePort: source + '_' + sourcePort,
        target: target,
        targetPort: target + '_' + targetPort
      };
      return inportEdge;
    });
    var outportEdges = outportsKeys.map(function (key) {
      var outport = outports[key];
      var source = outport.process;
      var sourcePort = outport.port;
      var target = "outport:::"+key;
      var targetPort = key;
      var outportEdge = {
        id: 'e' + currentEdge++,
        source: source,
        sourcePort: source + '_' + sourcePort,
        target: target,
        targetPort: target + '_' + targetPort
      };
      return outportEdge;
    });

    // Combine edges, inports, outports to one array
    kGraph.edges = kGraph.edges.concat(inportEdges, outportEdges);
    
    // Encode groups
    var groups = graph.groups;
    var countGroups = 0;
    // Mark the nodes already in groups to avoid the same node in many groups
    var nodesInGroups = [];
    groups.map(function (group) {
      // Create a node to use as a subgraph
      var node = {
        id: 'group' + countGroups++, 
        children: [], 
        edges: []
      };
      // Build the node/subgraph
      group.nodes.map(function (n) {
        var nodeT = kGraph.children[idx[n]];
        if (nodeT === null) {
          return;
        }
        if (nodesInGroups.indexOf(nodeT) >= 0) {
          return;
        }
        nodesInGroups.push(nodeT);
        node.children.push(nodeT);
        node.edges.push(kGraph.edges.filter(function (edge) {
          if (edge) {
            if ((edge.source === n) || (edge.target === n)) {
              return edge;
            }
          }
        })[0]);
        node.edges.clean();

        // Mark nodes inside the group to be removed from the graph
        kGraph.children[idx[n]] = null;

      });
      // Mark edges too
      node.edges.map(function (edge) {
        if (edge) {
          kGraph.edges[parseInt(edge.id.substr(1), 10)] = null;
        }
      });
      // Add node/subgraph to the graph
      kGraph.children.push(node);
    });

    // Remove the nodes and edges from the graph, just preserve them inside the
    // subgraph/group
    kGraph.children.clean();
    kGraph.edges.clean();

    return kGraph;
  };

  // Main interface for now: apply KLayJS layout algorithm and call the render
  window.klay = function (graph, portInfo, render, direction) {
    if (typeof $klay === 'undefined') {
      throw new Error('Klay autolayout algorithm not loaded, aborting');
    }
    direction = direction || "RIGHT";

    // Define some preset options to KLayJS
    var options = {
      "intCoordinates": true,
      "algorithm": "de.cau.cs.kieler.klay.layered",
      "layoutHierarchy": true,
      "spacing": 20,
      "borderSpacing": 20,
      "edgeSpacingFactor": 0.2,
      "inLayerSpacingFactor": 2.0,
      "nodePlace": "BRANDES_KOEPF",
      "nodeLayering": "NETWORK_SIMPLEX",
      "edgeRouting": "POLYLINE",
      "crossMin": "LAYER_SWEEP",
      "direction": direction
    };
    
    // Convert the NoFlo graph to KGraph
    var kGraph = toKieler(graph, portInfo, direction);
   
    $klay.layout({
      graph: kGraph,
      options: options,
      success: function (layouted) {
        render(layouted);
      },
      error: function (error) {
        // CAVEAT: this will catch errors in render callback
        console.warn("$klay.layout error:", error);
      }
    });
  };
}
