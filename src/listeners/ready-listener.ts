import { Listener } from "discord-akairo";

class ReadyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready"
    });
  }

  exec(): void {
    console.log("Client is ready...");
  }
}

module.exports = ReadyListener;