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
import SplitPane, { Pane } from "react-split-pane";
import IconMenu from "./component/iconMenu";
import { Container, Row, Col, Card, Modal } from "react-bootstrap";
import SearchModal from "./component/searchModal";
import { DrapDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { LocalConvenienceStoreOutlined } from "@material-ui/icons";
// import Hotkeys from "react-hot-keys";
const { ipcRenderer } = window.require("electron");

const CLASS_DOUBLELINK = "DoubleLink";
const CLASS_WEBSITELINK = "WebsiteLink";
let mdFileArray = [];

function getMdFileArray(treeDir) {
  // 调用前记得清空 mdFileArray
  if (treeDir === null) return;
  if (treeDir.children === null) return;
  if (treeDir.children.length === 0) return;
  for (let i in treeDir.children) {
    if (treeDir.children[i].type === "directory") {
      getMdFileArray(treeDir.children[i]);
    }
    if (treeDir.children[i].extension === ".md") {
      mdFileArray.push(treeDir.children[i]);
    }
  }
}

class APP extends React.Component {
  state = {
    treeDir: "",
    noteContent: "",
    notePath: "",
    linkRelation: "",
    modalShow: false,
  };
  editor = null;

  constructor(props) {
    super(props);
    // 绑定监听器
    ipcRenderer.on("updateSideBar", (event, args) => {
      //console.log("args:" + args);
      this.setState({ treeDir: args });
      mdFileArray = [];
      getMdFileArray(this.state.treeDir);
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

  handleDoubleLinkClick = (event) => {
    console.log("click dlink");
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    const element = event.target.parentNode;
    // let path = element.href;
    console.log("element: ", element);
    let path = element.getElementsByClassName(
      "vditor-ir__marker vditor-ir__marker--link"
    )[0].innerHTML;
    console.log("path: ", path);
    // path = decodeURI(path);
    // path = path.substring(8);
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
  };

  handleWebSiteLinkClick = (event) => {
    console.log("click link");
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    const element = event.target.parentNode;
    console.log("element: ", element);
    let url = element.getElementsByClassName(
      "vditor-ir__marker vditor-ir__marker--link"
    )[0].innerHTML;
    let iframeView = document.createElement("iframe");
    iframeView.style.height = "100%";
    iframeView.style.width = "100%";
    if (url === null || url === "") {
      iframeView.src = "";
    } else {
      let result = url.match(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g
      );
      if (result === null || result.length === 0) {
        iframeView.src = "";
      } else {
        iframeView.src = url;
      }
    }

    const node = document.getElementById("linkVditor");
    node.children[0].innerHTML = iframeView.src;
    node.children[1].innerHTML = "";
    node.children[1].appendChild(iframeView);
  };

  bindLinkEvent = () => {
    console.log("bindLinkEvent");
    const viewsDoubleLink = document.getElementsByClassName(CLASS_DOUBLELINK);
    const viewsWebSiteLink = document.getElementsByClassName(CLASS_WEBSITELINK);
    for (let i = 0; i < viewsDoubleLink.length; i++) {
      viewsDoubleLink[i].removeEventListener(
        "click",
        this.handleDoubleLinkClick
      );
      viewsDoubleLink[i].addEventListener("click", this.handleDoubleLinkClick);
    }
    for (let i = 0; i < viewsWebSiteLink.length; i++) {
      viewsWebSiteLink[i].removeEventListener(
        "click",
        this.handleWebSiteLinkClick
      );
      viewsWebSiteLink[i].addEventListener(
        "click",
        this.handleWebSiteLinkClick
      );
    }
  };

  createEditor = () => {
    let that = this;
    const editor = new Vditor("vditor", {
      height: 800,
      width: "100%",
      mode: "ir",
      placeholder: "React Vditor",
      counter: {
        enable: true,
      },
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
            console.log("that.editor.getValue(): ", that.editor.getValue());
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
              console.log("key: ", key);
              console.log("mdFileArray: ", mdFileArray);
              let pageList = [];
              for (let item of mdFileArray) {
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
                if (pageItem.html.search(key) > -1) {
                  popupShowList.push(pageItem);
                }
              }
              console.log("popupShowList: ", popupShowList);
              return popupShowList;
            },
          },
        ],
      },
      input(data) {
        console.log("input() call");
        /* const editorView = document.activeElement;
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
        } */
      },
      after() {
        // 编辑器异步渲染完成后的回调方法
        // 图片渲染逻辑: renderImage -> renderBang -> renderLink
        // 链接渲染逻辑: renderLink -> renderOpenBracket ->
        // renderLinkText -> renderCloseBracket -> renderOpenParen
        // renderLinkDest -> renderCloseParen
        that.editor.vditor.lute.SetJSRenderers({
          renderers: {
            Md2VditorIRDOM: {
              // 请根据不同的模式选择不同的渲染对象
              renderLink: (node, entering) => {
                if (entering) {
                  console.log("renderLink in");
                  return [``, window.Lute.WalkContinue];
                } else {
                  // debug: BUG
                  console.log("renderLink out");
                  console.log("renderLink, nodeText: ", node.Text());
                  console.log("this.myLink: ", this.myLink);
                  const text = node.Text();
                  if (text[0] === "[" && text[text.length - 1] === "]") {
                    console.log("isDoubleLink");
                    return [
                      `<span data-type="a" class="vditor-ir__node ${CLASS_DOUBLELINK}">` +
                        `<span class="vditor-ir__marker vditor-ir__marker--bracket">[</span>` +
                        `<span class="vditor-ir__link">${node.Text()}</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--bracket">]</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--paren">(</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--link">${this.myLink}</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--paren">)</span></span>`,
                      window.Lute.WalkContinue,
                    ];
                  } else {
                    console.log("isWebLink");
                    return [
                      `<span data-type="a" class="vditor-ir__node ${CLASS_WEBSITELINK}">` +
                        `<span class="vditor-ir__marker vditor-ir__marker--bracket">[</span>` +
                        `<span class="vditor-ir__link">${node.Text()}</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--bracket">]</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--paren">(</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--link">${this.myLink}</span>` +
                        `<span class="vditor-ir__marker vditor-ir__marker--paren">)</span></span>`,
                      window.Lute.WalkContinue,
                    ];
                  }
                }
              },
              renderOpenBracket: (node, entering) => {
                if (entering) {
                  console.log("renderOpenBracket in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderOpenBracket out");
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderLinkText: (node, entering) => {
                if (entering) {
                  console.log("renderLinkText in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderLinkText out");
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderCloseBracket: (node, entering) => {
                if (entering) {
                  console.log("renderCloseBracket in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderCloseBracket out");
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderOpenParen: (node, entering) => {
                if (entering) {
                  console.log("renderOpenParen in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderOpenParen out");
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderLinkDest: (node, entering) => {
                if (entering) {
                  console.log("renderLinkDest in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  this.myLink = node.TokensStr();
                  console.log("renderLinkDest out");
                  console.log("renderLink, node TokensStr: ", node.TokensStr());
                  console.log("this.myLink: ", this.myLink);
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderCloseParen: (node, entering) => {
                if (entering) {
                  console.log("renderCloseParen in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderCloseParen out");
                  return ["", window.Lute.WalkContinue];
                }
              },
              renderImage: (node, entering) => {
                if (entering) {
                  console.log("renderImage in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderImage out");
                  return [
                    `<span class="vditor-ir__node" data-type="img">` +
                      `<span class="vditor-ir__marker">!</span>` +
                      `<span class="vditor-ir__marker vditor-ir__marker--bracket">[</span>` +
                      `<span class="vditor-ir__marker vditor-ir__marker--bracket">${node.Text()}</span>` +
                      `<span class="vditor-ir__marker vditor-ir__marker--bracket">]</span>` +
                      `<span class="vditor-ir__marker vditor-ir__marker--paren">(</span>` +
                      `<span class="vditor-ir__marker vditor-ir__marker--link">${this.myLink}</span>` +
                      `<span class="vditor-ir__marker vditor-ir__marker--paren">)</span>` +
                      `<img src="${this.myLink}" alt="${node.Text()}"></span>`,
                    window.Lute.WalkContinue,
                  ];
                }
              },
              renderBang: (node, entering) => {
                if (entering) {
                  console.log("renderBang in");
                  return ["", window.Lute.WalkContinue];
                } else {
                  console.log("renderBang out");
                  return ["", window.Lute.WalkContinue];
                }
              },
            },
          },
        });

        that.editor.setValue(that.state.noteContent);
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
    console.log("handleOpenDir");
    ipcRenderer.invoke("openDir");
  };

  handleSearchModal = () => {
    console.log("handleSearchModal");
    this.setState({ modalShow: true });
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
              <IconMenu
                onOpenDir={this.handleOpenDir}
                onSearch={this.handleSearchModal}
              />
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
        <SearchModal
          show={this.state.modalShow}
          onHide={() => this.setState({ modalShow: false })}
        />
      </div>
    );
  }
}

ReactDOM.render(<APP />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
