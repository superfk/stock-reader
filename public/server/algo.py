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
    newdf = df.copy()
    if period > 1:
        newdf[f'close'] = abstract.SMA(df['close'], timeperiod=period)
        newdf[f'open'] = abstract.SMA(df['open'], timeperiod=period)
        newdf[f'high'] = abstract.SMA(df['high'], timeperiod=period)
        newdf[f'low'] = abstract.SMA(df['low'], timeperiod=period)
    if plot:
        plt.figure()
        ax = df.plot(figsize=(16, 8))
        plt.show()
    return newdf


def get_kd(df, plot=False):
    dfKD = df.drop(["adj_close"],axis = 1)
    dfKD['K'], dfKD['D'] = abstract.STOCH(df.high, df.low, df.close, fastk_period=9,
                                         slowk_period=3,
                                         slowk_matype=1,
                                         slowd_period=3,
                                         slowd_matype=1)

    return dfKD


def get_named_avg(srcdf, targetDf, tag=''):
    targetDf[f'close{tag}'] = srcdf['close']
    targetDf[f'open{tag}'] = srcdf['open']
    targetDf[f'high{tag}'] = srcdf['high']
    targetDf[f'low{tag}'] = srcdf['low']
    return targetDf

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

def get_slopes(df, period=1):
    df['slope'] = df['close'].rolling(period).apply(lambda x: np.polyfit(x.index.values, x.values, 1)[0])
    return df

def strategy(df, avg=1):
    df = get_moving_average(df, avg)
    df = strategyCore(df, 20.0, 'lower', 'greater', 'toBuy')
    df = strategyCore(df, 80.0, 'greater', 'lower', 'toSell')
    df = df.replace({np.nan: None})
    return df

def strategy1(df):
    shape = len(df['close'].values[:])
    zeroy = np.zeros((shape))
    truey = np.ones((shape))
    df5 = get_moving_average(df, 5)
    df22 = get_moving_average(df, 22)
    df5 = strategyCore(df5, 25.0, 'lower', 'greater', 'toBuy')
    df5['manyhead'] = np.abs(df5.close - df22.close) < 0.5
    df5 = get_slopes(df5,5)
    df5['mask_slope'] = df5.slope > 0
    condition = np.logical_and(df5['toBuy'], df5['mask_slope'] )
    condition = np.logical_and(condition, df5['manyhead'] )
    df5['toBuyMany'] = np.where(condition, truey, zeroy).astype('bool')
    dfFinal = df.copy()
    dfFinal = get_named_avg(df5,dfFinal,'_wk')
    dfFinal = get_named_avg(df22,dfFinal,'_mo')
    dfFinal['K'] = df5['K']
    dfFinal['D'] = df5['D']
    condition2 = np.logical_and(df5['toBuy'], df5['mask_slope'] )
    dfFinal['toBuy'] = np.where(condition2, truey, zeroy).astype('bool')
    dfFinal['toBuyMany'] = df5['toBuyMany']
    dfFinal['slope'] = df5['slope']
    dfFinal = dfFinal.replace({np.nan: None})
    print(dfFinal)
    return dfFinal

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
    print(df)
    df5 = get_moving_average(df, 5)
    print(df5)
    df22 = get_moving_average(df, 22)
    print(df22)
    df['df5'] = df5.close
    df['df22'] = df22.close
    df['manyhead'] = df5.close > df22.close
    print(df)

def test_strategy1():
    recs = get_stock('2317')
    df = pd.DataFrame(recs)
    ret = strategy1(df)
    print(ret)

if __name__ == "__main__":
    test_strategy1()
