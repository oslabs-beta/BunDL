const server = Bun.serve({
	fetch(req, server) {
		const success = server.upgrade(req);
		if (success) {
			return undefined;
		}

		return new Response('Hello World');
	},
	websocket: {
		async message(ws, message) {
			console.log(`Received ${message}`);
			ws.send(`You said: ${message}`);
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
