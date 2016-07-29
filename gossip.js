'use strict';
var slice = [].slice;
var parseArgs = function() {
  var args;
  var handler = {};
  var result = { ns: arguments[0], h: handler };

  if (typeof arguments[arguments.length - 1] === 'boolean') {
    handler.once = true;
    args = slice.call(arguments, 0, -1);
  } else {
    args = slice.call(arguments);
  }

  if (typeof args[1] === 'string') {
    result.e = args[1];

    if (typeof args[2] === 'string') {
      result.ns += (':' + args[2]);
      handler.h = args[3];
      handler.c = args[4];
    } else {
      handler.h = args[2];
      handler.c = args[3];
    }
  } else {
    result.e = '*';
    handler.h = args[1];
    handler.c = args[2];
  }

  return result;
};

var runHandlers = function(handlers, args) {
  return handlers.filter(function(ctx) {
    ctx.h.apply(ctx.c, args);
    return !ctx.once;
  });
};

var Gossip = function() {
  this.events = {};
};

Gossip.prototype = {
  // resource, [event], [instance], handler, [context]
  on: function() {
    var self = this;
    var args = parseArgs.apply(null, arguments);
    var events = self.events;
    var ns = events[args.ns] ? events[args.ns] : events[args.ns] = {};
    var handlers = ns[args.e] || (ns[args.e] = []);

    self.debug && self.log(args.h.once ? 'once' : 'on', args.ns, args.e);

    handlers.push(args.h);
    return self;
  },

  // resource, [event], [instance], handler, [context]
  off: function() {
    var self = this;
    var args = parseArgs.apply(null, arguments);
    var events = self.events;
    var ns = events[args.ns];

    self.debug && self.log('off', args.ns, args.e);

    if (!ns) {
      return self;
    }

    if (!args.h) {
      delete ns[args.e];
      return self;
    }

    var handlers = ns[args.e];
    if (!handlers) {
      return self;
    }

    if (args.h.h === undefined) {
      delete ns[args.e];
      return self;
    }

    var handler = args.h.h;
    var ctx = args.h.c;
    var i = handlers.length - 1;

    if (ctx !== undefined) {
      for (; i >= 0; i--) {
        if (ctx === handlers[i].c && handler === handlers[i].h) {
          handlers.splice(i, 1);
        }
      }
    } else {
      for (; i >= 0; i--) {
        if (handler === handlers[i].h) {
          handlers.splice(i, 1);
        }
      }
    }

    if (handlers.length === 0) {
      delete ns[args.e];
    }

    return self;
  },

  // resource, event, instance, handler, context
  once: function() {
    var args = slice.call(arguments);
    args.push(true);
    this.on.apply(this, args);
    return this;
  },

  emit: function(namespace, event, instanceId) {
    var self = this;
    var args = slice.call(arguments);

    self.debug && self.log('emit', namespace, event, instanceId || '');

    var t = typeof instanceId;

    if (t === 'string') {
      instanceId = instanceId.split('/');

      while (instanceId.length) {
        args[0] = namespace + ':' + instanceId.join('/');
        self.emitNS.apply(self, args);
        instanceId.pop();
      }

      args[0] = namespace;
    } else if (t === 'number') {
      args[0] = namespace + ':' + instanceId;
    }

    self.emitNS.apply(self, args);
    return self;
  },

  emitNS: function(namespace, event) {
    var ns = this.events[namespace];

    if (ns) {
      var args = slice.call(arguments, 1);

      if (ns[event]) {
        ns[event] = runHandlers(ns[event], args);
      }

      if (ns['*']) {
        ns['*'] = runHandlers(ns['*'], args);
      }
    }
  }
};


module.exports = Gossip;
