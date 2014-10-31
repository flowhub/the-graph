# Library store

module.exports = class Library
  library: null
  constructor: (graph) ->
    unless graph?.nodes?.length?
      throw new Error 'Call constructor with instance of noflo.Graph'
    @library = {}
    components = makeInitialComponents graph
    for component in components
      @registerComponent component
  registerComponent: (definition) ->
    mergeComponentDefinition definition, @library

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
mergeComponentDefinition = (definition, library) ->
  # console.log definition
  component = library[definition.name]
  unless component
    library[definition.name] = definition
    return
  for dInport in definition.inports
    exists = false
    for cInport in component.inports
      if cInport.name is dInport.name
        exists = true
    unless exists
      component.inports.push dInport
  for dOutport in definition.outports
    exists = false
    for cOutport in component.outports
      if cOutport.name is dOutport.name
        exists = true
    unless exists
      component.outports.push dOutport
  component.icon = definition.icon;
