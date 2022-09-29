// Realiza una petición REST con datos codificados en JSON
// Incluir en el HTML con <script src="rest.js"></script>
// uso:
// rest (metodo, url, [requestData], [callback])
// rest.metodo(url, [requestData], [callback])
// Cuando se completa la petición/respuesta se invoca callback con el estado y la respuesta: callback(status, response)
// Si no se pasa callback la petición es síncrona y retorna un objeto {status, response}
// ejemplos:
//  - rest("get", "http://www.miempresa.com/test", function (status, response) { ... });
//  - rest("post", "http://www.miempresa.com/persona", { nombre: "Luis" }, function (status, response) { ... });

//Rest es la librería que va a dar el estilo a nuestro servicio web
// Estilo rest, dice que cómo deberíamos implementar los códigos
// No se tiene que modificar nada, pero tiene que estar en la carpeta para poder usar esta librería.

(function () {
	function debug(...args) {
		if (rest.debug) console.log("REST", ...args);
	}

	function rest(method, url, data, callback) {
		method = method.toUpperCase(); // método en mayúsculas
		if (typeof data === "function") { // no se ha indicado data, pero si callback
			callback = data;
			data = null;
		}
		var async = typeof callback === "function"; // es una petición asincrona?
		if (data && typeof data !== "string") data = JSON.stringify(data); // datos en texto formato JSON
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, async);
		//xhr.responseType = 'json'; // el tipo de la respuesta que se espera es JSON
		xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8"); // el tipo de la petición es JSON
		debug(">>>", method, url, data);
		xhr.send(data); // Enviar datos
		function end() {
			debug("<<<", xhr.status, xhr.response);
			var response = xhr.response;
			if (xhr.status >= 200 && xhr.status < 300 && response) response = JSON.parse(response);
			if (async) {
				callback(xhr.status, response);
			} else {
				return { status: xhr.status, response: response };
			}
		}
		if (async) {
			xhr.onload = end;
			xhr.onerror = end;
		} else {
			return end();
		}
	};

	rest.debug = false;

	rest.get = function (url, callback) { return rest("GET", url, callback); };
	rest.post = function (url, data, callback) { return rest("POST", url, data, callback); };
	rest.put = function (url, data, callback) { return rest("PUT", url, data, callback); };
	rest.delete = function (url, callback) { return rest("DELETE", url, callback); };

	window.rest = rest;
})();