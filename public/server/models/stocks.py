#!/usr/bin/python

import sqlite3
import datetime
import os
import pandas as pd

class StockModel():
    def __init__(self, db_path):
        self.db = None
        self.db_path = db_path
    
    def connect(self):
        print(self.db_path)
        self.db = sqlite3.connect(self.db_path)
    
    def close(self):
        self.db.close()

    def get_by_stockNo(self,fromDate,toDate):
        try:
            self.connect()
            c = self.db.cursor()
            cursor = c.execute('''
            SELECT "index", amount, close from stock_price WHERE "index" >= "{}" AND "index" <= "{}"
            '''.format(fromDate,toDate))
            records = []
            for row in cursor:
                record = {}
                if type(row[0]) is object:
                    record['time_stamp'] = datetime.datetime.strftime(row[0],'%c')
                else:
                    record['time_stamp'] = row[0]
                record['amount'] = row[1]
                record['close'] = row[2]
                records.append(record)
            data = self.remove_duplicate(records)
            self.close()
            return data

        except Exception as e:
            print('database connection error')
            return None

    def remove_duplicate(self,data):
        df = pd.DataFrame(data)
        print(df)
        df = df.drop_duplicates(subset=['time_stamp'], keep='first')
        return df.to_dict(orient='records')

if __name__ == '__main__':
    dbPath = r'Z:\share\database'
    db_path = os.path.join(dbPath,'tw_2317'+'.db')
    stock = StockModel(db_path)
    recs = stock.get_by_stockNo('2020-01-01', '2020-05-01')
    print(recs)