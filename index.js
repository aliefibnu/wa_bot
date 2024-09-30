// ! Import librari yang dibutuhkan
const {
  BufferJSON,
  useMultiFileAuthState,
  makeWASocket,
  makeInMemoryStore,
  DisconnectReason,
  generateForwardMessageContent,
} = require("@whiskeysockets/baileys");
const { saveImage, saveVideo } = require("./controller.js");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { randomUUID } = require("crypto");

async function connectToWhatsapp() {
  // ! Deklarasi variabel
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const store = makeInMemoryStore({});
  const storeDbFIle = "./database/chat_baileys.json";
  const conn = makeWASocket({
    auth: state,
    browser: ["Alief Ibnu", "WA_BOT", "1.0"],
    printQRInTerminal: true,
    // logger: P({ level: "debug" }),
  });
  const intervalSaveDatabase = 10 * 1000;

  // ! Handler Media Message
  /**
   * @param {import("@whiskeysockets/baileys").WAMessage} msg
   * @param {boolean} fromGroup
   */
  // ? Function handler save file
  async function handlerMedia(msg, fromGroup) {
    try {
      const responseType = Object.keys(msg.message);
      console.log(responseType);
      // console.log(JSON.stringify(msg, "", 2));
      if (responseType.includes("imageMessage")) {
        saveImage(msg, fromGroup);
      } else if (responseType.includes("videoMessage")) {
        saveVideo(msg, fromGroup);
      } else if (responseType.join().includes("viewOnceMessage")) {
        let viewOnceMessageType;
        if (responseType.includes("viewOnceMessageV2")) {
          viewOnceMessageType = Object.keys(
            msg.message.viewOnceMessageV2.message
          );
          if (viewOnceMessageType.includes("imageMessage")) {
            saveImage(msg, fromGroup);
          } else if (viewOnceMessageType.includes("videoMessage")) {
            saveVideo(msg, fromGroup);
          } else {
            console.log("ntahlah 2");
          }
        }
      } else {
        ("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ! Login area
  // ? saveSession saat setelah login
  conn.ev.on("creds.update", saveCreds);
  conn.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      // console.log(
      //   "connection closed due to ",
      //   lastDisconnect.error,
      //   ", reconnecting ",
      //   shouldReconnect
      // );
      console.log("RECONNECT, LOG OUT ? " + shouldReconnect);
      // ? reconnect kalau tidak logged out
      if (shouldReconnect) {
        connectToWhatsapp();
      }
    } else if (connection === "open") {
      console.log("Koneksi Berhasil");
    }
  });

  // ! Simpan chat ke local file
  setInterval((x) => {
    store.writeToFile(storeDbFIle);
  }, intervalSaveDatabase);
  store.bind(conn.ev);

  // ! Algoritma kalau ada chat masuk tapi ngambil dari database
  conn.ev.on("messages.upsert", (response) => {
    response.messages.forEach(async (msg) => {
      try {
        const responseType = Object.keys(msg.message);
        const fromGroup = Object.keys(msg.key).includes("participant");
        let msgText, quotedText, forward;
        if (responseType.includes("conversation")) {
          console.log(`${msg.pushName} : ${msg.message.conversation}`);
        } else if (
          responseType.includes("extendedTextMessage") &&
          response.type !== "append"
        ) {
          msgText = msg.message.extendedTextMessage.text;
          quotedText =
            msg.message.extendedTextMessage.contextInfo.quotedMessage
              .conversation;
          console.log(`-- Reply : ${msgText}`);
          console.log(`-- ${msg.pushName} : ${quotedText}`);
          if (msgText.startsWith(".") && msgText.includes("forward")) {
            forward = await store.loadMessage(msg.key.remoteJid, msg.key.id);
            let a = generateForwardMessageContent({message:image});
            conn.sendMessage(msg.key.remoteJid, {
              forward,
            });
            console.log(a);
          }
        } else {
          handlerMedia(msg, fromGroup);
        }
      } catch (error) {
        console.log(error);
        console.log(JSON.stringify(response, "", 2));
      }
    });
  });
}
connectToWhatsapp();
