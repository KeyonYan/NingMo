import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Vditor from 'vditor';
// import "~vditor/src/assets/scss/index";
import './scss/index.scss';
import './resource/vendor/bootstrap/css/bootstrap.min.css';
import './resource/css/simple-sidebar.css';

const e = React.createElement

class APP extends React.Component {
  constructor (props) {
    super(props)
  }
  // 组件渲染后调用
  componentDidMount () {
    const vditor = new Vditor('vditor', {
      height: 800,
      toolbarConfig: {
        pin: true,
      },
      cache: {
        enable: false, // 是否使用 localStorage 进行缓存
      },
      hint: {
        extend: [
          {
            key: '@',
            hint: (key) => {
              let pageList = [{
                value: '<a href="./Page1">Page1</a>', html: 'Page1'
              }, {
                value: '<a href="./Page2">Page2</a>', html: 'Page2'
              }, {
                value: '<a href="./Page3">Page3</a>', html: 'Page3'
              }];
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
        }
      },
      after () { 
        // 编辑器异步渲染完成后的回调方法
        vditor.setValue('Hello, Vditor + React!')
      },
      input (string) {
        // 输入后触发 | string: 整个编辑框内的字符串值
        console.log("string:" + string);
      }
    })
  }

  render() {
    return (
      <div class="d-flex" id="wrapper">

        <div class="bg-light border-right" id="sidebar-wrapper">
          <div class="sidebar-heading">New Page</div>
          <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action bg-light">Dashboard</a>
            <a href="#" class="list-group-item list-group-item-action bg-light">Shortcuts</a>
            <a href="#" class="list-group-item list-group-item-action bg-light">Overview</a>
            <a href="#" class="list-group-item list-group-item-action bg-light">Events</a>
            <a href="#" class="list-group-item list-group-item-action bg-light">Profile</a>
            <a href="#" class="list-group-item list-group-item-action bg-light">Status</a>
          </div>
        </div>

        <div id="page-content-wrapper">
    
          <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button class="btn btn-primary" id="menu-toggle">Toggle Menu</button>
    
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
    
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                <li class="nav-item active">
                  <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Link</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Dropdown
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#">Something else here</a>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
    
          <div class="container-fluid">
            <div id="vditor"></div>
          </div>
        </div>
    
      </div>
    );
  }
}

ReactDOM.render(
  <APP />, document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
