let timer;

const scale_x = {
    display: true,
    position: 'bottom', 
    ticks: {
        color: '#ecf0f1',
        // color: 'black',
    },
    grid: {
        display: false,
        color: 'gray',
    },
    type: 'timeseries',
    offset: true,
    ticks: {
        major: {
            enabled: true,
        },
        fontStyle: context => context.tick.major ? 'bold' : undefined,
        source: 'data',
        maxRotation: 0,
        autoSkip: true,
        autoSkipPadding: 75,
        sampleSize: 100
    },
    afterBuildTicks: scale => {
        // const DateTime = window && window.luxon && window.luxon.DateTime;
        if (!Utils.DateTime) {
            return;
        }
        const majorUnit = scale._majorUnit;
        const ticks = scale.ticks;
        const firstTick = ticks[0];
        if (!firstTick) {
            return;
        }

        let val = Utils.DateTime.fromMillis(firstTick.value);
        if ((majorUnit === 'minute' && val.second === 0)
                || (majorUnit === 'hour' && val.minute === 0)
                || (majorUnit === 'day' && val.hour === 9)
                || (majorUnit === 'month' && val.day <= 3 && val.weekday === 1)
                || (majorUnit === 'year' && val.month === 1)) {
            firstTick.major = true;
        } else {
            firstTick.major = false;
        }
        let lastMajor = val.get(majorUnit);

        for (let i = 1; i < ticks.length; i++) {
            const tick = ticks[i];
            val = Utils.DateTime.fromMillis(tick.value);
            const currMajor = val.get(majorUnit);
            tick.major = currMajor !== lastMajor;
            lastMajor = currMajor;
        }
        scale.ticks = ticks;
    }
}


const minValueWorldBankData = 100;
const maxValueWorldBankData = 300;

var options = {
	interaction: {
		intersect: false,
		axis:'x',
	  },
	legend: {
		display: true,
		position: 'left',
		color: '#ecf0f1',
		// align: 'start'   // Align the text to the start (left)
	},
	scales: {
		x: {
            type: 'timeseries',
			display: true,
            position: 'bottom', 
			ticks: {
				color: '#ecf0f1',
				// color: 'black',
			},
			grid: {
				display: false,
				color: 'gray',
			},
		},
		y: {
			display: true,
            position: 'left',
			ticks: {
				color: '#ecf0f1',
				// color: 'black',
			},
			grid: {
				display: false,
				color: 'gray',
			},
		},
	},
	plugins: {
        zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                // modifierKey: 'ctrl',
            },
            zoom: {
                drag: {
                    enabled: false,
                },
                wheel: {
                    enabled: false,
                },
                pinch: {
                    enabled: true,
                },
                mode: 'x',
                  // scaleMode: 'y'
            },
        },
        	// Using Cross-Hair instead
		// customLine: {
		//   value: null,
		//   drawLine: false,
		// },
		// annotation: {
		//   annotations: [{
		// 	type: 'line',
		// 	mode: 'vertical',
		// 	scaleID: 'x',
		// 	borderColor: 'gray',
		// 	borderWidth: 2,
		// 	value: null,
		// 	label: {
		// 	  enabled: true,
		// 	  content: null,
		// 	}
		//   }]
		// },
        tooltip: {
            mode: 'interpolate',
            intersect: false
        },
        crosshair: {
            line: {
                color: '#F66',  // crosshair line color
                width: 1        // crosshair line width
            },
            sync: {
                enabled: true,            // enable trace line syncing with other charts
                group: 1,                 // chart group
                suppressTooltips: false   // suppress tooltips when showing a synced tracer
            },
            zoom: {
                enabled: true,                                      // enable zooming
                zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',     // background color of zoom box 
                zoomboxBorderColor: '#48F',                         // border color of zoom box
                zoomButtonText: 'Reset Zoom',                       // reset zoom button text
                zoomButtonClass: 'reset-zoom',                      // reset zoom button class
            },
            callbacks: {
                beforeZoom: () => function(start, end) {                  // called before zoom, return false to prevent zoom
                return true;
                },
                afterZoom: (zoomedChart) => function(start, end) {                   // called after zoom
                    // const {min, max} = zoomedChart.chart.scales.x;
                    // clearTimeout(timer);
                    // timer = setTimeout(() => {
                    //     console.log('Fetched data between ' + start + ' and ' + end);
                    //     // chart.data.datasets[0].data = fetchData(min, max);
                    //     // chart.stop(); // make sure animations are not running
                    //     // chart.update('none');
                    // }, 500);
                }
            }
        }
	}
}



let categorySchemes = [
    {
        mainAgencyID:'AVANTAGE',
        id:'AVANTAGE',
        name:'AVantage',
        sourcetype: 'api',
        source: `https://www.alphavantage.co/query?function=[[function]][[parameters]]&apikey=${configSettings[environment]['avantage']['apiKey']}`,
        structure: null,
        datatype: 'json',
        categories: [
            {
                id: 'INCOME_STATEMENT',
                name: 'Income Statement',
                dataflows: [],
                categories: [
                    {
                        id: 'grossProfit',
                        name: 'Gross Profit',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'grossprofitannualReports',
                                name: 'Gross Profit - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.grossProfit
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'grossprofitquarterlyReports',
                                name: 'Gross Profit - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.grossProfit
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalRevenue',
                        name: 'Total Revenue',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'totalrevenueannualReports',
                                name: 'Total Revenue - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalRevenue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalrevenuequarterlyReports',
                                name: 'Total Revenue - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalRevenue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'costOfRevenue',
                        name: 'Cost Of Revenue',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'costOfRevenueannualReports',
                                name: 'Cost Of Revenue - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.costOfRevenue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'costOfRevenuequarterlyReports',
                                name: 'Cost Of Revenue - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.costOfRevenue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'costofGoodsAndServicesSold',
                        name: 'Cost Of Goods and Services Sold',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'costofGoodsAndServicesSoldannualReports',
                                name: 'Cost Of Goods and Services Sold - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.costofGoodsAndServicesSold
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'costofGoodsAndServicesSoldquarterlyReports',
                                name: 'Cost Of Goods and Services Sold - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.costofGoodsAndServicesSold
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'operatingIncome',
                        name: 'Operating Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'operatingIncomeannualReports',
                                name: 'Operating Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.operatingIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'operatingIncomequarterlyReports',
                                name: 'Operating Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.operatingIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'sellingGeneralAndAdministrative',
                        name: 'Selling General and Administrative',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'sellingGeneralAndAdministrativeannualReports',
                                name: 'Selling General and Administrative - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.sellingGeneralAndAdministrative
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'sellingGeneralAndAdministrativequarterlyReports',
                                name: 'Selling General and Administrative - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.sellingGeneralAndAdministrative
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'researchAndDevelopment',
                        name: 'R & D',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'researchAndDevelopmentannualReports',
                                name: 'R & D - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.researchAndDevelopment
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'researchAndDevelopmentquarterlyReports',
                                name: 'R & D - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.researchAndDevelopment
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'operatingExpenses',
                        name: 'Operating Expenses',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'operatingExpensesannualReports',
                                name: 'Operating Expenses - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.operatingExpenses
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'operatingExpensesquarterlyReports',
                                name: 'Operating Expenses - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.operatingExpenses
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'investmentIncomeNet',
                        name: 'Net Investment Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'investmentIncomeNetannualReports',
                                name: 'Net Investment Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.investmentIncomeNet
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'investmentIncomeNetquarterlyReports',
                                name: 'Net Investment Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.investmentIncomeNet
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'netInterestIncome',
                        name: 'Net Interest Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'netInterestIncomeannualReports',
                                name: 'Net Interest Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netInterestIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'netInterestIncomequarterlyReports',
                                name: 'Net Interest Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netInterestIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'interestIncome',
                        name: 'Interest Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'interestIncomeannualReports',
                                name: 'Interest Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.interestIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'interestIncomequarterlyReports',
                                name: 'Interest Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.interestIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'interestExpense',
                        name: 'Interest Expense',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'interestExpenseannualReports',
                                name: 'Interest Expense - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.interestExpense
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'interestExpensequarterlyReports',
                                name: 'Interest Expense - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.interestExpense
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'nonInterestIncome',
                        name: 'Non Interest Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'nonInterestIncomeannualReports',
                                name: 'Non Interest Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.nonInterestIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'nonInterestIncomequarterlyReports',
                                name: 'Non Interest Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.nonInterestIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'otherNonOperatingIncome',
                        name: 'Other non Operating Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'otherNonOperatingIncomeannualReports',
                                name: 'Other non Operating Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherNonOperatingIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'otherNonOperatingIncomequarterlyReports',
                                name: 'Other non Operating Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherNonOperatingIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'depreciation',
                        name: 'Depreciation',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'depreciationannualReports',
                                name: 'Depreciation - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.depreciation
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'depreciationquarterlyReports',
                                name: 'Depreciation - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.depreciation
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'depreciationAndAmortization',
                        name: 'Depreciation And Amortization',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'depreciationAndAmortizationannualReports',
                                name: 'Depreciation And Amortization - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.depreciationAndAmortization
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'depreciationAndAmortizationquarterlyReports',
                                name: 'Depreciation And Amortization - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.depreciationAndAmortization
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'incomeBeforeTax',
                        name: 'Income Before Tax',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'incomeBeforeTaxannualReports',
                                name: 'Income Before Tax - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.incomeBeforeTax
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'incomeBeforeTaxquarterlyReports',
                                name: 'Income Before Tax - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.incomeBeforeTax
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'incomeTaxExpense',
                        name: 'Income Tax Expense',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'incomeTaxExpenseannualReports',
                                name: 'Income Tax Expense - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.incomeTaxExpense
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'incomeTaxExpensequarterlyReports',
                                name: 'Income Tax Expense - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.incomeTaxExpense
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'interestAndDebtExpense',
                        name: 'Interest and Debt Expense',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'interestAndDebtExpenseannualReports',
                                name: 'Interest and Debt Expense - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.interestAndDebtExpense
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'interestAndDebtExpensequarterlyReports',
                                name: 'Interest and Debt Expense - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.interestAndDebtExpense
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'netIncomeFromContinuingOperations',
                        name: 'Net Income from Continuing Operations',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'netIncomeFromContinuingOperationsannualReports',
                                name: 'Net Income from Continuing Operations - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netIncomeFromContinuingOperations
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'netIncomeFromContinuingOperationsquarterlyReports',
                                name: 'Net Income from Continuing Operations - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netIncomeFromContinuingOperations
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'comprehensiveIncomeNetOfTax',
                        name: 'Comprehensive Income Net of Tax',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'comprehensiveIncomeNetOfTaxannualReports',
                                name: 'Comprehensive Income Net of Tax - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.comprehensiveIncomeNetOfTax
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'comprehensiveIncomeNetOfTaxquarterlyReports',
                                name: 'Comprehensive Income Net of Tax - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.comprehensiveIncomeNetOfTax
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'ebit',
                        name: 'EBIT',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'ebitannualReports',
                                name: 'EBIT - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.ebit
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'ebitquarterlyReports',
                                name: 'EBIT - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.ebit
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'ebitda',
                        name: 'EBITDA',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'ebitdaannualReports',
                                name: 'EBITDA - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.ebitda
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'ebitdaquarterlyReports',
                                name: 'EBITDA - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.ebitda
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'netIncome',
                        name: 'Net Income',
                        function_name: 'INCOME_STATEMENT',
                        dataflows: [
                            {
                                id: 'netIncomeannualReports',
                                name: 'Net Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'netIncomequarterlyReports',
                                name: 'Net Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'BALANCE_SHEET',
                name: 'Balance Sheet',
                dataflows: [],
                categories: [
                    {
                        id: 'totalAssets',
                        name: 'Total Assets',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalAssetsannualReports',
                                name: 'Total Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalAssetsquarterlyReports',
                                name: 'Total Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalCurrentAssets',
                        name: 'Total Current Assets',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalCurrentAssetsannualReports',
                                name: 'Total Current Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalCurrentAssetsquarterlyReports',
                                name: 'Total Current Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'cashAndCashEquivalentsAtCarryingValue',
                        name: 'Cash And Equiv. At Carrying Value',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'cashAndCashEquivalentsAtCarryingValueannualReports',
                                name: 'Cash And Equiv. At Carrying Value - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashAndCashEquivalentsAtCarryingValue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'cashAndCashEquivalentsAtCarryingValuequarterlyReports',
                                name: 'Cash And Equiv. At Carrying Value - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashAndCashEquivalentsAtCarryingValue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'cashAndShortTermInvestments',
                        name: 'Cash and Short Term Investments',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'cashAndShortTermInvestmentsannualReports',
                                name: 'Cash and Short Term Investments - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashAndShortTermInvestments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'cashAndShortTermInvestmentsquarterlyReports',
                                name: 'Cash and Short Term Investments - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashAndShortTermInvestments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'inventory',
                        name: 'Inventory',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'inventoryannualReports',
                                name: 'Inventory - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.inventory
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'inventoryquarterlyReports',
                                name: 'Inventory - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.inventory
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'currentNetReceivables',
                        name: 'Current Net Receivables',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'currentNetReceivablesannualReports',
                                name: 'Current Net Receivables - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentNetReceivables
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'currentNetReceivablesquarterlyReports',
                                name: 'Current Net Receivables - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentNetReceivables
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalNonCurrentAssets',
                        name: 'Total Non Current Assets',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalNonCurrentAssetsannualReports',
                                name: 'Total Non Current Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalNonCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalNonCurrentAssetsquarterlyReports',
                                name: 'Total Non Current Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalNonCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'propertyPlantEquipment',
                        name: 'Property Plant Equipment',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'propertyPlantEquipmentannualReports',
                                name: 'Property Plant Equipment - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.propertyPlantEquipment
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'propertyPlantEquipmentquarterlyReports',
                                name: 'Property Plant Equipment - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.propertyPlantEquipment
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'accumulatedDepreciationAmortizationPPE',
                        name: 'Accumulated Depreciation Amortization',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'accumulatedDepreciationAmortizationPPEannualReports',
                                name: 'Accumulated Depreciation Amortization - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.accumulatedDepreciationAmortizationPPE
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'accumulatedDepreciationAmortizationPPEquarterlyReports',
                                name: 'Accumulated Depreciation Amortization - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.accumulatedDepreciationAmortizationPPE
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'intangibleAssets',
                        name: 'Intangible Assets',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'intangibleAssetsannualReports',
                                name: 'Intangible Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.intangibleAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'intangibleAssetsquarterlyReports',
                                name: 'Intangible Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.intangibleAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'intangibleAssetsExcludingGoodwill',
                        name: 'Intangible Assets Excluding Goodwill',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'intangibleAssetsExcludingGoodwillannualReports',
                                name: 'Intangible Assets Excluding Goodwill - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.intangibleAssetsExcludingGoodwill
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'intangibleAssetsExcludingGoodwillquarterlyReports',
                                name: 'Intangible Assets Excluding Goodwill - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.intangibleAssetsExcludingGoodwill
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'goodwill',
                        name: 'Goodwill',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'goodwillannualReports',
                                name: 'Goodwill - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.goodwill
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'goodwillquarterlyReports',
                                name: 'Goodwill - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.goodwill
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'investments',
                        name: 'Investments',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'investmentsannualReports',
                                name: 'Investments - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.investments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'investmentsquarterlyReports',
                                name: 'Investments - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.investments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'longTermInvestments',
                        name: 'Long Term Investments',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'longTermInvestmentsannualReports',
                                name: 'Long Term Investments - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.longTermInvestments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'longTermInvestmentsquarterlyReports',
                                name: 'Long Term Investments - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.longTermInvestments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'shortTermInvestments',
                        name: 'Short Term Investments',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'shortTermInvestmentsannualReports',
                                name: 'Short Term Investments - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.shortTermInvestments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'shortTermInvestmentsquarterlyReports',
                                name: 'Short Term Investments - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.shortTermInvestments
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'otherCurrentAssets',
                        name: 'Other Current Assets',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'otherCurrentAssetsannualReports',
                                name: 'Other Current Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'otherCurrentAssetsquarterlyReports',
                                name: 'Other Current Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'otherNonCurrentAssets',
                        name: 'Other Non Current Assets',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'otherNonCurrentAssetsannualReports',
                                name: 'Other Non Current Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherNonCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'otherNonCurrentAssetsquarterlyReports',
                                name: 'Other Non Current Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherNonCurrentAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalLiabilities',
                        name: 'Total Liabilities',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalLiabilitiesannualReports',
                                name: 'Total Liabilities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalLiabilitiesquarterlyReports',
                                name: 'Total Liabilities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalCurrentLiabilities',
                        name: 'Total Current Liabilities',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalCurrentLiabilitiesannualReports',
                                name: 'Total Current Liabilities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalCurrentLiabilitiesquarterlyReports',
                                name: 'Total Current Liabilities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'currentAccountsPayable',
                        name: 'Current Accounts Payable',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'currentAccountsPayableannualReports',
                                name: 'Current Accounts Payable - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentAccountsPayable
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'currentAccountsPayablequarterlyReports',
                                name: 'Current Accounts Payable - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentAccountsPayable
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'deferredRevenue',
                        name: 'Deferred Revenue',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'deferredRevenueannualReports',
                                name: 'Deferred Revenue - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.deferredRevenue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'deferredRevenuequarterlyReports',
                                name: 'Deferred Revenue - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.deferredRevenue
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'currentDebt',
                        name: 'Current Debt',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'currentDebtannualReports',
                                name: 'Current Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'currentDebtquarterlyReports',
                                name: 'Current Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'shortTermDebt',
                        name: 'Short Term Debt',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'shortTermDebtannualReports',
                                name: 'Short Term Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.shortTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'shortTermDebtquarterlyReports',
                                name: 'Short Term Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.shortTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalNonCurrentLiabilities',
                        name: 'Total Non Current Liabilities',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalNonCurrentLiabilitiesannualReports',
                                name: 'Total Non Current Liabilities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalNonCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalNonCurrentLiabilitiesquarterlyReports',
                                name: 'Total Non Current Liabilities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalNonCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'capitalLeaseObligations',
                        name: 'Capital Lease Obligations',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'capitalLeaseObligationsannualReports',
                                name: 'Capital Lease Obligations - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.capitalLeaseObligations
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'capitalLeaseObligationsquarterlyReports',
                                name: 'Capital Lease Obligations - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.capitalLeaseObligations
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'longTermDebt',
                        name: 'Long Term Debt',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'longTermDebtannualReports',
                                name: 'Long Term Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.longTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'longTermDebtquarterlyReports',
                                name: 'Long Term Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.longTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'currentLongTermDebt',
                        name: 'Current Long Term Debt',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'currentLongTermDebtannualReports',
                                name: 'Current Long Term Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentLongTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'currentLongTermDebtquarterlyReports',
                                name: 'Current Long Term Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.currentLongTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'longTermDebtNoncurrent',
                        name: 'Non Current Long Term Debt',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'longTermDebtNoncurrentannualReports',
                                name: 'Non Current Long Term Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.longTermDebtNoncurrent
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'longTermDebtNoncurrentquarterlyReports',
                                name: 'Non Current Long Term Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.longTermDebtNoncurrent
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'shortLongTermDebtTotal',
                        name: 'Total Short & Long Term Debt',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'shortLongTermDebtTotalannualReports',
                                name: 'Total Short & Long Term Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.shortLongTermDebtTotal
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'shortLongTermDebtTotalquarterlyReports',
                                name: 'Total Short & Long Term Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.shortLongTermDebtTotal
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'otherCurrentLiabilities',
                        name: 'Other Current Liabilities',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'otherCurrentLiabilitiesannualReports',
                                name: 'Other Current Liabilities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'otherCurrentLiabilitiesquarterlyReports',
                                name: 'Other Current Liabilities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'otherNonCurrentLiabilities',
                        name: 'Other Non Current Liabilities',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'otherNonCurrentLiabilitiesannualReports',
                                name: 'Other Non Current Liabilities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherNonCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'otherNonCurrentLiabilitiesquarterlyReports',
                                name: 'Other Non Current Liabilities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.otherNonCurrentLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'totalShareholderEquity',
                        name: 'Total Shareholder Equity',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'totalShareholderEquityannualReports',
                                name: 'Total Shareholder Equity - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalShareholderEquity
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'totalShareholderEquityquarterlyReports',
                                name: 'Total Shareholder Equity - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.totalShareholderEquity
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'treasuryStock',
                        name: 'Treasury Stock',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'treasuryStockannualReports',
                                name: 'Treasury Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.treasuryStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'treasuryStockquarterlyReports',
                                name: 'Treasury Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.treasuryStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'retainedEarnings',
                        name: 'Retained Earnings',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'retainedEarningsannualReports',
                                name: 'Retained Earnings - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.retainedEarnings
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'retainedEarningsquarterlyReports',
                                name: 'Retained Earnings - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.retainedEarnings
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'commonStock',
                        name: 'Common Stock',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'commonStockannualReports',
                                name: 'Common Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.commonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'commonStockquarterlyReports',
                                name: 'Common Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.commonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'commonStockSharesOutstanding',
                        name: 'Common Stock Shares Outstanding',
                        function_name: 'BALANCE_SHEET',
                        dataflows: [
                            {
                                id: 'commonStockSharesOutstandingannualReports',
                                name: 'Common Stock Shares Outstanding - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.commonStockSharesOutstanding
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'commonStockSharesOutstandingquarterlyReports',
                                name: 'Common Stock Shares Outstanding - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.commonStockSharesOutstanding
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'CASH_FLOW',
                name: 'Cash Flow',
                dataflows: [],
                categories: [
                    {
                        id: 'operatingCashflow',
                        name: 'Operating Cash Flow',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'operatingCashflowannualReports',
                                name: 'Operating Cash Flow - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.operatingCashflow
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'operatingCashflowquarterlyReports',
                                name: 'Operating Cash Flow - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.operatingCashflow
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'paymentsForOperatingActivities',
                        name: 'Payments For Operating Activities',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'paymentsForOperatingActivitiesannualReports',
                                name: 'Payments For Operating Activities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForOperatingActivities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'paymentsForOperatingActivitiesquarterlyReports',
                                name: 'Payments For Operating Activities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForOperatingActivities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromOperatingActivities',
                        name: 'Proceeds From Operating Actvities',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromOperatingActivitiesannualReports',
                                name: 'Proceeds From Operating Actvities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromOperatingActivities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromOperatingActivitiesquarterlyReports',
                                name: 'Proceeds From Operating Actvities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromOperatingActivities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'changeInOperatingLiabilities',
                        name: 'Change in Operating Liabilities',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'changeInOperatingLiabilitiesannualReports',
                                name: 'Change in Operating Liabilities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInOperatingLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'changeInOperatingLiabilitiesquarterlyReports',
                                name: 'Change in Operating Liabilities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInOperatingLiabilities
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'changeInOperatingAssets',
                        name: 'Change in Operating Assets',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'changeInOperatingAssetsannualReports',
                                name: 'Change in Operating Assets - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInOperatingAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'changeInOperatingAssetsquarterlyReports',
                                name: 'Change in Operating Assets - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInOperatingAssets
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'depreciationDepletionAndAmortization',
                        name: 'Depreciation Depletion & Amortization',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'depreciationDepletionAndAmortizationannualReports',
                                name: 'Depreciation Depletion & Amortization - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.depreciationDepletionAndAmortization
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'depreciationDepletionAndAmortizationquarterlyReports',
                                name: 'Depreciation Depletion & Amortization - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.depreciationDepletionAndAmortization
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'capitalExpenditures',
                        name: 'Capital Expenditure',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'capitalExpendituresannualReports',
                                name: 'Capital Expenditure - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.capitalExpenditures
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'capitalExpendituresquarterlyReports',
                                name: 'Capital Expenditure - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.capitalExpenditures
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'changeInReceivables',
                        name: 'Change in Receivables',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'changeInReceivablesannualReports',
                                name: 'Change in Receivables - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInReceivables
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'changeInReceivablesquarterlyReports',
                                name: 'Change in Receivables - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInReceivables
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'changeInInventory',
                        name: 'Change in Inventory',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'changeInInventoryannualReports',
                                name: 'Change in Inventory - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInInventory
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'changeInInventoryquarterlyReports',
                                name: 'Change in Inventory - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInInventory
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'profitLoss',
                        name: 'Profit & Loss',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'profitLossannualReports',
                                name: 'Profit & Loss - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.profitLoss
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'profitLossquarterlyReports',
                                name: 'Profit & Loss - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.profitLoss
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'cashflowFromInvestment',
                        name: 'Cash Flow From Investment',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'cashflowFromInvestmentannualReports',
                                name: 'Cash Flow From Investment - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashflowFromInvestment
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'cashflowFromInvestmentquarterlyReports',
                                name: 'Cash Flow From Investment - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashflowFromInvestment
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'cashflowFromFinancing',
                        name: 'Cash Flow From Financing',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'cashflowFromFinancingannualReports',
                                name: 'Cash Flow From Financing - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashflowFromFinancing
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'cashflowFromFinancingquarterlyReports',
                                name: 'Cash Flow From Financing - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.cashflowFromFinancing
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromRepaymentsOfShortTermDebt',
                        name: 'Proceeds from Repayment of Short Term Debt',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromRepaymentsOfShortTermDebtannualReports',
                                name: 'Proceeds from Repayment of Short Term Debt - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromRepaymentsOfShortTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromRepaymentsOfShortTermDebtquarterlyReports',
                                name: 'Proceeds from Repayment of Short Term Debt - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromRepaymentsOfShortTermDebt
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'paymentsForRepurchaseOfCommonStock',
                        name: 'Payments for Repurchase of Common Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'paymentsForRepurchaseOfCommonStockannualReports',
                                name: 'Payments for Repurchase of Common Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForRepurchaseOfCommonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'paymentsForRepurchaseOfCommonStockquarterlyReports',
                                name: 'Payments for Repurchase of Common Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForRepurchaseOfCommonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'paymentsForRepurchaseOfEquity',
                        name: 'Payments for Repurchase of Equity',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'paymentsForRepurchaseOfEquityannualReports',
                                name: 'Payments for Repurchase of Equity - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForRepurchaseOfEquity
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'paymentsForRepurchaseOfEquityquarterlyReports',
                                name: 'Payments for Repurchase of Equity - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForRepurchaseOfEquity
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'paymentsForRepurchaseOfPreferredStock',
                        name: 'Payments for Repurchase of Preferred Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'paymentsForRepurchaseOfPreferredStockannualReports',
                                name: 'Payments for Repurchase of Preferred Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForRepurchaseOfPreferredStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'paymentsForRepurchaseOfPreferredStockquarterlyReports',
                                name: 'Payments for Repurchase of Preferred Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.paymentsForRepurchaseOfPreferredStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'dividendPayout',
                        name: 'Dividend Payout',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'dividendPayoutannualReports',
                                name: 'Dividend Payout - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.dividendPayout
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'dividendPayoutquarterlyReports',
                                name: 'Dividend Payout - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.dividendPayout
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'dividendPayoutCommonStock',
                        name: 'Dividend Payout Common Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'dividendPayoutCommonStockannualReports',
                                name: 'Dividend Payout Common Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.dividendPayoutCommonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'dividendPayoutCommonStockquarterlyReports',
                                name: 'Dividend Payout Common Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.dividendPayoutCommonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'dividendPayoutPreferredStock',
                        name: 'Dividend Payout Preferred Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'dividendPayoutPreferredStockannualReports',
                                name: 'Dividend Payout Preferred Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.dividendPayoutPreferredStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'dividendPayoutPreferredStockquarterlyReports',
                                name: 'Dividend Payout Preferred Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.dividendPayoutPreferredStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromIssuanceOfCommonStock',
                        name: 'Proceeds from Issuance of Common Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromIssuanceOfCommonStockannualReports',
                                name: 'Proceeds from Issuance of Common Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromIssuanceOfCommonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromIssuanceOfCommonStockquarterlyReports',
                                name: 'Proceeds from Issuance of Common Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromIssuanceOfCommonStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet',
                        name: 'Proceeds from Issuance of Long Term Debt & Net Capital Securities',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNetannualReports',
                                name: 'Proceeds from Issuance of Long Term Debt & Net Capital Securities - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNetquarterlyReports',
                                name: 'Proceeds from Issuance of Long Term Debt & Net Capital Securities - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromIssuanceOfPreferredStock',
                        name: 'Proceeds from Issuance of Preferred Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromIssuanceOfPreferredStockannualReports',
                                name: 'Proceeds from Issuance of Preferred Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromIssuanceOfPreferredStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromIssuanceOfPreferredStockquarterlyReports',
                                name: 'Proceeds from Issuance of Preferred Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromIssuanceOfPreferredStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromRepurchaseOfEquity',
                        name: 'Proceeds from Repurchase of Equity',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromRepurchaseOfEquityannualReports',
                                name: 'Proceeds from Repurchase of Equity - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromRepurchaseOfEquity
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromRepurchaseOfEquityquarterlyReports',
                                name: 'Proceeds from Repurchase of Equity - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromRepurchaseOfEquity
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'proceedsFromSaleOfTreasuryStock',
                        name: 'Proceeds from Sale of Treasury Stock',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'proceedsFromSaleOfTreasuryStockannualReports',
                                name: 'Proceeds from Sale of Treasury Stock - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromSaleOfTreasuryStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'proceedsFromSaleOfTreasuryStockquarterlyReports',
                                name: 'Proceeds from Sale of Treasury Stock - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.proceedsFromSaleOfTreasuryStock
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'changeInCashAndCashEquivalents',
                        name: 'Change in Cash & Equiv.',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'changeInCashAndCashEquivalentsannualReports',
                                name: 'Change in Cash & Equiv. - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInCashAndCashEquivalents
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'changeInCashAndCashEquivalentsquarterlyReports',
                                name: 'Change in Cash & Equiv. - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInCashAndCashEquivalents
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'changeInExchangeRate',
                        name: 'Change in Exchange Rate',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'changeInExchangeRateannualReports',
                                name: 'Change in Exchange Rate - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInExchangeRate
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'changeInExchangeRatequarterlyReports',
                                name: 'Change in Exchange Rate - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.changeInExchangeRate
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'netIncome',
                        name: 'Net Income',
                        function_name: 'CASH_FLOW',
                        dataflows: [
                            {
                                id: 'netIncomeannualReports',
                                name: 'Net Income - Annual',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.annualReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            },
                            {
                                id: 'netIncomequarterlyReports',
                                name: 'Net Income - Quarterly',
                                attributes: {
                                    chartType: 'bar',
                                    filterUrlResponse: `response.quarterlyReports.map(x => (
                                        {
                                            'x': window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy") : window.luxon.DateTime.fromFormat(x.fiscalDateEnding,"yyyy-MM-dd"),
                                            'y':x.netIncome
                                        }
                                    ))`,
                                    hasTicker: true,
                                    parameters_string: '&symbol=[[ticker]]',
                                    parameters: {
                                        ticker: null,
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'TIME_SERIES_MONTHLY_ADJUSTED',
                name: 'Monthly Adjusted Time Series',
                function_name: 'TIME_SERIES_MONTHLY_ADJUSTED',
                dataflows: [
                    {
                        id: 'Monthly Adjusted Time Series',
                        name: 'Monthly Adjusted Time Series',
                        attributes: {
                                chartType: 'line',
                                filterUrlResponse: `Object.entries(response['Monthly Adjusted Time Series']).map(([date, prices]) => (
                                {
                                    x: window.luxon.DateTime.fromFormat(date,"yyyy-MM-dd").invalid? window.luxon.DateTime.fromFormat(date,"yyyy") : window.luxon.DateTime.fromFormat(date,"yyyy-MM-dd"),
                                    y: prices['4. close']
                                }
                            ));`,
                            hasTicker: true,
                            parameters_string: '&symbol=[[ticker]]',
                            parameters: {
                                ticker: null,
                            }
                        }
                    },
                ]
            }
        ]
    },
    {
        mainAgencyID:'YFinance',
        id:'YFinance',
        name:'YFinance',
        sourcetype: 'api',
        source: `${configSettings[environment]['python']['pythonApiUrl']}/get_yfinance_market_data/[[indicator]]`,
        structure: null,
        datatype: 'json',
        categories: [
            {
                id: 'Index',
                name: 'Market Indices',
                dataflows: [
                    {
                        id:'SNP500',
                        name:'S&P 500',
                        attributes: {
                            period: 'max',
                            interval: '1mo',
                            normalised: true
                        }
                    },
                    {
                        id:'NIFTY50',
                        name:'Nifty 50',
                        attributes: {
                            period: 'max',
                            interval: '1mo',
                            normalised: true
                        }
                    },
                    {
                        id:'RUSSELL2000',
                        name:'Russell 2000',
                        attributes: {
                            period: 'max',
                            interval: '1mo',
                            normalised: true
                        }
                    }
                ]
            }
        ]
    },
    {
        mainAgencyID:'OECD',
        id:'OECD',
        name:'OECD',
        sourcetype: 'api',
        source: 'https://sdmx.oecd.org/public/rest/data/[[agencyID]],[[indicator]],1.0/[[dimensions]]?startPeriod=1980&dimensionAtObservation=AllDimensions',
        structure: 'https://sdmx.oecd.org/public/rest/dataflow/[[agencyID]]/[[indicator]]/1.0?references=all',
        datatype: 'json',
    }
]