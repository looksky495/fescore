import appdata from "./src/appdata_path.js";
import path from "path";
import fs from "fs";
import { app, ipcMain, shell } from "electron";
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
const ScoresDirPath = path.join(ApplicationDataPath, "./scores/");
const AppSettingsPath = path.join(ApplicationDataPath, "./settings.json");

const ensureDir = dirPath => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const createScoreDataTemplate = () => ({
  version: manifest.version,
  preferences: {
    destination: {
      type: "relative",
      path: ".",
    },
    teams: [
      { name: "赤", color: "#ff8569" },
      { name: "青", color: "#22e3f4" },
      { name: "白", color: "#ffffff" },
      { name: "緑", color: "#96d35f" },
    ],
  },
  program: {
    config: { "deduct": 3, "dLimit": true },
    games: []
  }
});

const readAppSettings = () => {
  if (!fs.existsSync(AppSettingsPath)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(AppSettingsPath, { encoding: "utf-8" }));
    if (typeof data.activeScorePath !== "string") return {};
    return data;
  } catch {
    return {};
  }
};

const writeAppSettings = settings => {
  fs.writeFileSync(AppSettingsPath, JSON.stringify(settings), { encoding: "utf-8" });
};

const ensureScoreFile = scorePath => {
  if (!fs.existsSync(scorePath)) {
    fs.writeFileSync(scorePath, JSON.stringify(createScoreDataTemplate()), { encoding: "utf-8" });
  }
};

const resolveActiveScorePath = settings => {
  if (settings.activeScorePath && fs.existsSync(settings.activeScorePath)) {
    return settings.activeScorePath;
  }
  ensureDir(ScoresDirPath);
  if (fs.existsSync(ScoresDirPath)) {
    const candidates = fs.readdirSync(ScoresDirPath)
      .filter(name => name.endsWith(".json"))
      .sort();
    if (candidates.length > 0) {
      return path.join(ScoresDirPath, candidates[candidates.length - 1]);
    }
  }
  const newPath = path.join(ScoresDirPath, buildTimestampFileName());
  ensureScoreFile(newPath);
  return newPath;
};

const buildTimestampFileName = () => {
  const now = new Date();
  const pad = value => String(value).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join("");
  return `${stamp}.json`;
};

let appSettings = null;
let activeScorePath = null;

app.on("ready", async () => {
  ensureDir(ScoresDirPath);
  appSettings = readAppSettings();
  activeScorePath = resolveActiveScorePath(appSettings);
  if (appSettings.activeScorePath !== activeScorePath) {
    appSettings.activeScorePath = activeScorePath;
    writeAppSettings(appSettings);
  }
  ensureScoreFile(activeScorePath);
  ipcMain.handle("readScoreData", () => {
    const scoreData = JSON.parse(fs.readFileSync(activeScorePath, { encoding: "utf-8" }));
    return {scoreData: scoreData.program, removeEnabled};
  });
  ipcMain.handle("submitScoreData", (_, data) => {
    console.log("["+(new Date()).toLocaleString()+"] Score Data Received.");
    let scoreData = createScoreDataTemplate();
    if (fs.existsSync(activeScorePath)) {
      try {
        scoreData = JSON.parse(fs.readFileSync(activeScorePath, { encoding: "utf-8" }));
      } catch {
        scoreData = createScoreDataTemplate();
      }
    }
    scoreData.version = manifest.version;
    scoreData.program = data;
    fs.writeFileSync(activeScorePath, JSON.stringify(scoreData), { encoding: "utf-8" });
  });
  ipcMain.handle("getActiveScoreFile", () => {
    return { path: activeScorePath, name: path.basename(activeScorePath) };
  });
  ipcMain.handle("getSelectedScoreFile", () => {
    const selectedPath = appSettings?.activeScorePath;
    if (typeof selectedPath === "string" && fs.existsSync(selectedPath)) {
      return { path: selectedPath, name: path.basename(selectedPath) };
    }
    return { path: activeScorePath, name: path.basename(activeScorePath) };
  });
  ipcMain.handle("listScoreFiles", () => {
    const items = [];
    if (fs.existsSync(ScoreDataPath)) {
      items.push({ path: ScoreDataPath, name: path.basename(ScoreDataPath) });
    }
    if (fs.existsSync(ScoresDirPath)) {
      for (const fileName of fs.readdirSync(ScoresDirPath)) {
        if (!fileName.endsWith(".json")) continue;
        const filePath = path.join(ScoresDirPath, fileName);
        items.push({ path: filePath, name: fileName });
      }
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  });
  ipcMain.handle("createScoreFile", () => {
    ensureDir(ScoresDirPath);
    const filePath = path.join(ScoresDirPath, buildTimestampFileName());
    fs.writeFileSync(filePath, JSON.stringify(createScoreDataTemplate()), { encoding: "utf-8" });
    return { path: filePath, name: path.basename(filePath) };
  });
  ipcMain.handle("setActiveScoreFile", (_, filePath) => {
    if (typeof filePath !== "string") throw new Error("Invalid path");
    if (!filePath.startsWith(ApplicationDataPath)) throw new Error("Path outside app data");
    if (!fs.existsSync(filePath)) throw new Error("File not found");
    appSettings = appSettings || readAppSettings();
    appSettings.activeScorePath = filePath;
    writeAppSettings(appSettings);
    return { path: filePath, name: path.basename(filePath) };
  });
  ipcMain.handle("showActiveScoreFile", () => {
    shell.showItemInFolder(activeScorePath);
    return true;
  });
  ipcMain.handle("showScoreFile", (_, filePath) => {
    if (typeof filePath !== "string") throw new Error("Invalid path");
    if (!filePath.startsWith(ApplicationDataPath)) throw new Error("Path outside app data");
    if (!fs.existsSync(filePath)) throw new Error("File not found");
    shell.showItemInFolder(filePath);
    return true;
  });

  new MainWindow();
});
