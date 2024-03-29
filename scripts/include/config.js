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
                dataflows: [
                    {
                        id: 'annualReports',
                        name: 'Annual Reports',
                        attributes: {
                            hasTicker: true,
                            parameters_string: '&symbol=[[ticker]]',
                            parameters: {
                                ticker: null,
                            }
                        }
                    },
                    {
                        id: 'quarterlyReports',
                        name: 'Quarterly Reports',
                        attributes: {
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