#!/usr/bin/python

import sqlite3
import datetime, time, random
import os, traceback
import pandas as pd
from pandas_datareader import data as web
import config as cfg

class StockModel():
    def __init__(self, db_path, configPath):
        self.db = None
        self.db_path = db_path
        self.columns = ['date', 'high', 'low', 'open',
                        'close', 'volume', 'adj_close']
        self.financeType = 'yahoo'
        self.configPath = configPath
        self.startDate = cfg.get_dates(configPath)['start']
        self.endDate = cfg.get_dates(configPath)['end']
    
    def connect(self):
        self.db = sqlite3.connect(self.db_path)
        self.cursor = self.db.cursor()
        sql_str = '''
                CREATE TABLE IF NOT EXISTS stock_price (
                    "date" TIMESTAMP PRIMARY KEY,
                    volume INTEGER,
                    open REAL,
                    high REAL,
                    low REAL,
                    close REAL,
                    adj_close REAL,
                    stockno TEXT,
                    month INTEGER
                );
                '''
        self.cursor.execute(sql_str)
        self.db.commit()
    
    def close(self):
        self.db.close()

    def dict_factory(self, cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    def get_by_stockNo(self,fromDate,toDate):
        try:
            self.connect()
            self.db.row_factory = self.dict_factory
            cur = self.db.cursor()
            cur.execute('''
            SELECT * from stock_price WHERE "date" >= "{}" AND "date" <= "{}" order by "date"
            '''.format(fromDate,toDate))
            rows = cur.fetchall()
            df = pd.DataFrame(rows)
            df = self.remove_duplicate(df)
            data = df.to_dict(orient='records')
            self.close()
            return data

        except Exception as e:
            error_msg = traceback.format_exc()
            self.close()
            print(error_msg)

    def remove_duplicate(self,df):
        df = df.drop_duplicates(subset=['date'], keep='first')
        return df
    
    def moving_average(self,df, average=1):
        avg_data = df.close.rolling(window=average, min_periods=1).mean()
        return avg_data
    
    def get_stock_history(self, stockNo, startDate, endDate=None, country='tw'):
        stockNoCode = stockNo
        if country == 'tw':
            stockNoCode = f"{stockNo}.tw"
            try:
                df = web.DataReader(f"{stockNoCode}", 'yahoo',
                                start=startDate, end=endDate)
                                
                df.reset_index(inplace=True)
                
                return df
            except:
                stockNoCode = f"{stockNo}.two"
                df = web.DataReader(f"{stockNoCode}", 'yahoo',
                                start=startDate, end=endDate)
                                
                df.reset_index(inplace=True)
                
                return df
        else:
            try:
                df = web.DataReader(f"{stockNoCode}", 'yahoo',
                                start=startDate, end=endDate)
                                
                df.reset_index(inplace=True)
                
                return df
            except:
                print('Not Found Stock No.')
        
    def arrange(self, df, stock_no):
        df.columns = self.columns
        stock = [str(stock_no) for i in range(len(df))]
        # 新增股票代碼欄，之後所有股票進入資料表才能知道是哪一張股票
        df['stockno'] = pd.Series(stock, index=df.index)
        # datelist = [df['date'][i] for i in range(len(df))]
        # df.index = datelist  # 索引值改成日期
        # s2 = df.drop(['date'], axis=1)  # 刪除日期欄位
        mlist = [x.month for x in df['date']]
        df['month'] = mlist  # 新增月份欄位
        return df
    
    def run(self, stockNo, country='tw'):
        self.connect()
        startT = time.time()
        maxReqCounts = 3
        reqCounts = 3
        success = False
        while True:
            try:
                print(f'running {stockNo} {country} stock')
                result = self.get_stock_history(
                    stockNo=stockNo, startDate=self.startDate, endDate=self.endDate, country=country)
                result = self.arrange(result, stockNo)

                sql_str = '''
                Select * FROM stock_price WHERE `date` >= '{}'
                '''.format(result.index[0])

                df_in_db = pd.read_sql(sql_str, self.db)
                
                remain_df = self.removeDuplicate(result, df_in_db)
                
                # print(remain_df)
                remain_df.to_sql(
                    name='stock_price', con=self.db, if_exists='append', chunksize=250)
                
                endT = time.time()
                exeT = endT - startT
                print(f'finished {stockNo} {country} stock, executed time is {exeT}')
                success = True
                break
            except:
                errorMsg = traceback.format_exc()
                print('')
                print(f'{errorMsg}')
            finally:
                if reqCounts < maxReqCounts:
                    reqCounts += 1
                else:
                    reqCounts = 0
                    break
        self.close()
        return success
        
    def removeDuplicate(self, df_new, df_in_db):
        df_new.reset_index(inplace=True)
        df_new['date'] = pd.to_datetime(df_new['date']).dt.strftime('%Y-%m-%d %H:%M:%S')
        df_in_db.reset_index()
        df_in_db = df_in_db.append(df_new, sort=False, ignore_index=True)
        df_in_db.drop_duplicates(subset=["date"],
                                 keep=False, inplace=True)
        df_in_db.set_index('date', inplace=True)
        df_in_db = df_in_db.drop(['index'], axis=1)
        return df_in_db


if __name__ == '__main__':
    dbPath = r'C:\database'
    db_path = os.path.join(dbPath,'yahoo','us','us_0050.db')
    stock = StockModel(db_path)
    recs = stock.get_by_stockNo('2017-01-01', '2019-12-01')
    # stock.get_stock_names()
