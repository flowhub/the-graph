chai = require 'chai'
chai.should()

Noflo = require 'noflo'
LibraryStore = require '../../src/stores/LibraryStore'
graphJSON = require '../fixtures/graph.json'
expectedLibraryJSON = require '../fixtures/graphExpectedLibrary.json'

describe 'LibraryStore: model for component library', ->
  graph = null
  library = null

  before (done) ->
    Noflo.graph.loadJSON graphJSON, (g) ->
      graph = g
      done()

  it 'should throw when not started with noflo graph', ->
    fail = () ->
      library = new LibraryStore {}
    fail.should.throw('Call constructor with instance of noflo.Graph')

  it 'should correctly build initial library from graph', ->
    library = new LibraryStore graph
    library.data.should.deep.equal expectedLibraryJSON

  describe 'with an existing def', ->

    it 'should change an inport type', ->
      def =
        name: 'fixture/foo',
        inports: [{name: 'in', type: 'object'}]
        outports: []
      library.registerComponent def
      library.data[def.name].inports.length.should.equal 1
      library.data[def.name].inports[0].should.deep.equal def.inports[0]

    it 'should change an outport type', ->
      def =
        name: 'fixture/foo',
        inports: []
        outports: [{name: 'out', type: 'object'}]
      library.registerComponent def
      library.data[def.name].outports.length.should.equal 1
      library.data[def.name].outports[0].should.deep.equal def.outports[0]

    it 'should add an inport in first position', ->
      def =
        name: 'fixture/foo',
        inports: [
          {name: 'num', type: 'number'}
          {name: 'in', type: 'object'}
        ]
        outports: []
      library.registerComponent def
      library.data[def.name].inports.should.deep.equal def.inports

    it 'should add an outport in first position', ->
      def =
        name: 'fixture/foo',
        inports: []
        outports: [
          {name: 'obj', type: 'object'}
          {name: 'out', type: 'object'}
        ]
      library.registerComponent def
      library.data[def.name].outports.length.should.equal 2
      library.data[def.name].outports.should.deep.equal def.outports

    it 'should change a component icon', ->
      def =
        name: 'fixture/foo',
        icon: 'pied-piper-alt'
      library.registerComponent def
      library.data[def.name].icon.should.equal def.icon