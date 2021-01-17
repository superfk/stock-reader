import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const PlotlyChart = props => {

    const [data, setData] = useState([]);

    useEffect(() => {
        var raw = {
            x: props.data.map(elm => elm.date),
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
        const K = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.K),
            type: 'scatter',
            mode: 'lines',
            yaxis: 'y2',
            marker: { color: 'rgba(0, 0, 255, 0.7)', size: 0 },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 1
            },
            name: 'K'
        };
        const D = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.D),
            type: 'scatter',
            mode: 'lines',
            yaxis: 'y2',
            marker: { color: 'rgba(0, 0, 255, 0.7)', size: 0 },
            line: {
                color: 'rgba(0, 238, 168, 0.603)',
                width: 1
            },
            name: 'D'
        };
        var toBuy = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toBuy) {
                    return elm.close;
                } else {
                    return null
                }
            }),
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'rgbargb(40,72,241, 0.7)', size: 10 },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 5
            },
            name: 'to Buy'
        };

        var toSell = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toSell) {
                    return elm.close;
                } else {
                    return null
                }
            }),
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'rgba(211, 22, 22, 0.7)', size: 10 },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 5
            },
            name: 'to Sell'
        };
        const volumes = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.volume),
            type: 'bar',
            yaxis: 'y3',
            name: 'volume',
            marker: { color: 'rgb(89,214,72)', size: 10 },
        }

        setData([raw, K, D, toBuy, toSell, volumes])

    }, [props.data])

    return (
        <Plot
            style={{ width: '100%', height: '100%' }}
            data={data}
            layout={
                {
                    height: undefined,
                    width: undefined,
                    dragmode: 'zoom',
                    margin: {
                        r: 80,
                        t: 25,
                        b: 40,
                        l: 60,
                        pad: 5
                    },
                    legend: { "orientation": "h", x: 0, xanchor: 'left', y: 1.2, yanchor: 'top' },
                    autosize: true,
                    showlegend: true,
                    xaxis: {
                        autorange: true,
                        domain: [0, 1],
                        title: 'Date',
                        type: 'date'
                    },
                    yaxis: {
                        autorange: true,
                        type: 'linear',
                        title: 'close',
                        domain: [0.4, 1]
                    },
                    yaxis2: {
                        title: 'KD',
                        titlefont: { color: 'rgb(148, 103, 189)' },
                        tickfont: { color: 'rgb(148, 103, 189)' },
                        overlaying: 'y',
                        side: 'right',
                        domain: [0.4, 1]
                    },
                    yaxis3: {
                        title: 'Volume',
                        domain: [0, 0.3]
                    }
                }
            }
            config={{
                responsive: false,
                displaylogo: false,
            }}
            useResizeHandler
        />
    );
}

export default PlotlyChart;