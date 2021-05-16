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
    searchValue: "",
    listKey: 1,
  };
  constructor(props) {
    super(props);
  }

  handleChange(event) {
    console.log("handleChange");
    const key = event.target.value;
    this.setState({ searchValue: key });
  }

  render() {
    let searchResultArr = [];
    for (let i in this.props.searchResult) {
      searchResultArr.push(this.props.searchResult[i]);
    }
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
              <FormControl
                placeholder="Search"
                value={this.state.searchValue}
                onChange={(event) => {
                  this.handleChange(event);
                  this.props.onSearch(event);
                }}
              />
            </InputGroup>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {searchResultArr.map((item) => {
              return (
                <ListGroup.Item
                  action
                  key={this.state.listKey++}
                  onClick={() => this.props.onReadFile(item)}
                >
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
