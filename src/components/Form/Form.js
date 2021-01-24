import React, { useState, useEffect } from 'react';
import classes from './Form.module.css'

const Form = props => {

    const [options, setOptions] = useState([]);
    useEffect(() => {
        const stksOptions = props.stocks.map(elm=>{
            return <option key={elm.code} value={elm.code}>{elm.code} - {elm.name}</option>
        })
        setOptions(stksOptions)
    }, [props.stocks])

    return <div className={classes.Form}>
        <h2>Stock Selector</h2>
        <form className={classes.FormContent}>
            <div>
                <label >Stock:</label>
                {/* <input type='text' name='stockNo' value={props.searchParams.stockNo} onChange={props.changed} ></input> */}
                <select name='stockNo' value={props.searchParams.stockNo} onChange={props.changed}>
                    {options}
                </select>
                <label >Average:</label>
                <input type='number' name='average' value={props.searchParams.avg} onChange={props.changed} ></input>
                <label >KD Baseline:</label>
                <input type='number' name='kd' value={props.searchParams.kd} onChange={props.changed} ></input>
                <label >RSI:</label>
                <input type='number' name='rsi' value={props.searchParams.rsi} onChange={props.changed} ></input>
                <label >Slope Interval:</label>
                <input type='number' name='slope' value={props.searchParams.slope} onChange={props.changed} ></input>
                <label >Slope Baseline:</label>
                <input type='number' name='slope_baseline' value={props.searchParams.slope_baseline} onChange={props.changed} ></input>
                <div>
                    <label style={{ width: 100 }}>選擇股市:</label>
                    <label style={{ width: 80 }}><input type="radio" name="country" value="tw" onChange={props.changed} checked={props.searchParams.country === 'tw'} style={{ maxWidth: 20 }} />台股</label>
                    <label style={{ width: 80 }}><input type="radio" name="country" value="us" onChange={props.changed} checked={props.searchParams.country === 'us'} style={{ maxWidth: 20 }} />美股</label>
                </div>
            </div>
            <div>
                <label>Date From:</label>
                <input type='date' name='from' value={props.searchParams.from} onChange={props.changed}></input>
            </div>
            <div>
                <label>Date To:</label>
                <input type='date' name='to' value={props.searchParams.to} onChange={props.changed}></input>
            </div>
            <div>
                <button onClick={props.onQuery}>OK</button>
            </div>

        </form>
    </div>
}

export default Form;