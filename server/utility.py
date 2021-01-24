import glob, os, traceback
from os import walk
import twstock
twstock.__update_codes()

def get_stock_names(dbPath):
    try:
        db_path = os.path.join(dbPath,'yahoo')
        stock_names = []
        for root, dirs, files in walk(db_path):
            for f in files:
                country, code = tuple(f.split('.')[0].split('_'))
                item = {'code': code, 'country': country}
                stock_names.append(item)
                
        for item in stock_names:
            try:
                item['name'] = twstock.codes[item['code']].name
            except:
                item['name'] = ''
        return stock_names
    except:
        error_msg = traceback.format_exc()
        print(error_msg)


if __name__ == '__main__':
    dbPath = r'C:\tw_stock_test\database'
    db_path = os.path.join(dbPath)
    ret = get_stock_names(db_path)
    print(ret)