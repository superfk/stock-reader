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
            name: 'raw',
            showlegend: 'legendonly',
            visible: 'legendonly'
        };
        var rawWK = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.close_wk),
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'rgba(0, 0, 255, 0.7)', size: 0 },
            line: {
                color: 'rgba(235, 31, 255, 0.603)',
                width: 2
            },
            name: 'wk',
            showlegend: true,
        };
        var rawMO = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.close_mo),
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'rgba(0, 0, 255, 0.7)', size: 0 },
            line: {
                color: 'rgba(52, 44, 215, 0.603)',
                width: 2
            },
            name: 'mo',
            showlegend: true,
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
            name: 'K',
            showlegend: 'legendonly',
            visible: 'legendonly'
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
            name: 'D',
            showlegend: 'legendonly',
            visible: 'legendonly'
        };
        const RSI_5 = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.RSI_5),
            type: 'scatter',
            mode: 'lines',
            yaxis: 'y2',
            marker: { color: 'rgba(0, 0, 255, 0.7)', size: 0 },
            line: {
                color: 'rgba(123, 34, 212, 0.703)',
                width: 1
            },
            name: 'RSI_5',
            showlegend: 'legendonly',
            visible: 'legendonly'
        };
        const RSI_15 = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.RSI_15),
            type: 'scatter',
            mode: 'lines',
            yaxis: 'y2',
            marker: { color: 'rgba(0, 0, 255, 0.7)', size: 0 },
            line: {
                color: 'rgba(234, 25, 168, 0.603)',
                width: 1
            },
            name: 'RSI_15',
            showlegend: 'legendonly',
            visible: 'legendonly'
        };
        const slope = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.slope),
            type: 'scatter',
            mode: 'lines',
            yaxis: 'y4',
            marker: { color: 'rgba(53, 34 , 125, 0.6)', size: 0 },
            line: {
                color: 'rgba(53, 212 , 125, 0.4)',
                width: 3
            },
            name: 'Slope',
            showlegend: 'legendonly',
            visible: 'legendonly'
        };
        var toBuy = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toBuy) {
                    return elm.close_wk;
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
        var toBuyMany = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toBuyMany) {
                    return elm.close_wk;
                } else {
                    return null
                }
            }),
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: 'rgb(17, 157, 255)',
                opacity: 0.5,
                size: 20,
                line: {
                    color: 'rgb(231, 99, 250)',
                    width: 2
                }
            },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 5
            },
            name: 'to STRONGLY Buy'
        };

        var toBuy_RSI = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toBuy_RSI) {
                    return elm.close_wk;
                } else {
                    return null
                }
            }),
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'rgba(180,132,132,0.7)', size: 10 },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 5
            },
            name: 'to Buy RSI'
        };
        var toSell = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toSell) {
                    return elm.close_wk;
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
        var toSellMany = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toSellMany) {
                    return elm.close_wk;
                } else {
                    return null
                }
            }),
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: 'rgb(236,76,46)',
                opacity: 0.5,
                size: 20,
                line: {
                    color: 'rgb(21, 144, 233)',
                    width: 2
                }
            },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 5
            },
            name: 'to STRONGLY Sell'
        };
        var toSell_RSI = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => {
                if (elm.toSell_RSI) {
                    return elm.close_wk;
                } else {
                    return null
                }
            }),
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'rgba(214,72,186, 0.7)', size: 10 },
            line: {
                color: 'rgba(0, 0, 255, 0.603)',
                width: 5
            },
            name: 'to Sell RSI'
        };
        const volumes = {
            x: props.data.map(elm => elm.date),
            y: props.data.map(elm => elm.volume),
            type: 'bar',
            yaxis: 'y3',
            name: 'volume',
            marker: { color: 'rgb(89,214,72)', size: 10 },
        }

        setData([raw, rawWK, rawMO, K, D, RSI_5, RSI_15, slope, toBuy, toSell, volumes, toBuyMany, toBuy_RSI, toSellMany, toSell_RSI])

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
                    xaxis: {
                        autorange: true,
                        domain: [0, 0.95],
                        title: 'Date',
                        type: 'date'
                    },
                    yaxis: {
                        autorange: true,
                        type: 'linear',
                        title: 'close',
                        domain: [0.3, 1]
                    },
                    yaxis2: {
                        title: 'KD',
                        titlefont: { color: 'rgb(148, 103, 189)' },
                        tickfont: { color: 'rgb(148, 103, 189)' },
                        overlaying: 'y',
                        side: 'right',
                        domain: [0.3, 1],
                        anchor: 'x',
                        position: 0.9
                    },
                    yaxis3: {
                        title: 'Volume',
                        domain: [0, 0.2]
                    },
                    yaxis4: {
                        title: 'Weekly Slope',
                        titlefont: { color: 'rgb(148, 103, 189)' },
                        tickfont: { color: 'rgb(148, 103, 189)' },
                        overlaying: 'y',
                        side: 'right',
                        domain: [0.3, 1],
                        anchor: 'free',
                        position: 1
                    },
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