import React from "react";
import ReactDOM from "react-dom";
import "../resource/vendor/bootstrap/css/bootstrap.min.css";
import "../resource/css/simple-sidebar.css";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";

class SideBar extends React.Component {
  state = {};

  render() {
    let nodeIdIndex = 1;
    let treeDirArr = [];
    console.log("[SideBar]" + this.props.treeDir.children);
    for (let i in this.props.treeDir.children) {
      treeDirArr.push(this.props.treeDir.children[i]);
    }
    console.log(treeDirArr);
    return (
      <div className="bg-light border-right" id="sidebar-wrapper">
        <div className="sidebar-heading">New Page</div>
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
                  nodeId={nodeIdIndex + ""}
                  key={nodeIdIndex + ""}
                  label={item.name}
                >
                  {item.children.map((subItem) => {
                    nodeIdIndex = nodeIdIndex + 1;
                    return (
                      <TreeItem
                        nodeId={nodeIdIndex + ""}
                        key={nodeIdIndex + ""}
                        label={subItem.name}
                      />
                    );
                  })}
                </TreeItem>
              );
            } else {
              return (
                <TreeItem
                  nodeId={nodeIdIndex + ""}
                  key={nodeIdIndex + ""}
                  label={item.name}
                />
              );
            }
          })}
        </TreeView>
      </div>
    );
  }
}

export default SideBar;
