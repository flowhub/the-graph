/**
 * Created by mpricope on 05.09.14.
 */

(function (context) {
    "use strict";
    var TheGraph = context.TheGraph;

    TheGraph.Clipboard = {};
    var clipboardContent = {};

    TheGraph.Clipboard.copy = function (graph,keys) {
        //Duplicate all the nodes before putting them in clipboard
        //this will make this work also with cut/Paste and once we
        //decide if/how we will implement cross-document copy&paste will work there too
        clipboardContent = {nodes:[],edges:[]};
        var map = {};
        for (var nodeKey in keys) {
            var node = graph.getNode(keys[nodeKey]);
            var meta = JSON.parse(JSON.stringify(node.metadata));
            meta.x += 10;
            meta.y += 10;
            var newNode = {id:TheGraph.Clipboard.makeNewId(node.component),component:node.component,metadata:meta};
            clipboardContent.nodes.push(newNode);
            map[node.id] = newNode.id;

        }
        for (var edgeKey in graph.edges) {
            var edge = graph.edges[edgeKey];
            var fromNode = edge.from.node;
            var toNode = edge.to.node;
            if (map.hasOwnProperty(fromNode) && map.hasOwnProperty(toNode)) {
                var newEdgeMeta = JSON.parse(JSON.stringify(edge.metadata));
                var newEdge = {
                    from:{node:map[edge.from.node],port:edge.from.port},
                    to:{node:map[edge.to.node],port:edge.to.port},
                    metadata:newEdgeMeta
                };
                clipboardContent.edges.push(newEdge);
            }
        }

    };

    TheGraph.Clipboard.paste = function (graph) {
        var map = {};
        for (var nodeKey in clipboardContent.nodes) {
            var node = clipboardContent.nodes[nodeKey];
            var meta = JSON.parse(JSON.stringify(node.metadata));
            meta.x += 10;
            meta.y += 10;
            var newNode = graph.addNode(TheGraph.Clipboard.makeNewId(node.component),node.component,meta);
            map[node.id] = newNode.id;

        }
        for (var edgeKey in clipboardContent.edges) {
            var edge = clipboardContent.edges[edgeKey];
            var fromNode = edge.from.node;
            var toNode = edge.to.node;
            var newEdgeMeta = JSON.parse(JSON.stringify(edge.metadata));
            graph.addEdge(map[edge.from.node],edge.from.port,map[edge.to.node],edge.to.port,newEdgeMeta);
        }

    };


    TheGraph.Clipboard.makeNewId = function(label) {
        var num = 60466176; // 36^5
        num = Math.floor(Math.random() * num);
        var id = label + '_' + num.toString(36);
        return id;
    };

})(this);



