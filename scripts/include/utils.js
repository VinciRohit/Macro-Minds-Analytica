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
    async updateChart (data, label, myInteractiveLineChart, yAxisID) {
        myInteractiveLineChart.data.datasets.forEach(dataset => {
            if (dataset.label === label) {
                throw 'indicator already in chart';
            }
        });
        
        const dsColor = Utils.namedColor(myInteractiveLineChart.data.datasets.length);
        
        const dataset = {
            label: label,
            data: data,
            // yAxisID: label, // Associate with the first y-axis
            borderColor: dsColor,
            backgroundColor: Utils.gradientize(myInteractiveLineChart, dsColor, 1),
            fill: true
        };

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
    }
    
};


