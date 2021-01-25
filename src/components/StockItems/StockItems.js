import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        margin: 0,
    },
    chip: {
        margin: theme.spacing(0.5),
    },
}));

export default function ChipsArray(props) {
    const classes = useStyles();

    return (
        <Paper component="ul" className={classes.root}>
            {
                props.matchedData.reduce((prev, cur)=>{
                    const newData = cur.data.map((finaceData) => {
                        const dateOnly = finaceData.date.substring(0,10);
                        const matchType = finaceData.toBuyMany ? '大買' : 
                        finaceData.matched_buy ? '買' :
                        finaceData.toSellMany ? '大賣' : 
                        finaceData.matched_sell ? '賣' : '';
                        return (
                            <li key={`${cur.code} - ${cur.name} @ ${dateOnly}`}>
                                <Chip
                                    avatar={<Avatar>{matchType}</Avatar>}
                                    label={`${cur.code} - ${cur.name} @ ${dateOnly}`}
                                    className={classes.chip}
                                    onClick={()=>{props.clicked(cur.code, finaceData.date, cur.country)}}
                                    color={finaceData.matched_buy ? 'primary' :
                                    finaceData.matched_sell ? 'secondary' : undefined
                                    }
                                    clickable
                                />
                            </li>
                        );
                    })
                    return prev.concat([...newData]);
                },[])
            }
        </Paper>
    );
}
