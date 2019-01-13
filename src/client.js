const net = require('net');

const client = new net.Socket();
client.connect(
  42069,
  'raspberrypi.local',
  function() {
    console.log('Connected');
    // client.write('Hello, server! Love, Client.');
    // eslint-disable-next-line no-constant-condition
    while (true) {
      client.write(
        Buffer.from([0x03, 0x00, 0x00, 0x09, 0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00, 0xff])
      );
    }
  }
);

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
});
