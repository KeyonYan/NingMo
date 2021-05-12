import React, { Component } from "react";
import { Modal, InputGroup, FormControl, ListGroup } from "react-bootstrap";

class SettingModal extends Component {
  state = {};
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            id="contained-modal-title-vcenter"
            style={{ width: "100%" }}
          >
            ⚙ Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Content</Modal.Body>
      </Modal>
    );
  }
}

export default SettingModal;
