import React, { Component } from "react";
import ReactECharts from "echarts-for-react";

class Graph extends Component {
  constructor(props) {
    super(props);
  }

  onClick = {
    click: this.handleClick.bind(this),
  };

  handleClick(e) {
    console.log(e);
  }

  render() {
    let linkRelation = this.props.linkRelation;
    let legendData = [];
    for (let i in linkRelation.categories) {
      legendData.push(linkRelation.categories[i].name);
    }
    const option = {
      title: {
        text: "知识图谱",
        top: "bottom",
        left: "right",
      },
      legend: [
        {
          data: legendData,
        },
      ],
      animationDuration: 1500,
      animationEasingUpdate: "quinticInOut",
      series: [
        {
          // name: "Les Miserables",
          type: "graph",
          layout: "force",
          focusNodeAdjacency: true,
          roam: true,
          force: {
            repulsion: 500,
            edgeLength: [100, 200],
          },
          draggable: true,
          data: linkRelation.nodes,
          links: linkRelation.links,
          categories: linkRelation.categories,
          roam: true,
          label: {
            position: "right",
            formatter: "{b}",
          },
          lineStyle: {
            color: "source",
            curveness: 0.3,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 10,
            },
          },
        },
      ],
    };
    return (
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        onEvents={this.onClick}
      />
    );
  }
}

export default Graph;
