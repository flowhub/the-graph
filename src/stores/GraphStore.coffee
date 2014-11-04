# emitter = require('events').EventEmitter

LibraryStore = require './LibraryStore'
Constants = require '../constants/GraphConstants'

module.exports = class GraphStore
  graph: null
  library: null
  constructor: (options) ->
    unless options?.graph?.addNode?
      throw new Error Constants.Error.NEED_NOFLO_GRAPH
    @graph = options.graph
    @library = new LibraryStore {graph: @graph}
  setGraph: (@graph) ->
    @library = new LibraryStore @graph
  setIcon: (nodeID, icon) ->
  setError: (nodeID, hasError) ->
  setSelectedNodes: (nodes) ->
  setSelectedEdges: (edges) ->
  handleAction: (action) =>
    switch action.type
      when Constants.Runtime.UPDATE_ICON
        return
      when Constants.Runtime.REGISTER_COMPONENT
        @library?.registerComponent action.definition
