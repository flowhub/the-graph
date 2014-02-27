function klayinit () {
  "use strict";

  Array.prototype.clean = function() {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == null) {         
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
                            width: 92, 
                            height: 72,
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

      var ports = kGraph.children[idx[target]].ports;
      var port = {id: target + '_' + targetPort, 
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

  // Encode the original NoFlo graph and annotate it with layout information from
  // the autolayouted KIELER graph
  var toNoFlo = function (oGraph, kGraph) {
    // Update original graph nodes with the new coordinates from KIELER graph
    var nodes = oGraph.nodes;
    nodes.map(function (node) {
      var children = kGraph.children;

      var kNode = children.filter(function (el) {
        if (el.id === node.id)
          return el;
        // TODO: too ugly! we need a recursive method
        if (el.children) {
          // We have a child node (subgraph member)
          var grandchildren = el.children;
          var foo = grandchildren.filter(function (ell) {
            if (ell.id === node.id) {
              // We should add mom's coords to the child
              node.metadata.x = ell.x + el.x;
              node.metadata.y = ell.y + el.y;
              return ell;
            }
          })[0];
          return foo; 
        }
      })[0];

      if (kNode) {
        if (!kNode.children) {
          node.metadata.x = kNode.x;
          node.metadata.y = kNode.y;
        }
      }
    });
    // TODO: update oGraph edges (and ports) as well
    return oGraph;
  };

  // Main interface for now: apply KLayJS layout algorithm and call the render
  window.klay = function (graph, render) {
    var kGraph = toKieler(graph);
    // Define some preset options to KLayJS
    var options = {"algorithm": "de.cau.cs.kieler.klay.layered",
                   "layoutHierarchy": true};
    
    $klay.layout({graph: kGraph,
                  success: function (layouted) {
                    var nofloGraph = toNoFlo(graph, layouted);
                    render(nofloGraph);
                  },
                  error: function (error) {
                    console.log(error);
                  }});
  };
}
