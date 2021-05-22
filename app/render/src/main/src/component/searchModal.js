import { Component } from "react";
import {
  Modal,
  InputGroup,
  FormControl,
  ListGroup,
  Badge,
  Container,
  Row,
  Col,
} from "react-bootstrap";

class SearchModal extends Component {
  state = {
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
    console.log("searchResult: ", this.props.searchResult);
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
            {this.props.searchResult.map((item) => {
              let level = "";
              if (item._score > 9) level = "success";
              else if (item._score > 6) level = "primary";
              else level = "secondary";
              return (
                <ListGroup.Item
                  action
                  key={this.state.listKey++}
                  onClick={() => this.props.onReadFile(item._source)}
                >
                  <Container>
                    <Row>
                      <Col sm={4}>
                        {item._source.name} {"  "}
                      </Col>
                      <Col sm={1}>
                        <Badge variant="light">路径: {item._source.path}</Badge>
                        <Badge variant={level}>匹配度: {item._score}</Badge>
                      </Col>
                    </Row>
                  </Container>
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
