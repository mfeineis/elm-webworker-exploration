/* global Elm, importScripts */

var __BRIDGE__ = {
    isWorker: typeof importScripts === "function",
    send: function () {},
    subscribe: function () {},
    worker: null,
};

importScripts("../dist/app.js");

console.log("🔨 worker.Elm", Elm);

__BRIDGE__.prepare = function (sendToApp, initialModel, flags, view, _VirtualDom_diff) {
    console.log("🔨 worker.prepare"); //, ...arguments);

    var currNode = null;

    let render = function () {
        console.log("🔨 worker.render.IGNORE", ...arguments);
    };

    self.addEventListener("message", function (ev) {
        switch (ev.data.type) {
        case "ELM_VDOM_INIT":
            console.log("🔨 worker.onmessage.ELM_VDOM_INIT", ev.data.payload);
            currNode = ev.data.payload.currNode;
            // TODO: What to do about flags?
            render = triggerRender;
            render(initialModel);
            break;
        case "ELM_SENDTOAPP":
            console.log("🔨 worker.onmessage.ELM_SENDTOAPP", ev.data.payload);
            sendToApp(...ev.data.payload.args);
            break;
        case "ELM_PORT_FROMJS":
            console.log("🔨 worker.onmessage.ELM_PORT_FROMJS", ev.data.payload);
            //sendToApp(...ev.data.payload.args);
            app.__app__.ports[ev.data.payload.portName].send(ev.data.payload.data);
            break;
        default:
            console.error("🔨 worker.onmessage.UNKNOWN_MESSAGE", ev.data);
            break;
        }
    });

    function proxyApplyPatches(currNode, patches) {
        console.log("🔨 worker.proxyApplyPatches", ...arguments);
        const payload = {
            currNode,
            patches,
        };
        console.log("🔨 worker.proxyApplyPatches.payload", payload);
        self.postMessage({
            type: "ELM_RENDER",
            payload,
        });
    }

    __BRIDGE__.send = function (portName, data) {
        console.log("🔨 worker.send", portName, data);
        app.__app__.ports[portName].send(data);
    };

    __BRIDGE__.subscribe = function (portName, fn) {
        console.log("🔨 worker.subscribe", portName, fn);
        app.__app__.ports[portName].subscribe(function (data) {
            console.log("🔨 worker.subscribe.DATA", data);
            self.postMessage({
                type: "ELM_PORT_TOJS",
                payload: {
                    portName,
                    data,
                },
            });
        });
    };

    function triggerRender(model) {
        console.log("🔨 worker.render", ...arguments);
        var nextNode = view(model);
        var patches = _VirtualDom_diff(currNode, nextNode);
        proxyApplyPatches(currNode, patches);
        currNode = nextNode;
    }

    return function (model) {
        //console.log("🔨 worker.animator.step", ...arguments);
        render(model);
    };
};

const app = Elm.Main.init({
    flags: {},
    node: {},
});

app.ports.changed.subscribe(function noop() {});

console.log("🔨 worker.app", app);

/*
var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
  var ignoreUpdate = F2(
    function (msg, model) {
    return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
    });

  const app = _Platform_initialize(
    flagDecoder,
    args,
    impl.init,
    __BRIDGE__.isWorker ? impl.update : ignoreUpdate,
    impl.subscriptions,
    function(sendToApp, initialModel) {
      var render = __BRIDGE__.prepare(sendToApp, initialModel, args.flags, impl.view, _VirtualDom_diff, args, _VirtualDom_applyPatches, _VirtualDom_virtualize);
      return _Browser_makeAnimator(initialModel, render);
    }
  );
  const proxy = {
      __app__: app,
      __proxy__: true,
      ports: {
          changed: {
              subscribe(fn) {
                  __BRIDGE__.subscribe("changed", fn);
              },
          },
          decrement: {
              send(data) {
                  __BRIDGE__.send("decrement", data);
              },
          },
          increment: {
              send(data) {
                  __BRIDGE__.send("increment", data);
              },
          },
      },
  };
  return proxy;
});
*/
