import React from "react";
import ReactDOM from "react-dom";
import "../resource/vendor/bootstrap/css/bootstrap.min.css";
import "../resource/css/simple-sidebar.css";
import { InputGroup, FormControl, Dropdown } from "react-bootstrap";

class NavBar extends React.Component {
  state = {};

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <InputGroup>
        <InputGroup.Prepend>
          <Dropdown>
            <Dropdown.Toggle
              variant="light"
              style={{
                backgroundColor: "#f8f9fa",
                marginLeft: "2px",
                marginRight: "2px",
              }}
              id="dropdown-basic"
            >
              📃
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={this.props.onDelete}>
                🗑 Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
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
