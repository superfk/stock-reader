import numpy as np
import pandas as pd
import talib
from talib import abstract
from models.stocks import StockModel
import os
import matplotlib.pyplot as plt


def get_stock(stockNo):
    dbPath = r'C:\database'
    db_path = os.path.join(dbPath, 'yahoo', 'tw', f'tw_{stockNo}.db')
    stock = StockModel(db_path)
    recs = stock.get_by_stockNo('2019-01-01', '2021-12-01')
    return recs


def ploting(df):
    df.plot()


def get_moving_average(df, period=22, plot=False):
    if period > 1:
        df[f'close'] = abstract.SMA(df['close'], timeperiod=period)
        df[f'open'] = abstract.SMA(df['open'], timeperiod=period)
        df[f'high'] = abstract.SMA(df['high'], timeperiod=period)
        df[f'low'] = abstract.SMA(df['low'], timeperiod=period)
    if plot:
        plt.figure()
        ax = df.plot(figsize=(16, 8))
        plt.show()
    return df


def get_kd(df, plot=False):
    df2 = abstract.STOCH(df)

    if 'K' in df.columns:
        df['K'] = df2['slowk']
    if 'D' in df.columns:
        df['D'] = df2['slowd']

    if 'K' in df.columns or 'D' in df.columns:
        return df

    df3 = pd.concat([df, df2], axis=1)
    if set(['K', 'D']).issubset(df.columns):
        df['sum'] = df['A'] + df['C']
    df3.rename({'slowk': 'K', 'slowd': 'D'}, axis=1, inplace=True)
    if plot:
        plt.figure()
        ax = df3['close'].plot(figsize=(16, 8))
        df3[['K', 'D']].plot(secondary_y=True, ax=ax, alpha=0.5)
        plt.show()
    return df3


def strategyCore(KD_df, baseline=20.0, compare='lower', K2D='lower', name='event1'):
    KD_df = get_kd(KD_df)
    shape = len(KD_df['K'].values[:])
    zeroy = np.zeros((shape))
    truey = np.ones((shape))
    if compare == 'lower':
        condition = np.logical_and(
            KD_df['K'] < baseline, KD_df['D'] < baseline)
    elif compare == 'greater':
        condition = np.logical_and(
            KD_df['K'] > baseline, KD_df['D'] > baseline)

    if K2D == 'lower':
        KD_df['difference'] = KD_df.K - KD_df.D
        KD_df['cross'] = np.sign(KD_df.difference.shift(1))!=np.sign(KD_df.difference)
        condition = np.logical_and(condition, KD_df['cross'])
        condition = np.logical_and(condition, KD_df['K'] < KD_df['D'])
    elif K2D == 'greater':
        KD_df['difference'] = KD_df.K - KD_df.D
        KD_df['cross'] = np.sign(KD_df.difference.shift(1))!=np.sign(KD_df.difference)
        condition = np.logical_and(condition, KD_df['cross'])
        condition = np.logical_and(condition, KD_df['K'] > KD_df['D'])
    KD_df[name] = np.where(condition, truey, zeroy).astype('bool')
    KD_df.drop(columns=['cross', 'difference'])
    return KD_df


def strategy(df):
    df = strategyCore(df, 20.0, 'lower', 'greater', 'toBuy')
    df = strategyCore(df, 80.0, 'greater', 'lower', 'toSell')
    df = df.replace({np.nan: None})
    return df


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
    df = get_moving_average(df, 1, False)
    print(df)
    df = strategy(df, 80, 'greater', 'lower')
    print(df)


if __name__ == "__main__":
    main()
