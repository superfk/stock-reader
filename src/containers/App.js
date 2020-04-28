import React, { Component } from 'react';
import Form from '../components/Form/Form';
import LineChart from '../components/LineChart/LineChart'
import classes from './App.module.css';

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

// const data = {
//   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//   datasets: [
//     {
//       label: 'My First dataset',
//       fill: false,
//       lineTension: 0.1,
//       backgroundColor: 'rgba(75,192,192,0.4)',
//       borderColor: 'rgba(75,192,192,1)',
//       borderCapStyle: 'butt',
//       borderDash: [],
//       borderDashOffset: 0.0,
//       borderJoinStyle: 'miter',
//       pointBorderColor: 'rgba(75,192,192,1)',
//       pointBackgroundColor: '#fff',
//       pointBorderWidth: 1,
//       pointHoverRadius: 5,
//       pointHoverBackgroundColor: 'rgba(75,192,192,1)',
//       pointHoverBorderColor: 'rgba(220,220,220,1)',
//       pointHoverBorderWidth: 2,
//       pointRadius: 1,
//       pointHitRadius: 10,
//       data: [65, 59, 80, 81, 56, 55, 40]
//     }
//   ]
// };


class App extends Component {

  state = {

    searchParams: {
      stockNo: '',
      from: '2020-01-01',
      to: '2020-12-31'
    },

    stockData: {data:[{time:'', value:''}], title:'stock'}

  };

  formChangeHandler = (event)=>{
    let targetName = event.target.name;
    let targetValue = event.target.value;
    if(targetName==='stockNo'){
      this.setState({
        searchParams: {
          stockNo: targetValue,
          from: this.state.searchParams.from,
          to: this.state.searchParams.to
        },
      })
    }else if (targetName==='from'){
      this.setState({
        searchParams: {
          stockNo:  this.state.searchParams.stockNo,
          from: targetValue,
          to: this.state.searchParams.to
        },
      })
    }else if (targetName==='to'){
      this.setState({
        searchParams: {
          stockNo:  this.state.searchParams.stockNo,
          from: this.state.searchParams.from,
          to: targetValue
        },
      })
    }

  }

  searchHandler = (event) => {
    event.preventDefault();
    ipcRenderer.once('update-query-stock', (event,resp)=>{
      if (resp){
        let newData = resp.map( elm => {
          return {time:elm.time_stamp, value:elm.close}
        } );
        this.setState({
          stockData: {
            title: 'stock',
            data: newData
          }
        })
      }
    })
    ipcRenderer.send('request-get-stock',this.state.searchParams);
    
  };

  render() {
    return (
      <div className={classes.App}>
        <div className={classes.flex1}>
          <Form 
            stock={this.state.searchParams.stockNo}
            from={this.state.searchParams.from}
            to={this.state.searchParams.to}
            changed={(event)=>{this.formChangeHandler(event)}}
            onQuery={this.searchHandler}>
          </Form>
        </div>
        <div className={classes.flex2}>
          <LineChart
            data={this.state.stockData.data}
            title={this.state.stockData.title}
            color="#3E517A"
          />
        </div>
      </div>
    );
  }

}

export default App;
