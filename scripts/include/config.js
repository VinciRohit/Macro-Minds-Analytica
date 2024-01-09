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
                // modifierKey: 'ctrl',
            },
            zoom: {
                drag: {
                    enabled: true,
                },
                // pinch: {
                //     enabled: true,
                // },
                mode: 'xy',
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
                afterZoom: () => function(start, end) {                   // called after zoom
                }
            }
        }
	}
}


let categorySchemes = [
    {
        mainAgencyID:'YFinance',
        id:'YFinance',
        name:'YFinance',
        sourcetype: 'file',
        source: 'python/data/[[indicator]].json',
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
        source: 'https://sdmx.oecd.org/public/rest/data/[[agencyID]],[[indicator]],1.0/USA.M.HICP.CPI.PA._T.N.GY?startPeriod=2007-12&dimensionAtObservation=AllDimensions',
        datatype: 'json',
    }
]