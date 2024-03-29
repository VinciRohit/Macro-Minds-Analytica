// config
document.addEventListener('DOMContentLoaded', initializeFinancialChart);

async function initializeFinancialChart() {

	const finchart_options = { ...options };
	// finchart_options.onHover = Utils.verticalLineOnHover;	// Using Cross-Hair instead

	// var api = `${configSettings[environment]['python']['pythonApiUrl']}/get_yfinance_market_data/[[indicator]]`
	var api = categorySchemes.find((obj) => obj['mainAgencyID'] === 'YFinance')['source']
	api = api.replace('[[indicator]]','SNP500_5y');
	const response = await Utils.fetchJsonApi(api);
	const snpdata = Object.values(response['data'])

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

};