import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Vditor from "vditor";
// import "~vditor/src/assets/scss/index";
import "./scss/index.scss";
import "./resource/vendor/bootstrap/css/bootstrap.min.css";
import "./resource/css/simple-sidebar.css";
import SideBar from "./component/sideBar";
import NavBar from "./component/navBar";
import Hotkeys from "react-hot-keys";
const { ipcRenderer } = window.require("electron");

let treeDirArr = [];

function updateTreeDirArr(treeDir) {
  if (treeDir === null) return;
  if (treeDir.children === null) return;
  if (treeDir.children.length === 0) return;
  for (let i in treeDir.children) {
    if (treeDir.children[i].type === "directory") {
      updateTreeDirArr(treeDir.children[i]);
    }
    if (treeDir.children[i].extension === ".md") {
      treeDirArr.push(treeDir.children[i]);
    }
  }
}

class APP extends React.Component {
  state = {
    treeDir: "",
    noteContent: "",
    notePath: "",
  };
  editor = null;

  constructor(props) {
    super(props);
    // 绑定监听器
    ipcRenderer.on("updateSideBar", (event, args) => {
      //console.log("args:" + args);
      this.setState({ treeDir: args });
    });
  }

  handleReadFile = (item) => {
    if (item.type !== "file") {
      console.log("onClick item is not a file");
      return;
    }
    console.log("handleClick item:" + item);
    // 通知主进程读取path下的文件并返回其内容
    ipcRenderer.invoke("readFile", item).then((result) => {
      //console.log("readFile' ipcResult:" + result);
      this.setState({ noteContent: result, notePath: item.path });
    });
  };

  createEditor = () => {
    let that = this;
    const editor = new Vditor("vditor", {
      height: 800,
      mode: "ir",
      placeholder: "React Vditor",
      toolbar: [
        "emoji",
        "headings",
        "bold",
        "italic",
        "link",
        "|",
        "list",
        "ordered-list",
        "check",
        "outdent",
        "indent",
        "|",
        "quote",
        "line",
        "code",
        "inline-code",
        "insert-before",
        "insert-after",
        "|",
        "upload",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "fullscreen",
        "edit-mode",
        {
          name: "more",
          toolbar: [
            "both",
            "code-theme",
            "content-theme",
            "export",
            "outline",
            "preview",
            "devtools",
            "info",
            "help",
          ],
        },
        "|",
        {
          hotkey: "⌘S",
          name: "save",
          tipPosition: "s",
          tip: "保存",
          className: "right",
          icon: `<img style="height: 16px" src='https://img.58cdn.com.cn/escstatic/docs/imgUpload/idocs/save.svg'/>`,
          click() {
            // 发送至主进程并告知保存
            that.setState({ noteContent: that.editor.getValue() });
            var item = {
              path: that.state.notePath,
              content: that.state.noteContent,
            };
            // console.log("saveFile path:", item.path);
            // console.log("saveFile content:", item.content);
            ipcRenderer.invoke("saveFile", item);
          },
        },
      ],
      toolbarConfig: {
        hide: true,
      },
      cache: {
        enable: false, // 是否使用 localStorage 进行缓存
      },
      hint: {
        parse: false,
        extend: [
          {
            key: "@",
            hint: (key) => {
              updateTreeDirArr(this.state.treeDir);
              let pageList = [];
              for (let item of treeDirArr) {
                if (item.extension === ".md") {
                  pageList.push({
                    value:
                      "<a " +
                      'class="DoubleLink" ' +
                      'href="' +
                      item.path +
                      '">[' +
                      item.name +
                      "]</a>",
                    html: item.name,
                  });
                }
              }
              let popupShowList = [];
              for (let pageItem of pageList) {
                if (pageItem.html.indexOf(key.toLocaleLowerCase()) > -1) {
                  popupShowList.push(pageItem);
                }
              }

              return popupShowList;
            },
          },
        ],
      },
      after: () => {
        // 编辑器异步渲染完成后的回调方法
        editor.setValue(this.state.noteContent);
      },
    });
    return editor;
  };

  componentDidMount() {
    this.editor = this.createEditor();
  }

  onKeyDown(keyName, e, handle) {
    console.log("test:onKeyDown", e, handle);
    // 发送至主进程并告知保存
    this.setState({ noteContent: this.editor.getValue() });
    var item = {
      path: this.state.notePath,
      content: this.state.noteContent,
    };
    // console.log("saveFile path:", item.path);
    // console.log("saveFile content:", item.content);
    ipcRenderer.invoke("saveFile", item);
  }

  render() {
    if (this.editor !== null) {
      this.editor.setValue(this.state.noteContent);
    }
    return (
      <div className="d-flex" id="wrapper">
        <Hotkeys keyName="ctrl+j" onKeyDown={this.onKeyDown.bind(this)}>
          <SideBar
            treeDir={this.state.treeDir}
            onReadFile={this.handleReadFile}
          />
          <div id="page-content-wrapper">
            <NavBar />
            <div className="container-fluid">
              <div id="vditor"></div>
            </div>
          </div>
        </Hotkeys>
      </div>
    );
  }
}

ReactDOM.render(<APP />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
