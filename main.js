import appdata from "./src/appdata_path.js";
import path from "path";
import fs from "fs";
import { app, ipcMain } from "electron";
import MainWindow from "./src/window.js";
import manifest from "./package.json" with { type: "json" };

const removeEnabled = process.argv.includes("--remove-enabled");

const ConsoleRich = { reset: "\x1b[m", bold: "\x1b[1m", low: "\x1b[2m", italic: "\x1b[3m", underline: "\x1b[4m", blink: "\x1b[5m", fastblink: "\x1b[6m", reverse: "\x1b[7m", hide: "\x1b[8m", strike: "\x1b[9m", underline2: "\x1b[21m", bold_low: "\x1b[22m", reset_italic: "\x1b[23m", reset_underline: "\x1b[24m", reset_blink: "\x1b[25m", reset_reverse: "\x1b[27m", reset_hide: "\x1b[28m", reset_strike: "\x1b[29m", color_black: "\x1b[30m", color_red: "\x1b[31m", color_green: "\x1b[32m", color_yellow: "\x1b[33m", color_blue: "\x1b[34m", color_magenta: "\x1b[35m", color_cyan: "\x1b[36m", color_white: "\x1b[37m", color_def: "\x1b[39m", ground_black: "\x1b[40m", ground_red: "\x1b[41m", ground_green: "\x1b[42m", ground_yellow: "\x1b[43m", ground_blue: "\x1b[44m", ground_magenta: "\x1b[45m", ground_cyan: "\x1b[46m", ground_white: "\x1b[47m", ground_def: "\x1b[49m", colors_256: (id)=>"\x1b[38;5;"+id+"m", colors_1677: (r,g,b)=>"\x1b[38;2;"+r+";"+g+";"+b+"m", grounds_256: (id)=>"\x1b[48;5;"+id+"m", grounds_1677: (r,g,b)=>"\x1b[48;2;"+r+";"+g+";"+b+"m" };
console.log("\nprocess.versions: "+Object.entries(process.versions).map(item => "\n  " + item[0] + ": " + ConsoleRich.color_green + item[1] + ConsoleRich.color_def));
console.log("\nprocess.platform: "+ConsoleRich.color_green + process.platform + ConsoleRich.color_def);
console.log("\nprocess.arch: "+ConsoleRich.color_green + process.arch + ConsoleRich.color_def);
console.log("\nprocess.argv: "+process.argv.map((item, i) => "\n  " + i + ": " + ConsoleRich.color_green + item + ConsoleRich.color_def));
console.log("\nappdata: "+appdata());
console.log("\n\n");

const ApplicationDataPath = appdata();
const ScoreDataPath = path.join(ApplicationDataPath, "./AppScoreData.json");

app.on("ready", async () => {
  if (!fs.existsSync(ScoreDataPath)){
    fs.writeFileSync(ScoreDataPath, JSON.stringify(
      {
        version: manifest.version, // 最終読み込みバージョン
        preferences: { // PreferencesWindow が変更できるデータ
          destination: {
            type: "relative",
            path: ".",
          }, // 保存先
          teams: [
            { name: "赤", color: "#ff8569" },
            { name: "青", color: "#22e3f4" },
            { name: "白", color: "#ffffff" },
            { name: "緑", color: "#96d35f" },
          ],
        },
        program: { // MainWindow が変更できるデータ
          config: { "deduct": 3, "dLimit": true }, games: []
        }
      }
    ), { encoding: "utf-8" });
  }
  ipcMain.handle("readScoreData", () => {
    const scoreData = JSON.parse(fs.readFileSync(ScoreDataPath, { encoding: "utf-8" }));
    return {scoreData: scoreData.program, removeEnabled};
  });
  ipcMain.handle("submitScoreData", (_, data) => {
    console.log("["+(new Date()).toLocaleString()+"] Score Data Received.");

    fs.writeFileSync(ScoreDataPath, JSON.stringify({
      version: manifest.version,
      program: data
    }), { encoding: "utf-8" });
  });

  new MainWindow();
});
