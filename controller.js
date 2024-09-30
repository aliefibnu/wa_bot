const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { randomUUID } = require("crypto");
const fs = require("fs");
const { writeFile } = require("fs/promises");
const path = require("path");
let buffer, filename, pathMedia, asal;
let d = new Date();

module.exports = {
  /**
   * @param {import("@whiskeysockets/baileys").WAMessage} msg
   */
  saveImage: async function (msg, fromGroup) {
    try {
      buffer = await downloadMediaMessage(msg, "stream", {});
      asal = fromGroup ? `Anggota = ${msg.pushName}` : msg.key.remoteJid;
      filename = `${asal} ${d.getHours()}-${d.getMinutes()}-${d.getSeconds()} __ ${d.getDay()}-${d.getMonth()}-${d.getFullYear()}`;
      pathMedia = path.normalize(`./media/img/${filename}.jpg`);
      await writeFile(pathMedia, buffer);
      console.log(filename + ".jpg");
      console.log(true);
      return true;
    } catch (error) {
      console.error(error);
    }
  },
  saveVideo: async function (msg, fromGroup) {
    buffer = await downloadMediaMessage(msg, "stream", {});
    asal = fromGroup ? `Anggota = ${msg.pushName}` : msg.key.remoteJid;
    filename = `${asal} ${d.getHours()}-${d.getMinutes()}-${d.getSeconds()} __ ${d.getDay()}-${d.getMonth()}-${d.getFullYear()}`;
    pathMedia = path.normalize(`./media/video/${filename}.mp4`);
    await writeFile(pathMedia, buffer);
    console.log(filename + ".mp4");
    console.log(true);
    return true;
  },
};
