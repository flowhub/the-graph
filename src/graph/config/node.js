import base from './base'

export default {
  snap: base.nodeSize,
  container: {},
  background: {
    className: 'node-bg'
  },
  border: {
    className: 'node-border drag',
    rx: base.nodeRadius,
    ry: base.nodeRadius
  },
  innerRect: {
    className: 'node-rect drag',
    x: 3,
    y: 3,
    rx: base.nodeRadius - 2,
    ry: base.nodeRadius - 2
  },
  icon: {
    ref: 'icon',
    className: 'icon node-icon drag'
  },
  iconsvg: {
    className: 'icon node-icon drag'
  },
  inports: {
    className: 'inports'
  },
  outports: {
    className: 'outports'
  },
  labelBackground: {
    className: 'node-label-bg'
  },
  labelRect: {
    className: 'text-bg-rect'
  },
  labelText: {
    className: 'node-label'
  },
  sublabelBackground: {
    className: 'node-sublabel-bg'
  },
  sublabelRect: {
    className: 'text-bg-rect'
  },
  sublabelText: {
    className: 'node-sublabel'
  }
};
