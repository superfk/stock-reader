import os, traceback
from os import walk
import datetime
import requests
import pandas as pd
import numpy as np

def get_stock_names(dbPath):
    try:
        db_path = os.path.join(dbPath,'yahoo')
        dfTW = get_tw_code_from_csv()
        dfUS = get_us_code_from_csv()
        stock_names = []
        for root, dirs, files in walk(db_path):
            if len(dirs) == 0:
                for f in files:
                    country = os.path.split(root)[1]
                    code = f.split('.')[0]
                    item = {'code': code, 'country': country}
                    stock_names.append(item)
                
        for item in stock_names:
            try:
                if item['country'] == 'tw':
                    twcpy = dfTW.loc[item['code'], ['Company']]
                    item['name'] = twcpy['Company']
                elif item['country'] == 'us':
                    uscpy = dfUS.loc[item['code'], ['Company']]
                    item['name'] = uscpy['Company']
            except:
                item['name'] = ''
        return stock_names
    except:
        error_msg = traceback.format_exc()
        print(error_msg)

def get_us_code():
    url = 'https://www.slickcharts.com/sp500'
    headers = {"User-Agent" : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'}

    request = requests.get(url, headers = headers)

    df = pd.read_html(request.text)[0]
    df = df.drop(columns =['#', 'Weight', 'Price', 'Chg', '% Chg'])

    # 用 replace 將符號進行替換
    df = df.dropna(axis=1)
    df = df.set_index('Symbol')
    return df

def get_us_code_from_csv():
    df = pd.read_csv('us_list.csv', encoding='utf8')
    # 用 replace 將符號進行替換
    df = df.dropna(axis=1)
    df = df.set_index('Symbol')
    df = df.rename(columns={'Name': 'Company'})
    return df

def get_code_for_tw(text):
    return text.split('　')[0]

def get_name_for_tw(text):
    return text.split('　')[1]

def get_tw_code_from_csv():
    df = pd.read_csv('tw_list.csv', encoding='utf8')
    # 用 replace 將符號進行替換
    df = df.dropna(axis=1)
    df['Symbol'] = df['Symbol'].apply(lambda x: x.encode().decode('utf-8').strip())
    df['Company'] = df['Company'].apply(lambda x: x.encode().decode('utf-8').strip())
    df = df.rename(columns={'Name': 'Company'})
    df = df.set_index('Symbol')
    return df

def getNowString(time=None):
    if time:
        return datetime.datetime.strptime(time, "%Y-%m-%d").date().strftime("%Y-%m-%d")
    else:
        return datetime.datetime.now().strftime("%Y-%m-%d")

def getDiffDate(days_to_subtract=0):
    d = datetime.datetime.today() - datetime.timedelta(days=days_to_subtract)
    return d.strftime("%Y-%m-%d")


def filterStock(df, withdays=5):
    today = getNowString()
    preDay = getDiffDate(withdays)
    dfFinal = df.copy()
    dfFinal['date'] = pd.to_datetime(df['date'])
    data = []
    shape = len(df['close'].values[:])
    zeroy = np.zeros((shape))
    truey = np.ones((shape))
    condition = np.logical_or(dfFinal['toBuy'], dfFinal['toBuyMany'])
    condition = np.logical_or(condition, dfFinal['toBuy_RSI'])
    dfFinal['matched_buy'] = np.where(condition, truey, zeroy).astype('bool')

    
    condition = np.logical_or(dfFinal['toSell'], dfFinal['toSellMany'])
    condition = np.logical_or(condition, dfFinal['toSell_RSI'])
    dfFinal['matched_sell'] = np.where(condition, truey, zeroy).astype('bool')
    
    condition = np.logical_or(dfFinal['matched_buy'], dfFinal['matched_sell'])
    dfFinal['matched'] = np.where(condition, truey, zeroy).astype('bool')

    mask = (dfFinal['date'] > preDay) & (dfFinal['date'] <= today)
    dfFinal = dfFinal.loc[mask]
    matched = dfFinal['matched'].any()
    if matched:
        dfFinal['date'] = dfFinal['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
        dfFinal = dfFinal.loc[dfFinal['matched']]
        data = dfFinal.to_dict(orient='records')
    return matched, data

if __name__ == '__main__':
    dbPath = r'C:\tw_stock_test\database'
    db_path = os.path.join(dbPath)
    ret = get_stock_names(db_path)
    # print(ret)
    # ret = get_tw_code_from_csv()
    print(ret)