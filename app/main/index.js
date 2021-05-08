const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const dialog = require("electron").dialog;
const dirTree = require("../common/directory-tree");
const fs = require("fs");
var Datastore = require("nedb");
var db = new Datastore({ filename: "data.db", autoload: true });
let treeDir = null;
let linkRelation = {
  nodes: [],
  links: [],
  categories: [],
};
let nodeIndex = 1;

function readFile(path) {
  const data = fs.readFileSync(path, "utf-8");
  return data;
}

function saveFile(path, content) {
  console.log("saveFile path", path);
  fs.writeFileSync(path, content, "utf-8");
}

// 解析当前目录下所有文件的链接关系
function analyseLinkRelation(treeDir) {
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
  ipcMain.handle("openDir", async (event, item) => {
    db.remove({ type: "treeDir" });
    db.remove({ type: "linkRelation" });

    dialog
      .showOpenDialog({
        title: "请选择目录",
        properties: ["openDirectory"],
      })
      .then((result) => {
        // get dirTree and send to renderer
        const path = result.filePaths[0];
        treeDir = dirTree(path);
        //console.log(treeDir);
        win.webContents.send("updateSideBar", treeDir);

        analyseLinkRelation(treeDir);
        win.webContents.send("linkRelation", linkRelation);
        var doc = {
          type: "treeDir",
          value: treeDir,
        };
        db.insert(doc, function (err, newDoc) {
          console.log("insert treeDir to neDB");
        });
        doc = {
          type: "linkRelation",
          value: linkRelation,
        };
        db.insert(doc, function (err, newDoc) {
          console.log("insert linkRelation to neDB");
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });

  /* db.find({ type: "treeDir" }, function (err, docs) {
    if (docs.length !== 0) {
      console.log("treeDir from DB: ", docs[0].value);
      win.webContents.send("updateSideBar", docs[0].value);
    }
  });
  db.find({ type: "linkRelation" }, function (err, docs) {
    if (docs.length !== 0) {
      console.log("linkRelation from DB: ", docs[0].value);
      win.webContents.send("linkRelation", docs[0].value);
    }
  }); */
});
