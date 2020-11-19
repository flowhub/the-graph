// Component library functionality
function mergeComponentDefinition(component, definition) {
  // In cases where a component / subgraph ports change,
  // we don't want the connections hanging in middle of node
  // TODO visually indicate that port is a ghost
  if (component === definition) {
    return definition;
  }
  let _i; let _j; let _len; let _len1; let
    exists;
  const cInports = component.inports;
  const dInports = definition.inports;

  if (cInports !== dInports) {
    for (_i = 0, _len = cInports.length; _i < _len; _i++) {
      const cInport = cInports[_i];
      exists = false;
      for (_j = 0, _len1 = dInports.length; _j < _len1; _j++) {
        const dInport = dInports[_j];
        if (cInport.name === dInport.name) {
          exists = true;
        }
      }
      if (!exists) {
        dInports.push(cInport);
      }
    }
  }

  const cOutports = component.outports;
  const dOutports = definition.outports;

  if (cOutports !== dOutports) {
    for (_i = 0, _len = cOutports.length; _i < _len; _i++) {
      const cOutport = cOutports[_i];
      exists = false;
      for (_j = 0, _len1 = dOutports.length; _j < _len1; _j++) {
        const dOutport = dOutports[_j];
        if (cOutport.name === dOutport.name) {
          exists = true;
        }
      }
      if (!exists) {
        dOutports.push(cOutport);
      }
    }
  }

  if (definition.icon !== 'cog') {
    // Use the latest icon given
    component.icon = definition.icon;
  } else {
    // we should use the icon from the library
    definition.icon = component.icon;
  }
  // a component could also define a svg icon
  definition.iconsvg = component.iconsvg;

  return definition;
}

function componentsFromGraph(fbpGraph) {
  const components = [];

  fbpGraph.nodes.forEach((node) => {
    const component = {
      name: node.component,
      icon: 'cog',
      description: '',
      inports: [],
      outports: [],
    };

    Object.keys(fbpGraph.inports).forEach((pub) => {
      const exported = fbpGraph.inports[pub];
      if (exported.process === node.id) {
        for (let i = 0; i < component.inports.length; i++) {
          if (component.inports[i].name === exported.port) {
            return;
          }
        }
        component.inports.push({
          name: exported.port,
          type: 'all',
        });
      }
    });
    Object.keys(fbpGraph.outports).forEach((pub) => {
      const exported = fbpGraph.outports[pub];
      if (exported.process === node.id) {
        for (let i = 0; i < component.outports.length; i++) {
          if (component.outports[i].name === exported.port) {
            return;
          }
        }
        component.outports.push({
          name: exported.port,
          type: 'all',
        });
      }
    });
    fbpGraph.initializers.forEach((iip) => {
      if (iip.to.node === node.id) {
        for (let i = 0; i < component.inports.length; i++) {
          if (component.inports[i].name === iip.to.port) {
            return;
          }
        }
        component.inports.push({
          name: iip.to.port,
          type: 'all',
        });
      }
    });

    fbpGraph.edges.forEach((edge) => {
      let i;
      if (edge.from.node === node.id) {
        for (i = 0; i < component.outports.length; i++) {
          if (component.outports[i].name === edge.from.port) {
            return;
          }
        }
        component.outports.push({
          name: edge.from.port,
          type: 'all',
        });
      }
      if (edge.to.node === node.id) {
        for (i = 0; i < component.inports.length; i++) {
          if (component.inports[i].name === edge.to.port) {
            return;
          }
        }
        component.inports.push({
          name: edge.to.port,
          type: 'all',
        });
      }
    });
    components.push(component);
  });
  return components;
}

function libraryFromGraph(fbpGraph) {
  const library = {};
  const components = componentsFromGraph(fbpGraph);
  components.forEach((c) => {
    library[c.name] = c;
  });
  return library;
}

module.exports = {
  mergeComponentDefinition,
  componentsFromGraph,
  libraryFromGraph,
};
