/**
 * Created by mpricope on 05.09.14.
 */

(function (context) {
  "use strict";
  var TheGraph = context.TheGraph;

  TheGraph.Clipboard = {};
  var clipboardContent = {};

  var cloneObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  var makeNewId = function (label) {
    var num = 60466176; // 36^5
    num = Math.floor(Math.random() * num);
    var id = label + '_' + num.toString(36);
    return id;
  };

  TheGraph.Clipboard.copy = function (graph, keys) {
    //Duplicate all the nodes before putting them in clipboard
    //this will make this work also with cut/Paste and once we
    //decide if/how we will implement cross-document copy&paste will work there too
    clipboardContent = {nodes:[],edges:[]};
    var map = {};
    for (var nodeKey in keys) {
      var node = graph.getNode(keys[nodeKey]);
      var newNode = cloneObject(node);
      newNode.id = makeNewId(node.component);
      clipboardContent.nodes.push(newNode);
      map[node.id] = newNode.id;
    }
    for (var edgeKey in graph.edges) {
      var edge = graph.edges[edgeKey];
      var fromNode = edge.from.node;
      var toNode = edge.to.node;
      if (map.hasOwnProperty(fromNode) && map.hasOwnProperty(toNode)) {
        var newEdge = cloneObject(edge);
        newEdge.from.node = map[fromNode];
        newEdge.to.node = map[toNode];
        clipboardContent.edges.push(newEdge);
      }
    }

  };

  TheGraph.Clipboard.paste = function (graph) {
    var map = {};
    for (var nodeKey in clipboardContent.nodes) {
      var node = clipboardContent.nodes[nodeKey];
      var meta = cloneObject(node.metadata);
      meta.x += 10;
      meta.y += 10;
      var newNode = graph.addNode(makeNewId(node.component), node.component, meta);
      map[node.id] = newNode.id;
    }
    for (var edgeKey in clipboardContent.edges) {
      var edge = clipboardContent.edges[edgeKey];
      var fromNode = edge.from.node;
      var toNode = edge.to.node;
      var newEdgeMeta = cloneObject(edge.metadata);
      if (edge.from.hasOwnProperty('index') || edge.to.hasOwnProperty('index')) {
        // One or both ports are addressable
        var fromIndex = edge.from.index || null;
        var toIndex = edge.to.index || null;
        graph.addEdgeIndex(map[fromNode], edge.from.port, fromIndex, map[toNode], edge.to.port, toIndex, newEdgeMeta);
      } else {
        graph.addEdge(map[fromNode], edge.from.port, map[toNode], edge.to.port, newEdgeMeta);
      }
    }

  };

})(this);
