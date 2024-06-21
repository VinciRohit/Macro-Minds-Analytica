const configSettings = {
    development: {
        domain: 'http://127.0.0.1:8000',
        python: {
            pythonApiUrl: 'http://127.0.0.1:5001',
            apiKey: 'your_local_api_key'
        },
        avantage: {
            avantageUrl: 'https://www.alphavantage.co/query?',
            apiKey: 'HLJME512CKIQAV80'
        }
    },
    production: {
        domain: 'https://macromindsanalytica.com',
        python: {
            pythonApiUrl: 'https://macro-minds-analytica-python-apiapp.azurewebsites.net',
            apiKey: 'your_production_api_key'
        },
        avantage: {
            avantageUrl: 'https://www.alphavantage.co/query?',
            apiKey: 'HLJME512CKIQAV80'
        }
    }
  };
  

const isLocal = window.location.hostname === '' || window.location.hostname === 'localhost' || window.location.hostname === '[::]' || window.location.hostname === '127.0.0.1';
const environment = isLocal ? 'development' : 'production';
