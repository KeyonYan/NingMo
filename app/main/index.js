const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const dialog = require("electron").dialog;
const dirTree = require("../common/directory-tree");
const fs = require("fs");

function readFile(path) {
  const data = fs.readFileSync(path, "utf-8");
  return data;
}

function saveFile(path, content) {
  console.log("saveFile path", path);
  console.log("saveFile content", content);
  fs.writeFileSync(path, content, "utf-8");
}

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

  ipcMain.handle("readFile", async (event, item) => {
    // 读取item.path路径下的md文件并返回给渲染进程
    const result = await readFile(item.path);
    return result;
  });
  ipcMain.handle("saveFile", async (event, item) => {
    // 保存item.path路径下的md文件并通知渲染进程
    saveFile(item.path, item.content);
  });

  dialog
    .showOpenDialog({
      title: "请选择目录",
      properties: ["openDirectory"],
    })
    .then((result) => {
      // get dirTree and send to renderer
      const path = result.filePaths[0];
      const treeDir = dirTree(path);
      //console.log(treeDir);
      win.webContents.send("updateSideBar", treeDir);
    })
    .catch((error) => {
      console.log(error);
    });
});
