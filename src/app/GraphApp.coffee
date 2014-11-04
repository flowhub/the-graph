# TODO structure this more as it fills out
GraphStore = require '../stores/GraphStore'
Dispatcher = require '../dispatcher/GraphDispatcher'
Constants = require '../constants/GraphConstants'

module.exports = class TheGraphApp
  dispatcher: null
  store: null
  constructor: (options) ->
    unless options?.graph?.addNode?
      throw new Error Constants.Error.NEED_NOFLO_GRAPH
    @store = new GraphStore(options)
    @dispatcher = new Dispatcher()
    @dispatcher.register @store.handleAction

if window?
  window.TheGraphApp = TheGraphApp