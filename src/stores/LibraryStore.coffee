# emitter = require('events').EventEmitter

Constants = require '../constants/GraphConstants'

module.exports = class LibraryStore
  data: null
  constructor: (options) ->
    unless options?.graph?.addNode?
      throw new Error Constants.Error.NEED_NOFLO_GRAPH
    @data = {}
    components = makeInitialComponents options.graph
    for component in components
      @registerComponent component
  registerComponent: (definition) ->
    mergeComponentDefinition definition, @data
  toJSON: () ->
    return @data

makeInitialComponents = (graph) ->
  components = []
  for node in graph.nodes
    component =
      name: node.component
      icon: 'cog'
      description: ''
      inports: []
      outports: []
    for own key, inport of graph.inports
      continue unless inport.process is node.id
      newDef = checkPort(inport, component.inports)
      if newDef
        component.inports.push newDef
    for own key, outport of graph.outports
      continue unless outport.process is node.id
      newDef = checkPort(outport, component.outports)
      if newDef
        component.outports.push newDef
    for iip in graph.initializers
      continue unless iip.to.node is node.id
      newDef = checkPort(iip.to, component.inports)
      if newDef
        component.inports.push newDef
    for edge in graph.edges
      if edge.from.node is node.id
        newDef = checkPort(edge.from, component.outports)
        if newDef
          component.outports.push newDef
      if edge.to.node is node.id
        newDef = checkPort(edge.to, component.inports)
        if newDef
          component.inports.push newDef
    components.push component
  return components
checkPort = (graphItem, componentPorts) ->
  for port in componentPorts
    if port.name is graphItem.port
      return
  newDef =
    name: graphItem.port
    type: 'all'
  return newDef
chackAndMergePorts = (definitionPorts, componentPorts) ->
  for port, index in definitionPorts
    exists = false
    for cPort in componentPorts
      if cPort.name is port.name
        if port.type? and port.type isnt cPort.type
          cPort.type = port.type
        exists = true
    unless exists
      componentPorts.splice index, 0, port
mergeComponentDefinition = (definition, data) ->
  component = data[definition.name]
  if component?
    if definition.inports?
      chackAndMergePorts definition.inports, component.inports
    if definition.outports?
      chackAndMergePorts definition.outports, component.outports
    component.icon = definition.icon
  else
    data[definition.name] = definition
