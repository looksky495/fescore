import { app, BrowserWindow } from "electron";
import path from "path";
const __dirname = import.meta.dirname;

const template = [
  ...(process.platform === 'darwin'
    ? [{
      role: 'appMenu',
      submenu: [
        { role: 'about', label: "FeScoreについて" },
        { type: 'separator' },
        { role: 'services', label: "サービス" },
        { type: 'separator' },
        { role: 'hide', label: "FeScoreを非表示" },
        { role: 'hideOthers', label: "ほかを非表示" },
        { role: 'unhide', label: "すべてを表示" },
        { type: 'separator' },
        { role: 'quit', label: "FeScoreを終了" }
      ]
    }]
    : []
  ),
  {
    role: 'fileMenu',
    label: "ファイル",
    submenu: [
      ...(process.platform === 'darwin'
        ? [{ role: 'close', label: "ウィンドウを閉じる" }]
        : [{ role: 'quit', label: "FeScoreを終了" }]
      )
    ]
  },
  {
    role: 'editMenu',
    label: "編集",
    submenu: [
      { role: 'undo', label: "元に戻す" },
      { role: 'redo', label: "やり直す" },
      { type: 'separator' },
      { role: 'cut', label: "切り取り" },
      { role: 'copy', label: "コピー" },
      { role: 'paste', label: "貼り付け" },
      ...(process.platform === 'darwin'
        ? [
          { role: 'pasteAndMatchStyle', label: "スタイルを合わせて貼り付け" },
          { role: 'delete', label: "削除" },
          { role: 'selectAll', label: "すべてを選択" },
          { type: 'separator' },
          {
            label: 'スピーチ',
            submenu: [
              { role: 'startSpeaking', label: "読み上げを開始" },
              { role: 'stopSpeaking', label: "読み上げを停止" }
            ]
          }
        ]
        : [
          { role: 'delete', label: "削除" },
          { type: 'separator' },
          { role: 'selectAll', label: "すべてを選択" }
        ]
      )
    ]
  },
  {
    role: 'viewMenu',
    label: "表示",
    submenu: [
      { role: 'reload', label: "再読み込み" },
      { role: 'forceReload', label: "強制再読み込み" },
      { role: 'toggleDevTools', label: "デベロッパーツールの切り替え" },
      { type: 'separator' },
      { role: 'resetZoom', label: "ズームをリセット" },
      { role: 'zoomIn', label: "ズームイン" },
      { role: 'zoomOut', label: "ズームアウト" },
      { type: 'separator' },
      { role: 'togglefullscreen', label: "フルスクリーンの切り替え" }
    ]
  },
  {
    role: 'windowMenu',
    label: "ウィンドウ",
    submenu: [
      { role: 'minimize', label: "最小化" },
      { role: 'zoom', label: "ズーム" },
      ...(process.platform === 'darwin'
        ? [
          { type: 'separator' },
          { role: 'front', label: "前面に移動" }
        ]
        : [
          { role: 'close', label: "ウィンドウを閉じる" }
        ]
      )
    ]
  },
  {
    role: 'help',
    label: "ヘルプ",
    submenu: [
      {
        label: 'FeScoreについて',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://electronjs.org');
        }
      }
    ]
  }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));

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
