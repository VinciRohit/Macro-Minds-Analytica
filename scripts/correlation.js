// Get data for correlation

async function getCorrelations() {
  const datasets = Chart.getChart('AllDataChart').data.datasets
  const datasets_filtered = datasets.map(entry => ({tag: entry.tag, data:entry.data}))

  api = `${configSettings[environment]['pythonApiUrl']}/get_correlations`
  response = await Utils.fetchJsonApi(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datasets_filtered)
  })

}

















// Config
DATA_COUNT = 7;

data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers({count: DATA_COUNT, min: -100, max: 100}),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers({count: DATA_COUNT, min: -100, max: 100}),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.CHART_COLORS.blue,
    }
  ]
};

config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    },
  };

// Get the canvas element
container = document.getElementById('CorrelationContainer');
ctx = document.getElementById('Correlation').getContext('2d');

// Create the interactive line chart
myInteractiveLineChart = new Chart(ctx, config);

Utils.createButton({container, myInteractiveLineChart})
