import numpy as np
import pandas as pd
import talib
from talib import abstract
from models.stocks import StockModel
import os
import matplotlib.pyplot as plt

def get_stock(stockNo):
    dbPath = r'C:\database'
    db_path = os.path.join(dbPath,'yahoo','tw',f'tw_{stockNo}.db')
    stock = StockModel(db_path)
    recs = stock.get_by_stockNo('2019-01-01', '2021-12-01')
    return recs

def ploting(df):
    df.plot()

def get_moving_average(df, period=22):
    df[f'SMA{period}'] = talib.SMA(df['close'], timeperiod=period)
    # df3 =pd.concat([df, df2], axis=1)
    plt.figure()
    ax = df['close'].plot(figsize=(16,8))
    df[[f'SMA{period}']].plot(secondary_y=True, ax=ax, alpha=0.5)
    plt.show()
    return df

def get_kd(df):
    print(df)
    df2 = abstract.STOCH(df)
    df3 =pd.concat([df, df2], axis=1)
    plt.figure()
    ax = df3['close'].plot(figsize=(16,8))
    df3[['slowk', 'slowd']].plot(secondary_y=True, ax=ax, alpha=0.5)
    plt.show()
    return df3

def main():
    # 透過『get_function_groups』，取得分類後的技術指標清單
    all_ta_groups = talib.get_function_groups()
    # 看一下這個字典
    all_ta_groups
    # 有哪些大類別？
    all_ta_groups.keys()
    # 查看某類別底下的技術指標清單
    all_ta_groups['Momentum Indicators']
    # 查看所有類別的指標數量
    table = pd.DataFrame({
            '技術指標類別名稱': list(all_ta_groups.keys()),
            '該類別指標總數': list(map(lambda x: len(x), all_ta_groups.values()))
        })

    recs = get_stock('2317')
    df = pd.DataFrame(recs)
    get_kd(df)
    print(get_moving_average(df, 5))

if __name__ == "__main__":
    main()