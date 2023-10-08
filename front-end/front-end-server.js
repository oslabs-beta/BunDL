const server = Bun.serve({
  port: 8080,
  hostname: 'localhost',
  fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      return undefined;
    }
    const url = new URL(req.url);
    if (url.pathname === '/') {
      return new Response(Bun.file('./dist/index.html'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const assetPath = `./dist${url.pathname}`;
    const file = Bun.file(assetPath);
    if (file.exists()) {
      return new Response(Bun.file(assetPath));
    }

    return new Response('Not Found', { status: 404 });
  },
  websocket: {
    async message(ws, message) {
      console.log(`Received ${message}`);
      ws.send(`Message received: ${message}`);
    },
  },
});

console.log(`Listening on localhost: ${server.port}`);
