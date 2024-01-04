// Config
var DATA_COUNT = 7;

var data = {
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

var config = {
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
var container = document.getElementById('MacroEconomicAnalysisContainer');
var ctx = document.getElementById('MacroEconomicAnalysis').getContext('2d');

// Create the interactive line chart
var myInteractiveLineChart = new Chart(ctx, config);

Utils.createButton({container, myInteractiveLineChart})
