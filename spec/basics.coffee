
chai = window.chai or require 'chai'

parseFBP = (fbpString, callback) ->
  fbpGraph = window.TheGraph.fbpGraph or require 'fbp-graph'
  fbpGraph.graph.loadFBP fbpString, (err, graph) ->
    if err instanceof fbpGraph.Graph
      # legacy NoFlo, no error argument
      [err, graph] = [null, err]
    return callback err if err
    return callback null, graph

findSvgRoot = (editor) ->
  container = editor
  apps = container.getElementsByClassName('app-svg')
  console.log 'g', apps
  return apps[0]

waitReady = (editor, callback) ->
  setTimeout callback, 1000 # HACK

describeRender = (editor) ->
  svgRoot = findSvgRoot editor
  d =
    nodes: svgRoot.getElementsByClassName 'node'
    edges: svgRoot.getElementsByClassName 'edge'
    initials: svgRoot.getElementsByClassName 'iip'

renderEditor = (editor, props) ->
  # defaults
  props.width = editor.width if not props.width
  props.height = editor.height if not props.height

  element = React.createElement TheGraph.App, props
  ReactDOM.render element, editor

dummyComponent =
  inports: [
    { name: 'in', type: 'all' }
  ],
  outports: [
    { name: 'out', type: 'all' }
  ]

describe 'Basics', ->

  editor = null
  before (done) ->
    editor = document.getElementById 'editor'
    chai.expect(editor).to.exist
    return done()

  after (done) ->
    return done()

  describe 'loading a simple graph', ->
    render = null
    before (done) ->
      example = "'42' -> CONFIG foo(Foo) OUT -> IN bar(Bar)"
      exampleLibrary =
        'Foo': dummyComponent
        'Bar': dummyComponent
      parseFBP example, (err, graph) ->
        chai.expect(err).to.not.exist
        renderEditor editor, { graph: graph, library: exampleLibrary }
        waitReady editor, (err) ->
          return err if err
          render = describeRender editor
          return done()

    it 'should render 2 nodes', ->
      chai.expect(render.nodes).to.have.length 2
    it 'should render 1 edge', ->
      chai.expect(render.edges).to.have.length 1
    it 'should render 1 IIP', ->
      chai.expect(render.initials).to.have.length 1
