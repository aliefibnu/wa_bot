const {
  WAConnection,
  MessageMedia,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange,
} = require("@adiwajshing/baileys");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { connect, useSingleFileAuthState } = require("./lib/whatsapp");

(async () => {
  const auth = useSingleFileAuthState("session.json");
  const { state, saveCreds } = await connect("Baileys", auth);
  const sock = new WAConnection(state, {
    logger: console,
    printQRInTerminal: true,
    auth: state,
    syncFull: true,
    autoReconnect: true,
    qrRefresh: 10000,
    qrTimeout: 0,
    connectTimeoutMS: 60000,
    maxInflightMsgs: 128,
    maxCachedMessages: 1000,
    maxCachedPreKeys: 5 * 1024,
    printQRInTerminal: false,
    generateHighQualityQR: false,
    syncFull: true,
    browser: ["Baileys", "Safari", "1.0.0"],
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect.error) {
        console.log("Connection closed due to an error");
        console.log(lastDisconnect.error);
      } else {
        console.log("Connection closed");
      }
    } else if (connection === "open") {
      console.log("Connected");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });
})();
