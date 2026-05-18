import {spawn} from "child_process";
import qrcode from "qrcode-terminal";
import os from "os";

// Lokale IP holen
const interfaces = os.networkInterfaces();
let localIP = "localhost";
for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
        if (alias.family === "IPv4" && !alias.internal) {
            localIP = alias.address;
        }
    }
}

const url = `http://${localIP}:3000/protected/planner`;
console.log(`\n🔗 Network: ${url}\n`);
qrcode.generate(url, {small: true});

// Next.js dev starten
spawn("next", ["dev"], {stdio: "inherit", shell: true});