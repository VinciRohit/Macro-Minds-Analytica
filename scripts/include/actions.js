// Interactivity actions
const actions = [
    {
        name: 'Randomize',
        handler(chart) {
            chart.data.datasets.forEach(dataset => {
                dataset.data = Utils.numbers({ count: chart.data.labels.length, min: -100, max: 100 });
            });
            chart.update();
        },
    },
    {
        name: 'Add Dataset',
        handler(chart) {
            const data = chart.data;
            const dsColor = Utils.namedColor(chart.data.datasets.length);
            const newDataset = {
                label: 'Dataset ' + (data.datasets.length + 1),
                backgroundColor: Utils.transparentize(dsColor, 0.5),
                borderColor: dsColor,
                data: Utils.numbers({ count: data.labels.length, min: -100, max: 100 }),
            };
            chart.data.datasets.push(newDataset);
            chart.update();
        },
    },
    {
        name: 'Add Data',
        handler(chart) {
            const data = chart.data;
            if (data.datasets.length > 0) {
                data.labels = Utils.months({ count: data.labels.length + 1 });

                for (let index = 0; index < data.datasets.length; ++index) {
                    data.datasets[index].data.push(Utils.rand(-100, 100));
                }

                chart.update();
            }
        },
    },
    {
        name: 'Remove Dataset',
        handler(chart) {
            chart.data.datasets.pop();
            chart.update();
        },
    },
    {
        name: 'Remove Data',
        handler(chart) {
            chart.data.labels.splice(-1, 1); // remove the label first

            chart.data.datasets.forEach(dataset => {
                dataset.data.pop();
            });

            chart.update();
        },
    },
];

// Financial Chart Interactivity actions
const FinancialChartButtonactions = [
    {
        name: 'Add Index',
        async handler(chart) {
            var share = document.getElementById('share_historicalData');
            var filename = `python/data/${share.value}_normalised.json`;
            var response = await Utils.fetchFile(filename);
            const data = Object.values(response).map(entry => ({ x: entry.x, y: entry.c }));

            await Utils.updateChart(data, share.selectedOptions[0].textContent, chart);
        },
    },
    {
        name: 'Remove Last Index',
        async handler(chart) {
            chart.data.datasets.pop();
            chart.update();
        },
    },
    {
        name: 'Remove All Indices',
        async handler(chart) {
            chart.data.datasets = [];
            chart.update();
        },
    },
    {
        name: 'Reset Zoom',
        async handler(chart) {
            chart.resetZoom(mode = 'none');
            chart.update();
        },
    }
]

function GetFinancialChartButtonactions() {
    return FinancialChartButtonactions
}

// World Bank Data Interactivity actions
const WorldBankDataButtonactions = [
    {
        name: 'Add Indicator',
        async handler(chart) {
            var topic = document.getElementById('topics');
            const selectedTopic = topic.options[topic.selectedIndex];
            var indicator = document.getElementById('indicators');
            const selectedOption = indicator.options[indicator.selectedIndex];
            const label = selectedOption.textContent;
            console.log(`selected Indicator is ${selectedOption.value}`)
            let data;

            if (selectedTopic.textContent === 'Market Indices') {
                var filename = `python/data/${indicator.value}_normalised_max.json`;
                var response = await Utils.fetchFile(filename);
                data = Object.values(response).map(entry => ({ 
                    x: window.luxon.DateTime.fromObject({
                                                            year: Utils.DateTime.fromMillis(entry.x).c.year
                                                            , month: Utils.DateTime.fromMillis(entry.x).c.month
                                                        })
                    , y: entry.c 
                }));
            } else {
                var api = `https://api.worldbank.org/v2/country/xd/indicator/${indicator.value}?format=json`;
                try {
                    const response = await Utils.fetchApi(api);
                    data = Utils.orderByDate(response[1]).map(entry => ({ x: window.luxon.DateTime.fromObject({year: entry.date, month: 12}).ts, y: entry.value }));
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            };
            
            data = Utils.normalizeArray(data, 'y', minValueWorldBankData, maxValueWorldBankData);

            Utils.updateChart(data, label, chart);
        },
    },
    {
        name: 'Remove Selected Indicator',
        async handler(chart) {
            var indicator = document.getElementById('indicators');
            const selectedOption = indicator.options[indicator.selectedIndex];
            chart.data.datasets = chart.data.datasets.filter(dataset => dataset.label !== selectedOption.textContent);
            chart.update();
        },
    },
    {
        name: 'Remove Last Indicator',
        async handler(chart) {
            chart.data.datasets.pop();
            chart.update();
        },
    },
    {
        name: 'Remove All Indicators',
        async handler(chart) {
            chart.data.datasets = [];
            chart.update();
        },
    },
    {
        name: 'Reset Zoom',
        async handler(chart) {
            chart.resetZoom(mode = 'none');
            chart.update();
        },
    }
]

function GetWorldBankDataButtonactions() {
    return WorldBankDataButtonactions
}