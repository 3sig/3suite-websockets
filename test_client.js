import WebSocket from 'ws';

// Create two test clients
const client1 = new WebSocket('ws://localhost:4004');
const client2 = new WebSocket('ws://localhost:4004');

client1.on('open', function open() {
  console.log('Client 1 connected');
  
  // Send test message after both clients are connected
  setTimeout(() => {
    console.log('Client 1 sending: temperature|23.5');
    client1.send('temperature|23.5');
    
    setTimeout(() => {
      console.log('Client 1 sending: humidity|65');
      client1.send('humidity|65');
    }, 500);
  }, 1000);
});

client1.on('message', function message(data) {
  console.log('Client 1 received:', data.toString());
});

client2.on('open', function open() {
  console.log('Client 2 connected');
});

client2.on('message', function message(data) {
  console.log('Client 2 received:', data.toString());
  
  // Send response after receiving a message
  setTimeout(() => {
    console.log('Client 2 sending: status|ok');
    client2.send('status|ok');
  }, 200);
});

// Clean up after test
setTimeout(() => {
  console.log('Closing test clients...');
  client1.close();
  client2.close();
  process.exit(0);
}, 3000);