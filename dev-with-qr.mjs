import {spawn} from "child_process";
import qrcode from "qrcode-terminal";

const url = `https://studi-kompass-eta.vercel.app/protected/planner`;
console.log(`\n🔗 Network: ${url}\n`);
qrcode.generate(url, {small: true});

// Next.js dev starten
spawn("next", ["dev", "--turbopack", "-H", "0.0.0.0"], {stdio: "inherit", shell: true});