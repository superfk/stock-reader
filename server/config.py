import json, datetime

def read_system_config(path='config.json'):
    with open(path, 'r', encoding= 'utf-8') as f:
        data = json.load(f)
    return data

def write_system_config(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def get_stocks(path='config.json'):
    config = read_system_config(path)
    countries = get_country(path)
    totalStocks = []
    for c in countries:
        stocks = config[f'stocks_{c}'].split(',')
        stocks = [{'country':f"{c}", "code":f"{x.strip()}"} for x in stocks]
        totalStocks = totalStocks + stocks
    return totalStocks

def get_db_folder(path='config.json'):
    config = read_system_config(path)
    db_folder = config['db_folder']
    return db_folder

def get_dates(path='config.json'):
    config = read_system_config(path)
    date_start = config['date_start']
    if date_start == 'now':
        date_start = datetime.datetime.now().date()
    else:
        date_start = datetime.datetime.strptime(date_start, r'%Y-%m-%d').date()
    date_end = config['date_end']
    if date_end == 'now':
        date_end = datetime.datetime.now().date()
    else:
        date_end = datetime.datetime.strptime(date_end, r'%Y-%m-%d').date()
    return {'start': date_start, 'end':date_end}

def get_country(path='config.json'):
    config = read_system_config(path)
    countries = config['country'].split(',')
    return countries

if __name__ == "__main__":
    stocks = get_country()
    print(stocks)