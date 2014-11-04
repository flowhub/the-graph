chai = require 'chai'
chai.should()

Noflo = require 'noflo'
GraphApp = require '../../src/app/GraphApp'
Constants = require '../../src/constants/GraphConstants'
graphJSON = require '../fixtures/graph.json'
expectedLibraryJSON = require '../fixtures/graphExpectedLibrary.json'

describe 'GraphApp (model for graph)', ->
  graph = null
  app = null

  before (done) ->
    Noflo.graph.loadJSON graphJSON, (g) ->
      graph = g
      done()

  it 'should throw when not started with noflo graph', ->
    fail = () ->
      failStore = new GraphApp {}
    fail.should.throw(Constants.Error.NEED_NOFLO_GRAPH)

  it 'should correctly build initial library from graph', ->
    app = new GraphApp {graph}
    app.store.library.data.should.deep.equal expectedLibraryJSON

  describe 'with actions from dispatcher', ->
    it 'should add an inport in first position', ->
      def =
        name: 'fixture/foo',
        inports: [
          {name: 'num', type: 'number'}
          {name: 'in', type: 'object'}
        ]
        outports: []
      action =
        type: Constants.Runtime.REGISTER_COMPONENT
        definition: def
      app.dispatcher.dispatch action
      app.store.library.data[def.name].inports.should.deep.equal def.inports
