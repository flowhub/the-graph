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
  var toKieler = function (graph) {
    var kGraph = {id: 'root',
                  children: [], 
                  edges: []};

    // Encode nodes
    var nodes = graph.nodes;
    var idx = {};
    var countIdx = 0;
    nodes.map(function (node) {
      kGraph.children.push({id: node.id, 
                            labels: [{text: node.metadata.label}],
                            // Math.max(72, 8*node.metadata.label.length),
                            width: 72, 
                            height: 108,
                            ports: []
                           });
      idx[node.id] = countIdx++;
    });

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
                         // KGraph edges doesn't allow the same name to
                         // both sourcePort and targetPort, so...
                         sourcePort: source + '_' + sourcePort,
                         target: target,
                         targetPort: target + '_' + targetPort
                        });

      // Complete nodes encoding adding ports to them
      var ports = kGraph.children[idx[source]].ports;
      var port = {id: source + '_' + sourcePort, 
                  width: 10, 
                  height: 10, 
                  properties: {'de.cau.cs.kieler.portSide': 'EAST'}};
      if (ports.indexOf(port) < 0) {
        ports.push(port);
      }

      ports = kGraph.children[idx[target]].ports;
      port = {id: target + '_' + targetPort, 
                  width: 10, 
                  height: 10, 
                  properties: {'de.cau.cs.kieler.portSide': 'WEST'}};
      if (ports.indexOf(port) < 0) {
        ports.push(port);
      }
      
    });

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
  window.klay = function (graph, render) {
    // Convert the NoFlo graph to KGraph
    var kGraph = toKieler(graph);
    
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
                    console.log("$klay.layout error:", error);
                  }});
  };
})();
