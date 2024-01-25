// // Get data for correlation

// async function getCorrelations(chart_name) {
//   const datasets = Chart.getChart(chart_name).data.datasets
//   const datasets_filtered = datasets.map(entry => ({tag: entry.tag, data:entry.data}))

//   api = `${configSettings[environment]['pythonApiUrl']}/get_correlations`
//   response = await Utils.fetchJsonApi(api, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(datasets_filtered)
//   });

//   data = response['data'];
//   let updated_data = [];
  
//   for (let corr of data) {
//     corr_json = JSON.parse(corr);
//     let updated_corr_json = [];

//     for (let corr_column of corr_json) {
//       let updated_corr_column = {};
//       for (const tag in corr_column) {
//         if (corr_column.hasOwnProperty(tag)) {
//           let tag_name = Utils.getNamesFromTags(tag)
//           updated_corr_column[tag_name] = corr_column[tag];
//         }
//       }
//       updated_corr_json.push(updated_corr_column);
//     }
//     updated_data.push(updated_corr_json);

//   }
//   return updated_data;

// }


// async function getCorrelationChart(container_name) {
//   const correlationDatasets = await getCorrelations();
//   const container = document.getElementById(container_name);

//   for (let corr_data of correlationDatasets) {
//     // Create a canvas element
//     var canvas = document.createElement('canvas');
//     CSSFontFeatureValuesRule.className = 'button2'

//     // Set attributes for the canvas (width and height)
//     // canvas.width = 400; // Set your preferred width
//     // canvas.height = 200; // Set your preferred height

//     // Append the canvas element to the container
//     container.appendChild(canvas);

//     let context = canvas.getContext('2d');

//     // Get Data
//     var categories = Object.keys(corr_data[0]);
//     // for (const tag in corr_data[0]) {categories.push(tag)}
//     var data = []
//     for (i=0; i<categories.length; i++) {
//       for (j=0; j<categories.length; j++) {
//         data.push({x:categories[i], y:categories[j], v:corr_data[i][categories[j]]})
//       }
//     }
    
    
//     let canvas_data = {
//       datasets: [{
//         label: 'My Matrix',
//         data: data,
//         backgroundColor(context) {
//           const value = context.dataset.data[context.dataIndex].v;
//           const alpha = (value - 5) / 40;
//           const rgbaColor = 'rgba(0, 255, 0, ' + value + ')';
//           return rgbaColor;
//         },
//         borderColor(context) {
//           const value = context.dataset.data[context.dataIndex].v;
//           const alpha = (value - 5) / 40;
//           const rgbaColor = 'rgba(0, 255, 0, ' + value + ')';
//           return rgbaColor;
//         },
//         borderWidth: 1,
//         width: ({chart}) => (chart.chartArea || {}).width / categories.length - 1,
//         height: ({chart}) =>(chart.chartArea || {}).height / categories.length - 1
//       }]
//     };
//     // </block:data>

//     // <block:config:0>
//     let config = {
//       type: 'matrix',
//       data: canvas_data,
//       options: {
//         plugins: {
//           legend: false,
//           tooltip: {
//             callbacks: {
//               title() {
//                 return '';
//               },
//               label(context) {
//                 const v = context.dataset.data[context.dataIndex];
//                 return ['x: ' + v.x, 'y: ' + v.y, 'v: ' + v.v];
//               }
//             }
//           }
//         },
//         scales: {
//           x: {
//             type: 'category',
//             labels: categories,
//             ticks: {
//               display: true
//             },
//             grid: {
//               display: false
//             }
//           },
//           y: {
//             type: 'category',
//             labels: categories.reverse(),
//             offset: true,
//             ticks: {
//               display: true
//             },
//             grid: {
//               display: false
//             }
//           }
//         }
//       }
//     };

//     let myChart = new Chart(context, config);

//   }
// }