import React from "react";
import ReactDOM from "react-dom";
import "../resource/vendor/bootstrap/css/bootstrap.min.css";
import "../resource/css/simple-sidebar.css";
import { InputGroup, FormControl } from "react-bootstrap";

class NavBar extends React.Component {
  state = {};

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text id="basic-addon1">📃</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder="Untitled"
          aria-label="FileName"
          aria-describedby="basic-addon1"
          value={this.props.noteName}
          onChange={this.props.onFileNameChange}
          onBlur={this.props.onFileNameSaveChange}
        />
      </InputGroup>
    );
  }
}

export default NavBar;
