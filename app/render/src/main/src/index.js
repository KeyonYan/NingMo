import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Vditor from 'vditor';
// import "~vditor/src/assets/scss/index";
import './scss/index.scss';

const e = React.createElement

class APP extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    const vditor = new Vditor('vditor', {
      height: 360,
      toolbarConfig: {
        pin: true,
      },
      cache: {
        enable: false,
      },
      after () {
        vditor.setValue('Hello, Vditor + React!')
      },
    })
  }

  render () {
    return e(
      'div',
      {id: 'vditor'},
    )
  }
}

/* ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
); */
ReactDOM.render(
  e(APP), document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
