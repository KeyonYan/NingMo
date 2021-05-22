const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const dialog = require("electron").dialog;
const dirTree = require("../common/directory-tree");
const fs = require("fs");
const elasticsearch = require("elasticsearch");
var Datastore = require("nedb");
var db = new Datastore({ filename: "data.db", autoload: true });
let treeDir = null;
let rootPath = "";
// 知识图谱关系网数据结构
let linkRelation = {
  nodes: [],
  links: [],
  categories: [],
};
let nodeIndex = 1;
// elasticsearch
const ESINDEX = "ningmoindex";
const ESTYPE = "_doc";
const ESClient = new elasticsearch.Client({
  host: "127.0.0.1:9200",
  log: "error",
});

function readFile(path) {
  let data = "";
  if (fs.existsSync(path)) {
    data = fs.readFileSync(path, "utf-8");
  } else {
    throw Error("readFile Error, path: ", path);
  }
  return data;
}

function saveFile(path, content) {
  console.log("saveFile path", path);
  fs.writeFileSync(path, content, "utf-8");
}

// 解析当前目录下所有文件的链接关系
function analyseLinkRelation(treeDir) {
  linkRelation.nodes = [];
  linkRelation.links = [];
  linkRelation.categories = [];
  findCategories(treeDir.children);
  findNode(treeDir.children, treeDir.name);
  findLink();
  // console.log("linkRelation: ", linkRelation);
}
function findNode(dirArray, rootFolder) {
  if (dirArray === null) return;
  for (var i in dirArray) {
    if (dirArray[i].type === "directory") {
      findNode(dirArray[i].children, rootFolder);
    } else if (dirArray[i].type === "file" && dirArray[i].extension === ".md") {
      insertNode(dirArray[i].path, rootFolder);
    }
  }
}

function findCategories(dirArray) {
  linkRelation.categories.push({ name: "其他" });
  if (dirArray === null) return;
  for (var i in dirArray) {
    if (dirArray[i].type === "directory") {
      linkRelation.categories.push({ name: dirArray[i].name });
    }
  }
  return true;
}

function findCategoriesIndexByName(name) {
  return linkRelation.categories.findIndex((item) => item.name === name);
}

function insertNode(path, rootFolder) {
  const res = path.split("\\");
  let categories = "";
  for (var i = 0; i < res.length; i++) {
    if (rootFolder === res[i]) {
      // 如果是根目录下的md，其分类设为其他
      if (i === res.length - 2) {
        categories = res[i];
      } else {
        categories = res[i + 1];
      }
      break;
    }
  }
  let categoriesIndex = findCategoriesIndexByName(categories);
  if (categoriesIndex === -1) categoriesIndex = 0;
  // linkRelation.nodes 数据结构
  linkRelation.nodes.push({
    id: nodeIndex.toString(),
    name: res[res.length - 1],
    symbolSize: 30,
    value: 50,
    category: categoriesIndex,
    path: path,
  });
  nodeIndex++;
}

function findLink() {
  if (linkRelation.nodes === null || linkRelation.nodes.length === 0) {
    // console.log("linkRelation.nodes is null or empty.");
    return;
  }
  linkRelation.nodes.map((node) => {
    // console.log("node: ", node);
    const fileContent = readFile(node.path);
    // 解析时顺便将笔记内容存储在elasticsearch，做全文搜索用。
    ESClient.index(
      {
        index: ESINDEX,
        type: ESTYPE,
        body: {
          name: node.name,
          path: node.path,
          content: fileContent,
        },
      },
      (error, response) => {
        if (error) {
          console.log("ES error: ", error);
        }
      }
    );
    const regRes = fileContent.match(/\[{2}.*?\]{2}\(.*?\)/g);
    if (regRes === null || regRes.length === 0) {
      // console.log("link not found in node: ", node.path);
      return;
    }
    regRes.map((item) => {
      item.match(/\((.*?)\)/g);
      let linkPath = RegExp.$1;
      // linkPath = addEscape(linkPath);
      // console.log("linkPath: ", linkPath);
      const linkNode = findNodeByPath(linkPath);
      if (linkNode == "undefined" || linkNode === null) {
        // console.log("linkNode not found: ", linkPath);
        return;
      }
      // console.log("linkNode: ", linkNode);
      linkRelation.links.push({
        source: node.id,
        target: linkNode.id,
      });
    });
  });
}

function addEscape(path) {
  let res = "";
  const frag = path.split("\\");
  for (var i = 0; i < frag.length - 1; i++) {
    res += frag[i] + "\\\\";
  }
  res += frag[frag.length - 1];
  return res;
}

function findNodeByPath(path) {
  for (var i = 0; i < linkRelation.nodes.length; i++) {
    // console.log("linkRelation.nodes[i].path: ", linkRelation.nodes[i].path);
    // console.log("path: ", path);
    if (linkRelation.nodes[i].path === path) {
      return linkRelation.nodes[i];
    }
  }
  return null;
  // return linkRelation.nodes.find((item) => item.path === path);
}

function updateTreeDir(dirArray, oldPath, newPath) {
  if (dirArray === null) return;
  for (var i in dirArray) {
    if (dirArray[i].type === "directory") {
      updateTreeDir(dirArray[i].children);
    } else if (dirArray[i].type === "file" && dirArray[i].path === oldPath) {
      dirArray[i].path = newPath;
      return;
    }
  }
}

function updateLinkRelation(oldPath, newPath) {
  for (var i = 0; i < linkRelation.nodes.length; i++) {
    if (linkRelation.nodes[i].path === path) {
      linkRelation.nodes[i].path = newPath;
      return;
    }
  }
  return;
}

app.on("ready", () => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });
  if (isDev) {
    // 开发环境
    win.loadURL("http://localhost:3000");
  } else {
    // 生产环境
    win.loadFile(path.resolve(__dirname, "../render/pages/main/index.html"));
  }
  // initial es
  ESClient.indices.delete({
    index: ESINDEX,
  });

  ipcMain.handle("readFile", async (event, item) => {
    // 读取item.path路径下的md文件并返回给渲染进程
    const result = readFile(item.path);
    return result;
  });
  ipcMain.handle("saveFile", async (event, item) => {
    // 保存item.path路径下的md文件并通知渲染进程
    saveFile(item.path, item.content);
    analyseLinkRelation(treeDir);
    win.webContents.send("linkRelation", linkRelation);
  });
  ipcMain.handle("openDir", async (event, item) => {
    dialog
      .showOpenDialog({
        title: "请选择目录",
        properties: ["openDirectory"],
      })
      .then((result) => {
        // 读取数据库已有数据
        // 数据库结构：
        // {
        //   rootpath: 唯一
        //   treeDir:
        //   linkRelation:
        // }
        let rootPath = result.filePaths[0];
        db.find({ rootpath: rootPath }, function (err, docs) {
          if (docs.length !== 0) {
            console.log("database found data");
            treeDir = docs[0].treeDir;
            linkRelation = docs[0].linkRelation;
            win.webContents.send("updateSideBar", treeDir);
            win.webContents.send("linkRelation", linkRelation);
          } else {
            console.log("database not found data");
            // 目录解析
            rootPath = result.filePaths[0];
            treeDir = dirTree(rootPath);
            win.webContents.send("updateSideBar", treeDir);
            // 知识图谱解析
            analyseLinkRelation(treeDir);
            win.webContents.send("linkRelation", linkRelation);
            // 存入数据库
            let doc = {
              rootpath: rootPath,
              treeDir: treeDir,
              linkRelation: linkRelation,
            };
            db.insert(doc, function (err, newDoc) {
              console.log("insert data to neDB");
            });
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });
  ipcMain.handle("newPage", async (event, item) => {
    dialog
      .showOpenDialog({
        title: "新建文件",
        properties: ["openDirectory"],
      })
      .then((result) => {
        console.log("showOpenDialog: ", result);
        const path = result.filePaths[0] + "\\Untitled.md";
        fs.writeFileSync(path, "", "utf-8");
        win.webContents.send("showNewPage", path);
        treeDir = dirTree(rootPath);
        win.webContents.send("updateSideBar", treeDir);
        analyseLinkRelation(treeDir);
        win.webContents.send("linkRelation", linkRelation);
      })
      .catch((error) => {
        console.log(error);
      });
  });
  ipcMain.handle("changeFileName", async (event, item) => {
    // console.log("item: ", item);
    if (fs.existsSync(path)) {
      fs.renameSync(item.oldPath, item.newPath, function (err) {
        if (err) {
          throw Error("changeFileName error");
        }
      });
    } else {
      throw Error("readFile Error, path: ", path);
    }

    //updateTreeDir(treeDir, item.oldPath, item.newPath);
    //updateLinkRelation(item.oldPath, item.newPath);
    treeDir = dirTree(rootPath);
    analyseLinkRelation(treeDir);
    return {
      treeDir: treeDir,
      linkRelation: linkRelation,
    };
  });
  ipcMain.handle("deleteFile", async (event, path) => {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
      treeDir = dirTree(rootPath);
      win.webContents.send("updateSideBar", treeDir);
      analyseLinkRelation(treeDir);
      win.webContents.send("linkRelation", linkRelation);
    } else {
      throw Error("readFile Error, path: ", path);
    }
  });
  ipcMain.handle("clearDatabase", async (event, path) => {
    // 清空数据库
    db.remove({ rootpath: path });
    console.log("clearDatabase");
  });
});
