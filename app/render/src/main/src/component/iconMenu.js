import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ButtonGroup, Image } from "react-bootstrap";
import pageIcon from "../resource/icons/page.png";
import graphIcon from "../resource/icons/graph.png";
import { VscFolderOpened, VscSettings, VscSearch } from "react-icons/vsc";
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
            <VscFolderOpened size={30} />
          </Button>
          <Button
            variant="light"
            size="sm"
            style={{ marginTop: "10px" }}
            onClick={() => this.props.onGraphShow()}
          >
            <Image src={graphIcon} />
          </Button>
          <Button
            variant="light"
            size="sm"
            style={{ marginTop: "10px" }}
            onClick={() => this.props.onSearchShow()}
          >
            <VscSearch size={30} />
          </Button>
          <Button
            variant="light"
            size="sm"
            style={{ marginTop: "10px" }}
            onClick={() => this.props.onSettingShow()}
          >
            <VscSettings size={30} />
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

export default IconMenu;
