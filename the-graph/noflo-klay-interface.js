//function klayinit () {
(function () {
  "use strict";

  Array.prototype.clean = function() {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === null) {         
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };

  // Encode the original NoFlo graph as a KGraph (KIELER Graph) JSON
  var toKieler = function (graph, portInfo, direction) {
    console.log('graph:', graph);
    console.log('portInfo:', portInfo);
    var direction = direction || 'l2r';
    var portProperties = {inportSide: {'de.cau.cs.kieler.portSide': 'WEST'},
                          outportSide: {'de.cau.cs.kieler.portSide': 'EAST'},
                          width: 10,
                          height: 10};
    if (direction === 't2b') {
      portProperties.inportSide = {'de.cau.cs.kieler.portSide': 'NORTH'};
      portProperties.outportSide = {'de.cau.cs.kieler.portSide': 'SOUTH'};
    }
    var kGraph = {
      id: 'root',
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
        return {id: node.id + '_' + key,
                width: portProperties.width,
                height: portProperties.height,
                properties: portProperties.inportSide};
      });
      var outPorts = portInfo[node.id].outports;
      var outPortsKeys = Object.keys(outPorts);
      var outPortsTemp = outPortsKeys.map(function (key) {
        return {id: node.id + '_' + key,
                width: portProperties.width,
                height: portProperties.height,
                properties: portProperties.outportSide};
      });
      var kChild = {
        id: node.id,
        labels: [{text: node.metadata.label}],
        width: 72, 
        height: 108,
        ports: inPortsTemp.concat(outPortsTemp)
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
      var kChild = {
        id: tempId, 
        labels: [{text: key}],
        width: 72, 
        height: 108,
        ports: []
      };
      idx[tempId] = countIdx++;
      return kChild;
    });
    var outports = graph.outports;
    var outportsKeys = Object.keys(outports);
    var outportChildren = outportsKeys.map(function(key){
      var outport = outports[key];
      var tempId = "outport:::"+key;
      var kChild = {
        id: tempId, 
        labels: [{text: key}],
        width: 72, 
        height: 108,
        ports: []
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
      kGraph.edges.push({id: 'e' + currentEdge++, 
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



    // FIXME: groups are not supported on KLayJS, uncomment the following lines
    // when it gets support
      
    // // Encode groups
    // var groups = graph.groups;
    // var countGroups = 0;
    // groups.map(function (group) {
    //   // Create a node to use as a subgraph
    //   var node = {id: 'group' + countGroups++, 
    //               properties: {'de.cau.cs.kieler.layoutHierarchy': true,
    //                            'de.cau.cs.kieler.klay.layered.nodeLayering': 'NETWORK_SIMPLEX',
    //                            "nodePlace": "LINEAR_SEGMENTS"
    //                           }, // FIXME: hack to get klaygwt working, remove ASAP!
    //               children: [], 
    //               edges: []};
    //   // Build the node/subgraph
    //   group.nodes.map(function (n) {
    //     node.children.push(kGraph.children[idx[n]]);
    //     node.edges.push(kGraph.edges.filter(function (edge) {
    //       if (edge) {
    //         if ((edge.source === n) || (edge.target === n)) {
    //           return edge;
    //         }
    //       }
    //     })[0]);
    //     // FIXME: guarantee that there's no undefined or null edge
    //     node.edges.clean();

    //     // Mark nodes inside the group to be removed from the graph
    //     kGraph.children[idx[n]] = null;

    //   });
    //   // Mark edges too
    //   node.edges.map(function (edge) {
    //     if (edge) {
    //       kGraph.edges[parseInt(edge.id.substr(1))] = null;
    //     }
    //   });
    //   // Add node/subgraph to the graph
    //   kGraph.children.push(node);
    // });

    // // Remove the nodes and edges from the graph, just preserve them inside the
    // // subgraph/group
    // kGraph.children.clean();
    // kGraph.edges.clean();
    // DEBUG: console.log(JSON.stringify(kGraph));
    return kGraph;
  };

  // Main interface for now: apply KLayJS layout algorithm and call the render
  window.klay = function (graph, portInfo, render) {
    if (!$klay) {
      console.warn("klay didn't load, gwtwtf");
      return;
    }
    // Convert the NoFlo graph to KGraph
    var kGraph = toKieler(graph, portInfo);
    
    // Define some preset options to KLayJS
    var options = {"algorithm": "de.cau.cs.kieler.klay.layered",
                   "layoutHierarchy": true,
                   "spacing": 20};

    $klay.layout({graph: kGraph,
                  options: options,
                  success: function (layouted) {
                    render(layouted);
                  },
                  error: function (error) {
                    // CAVEAT: this will catch errors in render callback
                    console.log("$klay.layout error:", error);
                  }});
  };
})();
