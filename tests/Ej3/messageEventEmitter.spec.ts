import "mocha";
import { expect } from "chai";
import net from "net";
import { MessageEventEmitter, messageEventEmitterTypeOptions } from "../../src/Ej3/messageEventEmitter.js";

describe("MessageEventEmitterClient", () => {
  it("Should emit a message event once it gets a complete message", (done) => {
    const socket = new net.Socket();
    const client = new MessageEventEmitter(socket);

    client.on("message", (message) => {
      expect(message).to.be.eql({ type: "change", prev: 13, curr: 26 });
      done();
    });

    socket.emit("data", '{"type": "change", "prev": 13');
    socket.emit("data", ', "curr": 26}');
    socket.emit("data", "\n");
  });
});

describe("MessageEventEmitterClient", () => {
  it("Should emit a request event once it gets a complete message", (done) => {
    const socket = new net.Socket();
    const emitterType: messageEventEmitterTypeOptions = {
      emitterType: "server",
    };
    const client = new MessageEventEmitter(socket, emitterType);

    client.on("request", (message) => {
      expect(message).to.be.eql({ type: "change", prev: 13, curr: 26 });
      done();
    });

    socket.emit("data", '{"type": "change", "prev": 13');
    socket.emit("data", ', "curr": 26}');
    socket.emit("data", "\n");
  });
});

describe("MessageEventEmitterClient", () => {
  it("Should emit a response event once it gets a complete message", (done) => {
    const socket = new net.Socket();
    const emitterType: messageEventEmitterTypeOptions = {
      emitterType: "client",
    };
    const client = new MessageEventEmitter(socket, emitterType);

    client.on("response", (message) => {
      expect(message).to.be.eql({ type: "change", prev: 13, curr: 26 });
      done();
    });

    socket.emit("data", '{"type": "change", "prev": 13');
    socket.emit("data", ', "curr": 26}');
    socket.emit("data", "\n");
  });

  describe("write", () => {
    it("should send a message over the socket", (done) => {
      const server = net.createServer((socket) => {
        socket.on("data", (data) => {
          expect(data.toString()).to.equal(
            '{"type":"test","message":"hello"}\n'
          );
          done();
          server.close();
        });
      });

      server.listen(60300, () => {
        const client = new MessageEventEmitter(net.connect({ port: 60300 }), {
          emitterType: "client",
        });
        client.write("test", "hello");
        client.connection.end();
      });
    });
  });
});
