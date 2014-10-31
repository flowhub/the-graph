chai = require 'chai'
chai.should()

Noflo = require 'noflo'
Library = require '../../src/stores/Library'
graphJSON = require '../fixtures/graph.json'
expectedLibraryJSON = require '../fixtures/graphExpectedLibrary.json'

describe 'Constructor', ->
  graph = null
  library = null

  before (done) ->
    Noflo.graph.loadJSON graphJSON, (g) ->
      graph = g
      done()

  it 'should throw when not started with noflo graph', ->
    fail = () ->
      library = new Library {}
    fail.should.throw('Call constructor with instance of noflo.Graph')

  it 'should correctly initialize library', ->
    library = new Library graph
    library.library.should.deep.equal expectedLibraryJSON

  # it 'should change component ports', ->

  it 'should change a component icon', ->
    def =
      name: 'interaction/ListenMouse',
      icon: 'mouse'
      inports: []
      outports: []
    library.registerComponent def
    library.library[def.name].icon.should.equal def.icon