// Component library functionality
function mergeComponentDefinition(component, definition) {
  // In cases where a component / subgraph ports change,
  // we don't want the connections hanging in middle of node
  // TODO visually indicate that port is a ghost
  if (component === definition) {
    return definition;
  }
  var _i, _j, _len, _len1, exists;
  var cInports = component.inports;
  var dInports = definition.inports;

  if (cInports !== dInports) {
    for (_i = 0, _len = cInports.length; _i < _len; _i++) {
      var cInport = cInports[_i];
      exists = false;
      for (_j = 0, _len1 = dInports.length; _j < _len1; _j++) {
        var dInport = dInports[_j];
        if (cInport.name === dInport.name) {
          exists = true;
        }
      }
      if (!exists) {
        dInports.push(cInport);
      }
    }
  }

  var cOutports = component.outports;
  var dOutports = definition.outports;

  if (cOutports !== dOutports) {
    for (_i = 0, _len = cOutports.length; _i < _len; _i++) {
      var cOutport = cOutports[_i];
      exists = false;
      for (_j = 0, _len1 = dOutports.length; _j < _len1; _j++) {
        var dOutport = dOutports[_j];
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

module.exports = {
  mergeComponentDefinition: mergeComponentDefinition,
};
