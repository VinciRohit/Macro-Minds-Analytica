// Define a simple Utils object with utility functions
// let timer;

const Utils_deprecated = {
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
}

const Utils = {
    
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
        Chart.getChart('AllDataChart').getDatasetMeta(0)._dataset
        const datasets_filtered = datasets.map(entry => ({tag: entry.tag, data:entry.data}))
        
        api = `${configSettings[environment]['python']['pythonApiUrl']}/get_correlations`
        response = await Utils.fetchJsonApi(api, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(datasets_filtered)
        });
        
        data = response['dataflows'];
        let updated_dataflows = [];
        
        for (let corr of data) {
            corr_json = corr['data'];
            corr_tag = corr['tag'];
            let updated_data = {'tag': corr_tag, 'data': {}};
        
            for (const corr_column in corr_json) {
                let tag_name_i = Utils.getNamesFromTags(corr_column)
                updated_data['data'][tag_name_i] = {};
                for (const tag in corr_json[corr_column]) {
                    let tag_name_j = Utils.getNamesFromTags(tag)
                    updated_data['data'][tag_name_i][tag_name_j] = corr_json[corr_column][tag];
                }
            }
            updated_dataflows.push(updated_data);
        
        }
        return updated_dataflows;
        
    },
    async getCorrelationChart (chart_name, container_name) {
        const correlationDatasets = await Utils.getCorrelations(chart_name);
        const container = document.getElementById(container_name);

        // First remove all existing canvases
        for (let i = container.children.length - 1; i >= 0; i--) {
            const child = container.children[i];
            if (child.tagName.toLowerCase() === 'canvas') {
                container.removeChild(child);
            }
        }
      
        for (let corr_data of correlationDatasets) {
          // Create a canvas element
          var canvas = document.createElement('canvas');
          var containerWidth = container.offsetWidth;
          var canvasWidth = containerWidth * 0.05 * Object.keys(corr_data['data']).length; // 10% of container width x number of datasets
          var canvasHeight = canvasWidth; // Assuming you want the height to be the same as the width

          // canvas.width = canvasWidth;
          // canvas.height = canvasHeight;

            canvas.style = 'display: inline-block'
      
          // Append the canvas element to the container
          container.appendChild(canvas);
      
          let context = canvas.getContext('2d');
      
          // Get Data
          var categories = Object.keys(corr_data['data']);
          // for (const tag in corr_data[0]) {categories.push(tag)}
          var data = []
          for (i=0; i<categories.length; i++) {
            for (j=0; j<categories.length; j++) {
              data.push({x:categories[i], y:categories[j], v:corr_data['data'][categories[i]][categories[j]]})
            }
          }
          
          
          let canvas_data = {
            datasets: [{
              label: corr_data['tag'],
              data: data,
              backgroundColor(context) {
                const value = context.dataset.data[context.dataIndex].v;
                // const alpha = (value - 5) / 40;
                const rgbaColor = 'rgba(0, 255, 0, ' + value + ')';
                return rgbaColor;
              },
              borderColor(context) {
                const value = context.dataset.data[context.dataIndex].v;
                // const alpha = (value - 5) / 40;
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
            //   maintainAspectRatio: true,
              responsive: false,  
              width: canvasWidth,
              height: canvasHeight,
            //   aspectRatio: 1,
              plugins: {
                title: {
                    display: true,
                    text: corr_data['tag']
                },
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
    },
};

const Utils2 = {
    async categorySchemesDropdownFilteringAndEventHandling() {
        // Function to create the dropdown from JSON
        function createDropdown(container, data) {
            var ul = $("<ul>").addClass("dropdown-menu");
            container.append(ul);
    
            $.each(data, function (index, item) {
            var li = $("<li>");
            ul.append(li);
    
            if (item.categories && item.categories.length > 0) {
                li.addClass("dropdown-submenu");
                // li.attr("id", item.id).text(item.name).append($("<span>").addClass("caret"))
                li.append(
                $("<a>").addClass("button2").attr("id", item.id).attr("type", "button").text(item.name + " ").append($("<span>").addClass("caret"))
                );
                createDropdown(li, item.categories);
            } else {
                li.append($("<a>").addClass("button3").attr("id", item.id).text(item.name));
            }
            });
        }
    
        // Call the function to create the dropdown
        createDropdown($("#dynamicDropdown"), categorySchemes);
    
        // Add event handling for dynamic dropdown
        $(document).on("click", '.dropdown-submenu a.button2', function (e) {
            if ($(this).next('ul')[0].getAttribute("style") != "display: block;") {
                $(".dropdown-menu").slice(1).attr('style','diplay: none;');
                for (let parent of $(this).parents(".dropdown-menu").slice(0, -1)) {
                    parent.setAttribute("style", "display: block;")
                }
            }
            
            $(this).next('ul').toggle();
            e.stopPropagation();
            e.preventDefault();
        });
    
        $(document).on("click", '.dropdown-submenu a.button3', function (e) {
            const SelectedData = document.getElementById('SelectData');
            SelectedData.innerHTML = $(this)[0].textContent + ' <span class="caret"></span>';
    
            var filterid = [];
            filterid.push($(this)[0].id);
            for (let parent of $(this).parents(".dropdown-submenu")) {
                filterid.push(parent.children[0].id);
            }
    
            // console.log(filterid.reverse());
            Utils2.filterByTopic2(filterid.reverse());
        });
    },
    filterByTopic2(selectedTopics) {
        const indicatorsDropdown = document.getElementById('indicators2');
        let indicators = indicatorsDropdown.querySelectorAll('option');
        const AgencyScheme = categorySchemes.find(categoryScheme => categoryScheme.mainAgencyID === selectedTopics[0]);
    
        let dataflows = [];
        let scheme = categorySchemes.find(categoryScheme => categoryScheme.mainAgencyID === selectedTopics[0]);
        let topic = '';
    
        for (let i = 1; i < selectedTopics.length; i++) {
            scheme = scheme.categories.find(categoryScheme => categoryScheme.id === selectedTopics[i]);
            if (i === selectedTopics.length - 1) {
                dataflows = scheme.dataflows;
                topic = topic + selectedTopics[i]
                // console.log(dataflows);
                break;
            } else {
                topic = topic + selectedTopics[i] + '/' ;
            }
        }
    
        let optionsSet = [];
    
        for (let opt of indicators) {
            if (opt.value != "") {
                opt.style.display = 'none';
            }
        }
    
        dataflows.forEach(indicator => {
    
            let optionAlreadyPresent = null;
    
            for (let opt of indicators) {
                if (opt.value === indicator.id) {
                    optionAlreadyPresent = opt;
                }
            }
    
            if (optionAlreadyPresent) {
                optionAlreadyPresent.style.display = 'block';
                optionsSet.push(optionAlreadyPresent);
            } else {
                const option = document.createElement('option');
                option.sourcetype = AgencyScheme.sourcetype;
                option.source = AgencyScheme.source;
                option.structure = AgencyScheme.structure;
                option.datatype = AgencyScheme.datatype;
                option.Topic = topic;
                option.mainAgencyID = AgencyScheme.mainAgencyID;
                option.dataflowAttributes = indicator.attributes;
                option.value = indicator.id;
                option.textContent = `${indicator.name}`;
                indicatorsDropdown.appendChild(option);
                option.style.display = 'block';
                optionsSet.push(option);
            }
    
        })
    
        // optionsSet[0].selected = true;
    
    },
    async getDimensions() {
        const indicator = document.getElementById('indicators2');
        const selectedOption = indicator.options[indicator.selectedIndex];
        const div = document.getElementById('MacroEconomicAnalysisIndicators2');
        // let data;
    
        // Remove all previous filters
        while (div.lastElementChild && (div.lastElementChild.id != 'indicators2')) {
            div.removeChild(div.lastElementChild)
        }
    
        if (selectedOption.mainAgencyID === 'YFinance') {
        } else if (selectedOption.mainAgencyID === 'OECD') {
            this.OECDDimensions(selectedOption, div);
        } else if (selectedOption.mainAgencyID === 'AVANTAGE') {
            this.AVantageDimensions(selectedOption, div);
        }
    },
    async OECDDimensions(selectedOption, div) {
        var datastructure = selectedOption.structure;
            let agencyID = selectedOption.dataflowAttributes.agencyID? selectedOption.dataflowAttributes.agencyID:'all';
            let indicator = selectedOption.value;
            datastructure = datastructure.replace('[[agencyID]]',agencyID);
            datastructure = datastructure.replace('[[indicator]]',indicator);
            try {
                const responseDataStructure = await Utils.fetchXmlApi(datastructure);
    
                // Get Dimensions
                const dimensionList = responseDataStructure.documentElement.getElementsByTagName("structure:DimensionList")[0];
                const dimensions = dimensionList.getElementsByTagName("structure:Dimension");
                dimensionsArray = Array.from(dimensions).map(dim => {
                    let codes = Array.from(dim.getElementsByTagName("structure:Enumeration")).map(tag => Array.from(tag.children).find(child => child.getAttribute? child.getAttribute('class') === 'Codelist' : false));
    
                    return {
                    dimId: dim.getAttribute("id"),
                    dimPosition: dim.getAttribute("position"),
                    // codeListId: Array.from(Array.from(dim.getElementsByTagName("structure:Enumeration"))[0].getElementsByTagName('Ref')).find(tag => tag.getAttribute('class') === 'Codelist').id
                    codeListId: codes.length? codes[0].id : ''
                    };
                });
                dimensionsArray.filter(dim => dim.codeListId); // remove elements where codeListId is blank
    
                // Get Concepts
                const StructureConcepts = responseDataStructure.documentElement.getElementsByTagName("structure:Concepts")[0];
                const Concepts = StructureConcepts.getElementsByTagName("structure:Concept");
                for (let concept of Concepts) {
                    let dim = dimensionsArray.find(entry => entry.dimId === concept.id);
                    if (dim) {
                        let conceptNameStructure = Array.from(concept.getElementsByTagName("common:Name")).find(child => child.getAttribute? child.getAttribute('xml:lang') === 'en' : false);
                        let conceptName = conceptNameStructure? conceptNameStructure.textContent : (Array.from(concept.getElementsByTagName("common:Name")).length? code.getElementsByTagName("common:Name")[0].textContent : '');
                        dim.dimName = conceptName;
                    }
                }
    
                // Get CodeList
                const StructureCodeLists = responseDataStructure.documentElement.getElementsByTagName("structure:Codelists")[0];
                const codeLists = StructureCodeLists.getElementsByTagName("structure:Codelist");
                for (let codeList of codeLists) {
                    let dim = dimensionsArray.find(entry => entry.codeListId === codeList.id);
    
                    if (dim) {
                        dim.codes = Array.from(codeList.getElementsByTagName("structure:Code")).map(code => {
                            let codeNames = Array.from(code.getElementsByTagName("common:Name")).find(child => child.getAttribute? child.getAttribute('xml:lang') === 'en' : false);
    
                            return {
                                codeId: code.getAttribute("id"),
                                codeName: codeNames? codeNames.textContent : (Array.from(code.getElementsByTagName("common:Name")).length? code.getElementsByTagName("common:Name")[0].textContent : ''),
                            };
                        })
                    }
    
                };
    
                // Get Constraints
                const StructureConstraints = responseDataStructure.documentElement.getElementsByTagName("structure:Constraints")[0];
                const StructureAllowedConstraints = StructureConstraints.getElementsByTagName("structure:ContentConstraint");
                let AllowedConstraint = Array.from(StructureAllowedConstraints).find(entry => entry.getAttribute('type')? entry.getAttribute('type') === 'Actual': false);
                AllowedConstraint = AllowedConstraint? AllowedConstraint : StructureAllowedConstraints[0];
                const StructurecubeRegion = AllowedConstraint.getElementsByTagName("structure:CubeRegion");
                let IncludedCubeRegion = Array.from(StructurecubeRegion).find(entry => entry.include? entry.include === 'true': false);
                IncludedCubeRegion = IncludedCubeRegion? IncludedCubeRegion : StructurecubeRegion[0];
                const Constraints = IncludedCubeRegion.getElementsByTagName("common:KeyValue");
                for (let constraint of Constraints) {
                    let dim = dimensionsArray.find(entry => entry.dimId === constraint.id);
    
                    if (dim) {
                        let constraintList = Array.from(constraint.getElementsByTagName("common:Value")).map(entry => entry.textContent);
                        let constraintSet = new Set(constraintList);
                        dim.codes = dim.codes.filter(item => constraintSet.has(item.codeId));
                    }
                }
    
                
                // Create html elements
                for (let dim of dimensionsArray) {
                    let dimSelect = document.createElement('select');
                    dimSelect.classList.add('button4');
                    dimSelect.setAttribute('id', dim.dimId);
    
                    let dimOption = document.createElement('option');
                    dimOption.setAttribute('value', '');
                    dimOption.textContent = `Select ${dim.dimName? dim.dimName : dim.dimId}`;
                    dimSelect.appendChild(dimOption);
    
                    for (let code of dim.codes) {
                        let dimOption = document.createElement('option');
                        dimOption.setAttribute('value', `${code.codeId}`);
                        dimOption.textContent = `${code.codeName}`;
                        dimSelect.appendChild(dimOption);
                    }
    
                    div.appendChild(dimSelect);
                }
                
    
            } catch (error) {
                throw error;
            }
    },
    async AVantageDimensions(selectedOption, div) {
        var dataflowAttributes = selectedOption.dataflowAttributes;
        if (dataflowAttributes.hasTicker) {
            let dimInput = document.createElement('input');
            dimInput.classList.add('textfield');
            dimInput.setAttribute('id', 'tickerInput');
            dimInput.setAttribute('placeholder', 'e.g. Ticker');
            dimInput.setAttribute('onkeyup', "Utils2.AVantageTickerSearch()");
            div.appendChild(dimInput);
        }
    },
    async AVantageTickerSearch() {
        try{
            var input = document.getElementById('tickerInput');
            var apiurl = categorySchemes.find((obj) => obj['mainAgencyID'] === 'AVANTAGE')['source']
            apiurl = apiurl.replace('[[function]]','SYMBOL_SEARCH').replace('[[parameters]]',`&keywords=${input.value}`);
            console.log(apiurl);
            var data = await Utils.fetchJsonApi(apiurl);
            console.log(data)
        } catch (error) {
            console.log(error);
        }
        
    }
}
