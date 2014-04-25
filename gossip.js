'use strict';

var slice = [].slice,
	parseArgs = function() {
		var args,
			handler = {},
			result = {ns: arguments[0], h: handler};

		if(typeof arguments[arguments.length-1] === "boolean") {
			handler.once = true;
			args = slice.call(arguments, 0, -1);
		} else {
			args = slice.call(arguments);
		}

		if(typeof args[1] === "string") {
			result.e = args[1];

			if(typeof args[2] === "string") {
				result.ns += (":" + args[2]);
				handler.h = args[3];
				handler.c = args[4];
			} else {
				handler.h = args[2];
				handler.c = args[3];
			}
		} else {
			result.e = "*";
			handler.h = args[1];
			handler.c = args[2];
		}

		return result;
	},

	runHandlers = function(handlers, args) {
		for(var i in handlers) {
			var ctx = handlers[i];
			ctx.h.apply(ctx.c, args);
			if(ctx.once) {
				handlers.splice(i, 1);
			}
		}
	};

var Gossip = function () {
	this.events = {};
};

Gossip.prototype = {
	// resource, [event], [instance], handler, [context]
	on: function() {
		var self = this,
			args = parseArgs.apply(null, arguments),
			events = self.events,
			ns = events[args.ns] ? events[args.ns] : events[args.ns] = {},
			handlers = ns[args.e] || (ns[args.e] = []);

		self.debug && self.log(args.h.once ? "once" : "on", args.ns, args.e);

		handlers.push(args.h);
		return self;
	},

	// resource, [event], [instance], handler
	off: function() {
		var self = this,
			args = parseArgs.apply(null, arguments),
			events = self.events,
			ns = events[args.ns];

		self.debug && self.log("off", args.ns, args.e);

		if(!ns) {return self;}

		if(!args.h) {
			delete ns[args.e];
			return self;
		}

		var handlers = ns[args.e];
		if(!handlers) {return self;}

		if(args.h.h === undefined) {
			delete ns[args.e];
			return self;
		}

		var handler = args.h.h, i = handlers.length-1;
		for(; i >= 0; i--) {
			if(handler == handlers[i].h) {
				handlers.splice(i, 1);
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

	emit: function(resource, event, instanceId) {
		var self = this,
			args = slice.call(arguments);

		self.debug && self.log("emit", resource, event, instanceId);

		if(instanceId) {
			instanceId = instanceId.split("/");

			while(instanceId.length) {
				args[0] = resource + ":" + instanceId.join("/");
				self.emitNS.apply(self, args);
				instanceId.pop();
			}

			args[0] = resource;
		}

		self.emitNS.apply(self, args);
		return self;
	},

	emitNS: function(namespace, event) {
		var ns = this.events[namespace],
			i;

		if(ns) {
			var handlers = ns[event],
				allHandlers = ns['*'];

			if(handlers || allHandlers) {
				var args = slice.call(arguments, 1);

				runHandlers(handlers, args);
				runHandlers(allHandlers, args);
			}
		}
	}
};

module.exports = Gossip;
