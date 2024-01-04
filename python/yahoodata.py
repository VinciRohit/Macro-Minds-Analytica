# . venv/bin/activate
# python -m http.server

import yfinance as yf
import pandas as pd

# share = yf.Ticker("^NSEI") # Nifty 50
share = yf.Ticker("^GSPC") # SNP500
# share = yf.Ticker("^RUT") # Russell 2000

# get all stock info
hist = share.history(period="max", interval='1mo')
hist.reset_index(inplace=True)
hist['Date'] = hist['Date'].dt.date
hist = hist[['Date','Open','High','Low','Close']]
hist.columns = ['x','o','h','l','c']
# hist.T.to_json('python/data/NIFTY50.json')
# hist.T.to_json('python/data/SNP500.json')
# hist.T.to_json('python/data/RUSSELL2000.json')


normalised_hist = (hist.set_index('x')['c'].pct_change().fillna(0)+1)
normalised_hist = normalised_hist.cumprod() * 100
normalised_hist = normalised_hist.to_frame()
normalised_hist.reset_index(inplace=True)
# normalised_hist.T.to_json('python/data/NIFTY50_normalised.json')
normalised_hist.T.to_json('python/data/SNP500_normalised_max.json')
# normalised_hist.T.to_json('python/data/RUSSELL2000_normalised.json')