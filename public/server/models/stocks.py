#!/usr/bin/python

import sqlite3
import datetime
import os, traceback
import pandas as pd

class StockModel():
    def __init__(self, db_path):
        self.db = None
        self.db_path = db_path
    
    def connect(self):
        self.db = sqlite3.connect(self.db_path)
    
    def close(self):
        self.db.close()

    def dict_factory(self, cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    def get_by_stockNo(self,fromDate,toDate, avg=1):
        try:
            self.connect()
            self.db.row_factory = self.dict_factory
            cur = self.db.cursor()
            cur.execute('''
            SELECT * from stock_price WHERE "index" >= "{}" AND "index" <= "{}" order by "index"
            '''.format(fromDate,toDate))
            rows = cur.fetchall()
            df = pd.DataFrame(rows)
            df = self.remove_duplicate(df)
            df_avg_5 = self.moving_average(df, 5)
            df_avg_20 = self.moving_average(df, 20)
            df[f"avg_{5}"] = df_avg_5.values
            df[f"avg_{20}"] = df_avg_20.values
            data = df.to_dict(orient='records')
            self.close()
            return data

        except Exception as e:
            error_msg = traceback.format_exc()
            print(error_msg)

    def remove_duplicate(self,df):
        df = df.drop_duplicates(subset=['index'], keep='first')
        return df
    
    def moving_average(self,df, average=1):
        avg_data = df.close.rolling(window=average, min_periods=1).mean()
        return avg_data

if __name__ == '__main__':
    dbPath = r'Z:\share\database'
    db_path = os.path.join(dbPath,'tw_2301'+'.db')
    stock = StockModel(db_path)
    recs = stock.get_by_stockNo('2017-01-01', '2019-12-01')
    print(recs)