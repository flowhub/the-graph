import base from './base'

export default {
  curve: base.nodeSize,
  container: {
    className: 'edge'
  },
  backgroundPath: {
    className: 'edge-bg'
  },
  foregroundPath: {
    ref: 'route',
    className: 'edge-fg stroke route'
  },
  touchPath: {
    className: 'edge-touch',
    ref: 'touch'
  }
};
