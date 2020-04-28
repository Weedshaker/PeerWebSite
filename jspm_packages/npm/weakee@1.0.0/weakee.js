/* */ 
'format es6'
'use strict'

var objectToEvents = new WeakMap()

export default class Emitter {
  constructor () {
    objectToEvents.set(this, {})
  }
  on (type, handler) {
    var events = objectToEvents.get(this)

    if (!events[type]) {
      events[type] = []
    }
    events[type].push(handler)
    return this
  }
  once (type, handler) {
    this.on(type, function tempHandler () {
      handler.apply(this, arguments)
      this.off(type, tempHandler)
    })
    return this
  }
  off (type, handler) {
    var events = objectToEvents.get(this)[type]

    if (events) {
      if (!handler) {
        events.length = 0
      } else {
        events.splice(events.indexOf(handler), 1)
      }
    }
    return this
  }
  emit (type) {
    var event, events

    events = (objectToEvents.get(this)[type] || []).slice()

    var args = new Array(arguments.length - 1)
    var iterateTo = args.length + 1
    for (var i = 1; i < iterateTo; ++i) {
      args[i - 1] = arguments[i]
    }

    if (events.length) {
      while (event = events.shift()) {
        event.apply(this, args)
      }
    }
    return this
  }
}
