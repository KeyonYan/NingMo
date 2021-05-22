import React, { Component } from "react";
import {
  Modal,
  InputGroup,
  FormControl,
  ListGroup,
  Button,
} from "react-bootstrap";

class SettingModal extends Component {
  state = {
    isClear: false,
  };
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
        <Modal.Body>
          {this.state.isClear ? (
            <Button variant="success" disabled>
              🗑 清空完毕
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={(event) => {
                this.props.onClearDatabase(event);
                if (!this.state.isClear) {
                  this.setState({ isClear: true });
                }
              }}
            >
              🗑 缓存清空
            </Button>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}

export default SettingModal;
