/* Cliente RPC basado en peticiones REST */
(function () {
	"use strict";

	function debug(...args) {
		if (window.rpc.debug) console.log("[RPC]", ...args);
	}

	class RPCCient {
		constructor(server, port, app) {
			if (!isFinite(port)) {
				app = port;
				port = 3501;
			}
			this.url = "http://" + server + ":" + port + "/RPC/" + app + "/";
		}

		procedure(name) {
			return (...args) => {
				var url = this.url + name;
				if (typeof args[args.length - 1] === "function") { // async
					let callback = args.pop();
					debug(">>>", name, "(", ...args, ")");
					rest.post(url, args, (status, response) => {
						if (status != 200) throw new Error("Error en la llamada rpc: " + name);
						debug("<<<", name, "(", ...args, ")", "->", response);
						callback(response);
					});
				} else { // sync
					debug(">>>", name, "(", ...args, ")");
					let result = rest.post(url, args);
					if (result.status != 200) throw new Error("Error en la llamada rpc: " + name);
					debug("<<<", name, "(", ...args, ")", "->", result.response);
					return result.response;
				}
			};
		}
	}

	var rpc = function (server, port, app) {
		return new RPCCient(server, port, app);
	};

	rpc.debug = false;

	window.rpc = rpc;
})();