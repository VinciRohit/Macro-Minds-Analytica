// config
document.addEventListener('DOMContentLoaded', initializeFinancialChart);

async function initializeFinancialChart() {

	const finchart_options = { ...options };
	// finchart_options.onHover = Utils.verticalLineOnHover;	// Using Cross-Hair instead

	var filename = 'python/data/SNP500.json';
	Utils.fetchFile(filename).then(snpdata => {
		const container = document.getElementById('HistoricalDataContainer');
		const ctx = document.getElementById('HistoricalData').getContext('2d');

		const myInteractiveLineChart = new Chart(ctx, {
				type: 'candlestick',
				data: {
				datasets: [{
					label: 'S&P 500',
					data: Object.values(snpdata),
					borderColor: '#36A2EB',
					backgroundColor: '#ecf0f1',
				}]
			},
			options: finchart_options,
			// plugins: [Utils.verticalLine]	// Using Cross-Hair instead
		});
		
		const actions = GetFinancialChartButtonactions()
		Utils.createButtonAsync({actions, container, myInteractiveLineChart})

	}, error => console.log(error));

};