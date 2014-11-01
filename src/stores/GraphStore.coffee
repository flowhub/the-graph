# emitter = require('events').EventEmitter

LibraryStore = require './LibraryStore'

class GraphStore
  graph: null
  library: null
  constructor: (options) ->
    unless options?.graph?.addNode?
      throw new Error 'Constructor called without options.graph'
    @graph = options.graph
    @library = new LibraryStore @graph
  registerComponent: (definition) ->
    @library?.registerComponent definition
  setGraph: (@graph) ->
    @library = new LibraryStore @graph
  setIcon: (nodeID, icon) ->
  setError: (nodeID, hasError) ->
  setSelectedNodes: (nodes) ->
  setSelectedEdges: (edges) ->

module.exports = GraphStore