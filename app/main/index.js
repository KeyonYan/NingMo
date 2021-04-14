const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const dialog = require("electron").dialog;
const dirTree = require("../common/directory-tree");

app.on("ready", () => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (isDev) {
    // 开发环境
    win.loadURL("http://localhost:3000");
  } else {
    // 生产环境
    win.loadFile(path.resolve(__dirname, "../render/pages/main/index.html"));
  }
  dialog
    .showOpenDialog({
      title: "请选择目录",
      properties: ["openDirectory"],
    })
    .then((result) => {
      // get dirTree and send to renderer
      const path = result.filePaths[0];
      const treeDir = dirTree(path);
      console.log(treeDir);
      win.webContents.send("updateSideBar", treeDir);
    })
    .catch((error) => {
      console.log(error);
    });
});
