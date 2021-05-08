import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ButtonGroup, Image } from "react-bootstrap";
import pageIcon from "../resource/icons/page.png";
import graphIcon from "../resource/icons/graph.png";
// import '../resource/vendor/bootstrap/css/bootstrap.min.css';
class IconMenu extends React.Component {
  render() {
    return (
      <div
        style={{
          height: "100vh",
          marginLeft: "-15px",
          marginRight: "-15px",
          paddingTop: "10px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <ButtonGroup vertical>
          <Button
            variant="light"
            size="sm"
            onClick={() => this.props.onOpenDir()}
          >
            <Image src={pageIcon} />
          </Button>
          <Button variant="light" size="sm" style={{ marginTop: "10px" }}>
            <Image src={graphIcon} />
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

export default IconMenu;
