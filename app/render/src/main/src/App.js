import logo from './logo.svg';
import './App.css';
const {ipcRenderer} = window.require('electron')

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
  );
}

export default App;