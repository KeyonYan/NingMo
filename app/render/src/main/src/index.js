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
const { ipcRenderer } = window.require("electron");
let vditor = null;
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
    noteContent: "Hello",
  };

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
      this.setState({ noteContent: result });
    });
  };

  componentDidMount() {
    const { noteContent } = this.state;
    vditor = new Vditor("vditor", {
      height: 800,
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
      preview: {
        parse(HTMLElement) {
          // 预览回调
          console.log("HTMLElement:" + HTMLElement);
          return HTMLElement;
        },
        transform(string) {
          // 渲染之前回调
          console.log("transform string:" + string);
          return string;
        },
      },
      after() {
        // 编辑器异步渲染完成后的回调方法
        vditor.setValue(noteContent);
      },
      input(string) {
        // 输入后触发 | string: 整个编辑框内的字符串值
        console.log("string:" + string);
      },
    });
  }

  render() {
    if (vditor !== null) {
      vditor.setValue(this.state.noteContent);
    }
    return (
      <div className="d-flex" id="wrapper">
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
      </div>
    );
  }
}

ReactDOM.render(<APP />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
