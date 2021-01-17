import React from 'react';
import classes from './Form.module.css'

const form = props => {



    return <div className={classes.Form}>
        <h2>Stock Selector</h2>
        <form className={classes.FormContent}>
            <div>
                <label >Stock:</label>
                <input type='text' name='stockNo' value={props.searchParams.stockNo} onChange={props.changed} ></input>
                <label >Average:</label>
                <input type='number' name='average' value={props.searchParams.avg} onChange={props.changed} ></input>
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

export default form;