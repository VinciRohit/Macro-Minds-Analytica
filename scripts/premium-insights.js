// Config
DATA_COUNT = 7;

data = {
  labels: Utils_deprecated.months({count: DATA_COUNT}),
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils_deprecated.numbers({count: DATA_COUNT, min: -100, max: 100}),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
    },
    {
      label: 'Dataset 2',
      data: Utils_deprecated.numbers({count: DATA_COUNT, min: -100, max: 100}),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.CHART_COLORS.blue,
    }
  ]
};

const borderPlugin = {
  id: 'panAreaBorder',
  beforeDraw(chart, args, options) {
    const {ctx, chartArea: {left, top, width, height}} = chart;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(left + width * 0.25, top + height * 0.25, width / 2, height / 2);
    ctx.restore();
  }
};

config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'xy',
          },
          zoom: {
            wheel: {
              enabled: false,
            },
            pinch: {
              enabled: true,
            },
            mode: 'xy',
            // scaleMode: 'y'
          }
        }
      },
    },
    plugins: [borderPlugin]
  };

// Get the canvas element
container = document.getElementById('PremiumInsightsContainer');
ctx = document.getElementById('PremiumInsights').getContext('2d');

// Create the interactive line chart
myInteractiveLineChart = new Chart(ctx, config);

Utils.createButton({container, myInteractiveLineChart})
