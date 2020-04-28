import React, {Component} from 'react';
import classes from './LineChart.module.css';

const Chart = require('chart.js');
Chart.defaults.global.defaultFontSize = 12
Chart.defaults.global.defaultFontFamily = "Roboto, sans-serif";

class LineChart extends Component {
    constructor(props) {
      super(props);
      this.chartRef = React.createRef();
    }
  
    componentDidUpdate() {
      this.myChart.data.labels = this.props.data.map(d => d.time);
      this.myChart.data.datasets[0].data = this.props.data.map(d => d.value);
      this.myChart.update();
    }
  
    componentDidMount() {
      this.myChart = new Chart(this.chartRef.current, {
        type: 'line',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                type: 'time',
                time: {
                  unit: 'week'
                }
              }
            ],
            yAxes: [
              {
                ticks: {
                  min: 0
                }
              }
            ]
          },
        },
        data: {
          labels: this.props.data.map(d => d.time),
          datasets: [{
            label: this.props.title,
            data: this.props.data.map(d => d.value),
            fill: 'none',
            backgroundColor: this.props.color,
            pointRadius: 2,
            borderColor: this.props.color,
            borderWidth: 2,
            lineTension: 0
          }]
        }
      });
    }
  
    render() {
      return (
            <div className={classes.Chart}>
                <canvas ref={this.chartRef} />
            </div>
        )
    }
  }

  export default LineChart;