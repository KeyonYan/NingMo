import React, { Component } from "react";
import { Modal, InputGroup, FormControl, ListGroup } from "react-bootstrap";

class SearchModal extends Component {
  state = {
    pageList: [
      {
        name: "Page1",
        path: "E:\\Page1",
      },
      {
        name: "Page2",
        path: "E:\\Page2",
      },
    ],
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
            <InputGroup className="mb">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">🔍</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl placeholder="Search" />
            </InputGroup>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {this.state.pageList.map((item) => {
              return (
                <ListGroup.Item action>
                  {item.name} - {item.path}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SearchModal;