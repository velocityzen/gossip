#Gossip
Simple browser & nodejs events with namespaces and bubbling.
Part of client lib [sweets framework](http://swts.me).
No dependecies.

## Usage
```js
var Gossip = require("gossip");
var gossip = new Gossip();

//we are ready
gossip.on("user", "update", function() {
    // do stuff
});

```

**All methods are chainable.**

## Event model
###on(resource, handler, [context]);
Subscribe to all events of the resource. Gossip will fire all resource's and its children events.

###on(resource, event, handler, [context]);
Subscribe to specified event of the resource. Gossip will fire all resources's and its children events.

### on(resource, event, instanceId, handler, [context]);
Subscribe to specified event of the resource for definite instance. instanceId looks like `"resource/child1/child2"` - child events are bubbled to parent.

### once
The same as **on**, but fires only once.

Handler must look like:

    function (event, instanceId, arg1, arg2, ...) {...}

###off(resource);
Unsubscribe from all events of the resource.

###off(resource, handler);
###off(resource, "*", handler);
Removes specified handler from all events of the resource. 

###off(resource, event, handler);
Removes specified handler from event.

###off(resource, event, instanceId, handler);
Removes specified handler from instace for specified event.

###emit(resource, event, instanceId, arg1, ...);
Fire event for resource.

License MIT.
