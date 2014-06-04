var klay = (function () {
  "use strict";
  
  var worker;
  var defaultOptions = {
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
    "direction": "RIGHT"
  };
  var cleanArray = function(array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === null || array[i] === undefined) {
        array.splice(i, 1);
        i--;
      }
    }
    return array;
  };

  return {
    // Initialize the layouter as a WebWorker
    init: function (params) {
      // Set up some properties
      var callback, workerScript;
      if ("onSuccess" in params) {
        callback = params.onSuccess;
      } else {
        callback = console.log;
      }
      if ("workerScript" in params) {
        workerScript = params.workerScript;
      } else {
        workerScript = "klay-worker.js";
      }
      // Start the WebWorker
      worker = new Worker(workerScript);
      // Register a listener to default WebWorker event, calling
      // 'callback' when layout succeeds
      worker.addEventListener('message', function (e) {
        callback(e.data);
      }, false);
      
      return this;
    },

    // Layout a given graph, the result will be sent by the WebWorker
    // when done and will be made accessible by the callback defined
    // in init
    layout: function (params) {
      var graph, options, portInfo, direction, encodedGraph;
      
      if ("graph" in params) {
        graph = params.graph;
      } else {
        return;
      }
      if ("options" in params) {
        options = params.options;
      } else {
        options = defaultOptions;
      }
      if ("direction" in params) {
        direction = params.direction;
      } else {
        direction = "RIGHT";
      }
      // If portInfo is a parameter, encode the graph as KGraph first
      if ("portInfo" in params) {
        portInfo = params.portInfo;
        encodedGraph = this.nofloToKieler(graph, portInfo, direction);
      } else {
        encodedGraph = graph;
      }
      
      worker.postMessage({
        "graph": encodedGraph,
        "options": options
      });
    },

    nofloToKieler: function (graph, portInfo, direction) {
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
        height: 72
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
            x: portInfo[node.id].inports[key].x - portProperties.width,
            y: portInfo[node.id].inports[key].y
          };
        });
        var outPorts = portInfo[node.id].outports;
        var outPortsKeys = Object.keys(outPorts);
        var outPortsTemp = outPortsKeys.map(function (key) {
          return {
            id: node.id + '_' + key,
            width: portProperties.width,
            height: portProperties.height,
            x: portInfo[node.id].outports[key].x,
            y: portInfo[node.id].outports[key].y
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

      // Encode edges (together with ports on both edges and already
      // encoded nodes)
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
          node.edges = cleanArray(node.edges);

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

      // Remove the nodes and edges from the graph, just preserve them
      // inside the subgraph/group
      kGraph.children = cleanArray(kGraph.children);
      kGraph.edges = cleanArray(kGraph.edges);

      return kGraph;
    }
  }
})();
