#!/usr/bin/python
# -*- coding: UTF-8 -*-

from __future__ import print_function
import sys, os
import asyncio
import traceback
import websockets
import json, random
from loguru import logger
from models.stocks import StockModel
import algo
import numpy as np
import pandas as pd
from utility import get_stock_names

dbPath = r'C:\tw_stock_test\database'


class PyServerAPI(object):
    def __init__(self):
        self.users = set()
        logger.add(sys.stdout, format="{time} - {level} - {message}")
        logger.add(r"C:\\systemlog/{time:YYYY-MM-DD}/file_{time:YYYY-MM-DD}.log", rotation="10 MB")
        self.lg = logger

    async def register(self,websocket):
        self.users.add(websocket)
        self.lg.debug('new user connected: {}'.format(websocket))

    async def unregister(self,websocket):
        self.users.remove(websocket)
        self.lg.debug('user disconnected: {}'.format(websocket))

    async def handler(self,websocket, path):
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
                    await self.sendMsg(websocket,'reply_init_ok')
                elif cmd == 'getStockNames':
                    db_path = os.path.join(dbPath)
                    ret = get_stock_names(db_path)
                    await self.sendMsg(websocket,'reply_stock_names', ret)
                elif cmd == 'getStock':
                    countryCode = data['country']
                    db_path = os.path.join(dbPath,'yahoo', countryCode, f'{countryCode}_'+data['stockNo']+'.db')
                    stock = StockModel(db_path)
                    recs = stock.get_by_stockNo(fromDate=data['from'], toDate=data['to']) 
                    df = pd.DataFrame(recs)  
                    # df = algo.strategy(df, avg=int(data['avg']))
                    df = algo.strategy2(df, data)
                    data = df.to_dict(orient='records')
                    await self.sendMsg(websocket,'reply_getStock', data)
                elif cmd == 'close_all':
                    await self.sendMsg(websocket,'reply_closed_all')
                else:
                    self.lg.debug('Not found this cmd: {}'.format(cmd))
        except Exception as e:
            try:
                err_msg = traceback.format_exc()
                print(err_msg)
                await self.sendMsg(websocket,'reply_server_error',{'error':err_msg})
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
                    await asyncio.wait([self.sendMsg(user,'ping', random.random()) for user in self.users])
            except Exception as e:
                self.lg.debug('error during send ping message with websocket')
                self.lg.debug(e)
            finally:
                await asyncio.sleep(10)  


def main():
    sokObj = PyServerAPI()
    port=6849
    addr = 'tcp://127.0.0.1:{}'.format(port)
    print('start running on {}'.format(addr))

    start_server = websockets.serve(sokObj.handler, "127.0.0.1", port, ping_interval=30)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    loop.run_forever()

if __name__ == '__main__':
    main()