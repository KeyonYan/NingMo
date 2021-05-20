import React from "react";
import "../resource/vendor/bootstrap/css/bootstrap.min.css";
import "../resource/css/simple-sidebar.css";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
// import { Treebeard } from "react-treebeard";
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
  /* componentDidMount() {
    document.addEventListener("contextmenu", this._handleContextMenu);
  }

  componentWillUnmount() {
    document.removeEventListener("contextmenu", this._handleContextMenu);
  } */

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
