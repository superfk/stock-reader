#!/usr/bin/python
# -*- coding: UTF-8 -*-

from __future__ import print_function
import sys
import os
import datetime
import time
import asyncio
import traceback
import websockets
import json
import random
from loguru import logger
from models.stocks import StockModel
import algo
import numpy as np
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed
from utility import get_stock_names, getNowString, getDiffDate, filterStock
import config as cfg


class PyServerAPI(object):
    def __init__(self):
        self.users = set()
        logger.add(sys.stdout, format="{time} - {level} - {message}")
        logger.add(
            r"C:\\systemlog/{time:YYYY-MM-DD}/file_{time:YYYY-MM-DD}.log", rotation="10 MB")
        self.lg = logger
        self.configPath = ''
        self.appRoot = ''

    async def register(self, websocket):
        self.users.add(websocket)
        self.lg.debug('new user connected: {}'.format(websocket))

    async def unregister(self, websocket):
        self.users.remove(websocket)
        self.lg.debug('user disconnected: {}'.format(websocket))

    async def handler(self, websocket, path):
        # register(websocket) sends user_event() to websocket
        await self.register(websocket)
        try:
            async for message in websocket:
                # print(message)
                self.lg.debug(message)
                msg = json.loads(message)
                cmd = msg["cmd"]
                data = msg["data"]
                if cmd == 'pong':
                    print('client pong: {}'.format(data))
                elif cmd == 'isInited':
                    self.appRoot = data
                    await self.sendMsg(websocket, 'reply_init_ok')
                elif cmd == 'load_sys_config':
                    self.configPath = data
                    countries = cfg.get_country(self.configPath)
                    for c in countries:
                        dbFolder = os.path.join(cfg.get_db_folder(self.configPath), 'yahoo',  c)
                        if not os.path.exists(dbFolder):
                            os.makedirs(dbFolder)
                elif cmd == 'getStockNames':
                    ret = get_stock_names(cfg.get_db_folder(self.configPath))
                    await self.sendMsg(websocket, 'reply_stock_names', ret)
                elif cmd == 'getStock':
                    countryCode = data['country']
                    db_path = os.path.join(
                        cfg.get_db_folder(self.configPath), 'yahoo', countryCode, data['stockNo']+'.db')
                    stock = StockModel(db_path, self.configPath)
                    recs = stock.get_by_stockNo(
                        fromDate=data['from'], toDate=data['to'])
                    df = pd.DataFrame(recs)
                    df = algo.strategy2(df, data)
                    data = df.to_dict(orient='records')
                    await self.sendMsg(websocket, 'reply_getStock', data)

                elif cmd == 'updateAll':
                    startT = time.time()
                    workers = 24
                    totalStocks = len(cfg.get_stocks(self.configPath))
                    success_tasks = 0
                    curloop = asyncio.get_running_loop()

                    def run_instance(stock, loop):
                        db_path = os.path.join(
                            cfg.get_db_folder(self.configPath), 'yahoo', stock['country'], stock['code']+'.db')
                        print(db_path)
                        st = StockModel(db_path, self.configPath)
                        st.connect()
                        result = st.run(
                            stock['code'], country=stock['country'])
                        st.close()
                        realteimResultText = f"updated {stock['code']}"
                        print(realteimResultText)
                        future = asyncio.run_coroutine_threadsafe(self.sendMsg(
                            websocket, 'reply_updateAllRealTime', realteimResultText), loop)
                        future.result()
                        return result, stock['code']
                    with ThreadPoolExecutor(max_workers=workers) as executor:
                        futures = []
                        invalidTasks = []
                        tasks = [curloop.run_in_executor(
                            executor, run_instance, s, curloop) for s in cfg.get_stocks(self.configPath)]

                        for response in await asyncio.gather(*tasks):
                            success, stkNo = response
                            if success:
                                success_tasks += 1
                            else:
                                invalidTasks.append(stkNo)

                    endT = time.time()
                    exeT = round(endT - startT, 2)
                    invalidStk = ",".join(invalidTasks)
                    resultText = f"executed time: {exeT} s for {workers} workers, successTasks {success_tasks}/{totalStocks}, invalid stock: {invalidStk}"
                    print(resultText)
                    await self.sendMsg(websocket, 'reply_updateAll', resultText)
                    await self.sendMsg(websocket, 'reply_updateAllRealTime', resultText)
                    ret = get_stock_names(cfg.get_db_folder(self.configPath))
                    await self.sendMsg(websocket, 'reply_stock_names', ret)

                elif cmd == 'filterAll':
                    stockNames = get_stock_names(cfg.get_db_folder(self.configPath))
                    curloop = asyncio.get_running_loop()

                    def run_instance(stk, loop):
                        try:
                            item = {
                                'code': stk['code'], 'country': stk['country'], 'name': stk['name'], 'data': []}
                            countryCode = item['country']
                            db_path = os.path.join(
                                cfg.get_db_folder(self.configPath), 'yahoo', countryCode, item['code']+'.db')
                            stock = StockModel(db_path, self.configPath)
                            recs = stock.get_by_stockNo(
                                fromDate=data['from'], toDate=data['to'])
                            df = pd.DataFrame(recs)
                            df = algo.strategy2(df, data)
                            matched, matchedData = filterStock(df, 30)
                            realteimResultText = f"filtered {stk['code']}"
                            print(realteimResultText)
                            future = asyncio.run_coroutine_threadsafe(self.sendMsg(
                                websocket, 'reply_updateAllRealTime', realteimResultText), loop)
                            future.result()
                            if matched:
                                item['data'] = matchedData
                                return True, item
                            else:
                                return False, None
                        except:
                            err_msg = traceback.format_exc()
                            print(err_msg)
                            return False, None
                    startT = time.time()
                    workers = 24
                    filterdData = []
                    totalStocks = len(stockNames)
                    success_tasks = 0
                    with ThreadPoolExecutor(max_workers=workers) as executor:
                        tasks = [curloop.run_in_executor(
                            executor, run_instance, s, curloop) for s in stockNames]

                        for response in await asyncio.gather(*tasks):
                            success, item = response
                            if success:
                                success_tasks += 1
                                filterdData.append(item)
                            else:
                                pass

                    endT = time.time()
                    exeT = round(endT - startT, 2)
                    realteimResultText = f"executed time: {exeT} s for {workers} workers, {success_tasks} stock event found"
                    print(realteimResultText)
                    await self.sendMsg(websocket, 'reply_filterAll', filterdData)
                    await self.sendMsg(websocket, 'reply_updateAllRealTime', realteimResultText)
                elif cmd == 'close_all':
                    await self.sendMsg(websocket, 'reply_closed_all')
                else:
                    self.lg.debug('Not found this cmd: {}'.format(cmd))
        except Exception as e:
            try:
                err_msg = traceback.format_exc()
                print(err_msg)
                await self.sendMsg(websocket, 'reply_server_error', {'error': err_msg})
            except:
                pass

    async def sendMsg(self, websocket, cmd, data=None):
        msg = {'cmd': cmd, 'data': data}
        filter_cmd = ['update_cur_status', 'pong']
        if cmd not in filter_cmd:
            # self.lg.debug('server sent msg: {}'.format(msg))
            pass
        try:
            await websocket.send(json.dumps(msg))
        except Exception as e:
            self.lg.debug('error during send message with websocket')
            self.lg.debug(e)

    async def continousSend(self):
        while True:
            try:
                if self.users:
                    await asyncio.wait([self.sendMsg(user, 'ping', random.random()) for user in self.users])
            except Exception as e:
                self.lg.debug('error during send ping message with websocket')
                self.lg.debug(e)
            finally:
                await asyncio.sleep(10)


def main():
    sokObj = PyServerAPI()
    port = 6849
    addr = 'tcp://127.0.0.1:{}'.format(port)
    print('start running on {}'.format(addr))

    start_server = websockets.serve(
        sokObj.handler, "127.0.0.1", port, ping_interval=30)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    loop.run_forever()


if __name__ == '__main__':
    main()
