import React from "react";
import ReactDOM from "react-dom";
import "../resource/vendor/bootstrap/css/bootstrap.min.css";
import "../resource/css/simple-sidebar.css";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
const { ipcRenderer } = window.require("electron");
let nodeIdIndex = 1;

class SideBar extends React.Component {
  state = {};

  /* renderTreeItems = (treeDirArr) =>
    treeDirArr.map((item) => {
      console.log("render index:" + nodeIdIndex);
      console.log("render item: " + item);
      nodeIdIndex = nodeIdIndex + 1;
      if (item.type === "directory") {
        return (
          <TreeItem
            key={nodeIdIndex + ""}
            nodeId={nodeIdIndex + ""}
            label={item.name}
          >
            {() => this.renderTreeItems(item.children)}
          </TreeItem>
        );
      }
      return (
        <TreeItem
          key={nodeIdIndex + ""}
          nodeId={nodeIdIndex + ""}
          label={item.name}
        />
      );
    }); */

  render() {
    let treeDirArr = [];
    for (let i in this.props.treeDir.children) {
      treeDirArr.push(this.props.treeDir.children[i]);
    }
    return (
      <div className="bg-light border-right" id="sidebar-wrapper">
        <div className="sidebar-heading"> </div>
        <TreeView
          className="treeview"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {treeDirArr.map((item) => {
            nodeIdIndex = nodeIdIndex + 1;
            if (item.type === "directory") {
              return (
                <TreeItem
                  key={nodeIdIndex + ""}
                  nodeId={nodeIdIndex + ""}
                  label={item.name}
                >
                  {item.children.map((item) => {
                    nodeIdIndex = nodeIdIndex + 1;
                    if (item.type === "directory") {
                      return (
                        <TreeItem
                          key={nodeIdIndex + ""}
                          nodeId={nodeIdIndex + ""}
                          label={item.name}
                        >
                          {() => this.renderTreeItems(item.children)}
                        </TreeItem>
                      );
                    }
                    return (
                      <TreeItem
                        key={nodeIdIndex + ""}
                        nodeId={nodeIdIndex + ""}
                        label={item.name}
                        onClick={() => this.props.onReadFile(item)}
                      />
                    );
                  })}
                </TreeItem>
              );
            }
            return (
              <TreeItem
                key={nodeIdIndex + ""}
                nodeId={nodeIdIndex + ""}
                label={item.name}
                onClick={() => this.props.onReadFile(item)}
              />
            );
          })}
        </TreeView>
      </div>
    );
  }
}

export default SideBar;
