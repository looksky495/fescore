import { app, BrowserWindow } from "electron";
import path from "path";
const __dirname = import.meta.dirname;

class MainWindow {
  #window;

  constructor (){
    const window = this.#window = new BrowserWindow({
      x: 0, y: 0,
      width: 1024,
      height: 768,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "./preload.js")
      },
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#223a48",
        symbolColor: "#74b1be"
      },
      title: "#あたいの足技みさらせやー"
    });

    window.on("closed", () => {
      app.exit();
    });

    window.loadFile(path.join(__dirname, "./admin.html"));
  }
}

export default MainWindow;
