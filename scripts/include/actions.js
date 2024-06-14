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
            // var api = `${configSettings[environment]['pythonApiUrl']}/get_yfinance_market_data/[[indicator]]`
            var api = categorySchemes.find((obj) => obj['mainAgencyID'] === 'YFinance')['source']
            var share = document.getElementById('share_historicalData');
            api = api.replace('[[indicator]]',`${share.value}_normalised_5y`);
            const response = await Utils.fetchJsonApi(api);
            const data = Object.values(response['data']).map(entry => ({ x: entry.x, y: entry.c }));

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
                // var api = `${configSettings[environment]['pythonApiUrl']}/get_yfinance_market_data/[[indicator]]_normalised_max`
                var api = categorySchemes.find((obj) => obj['mainAgencyID'] === 'YFinance')['source'] + '_normalised_max'
                api = api.replace('[[indicator]]',selectedOption.value);
                const response = await Utils.fetchJsonApi(api);
                data = Object.values(response['data']).map(entry => ({ 
                    x: window.luxon.DateTime.fromObject({
                                                            year: Utils.DateTime.fromMillis(entry.x).c.year
                                                            , month: Utils.DateTime.fromMillis(entry.x).c.month
                                                        })
                    , y: entry.c 
                }));
            } else {
                var api = `https://api.worldbank.org/v2/country/xd/indicator/${indicator.value}?format=json`;
                try {
                    const response = await Utils.fetchJsonApi(api);
                    data = Utils.orderByDate(response[1]).map(entry => ({ x: window.luxon.DateTime.fromObject({year: entry.date, month: 12}), y: entry.value }));
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

// All Data Interactivity actions
const MacroDataButtonactions = [
    {
        name: 'Add Indicator',
        async handler(chart) {
            // var topic = document.getElementById('topics');
            // const selectedTopic = topic.options[topic.selectedIndex];
            // const div = document.getElementById('AllDataChartIndicatorContainer');
            // const indicatorElement = Array.from(selectElements).find(entry => entry.id === 'AllDataChartIndicators');
            const selectElements = document.getElementsByName('AllDataChartIndicatorContainer-dimensions');
            const indicatorElement = document.getElementById('AllDataChartIndicators');

            const selectedOption = indicatorElement.options[indicatorElement.selectedIndex];

            if (!selectedOption.canAddIndicator) {
                throw 'Awaiting Dimensions'
            }

            var label = selectedOption.updatedtextContent;
            var api = selectedOption.source;

            console.log(`selected option Id is ${selectedOption.value}`);
            let data;
            let tag;    // used for global understanding of the data
            let type;
            
            let dimensions = Array.from(selectElements).map(item => {
                if (item.tagName === 'SELECT') {
                    return item.options[item.selectedIndex].value;
                } else if (item.tagName === 'INPUT') {
                    return item.value;
                }
            });

            if (selectedOption.mainAgencyID === 'YFinance') {
                // var filename = `python/data/${indicator.value}_normalised_max.json`;
                const indicator = selectedOption.value + (selectedOption.dataflowAttributes.normalised? '_normalised':'') + (selectedOption.dataflowAttributes.period? `_${selectedOption.dataflowAttributes.period}`:'')
                api = api.replace('[[indicator]]',indicator);
                tag = selectedOption.mainAgencyID + '/' + selectedOption.Topic + '/' + indicator;
                const response = await Utils.fetchJsonApi(api);
                data = Object.values(response['data']).map(entry => ({ 
                    x: window.luxon.DateTime.fromObject({
                                                            year: Utils.DateTime.fromMillis(entry.x).c.year
                                                            , month: Utils.DateTime.fromMillis(entry.x).c.month
                                                        })
                    , y: entry.c 
                }));
            } else if (selectedOption.mainAgencyID === 'OECD') {
                const agencyID = selectedOption.dataflowAttributes.agencyID? selectedOption.dataflowAttributes.agencyID:'all';
                const indicator = selectedOption.value;

                // dimensions = Array.from(selectElements).filter(entry => entry.id != 'AllDataChartIndicators').map(item => item.options[item.selectedIndex].value);

                dimensionslabels = Array.from(selectElements)
                    .filter(entry => entry.id != 'AllDataChartIndicators')
                    .filter(entry => entry.id != 'MEASURE')
                    .filter(entry => entry.id != 'FREQ')
                    .filter(entry => entry.id != 'METHODOLOGY')
                    .filter(entry => entry.id != 'UNIT_MEASURE')
                    .filter(entry => entry.id != 'ADJUSTMENT')
                    .map(item => {
                        if (item.tagName === 'SELECT') {
                            return item.options[item.selectedIndex].textContent;
                        }
                    });

                label = label + ' - ' + dimensionslabels.join(' - ');

                api = api.replace('[[agencyID]]',agencyID);
                api = api.replace('[[indicator]]',indicator);
                api = api.replace('[[dimensions]]',dimensions.join('.'));

                tag = selectedOption.mainAgencyID + '/' + selectedOption.Topic + '/' + indicator + '/' + dimensions.join('.');

                // try {
                // Get Data
                const response = await Utils.fetchXmlApi(api);
                const observations = response.documentElement.getElementsByTagName("generic:Obs");
                data = Array.from(observations).map(obs => {
                    const date = Array.from(obs.getElementsByTagName("generic:Value")).find(tag => tag.id === 'TIME_PERIOD').getAttribute("value");
                    
                    return {
                    x: window.luxon.DateTime.fromFormat(date,"yyyy-MM").invalid? window.luxon.DateTime.fromFormat(date,"yyyy") : window.luxon.DateTime.fromFormat(date,"yyyy-MM"),
                    y: obs.getElementsByTagName("generic:ObsValue")[0].getAttribute("value")
                }});
                    // data = Utils.orderByDate(response[1]).map(entry => ({ x: window.luxon.DateTime.fromObject({year: entry.date, month: 12}).ts, y: entry.value }));
                // } catch (error) {
                //     throw error;
                // }
            } else if (selectedOption.mainAgencyID === 'AVANTAGE') {
                // selectedOption.updatedtextContent = selectedOption.dataflowAttributes.parameters['ticker'] + ' - ' + selectedOption.textContent;
                // label = selectedOption.updatedtextContent;

                const _function = selectedOption.category.function_name;
                const indicator = selectedOption.value;
                api = api.replace('[[function]]', _function);

                var parameters_string = {...selectedOption.dataflowAttributes.parameters_string};
                var parameters = {...selectedOption.dataflowAttributes.parameters};
                
                Object.keys(selectedOption.dataflowAttributes.parameters_string).forEach(item => {
                    if ((item === 'ticker') && selectedOption.dataflowAttributes.multipleTickers) {
                        parameters_string[item] = (parameters[item].length > 0)? parameters_string[item].replace(`[[${item}]]`, parameters[item].join(',')) : '';
                    } else if ((item === 'topic') && selectedOption.dataflowAttributes.multipleTopics) {
                        parameters_string[item] = (parameters[item].length > 0)? parameters_string[item].replace(`[[${item}]]`, parameters[item].join(',')) : '';
                    } else {
                        parameters_string[item] = parameters[item]? parameters_string[item].replace(`[[${item}]]`, parameters[item]) : '';
                    }
                })

                api = api.replace('[[parameters]]', Object.keys(parameters_string).map(item => parameters_string[item]).join(''));

                tag = selectedOption.mainAgencyID + '/' + selectedOption.Topic + '/' + indicator + '/' + Object.keys(parameters).map(x => parameters[x]?parameters[x]:'.').join('.');
                
                // test
                api = "https://www.alphavantage.co/query?function=[[function]]&symbol=IBM&apikey=demo".replace('[[function]]', _function);
                // api = "https://www.alphavantage.co/query?function=[[function]]&tickers=AAPL&apikey=demo".replace('[[function]]', _function);
                parameters.ticker = ['AAPL','META'];

                const response = await Utils.fetchJsonApi(api);

                data = eval(selectedOption.dataflowAttributes.filterUrlResponse);
                type = selectedOption.dataflowAttributes.chartType? selectedOption.dataflowAttributes.chartType : type;

            }
            
            // data = Utils.normalizeArray(data, 'y', minValueMacro, maxValueMacro);
            if (data.hasMultipleDatasets) {
                for (let dataset of data.datasets) {
                    Utils.updateChart(dataset.data, dataset.updateLabel, chart, `y${chart.data.datasets.length}`, tag, type);
                }
            } else {
                Utils.updateChart(data, label, chart, `y${chart.data.datasets.length}`, tag, type);
            }
        },
    },
    {
        name: 'Remove Selected Indicator',
        async handler(chart) {
            var indicator = document.getElementById('AllDataChartIndicators');
            const selectedOption = indicator.options[indicator.selectedIndex];
            chart.data.datasets = chart.data.datasets.filter(dataset => dataset.label !== selectedOption.updatedtextContent);
            chart.update();
        },
    },
    {
        name: 'Update ChartType for Selected Indicator',
        async handler(chart) {
            var indicator = document.getElementById('AllDataChartIndicators');
            const selectedOption = indicator.options[indicator.selectedIndex];
            var type = prompt("Please enter chart type:", "line");
            chart.data.datasets = chart.data.datasets.map(x => {
                if (x.label === selectedOption.updatedtextContent) {
                    x.type = type;
                    return x
                } else {
                    return x
                }
            })
            chart.update();
        },
    },
    {
        name: 'Update ChartType for All',
        async handler(chart) {
            var indicator = document.getElementById('AllDataChartIndicators');
            const selectedOption = indicator.options[indicator.selectedIndex];
            var type = prompt("Please enter chart type:", "line");
            chart.data.datasets = chart.data.datasets.map(x => {
                x.type = type;
                return x
            })
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
        name: 'Draw Correlations',
        async handler() {
            Utils.getCorrelationChart('AllDataChart','CorrelationContainer')
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

function GetMacroDataButtonactions() {
    return MacroDataButtonactions
}