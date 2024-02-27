const configSettings = {
    development: {
        pythonApiUrl: 'http://127.0.0.1:5001',
        apiKey: 'your_local_api_key'
    },
    production: {
        pythonApiUrl: 'https://macro-minds-analytica-python-apiapp.azurewebsites.net',
        apiKey: 'your_production_api_key'
    }
  };
  

const isLocal = window.location.hostname === '' || window.location.hostname === 'localhost' || window.location.hostname === '[::]' || window.location.hostname === '127.0.0.1';
const environment = isLocal ? 'development' : 'production';
