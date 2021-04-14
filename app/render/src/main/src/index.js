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

class APP extends React.Component {
  state = {
    treeDir: "",
  };

  constructor(props) {
    super(props);
    // 绑定监听器
    ipcRenderer.on("updateSideBar", (event, args) => {
      console.log("args:" + args);
      this.setState({ treeDir: args });
    });
  }

  // 组件渲染后调用
  componentDidMount() {
    const vditor = new Vditor("vditor", {
      height: 800,
      toolbarConfig: {
        hide: true,
      },
      cache: {
        enable: false, // 是否使用 localStorage 进行缓存
      },
      hint: {
        extend: [
          {
            key: "@",
            hint: (key) => {
              let pageList = [
                {
                  value: '<a href="./Page1">Page1</a>',
                  html: "Page1",
                },
                {
                  value: '<a href="./Page2">Page2</a>',
                  html: "Page2",
                },
                {
                  value: '<a href="./Page3">Page3</a>',
                  html: "Page3",
                },
              ];
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
        vditor.setValue("Hello, Vditor + React!");
      },
      input(string) {
        // 输入后触发 | string: 整个编辑框内的字符串值
        console.log("string:" + string);
      },
    });
  }

  render() {
    return (
      <div className="d-flex" id="wrapper">
        <SideBar treeDir={this.state.treeDir} />
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
