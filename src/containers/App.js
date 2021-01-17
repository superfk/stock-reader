import React, { Component } from 'react';
import Form from '../components/Form/Form';
import PlotlyChart from '../components/PlotChart/PlotlyChart';
import classes from './App.module.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


class App extends Component {

  state = {

    searchParams: {
      stockNo: '2317',
      avg: '5',
      country: 'tw',
      from: '2019-01-01',
      to: '2021-12-31'
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
          ...this.state.searchParams,
          stockNo: targetValue
        },
      })
    } else if (targetName === 'average') {
      this.setState({
        searchParams: {
          ...this.state.searchParams,
          avg: targetValue
        },
      })
    } else if (targetName === 'country') {
      this.setState((state, props) => {
        return {
          searchParams: {
            ...this.state.searchParams,
            country: state.searchParams.country === 'tw' ? 'us' : 'tw'
          },
        }
      })
    } else if (targetName === 'from') {
      this.setState({
        searchParams: {
          ...this.state.searchParams,
          from: targetValue
        },
      })
    } else if (targetName === 'to') {
      this.setState({
        searchParams: {
          ...this.state.searchParams,
          to: targetValue
        },
      })
    }

  }

  searchHandler = (event) => {
    event.preventDefault();
    ipcRenderer.once('update-query-stock', (event, resp) => {
      if (resp) {
        this.setState({
          data: resp
        },()=>{
          window.dispatchEvent(new Event('resize'));
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
            searchParams={this.state.searchParams}
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
