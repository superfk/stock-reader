import React, { Component } from 'react';
import Form from '../components/Form/Form';
import PlotlyChart from '../components/PlotChart/PlotlyChart';
import StockItems from '../components/StockItems/StockItems';
import classes from './App.module.css';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}


class App extends Component {

  state = {

    searchParams: {
      stockNo: '2317',
      avg: '5',
      kd: '20',
      slope: '5',
      slope_baseline: '0',
      rsi: '35',
      country: 'tw',
      from: '2019-01-01',
      to: '2021-12-31'
    },

    stockData: { data: [{ time: '', value: '' }], title: 'stock' },
    data: [],
    filteredData: [],
    stockNames: [], // [{'code': code, 'country': country, 'name': name}]
    isLoading: false,
    updateMsg: '',

  };

  componentDidMount() {
    const onGetStockNames = (event, data) => {
      this.setState({
        stockNames: data
      })
    }
    const onUpdateMsg = (event, data) => {
      this.setState({
        updateMsg: data,
      })
    }
    ipcRenderer.on('reply_stock_names', onGetStockNames)
    ipcRenderer.on('reply_updateAllRealTime', onUpdateMsg)
    ipcRenderer.send('getStockNames');
    return () => {
      ipcRenderer.removeListener('reply_stock_names', onGetStockNames)
      ipcRenderer.removeListener('reply_updateAllRealTime', onUpdateMsg)
    }
  }

  formChangeHandler = (event) => {
    let targetName = event.target.name;
    let targetValue = event.target.value;
    if (targetName === 'stockNo') {
      const coty = this.state.stockNames.find(elm=>elm.code===targetValue);
      if (coty !== undefined){
        this.setState({
          searchParams: {
            ...this.state.searchParams,
            stockNo: targetValue,
            country: coty.country
          },
        })
      }
      
    } else if (targetName === 'average') {
      this.setState({
        searchParams: {
          ...this.state.searchParams,
          avg: targetValue
        },
      })
    } else if (targetName === 'kd') {
      this.setState((state, props) => {
        return {
          searchParams: {
            ...this.state.searchParams,
            kd: state.searchParams.kd = targetValue
          },
        }
      })
    } else if (targetName === 'slope') {
      this.setState((state, props) => {
        return {
          searchParams: {
            ...this.state.searchParams,
            slope: state.searchParams.slope = parseInt(targetValue) < 2 ? '2' : targetValue
          },
        }
      })
    } else if (targetName === 'slope_baseline') {
      this.setState((state, props) => {
        return {
          searchParams: {
            ...this.state.searchParams,
            slope_baseline: state.searchParams.slope_baseline = targetValue
          },
        }
      })
    } else if (targetName === 'rsi') {
      this.setState((state, props) => {
        return {
          searchParams: {
            ...this.state.searchParams,
            rsi: state.searchParams.rsi = targetValue
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
    try {

      event.preventDefault();
    } catch (err) {

    }
    ipcRenderer.once('update-query-stock', (event, resp) => {
      if (resp) {
        this.setState({
          data: resp
        }, () => {
          window.dispatchEvent(new Event('resize'));
        })
      }
    })
    ipcRenderer.send('request-get-stock', this.state.searchParams);

  };
  onFilterAll = (event) => {
    try {
      event.preventDefault();
    } catch (err) {

    }
    ipcRenderer.once('reply_filterAll', (event, resp) => {
      if (resp) {
        this.setState({
          filteredData: resp,
          isLoading: false
        }, () => {
        })
      }
    })
    this.setState({isLoading: true},()=>{
      ipcRenderer.send('filterAll', this.state.searchParams);
    })
  }

  onUpdateAll = (event) => {
    try {
      event.preventDefault();
    } catch (err) {

    }
    ipcRenderer.once('reply_updateAll', (event, resp) => {
      this.setState({
        isLoading: false,
      })
    })
    this.setState({isLoading: true},()=>{
      ipcRenderer.send('updateAll');
    })
  }
  filterDataClicked = (code, date, country) => {
    const now = new Date();
    const fromDate = new Date();
    const middleDate = new Date(formatDate(date));
    fromDate.setDate(middleDate.getDate() - 730);
    const curParams = {
      ...this.state.searchParams,
      stockNo: code,
      country: country,
      from: fromDate.toISOString().substring(0, 10),
      to: now.toISOString().substring(0, 10)
    };
    this.setState({
      searchParams: curParams
    })

    ipcRenderer.once('update-query-stock', (event, resp) => {
      if (resp) {
        this.setState({
          data: resp
        }, () => {
          window.dispatchEvent(new Event('resize'));
        })
      }
    })
    ipcRenderer.send('request-get-stock', curParams);
  }
  

  render() {

    return (
      <div className={classes.App}>
        <div className={classes.flex1}>
          <Form
            stocks={this.state.stockNames}
            searchParams={this.state.searchParams}
            changed={(event) => { this.formChangeHandler(event) }}
            onQuery={this.searchHandler}
            onFilterAll={this.onFilterAll}
            onUpdateAll={this.onUpdateAll}
            isLoading={this.state.isLoading}
            updateMsg={this.state.updateMsg}
            >
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
        <div className={classes.flex3}>
          <StockItems matchedData={this.state.filteredData} clicked={this.filterDataClicked} />
        </div>
      </div>
    );
  }

}

export default App;
