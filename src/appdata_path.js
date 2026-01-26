import path from "path";
import { app } from "electron";
import fs from "fs";

function appData(){
  const basePath = path.join(app.getPath("userData"), "./appdata/");
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  return basePath;
}

export default appData;
