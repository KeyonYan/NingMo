import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Vditor from "vditor";
// import "~vditor/src/assets/scss/index";
import "./scss/index.scss";
import "bootstrap/dist/css/bootstrap.min.css";
// import "./resource/vendor/bootstrap/css/bootstrap.min.css";
import "./resource/css/simple-sidebar.css";
import "./resource/css/split-pane.css";
import SideBar from "./component/sideBar";
import NavBar from "./component/navBar";
import Graph from "./component/graph";
import IconMenu from "./component/iconMenu";
import SplitPane, { Pane } from "react-split-pane";
import { Container, Row, Col, Card } from "react-bootstrap";
import { DrapDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LocalConvenienceStoreOutlined } from "@material-ui/icons";
// import Hotkeys from "react-hot-keys";
const { ipcRenderer } = window.require("electron");

const CLASS_DOUBLELINK = "DoubleLink";
const CLASS_WEBSITELINK = "WebsiteLink";
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
    linkRelation: "",
  };
  editor = null;

  constructor(props) {
    super(props);
    // 绑定监听器
    ipcRenderer.on("updateSideBar", (event, args) => {
      //console.log("args:" + args);
      this.setState({ treeDir: args });
    });
    ipcRenderer.on("linkRelation", (event, args) => {
      this.setState({ linkRelation: args });
    });
    this.refLinkVditor = React.createRef();
  }

  handleReadFile = (item) => {
    if (item.type !== "file") {
      console.log("onClick item is not a file");
      return;
    }
    // 通知主进程读取path下的文件并返回其内容
    ipcRenderer.invoke("readFile", item).then((result) => {
      //console.log("readFile' ipcResult:" + result);
      this.setState({ noteContent: result, notePath: item.path });
    });
  };

  bindLinkEvent = () => {
    console.log("bindLinkEvent");
    const viewsDoubleLink = document.getElementsByClassName(CLASS_DOUBLELINK);
    const viewsWebSiteLink = document.getElementsByClassName(CLASS_WEBSITELINK);
    for (let i = 0; i < viewsDoubleLink.length; i++) {
      viewsDoubleLink[i].addEventListener("click", (event) => {
        const element = event.target;
        let path = element.href;
        path = decodeURI(path);
        path = path.substring(8);
        ipcRenderer.invoke("readFile", { path: path }).then((result) => {
          Vditor.md2html(result).then((data) => {
            const node = document.getElementById("linkVditor");
            const divView = document.createElement("div");
            divView.style.height = "100%";
            divView.style.width = "100%";
            divView.style.overflow = "auto";
            node.children[0].innerHTML = path;
            divView.innerHTML = data;
            node.children[1].innerHTML = "";
            node.children[1].appendChild(divView);
          });
        });
      });
    }
    for (let i = 0; i < viewsWebSiteLink.length; i++) {
      viewsWebSiteLink[i].addEventListener("click", (event) => {
        const element = event.target;
        let iframeView = document.createElement("iframe");
        iframeView.style.height = "100%";
        iframeView.style.width = "100%";
        iframeView.src = element.href;
        const node = document.getElementById("linkVditor");
        node.children[0].innerHTML = iframeView.src;
        node.children[1].innerHTML = "";
        node.children[1].appendChild(iframeView);
      });
    }
  };

  handleDoubleLinkClick = () => {
    console.log("doublelink click");
  };

  createEditor = () => {
    let that = this;
    const editor = new Vditor("vditor", {
      height: 800,
      width: "100%",
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
            console.log("save");
            // 发送至主进程并告知保存
            that.setState({ noteContent: that.editor.getValue() });
            var item = {
              path: that.state.notePath,
              content: that.state.noteContent,
            };
            // console.log("saveFile path:", item.path);
            // console.log("saveFile content:", item.content);
            ipcRenderer.invoke("saveFile", item);
            // 双链绑定事件监听器
            that.bindLinkEvent();
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
        parse: true,
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
                      "class='" +
                      CLASS_DOUBLELINK +
                      "'href='" +
                      item.path +
                      "'>[" +
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
      input(data) {
        console.log("input() call");
        const editorView = document.activeElement;
        const selection = window.getSelection();
        let range = selection.getRangeAt(0); // 记录当前光标位置，之后用
        const lastChar = data[data.length - 2];
        console.log("lastChar: ", lastChar);
        if (lastChar === "%") {
          // 1. 触发弹窗列表
          // TODO
          // 2. 列表项回车触发 内容复制到粘贴板 再调用粘贴命令 内容粘贴到编辑器
          var inputView = document.getElementById("tempInput");
          inputView.value = "[测试数据](111)";
          inputView.focus();
          if (inputView.setSelectionRange) {
            inputView.setSelectionRange(0, inputView.value.length);
          } else {
            //获取光标起始位置到结束位置
            inputView.select();
          }
          try {
            var flag = document.execCommand("copy"); //执行复制
          } catch (error) {
            console.log(error);
            var flag = false;
          }
          editorView.focus();
          selection.removeAllRanges(); // 删除所有选取范围
          selection.addRange(range); // 添加一个选取范围（移动光标到最后）

          // 粘贴内容
          document.execCommand("Paste");
        }
      },
      after: () => {
        // 编辑器异步渲染完成后的回调方法
        console.log("after() call");
        this.editor.vditor.lute.SetJSRenderers({
          renderers: {
            Md2VditorIRDOM: {
              // 请根据不同的模式选择不同的渲染对象
              renderLinkDest: (node, entering) => {
                if (entering) {
                  this.myLink = node.TokensStr();
                  return [``, window.Lute.WalkContinue];
                }
                return [``, window.Lute.WalkContinue];
              },
              renderLink: (node, entering) => {
                if (entering) {
                  return [``, window.Lute.WalkContinue];
                } else {
                  console.log("renderLink, nodeText: ", node.Text());
                  const text = node.Text();
                  if (text[0] === "[" && text[text.length - 1] === "]") {
                    return [
                      `<a href='${this.myLink}' class="` +
                        CLASS_DOUBLELINK +
                        `">${node.Text()}</a>`,
                      window.Lute.WalkContinue,
                    ];
                  } else {
                    return [
                      `<a href='${this.myLink}' class="` +
                        CLASS_WEBSITELINK +
                        `">${node.Text()}</a>`,
                      window.Lute.WalkContinue,
                    ];
                  }
                }
              },
              renderOpenBracket: (node, entering) => {
                if (entering) {
                  return ["", window.Lute.WalkContinue];
                } else {
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderLinkText: (node, entering) => {
                if (entering) {
                  return ["", window.Lute.WalkContinue];
                } else {
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderCloseBracket: (node, entering) => {
                if (entering) {
                  return ["", window.Lute.WalkContinue];
                } else {
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderOpenParen: (node, entering) => {
                if (entering) {
                  return ["", window.Lute.WalkContinue];
                } else {
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderCloseParen: (node, entering) => {
                if (entering) {
                  return ["", window.Lute.WalkContinue];
                } else {
                  return ["", window.Lute.WalkContinue];
                }
              },
            },
          },
        });

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

  handleOpenDir = () => {
    console.log("onClick");
    ipcRenderer.invoke("openDir");
  };

  render() {
    if (this.editor !== null) {
      this.editor.setValue(this.state.noteContent);
    }
    this.bindLinkEvent();
    return (
      <div>
        <Container fluid>
          <Row>
            <Col md="auto">
              <IconMenu onOpenDir={this.handleOpenDir} />
            </Col>
            <Col>
              <div className="d-flex" id="wrapper">
                <SplitPane
                  split="vertical"
                  defaultSize={230}
                  minSize={230}
                  maxSize={300}
                >
                  <SideBar
                    treeDir={this.state.treeDir}
                    onReadFile={this.handleReadFile}
                  />
                  <SplitPane
                    split="vertical"
                    defaultSize={700}
                    minSize={300}
                    maxSize={900}
                  >
                    <div id="page-content-wrapper">
                      <div id="vditor"></div>
                    </div>
                    <SplitPane
                      split="horizontal"
                      defaultSize={400}
                      minSize={300}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <div style={{ height: "100%", width: "100%" }}>
                        <Card
                          id="linkVditor"
                          style={{ height: "100%", width: "100%" }}
                        >
                          <Card.Header></Card.Header>
                          <Card.Body
                            style={{
                              height: "100%",
                              width: "100%",
                              padding: "0",
                            }}
                          ></Card.Body>
                        </Card>
                      </div>
                      <Graph linkRelation={this.state.linkRelation} />
                    </SplitPane>
                  </SplitPane>
                </SplitPane>
                <input id="tempInput"></input>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

ReactDOM.render(<APP />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
