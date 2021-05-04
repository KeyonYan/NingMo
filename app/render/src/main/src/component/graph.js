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
    const jsonData = {
      nodes: [
        {
          id: "0",
          name: "Myriel",
          symbolSize: 19.12381,
          x: -266.82776,
          y: 299.6904,
          value: 28.685715,
          category: 0,
        },
        {
          id: "1",
          name: "Napoleon",
          symbolSize: 2.6666666666666665,
          x: -418.08344,
          y: 446.8853,
          value: 4,
          category: 0,
        },
        {
          id: "2",
          name: "MlleBaptistine",
          symbolSize: 6.323809333333333,
          x: -212.76357,
          y: 245.29176,
          value: 9.485714,
          category: 1,
        },
      ],
      links: [
        {
          source: "0",
          target: "1",
        },
        {
          source: "0",
          target: "2",
        },
        {
          source: "1",
          target: "2",
        },
      ],
      categories: [
        {
          name: "类目0",
        },
        {
          name: "类目1",
        },
      ],
    };
    const option = {
      title: {
        text: "知识图谱",
        top: "bottom",
        left: "right",
      },
      legend: [
        {
          data: jsonData.categories.map(function (a) {
            return a.name;
          }),
        },
      ],
      animationDuration: 1500,
      animationEasingUpdate: "quinticInOut",
      series: [
        {
          name: "Les Miserables",
          type: "graph",
          layout: "none",
          data: jsonData.nodes,
          links: jsonData.links,
          categories: jsonData.categories,
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
        style={{ height: "700px", width: "100%" }}
        onEvents={this.onClick}
      />
    );
  }
}

export default Graph;
