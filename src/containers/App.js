import React, { Component } from 'react';
import Form from '../components/Form/Form';
import PlotlyChart from '../components/PlotChart/PlotlyChart';
import classes from './App.module.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


class App extends Component {

  state = {

    searchParams: {
      stockNo: '',
      from: '2020-01-01',
      to: '2020-12-31'
    },

    stockData: { data: [{ time: '', value: '' }], title: 'stock' },
    data: [],

  };

  formChangeHandler = (event) => {
    let targetName = event.target.name;
    let targetValue = event.target.value;
    if (targetName === 'stockNo') {
      this.setState({
        searchParams: {
          stockNo: targetValue,
          from: this.state.searchParams.from,
          to: this.state.searchParams.to
        },
      })
    } else if (targetName === 'from') {
      this.setState({
        searchParams: {
          stockNo: this.state.searchParams.stockNo,
          from: targetValue,
          to: this.state.searchParams.to
        },
      })
    } else if (targetName === 'to') {
      this.setState({
        searchParams: {
          stockNo: this.state.searchParams.stockNo,
          from: this.state.searchParams.from,
          to: targetValue
        },
      })
    }

  }

  // searchHandler = (event) => {
  //   event.preventDefault();
  //   ipcRenderer.once('update-query-stock', (event, resp) => {
  //     if (resp) {
  //       let newData = resp.map(elm => {
  //         return { time: elm.time_stamp, value: elm.close }
  //       });
  //       this.setState({
  //         stockData: {
  //           title: 'stock',
  //           data: newData
  //         }
  //       })
  //     }
  //   })
  //   ipcRenderer.send('request-get-stock', this.state.searchParams);

  // };

  searchHandler = (event) => {
    event.preventDefault();
    ipcRenderer.once('update-query-stock', (event, resp) => {
      if (resp) {
        this.setState({
          data: resp
        })
      }
    })
    ipcRenderer.send('request-get-stock', this.state.searchParams);

  };

  render() {

    return (
      <div className={classes.App}>
        <div className={classes.flex1}>
          <Form
            stock={this.state.searchParams.stockNo}
            from={this.state.searchParams.from}
            to={this.state.searchParams.to}
            changed={(event) => { this.formChangeHandler(event) }}
            onQuery={this.searchHandler}>
          </Form>
        </div>
        <div className={classes.flex2}>
          {/* <LineChart
            data={this.state.stockData.data}
            title={this.state.stockData.title}
            color="#3E517A"
          /> */}
          <PlotlyChart data={this.state.data} />
        </div>
      </div>
    );
  }

}

export default App;
