// ! Import librari yang dibutuhkan
const {
  BufferJSON,
  useMultiFileAuthState,
  makeWASocket,
  makeInMemoryStore,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");

async function connectToWhatsapp() {
  // ! Deklarasi variabel
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const conn = makeWASocket({
    auth: state,
    browser: ["Alief Ibnu", "WA_BOT", "1.0"],
    printQRInTerminal: true,
  });
  const store = makeInMemoryStore({});
  const storeDbFIle = "./database/chat_baileys.json";
  const intervalSaveDatabase = 10 * 1000;

  // ! Login area
  // ? saveSession saat setelah login
  conn.ev.on("creds.update", saveCreds);
  conn.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect
      );
      // ? reconnect kalau tidak logged out
      if (shouldReconnect) {
        connectToWhatsapp();
      }
    } else if (connection === "open") {
      console.log("Koneksi Berhasil");
    }
  });

  // ! Simpan chat ke local file
  store.readFromFile(storeDbFIle);
  setInterval((x) => {
    store.writeToFile(storeDbFIle);
  }, intervalSaveDatabase);
  store.bind(conn.ev);

  // ! Algoritma kalau ada chat masuk tapi ngambil dari database
  conn.ev.on("messages.upsert", (message) => {
    console.log(JSON.stringify(message, null, 2));
  });
}
connectToWhatsapp();
