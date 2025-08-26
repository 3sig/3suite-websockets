import config from '3lib-config';
import { WebSocketServer } from 'ws';

config.init();

const verbose = config.get("verbose", false);
const silent = config.get("silent", false);
const port = config.get("port", 4004);

const wss = new WebSocketServer({ 
  port: port,
  perMessageDeflate: false
});

if (verbose) {
  console.log("WebSocket server initialized with config:", {
    port: port,
    perMessageDeflate: false
  });
}

const clients = new Set();

wss.on('connection', function connection(ws, request) {
  clients.add(ws);
  
  const clientId = `${request.socket.remoteAddress}:${request.socket.remotePort}`;
  console.log(`Client connected: ${clientId}`);

  if (verbose) {
    console.log("Connection details:", {
      id: clientId,
      address: request.socket.remoteAddress,
      port: request.socket.remotePort,
      headers: request.headers,
      time: new Date().toISOString(),
      totalClients: clients.size
    });
  }

  ws.on('message', function message(data) {
    const messageStr = data.toString();
    
    if (!silent) {
      console.log(`Message received: ${messageStr} from ${clientId}`);
    }

    if (verbose) {
      console.log("Message details:", {
        message: messageStr,
        from: clientId,
        time: new Date().toISOString(),
        totalClients: clients.size
      });
    }

    // Parse pipe-separated message format: name|value
    const parts = messageStr.split('|');
    if (parts.length !== 2) {
      if (verbose) {
        console.log(`Invalid message format from ${clientId}: expected 'name|value', got '${messageStr}'`);
      }
      return;
    }

    const [name, value] = parts;
    
    // Broadcast to all other clients
    let broadcastCount = 0;
    clients.forEach(function each(client) {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(messageStr);
        broadcastCount++;
      }
    });

    if (verbose) {
      console.log(`Message broadcast: ${name}|${value} to ${broadcastCount} clients`);
    }
  });

  ws.on('close', function close() {
    clients.delete(ws);
    console.log(`Client disconnected: ${clientId}`);

    if (verbose) {
      console.log("Disconnect details:", {
        id: clientId,
        time: new Date().toISOString(),
        remainingClients: clients.size
      });
    }
  });

  ws.on('error', function error(err) {
    console.log(`Client error: ${clientId} - ${err.message}`);
    clients.delete(ws);
  });
});

console.log(`WebSocket server started on port ${port}`);

if (verbose) {
  console.log("Server configuration:", {
    port: port,
    silent: silent,
    verbose: verbose,
    timestamp: new Date().toISOString()
  });
}
