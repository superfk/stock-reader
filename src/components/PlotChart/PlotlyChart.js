import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const PlotlyChart = props => {

    const [data, setData] = useState([]);

    useEffect(() => {

        var raw = {

            x: props.data.map(elm => elm.index),
            close: props.data.map(elm => elm.close),
            decreasing: { line: { color: 'green' } },
            high: props.data.map(elm => elm.high),
            increasing: { line: { color: 'red' } },
            line: { color: 'rgba(31,119,180,1)' },
            low: props.data.map(elm => elm.low),
            open: props.data.map(elm => elm.close),
            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y',
            name: 'raw'
        };
        var avg_5 = {
            x: props.data.map(elm => elm.index),
            y: props.data.map(elm => elm.avg_5),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'rgba(0, 0, 255, 0.603)', size: 1 },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 1
            },
            name: '周線(avg5)'
        };
        var avg_20 = {
            x: props.data.map(elm => elm.index),
            y: props.data.map(elm => elm.avg_20),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'rgba(255, 0, 179, 0.603)', size: 1 },
            line: {
                color: 'rgba(255, 0, 179, 0.603)',
                width: 1
            },
            name: '月線(avg20)'
        };

        setData([raw, avg_5, avg_20])

    }, [props.data])

    return (
        <Plot
            style={{ width: undefined, height: undefined }}
            data={data}
            layout={
                {
                    dragmode: 'zoom',
                    margin: {
                        r: 50,
                        t: 25,
                        b: 40,
                        l: 60
                    },
                    showlegend: true,
                    xaxis: {
                        autorange: true,
                        domain: [0, 1],
                        title: 'Date',
                        type: 'date'
                    },
                    yaxis: {
                        autorange: true,
                        domain: [0, 1],
                        type: 'linear'
                    }
                }
            }
            config={{ responsive: true }}
        />
    );
}

export default PlotlyChart;