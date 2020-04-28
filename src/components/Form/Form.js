import React from 'react';
import classes from './Form.module.css'

const form = props => {
    return <div className={classes.Form}>
        <h2>Stock Selector</h2>
        <form className={classes.FormContent}>
            <div>
                <label >Stock:</label>
                <input type='text' name='stockNo' value={props.stock} onChange={props.changed} placeholder='2317'></input>
            </div>
            <div>
                <label>Date From:</label>
                <input type='date' name='from' value={props.from} onChange={props.changed}></input>
            </div>
            <div>
                <label>Date To:</label>
                <input type='date' name='to' value={props.to} onChange={props.changed}></input>
            </div>
            <div>
                <button onClick={props.onQuery}>OK</button>
            </div>
            
        </form>
    </div>
}

export default form;