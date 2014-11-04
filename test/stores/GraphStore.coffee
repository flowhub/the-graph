chai = require 'chai'
chai.should()

Noflo = require 'noflo'
GraphStore = require '../../src/stores/GraphStore'
Constants = require '../../src/constants/GraphConstants'
Dispatcher = require '../../src/dispatcher/GraphDispatcher'
graphJSON = require '../fixtures/graph.json'
expectedLibraryJSON = require '../fixtures/graphExpectedLibrary.json'

describe 'GraphStore (model for graph)', ->
  graph = null
  store = null

  before (done) ->
    Noflo.graph.loadJSON graphJSON, (g) ->
      graph = g
      done()

  it 'should throw when not started with noflo graph', ->
    fail = () ->
      failStore = new GraphStore {}
    fail.should.throw(Constants.Error.NEED_NOFLO_GRAPH)

  it 'should correctly build initial library from graph', ->
    store = new GraphStore {graph}
    store.library.data.should.deep.equal expectedLibraryJSON
