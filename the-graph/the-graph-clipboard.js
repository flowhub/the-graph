/**
 * Created by mpricope on 05.09.14.
 */

var Clipboard= {};


Clipboard.copy = function (graph,keys) {
    //this works only inside the same document
    //as you can't access system Clipboard from JavaScript (security reason)
    //to make this work between two different documents we will probably need a
    //little ajax service
    window.clipboardContent = keys;
}

Clipboard.paste = function (graph) {
    var map = {};
    for (var nodeKey in window.clipboardContent) {
        var node = graph.getNode(window.clipboardContent[nodeKey]);
        var meta = JSON.parse(JSON.stringify(node.metadata));
        meta.x += 10;
        meta.y += 10;
        var newNode = graph.addNode(Clipboard.makeNewId(node.component),node.component,meta);
        map[node.id] = newNode.id;

    }
    for (var edgeKey in graph.edges) {
        var edge = graph.edges[edgeKey];
        var fromNode = edge.from.node;
        var toNode = edge.to.node;
        if (map.hasOwnProperty(fromNode) && map.hasOwnProperty(toNode)) {
            var newEdgeMeta = JSON.parse(JSON.stringify(edge.metadata));
            graph.addEdge(map[edge.from.node],edge.from.port,map[edge.to.node],edge.to.port);
        }
    }

}


Clipboard.makeNewId = function(label) {
    var num = 60466176; // 36^5
    num = Math.floor(Math.random() * num);
    var id = label + '_' + num.toString(36);
    return id;
}