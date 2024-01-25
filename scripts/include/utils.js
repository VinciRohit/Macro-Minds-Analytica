// Define a simple Utils object with utility functions
const Utils = {
    months: ({ count }) => {
        // Function to generate an array of month labels
        // Implement as needed for your use case
        // For simplicity, just returning an array with count elements
        return Array.from({ length: count }, (_, index) => `Month ${index + 1}`);
    },
    numbers: ({ count, min, max }) => {
        // Function to generate an array of random numbers
        // Implement as needed for your use case
        // For simplicity, just returning an array with count random numbers
        return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    },
    rand: (min, max) => {
        // Function to generate a random number between min and max
        // Implement as needed for your use case
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    CHART_COLORS: {
        red: 'rgb(255, 99, 132)',
        blue: 'rgb(54, 162, 235)',
    },
    gradientize: (chart, color, opacity) => {
        // Function to make a color gradient
        // Implement as needed for your use case

        var {ctx, chartArea: {left, top, right, bottom}, scales: {x, y}} = chart;
        const gradient = ctx.createLinearGradient(0, 0, 0, y.bottom); // Adjust the coordinates as needed
        gradient.addColorStop(0, Utils.adjustColorTransparency(color, opacity)); // Start color with some transparency
        gradient.addColorStop(1, Utils.adjustColorTransparency(color, 0)); // End color with full transparency
        
        return gradient;
    },
    convertNamedColorToRGBA: (colorName) => {
        const tempElement = document.createElement('div');
        tempElement.style.color = colorName;
        document.body.appendChild(tempElement);
      
        const computedStyle = window.getComputedStyle(tempElement);
        const rgbaValues = computedStyle.color.match(/\d+/g).map(Number);
      
        document.body.removeChild(tempElement);
      
        return `rgba(${rgbaValues.join(', ')})`;
    },
    adjustColorTransparency: (color, alpha) => {
        // Convert named color to RGBA
        const rgbaColor = Utils.convertNamedColorToRGBA(color);
      
        // Parse the RGBA values
        const rgbaValues = rgbaColor.match(/\d+/g).map(Number);
      
        // Set the alpha value
        rgbaValues[3] = alpha * 255;
      
        // Return the modified RGBA color as a string
        return `rgba(${rgbaValues.join(', ')})`;
    },
    DateTime: window && window.luxon && window.luxon.DateTime,
    verticalLine: {
        id: 'verticalLine',
        beforeDraw(chart, args, options) {
            if (chart.options.plugins.customLine.drawLine) {
                var {ctx, chartArea: {left, top, right, bottom}, scales: {x, y}} = chart;
                var x = chart.options.plugins.customLine.value;
                // Draw the vertical line
                ctx.beginPath();
                ctx.moveTo(x, y.top);
                ctx.lineTo(x, y.bottom);
                ctx.strokeStyle = chart.options.plugins.annotation.annotations[0].borderColor;
                ctx.stroke();
            }
        }
    },
    verticalLineOnHover (event) {
		var element = event.chart.getElementsAtEventForMode(event, 'nearest', { intersect: false, axis:'x' }, false);

		if (element.length) {
		var {ctx, chartArea: {left, top, right, bottom}, scales: {x, y}} = event.chart;
		var x = element[0].element.x
		//event.chart.scales.x.getValueForPixel(x))
		// console.log(element[0].element.$context.parsed.x);
		event.chart.options.plugins.customLine.value = x;
		event.chart.options.plugins.customLine.drawLine = true;
		} else {
		event.chart.options.plugins.customLine.drawLine = false;
		}
		event.chart.update();
	},
    namedColor: index => {
        // Function to get a predefined color based on index
        // Implement as needed for your use case
        return index % 2 === 0 ? Utils.CHART_COLORS.red : Utils.CHART_COLORS.blue;
    },
    createButton: ({container, myInteractiveLineChart}) => {
        actions.forEach(action => {
            const button = document.createElement('button');
            button.innerHTML = action.name;
            button.className = "button2"
            button.addEventListener('click', () => action.handler(myInteractiveLineChart));
            container.appendChild(button);
        });
    },
    createButtonAsync: ({actions, container, myInteractiveLineChart}) => {
        actions.forEach(action => {
            const button = document.createElement('button');
            button.innerHTML = action.name;
            button.className = "button2"
            button.addEventListener('click', async () => {
                try {
                    await action.handler(myInteractiveLineChart);
                } catch (error) {
                    console.error('Error in button click:', error);
                }
            });
            container.appendChild(button);
        });
    },
    async fetchFile(filename) {
        try {
            const response = await fetch(filename);
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            var data = await response.json();
            // console.log('First data received: ',data);
            return data;
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            throw error; // Propagate the error
        }
    },
    async fetchJsonApi(api, body) {
        try {
            var response = await fetch(api, body);
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            var data = await response.json();
            // console.log('First data received: ',data);

            try {
                const pages = data[0].pages
                var page = data[0].page
        
                while(page < pages) {
                    try {
                        response = await fetch(api+`&page=${page+1}`);
                
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                
                        datanextpage = await response.json();
                        // console.log('First data received: ',datanextpage);
                        
                        page = datanextpage[0].page;
                        data[1] = [...data[1],...datanextpage[1]];
        
                    } catch (error) {
                    console.error('Error fetching or parsing data:', page, error);
                    throw error; // Propagate the error
                    }
        
                };
        
            } catch (error) {
                console.log(`Warning: Could not load other pages for the api query: ${api}`);
                // throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            throw error; // Propagate the error
        }
    },
    async fetchXmlApi(api, body) {
        try {
            var response = await fetch(api, body);
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const xmlString = await response.text();

            // console.log(xmlString);

            // Parse the XML string
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

            return xmlDoc;
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            throw error; // Propagate the error
        }
    },
    orderByDate: (data) => {
        data.sort((setA, setB) => {
            const dateA = setA.date;
            const dateB = setB.date;
            return new Date(dateA) - new Date(dateB);
        });
        return data
    },
    async updateChart (data, label, myInteractiveLineChart, yAxisID, tag) {
        myInteractiveLineChart.data.datasets.forEach(dataset => {
            if (dataset.label === label) {
                throw 'indicator already in chart';
            }
        });
        
        const dsColor = Utils.namedColor(myInteractiveLineChart.data.datasets.length);
        
        const dataset = {
            label: label,
            data: data,
            borderColor: dsColor,
            backgroundColor: Utils.gradientize(myInteractiveLineChart, dsColor, 1),
            fill: true
        };

        if (tag) {dataset.tag = tag}

        if (yAxisID) {
            dataset.yAxisID = yAxisID;
            myInteractiveLineChart.options.scales[yAxisID] = {display:false}
        }
        
    
        if (myInteractiveLineChart.config._config.type === 'candlestick') {
            myInteractiveLineChart.config._config.type = 'line';
            myInteractiveLineChart.options.elements.point.radius = 0;   // remove markers
            
            myInteractiveLineChart.data.datasets[0] = dataset
    
        } else {
            myInteractiveLineChart.options.elements.point.radius = 0;   // remove markers
            myInteractiveLineChart.data.datasets.push(dataset);
        };
    
        myInteractiveLineChart.update();
    
    },
    normalizeArray (array, key, minValue, maxValue) {
        const values = array.map(item => item[key]);
        const minValueKey = Math.min(...values);
        const maxValueKey = Math.max(...values);

        return array.map(item => ({
          x: item.x,
          y: item[key] ? ((item[key] - minValueKey) / (maxValueKey - minValueKey) * (maxValue - minValue)) + minValue : null
        }));
    },
    async getCorrelations (chart_name) {
        const datasets = Chart.getChart(chart_name).data.datasets
        const datasets_filtered = datasets.map(entry => ({tag: entry.tag, data:entry.data}))
        
        api = `${configSettings[environment]['pythonApiUrl']}/get_correlations`
        response = await Utils.fetchJsonApi(api, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(datasets_filtered)
        });
        
        data = response['data'];
        let updated_data = [];
        
        for (let corr of data) {
            corr_json = JSON.parse(corr);
            let updated_corr_json = [];
        
            for (let corr_column of corr_json) {
            let updated_corr_column = {};
            for (const tag in corr_column) {
                if (corr_column.hasOwnProperty(tag)) {
                let tag_name = Utils.getNamesFromTags(tag)
                updated_corr_column[tag_name] = corr_column[tag];
                }
            }
            updated_corr_json.push(updated_corr_column);
            }
            updated_data.push(updated_corr_json);
        
        }
        return updated_data;
        
    },
    async getCorrelationChart (chart_name, container_name) {
        const correlationDatasets = await Utils.getCorrelations(chart_name);
        const container = document.getElementById(container_name);
      
        for (let corr_data of correlationDatasets) {
          // Create a canvas element
          var canvas = document.createElement('canvas');
          canvas.className = 'button2'
      
          // Set attributes for the canvas (width and height)
          // canvas.width = 400; // Set your preferred width
          // canvas.height = 200; // Set your preferred height
      
          // Append the canvas element to the container
          container.appendChild(canvas);
      
          let context = canvas.getContext('2d');
      
          // Get Data
          var categories = Object.keys(corr_data[0]);
          // for (const tag in corr_data[0]) {categories.push(tag)}
          var data = []
          for (i=0; i<categories.length; i++) {
            for (j=0; j<categories.length; j++) {
              data.push({x:categories[i], y:categories[j], v:corr_data[i][categories[j]]})
            }
          }
          
          
          let canvas_data = {
            datasets: [{
              label: 'My Matrix',
              data: data,
              backgroundColor(context) {
                const value = context.dataset.data[context.dataIndex].v;
                const alpha = (value - 5) / 40;
                const rgbaColor = 'rgba(0, 255, 0, ' + value + ')';
                return rgbaColor;
              },
              borderColor(context) {
                const value = context.dataset.data[context.dataIndex].v;
                const alpha = (value - 5) / 40;
                const rgbaColor = 'rgba(0, 255, 0, ' + value + ')';
                return rgbaColor;
              },
              borderWidth: 1,
              width: ({chart}) => (chart.chartArea || {}).width / categories.length - 1,
              height: ({chart}) =>(chart.chartArea || {}).height / categories.length - 1
            }]
          };
          // </block:data>
      
          // <block:config:0>
          let config = {
            type: 'matrix',
            data: canvas_data,
            options: {
              plugins: {
                legend: false,
                tooltip: {
                  callbacks: {
                    title() {
                      return '';
                    },
                    label(context) {
                      const v = context.dataset.data[context.dataIndex];
                      return ['x: ' + v.x, 'y: ' + v.y, 'v: ' + v.v];
                    }
                  }
                }
              },
              scales: {
                x: {
                  type: 'category',
                  labels: categories,
                  ticks: {
                    display: true
                  },
                  grid: {
                    display: false
                  }
                },
                y: {
                  type: 'category',
                  labels: categories.reverse(),
                  offset: true,
                  ticks: {
                    display: true
                  },
                  grid: {
                    display: false
                  }
                }
              }
            }
          };
      
          let myChart = new Chart(context, config);
      
        }
    },
    getNamesFromTags (tag) {
        let flows = tag.split('/')
        if (flows[0] === 'YFinance') {
            let indice = flows[2].split('_')
            return categorySchemes.find(entry => entry.mainAgencyID === flows[0])
                                .categories.find(entry => entry.id === flows[1])
                                .dataflows.find(entry => entry.id === indice[0])
                                .name
        } else if (flows[0] === 'OECD') {
            // let indice = flows[2].split('_')
            let categories = categorySchemes.find(entry => entry.mainAgencyID === flows[0])
                                .categories.find(entry => entry.id === flows[1])
                                // .dataflows.find(entry => entry.id === flows[2])
                                // .name
            for (i=2; i < flows.length - 1; i++) {
                if (categories.dataflows.find(entry => entry.id === flows[i])) {
                    return categories.dataflows.find(entry => entry.id === flows[i]).name
                } else {
                    categories = categories.categories.find(entry => entry.id === flows[i])
                }
            }
        }
    }
    
};


