# A stub for now, we'll see if we need more complexity

module.exports = class GraphDispatcher
  callbacks: null
  constructor: (options) ->
    @callbacks = []
  register: (callback) ->
    @callbacks.push callback
  dispatch: (action) ->
    for callback in @callbacks
      callback action
