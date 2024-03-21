
document.addEventListener('DOMContentLoaded', initializeWorldBankChart);


async function initializeWorldBankChart() {
	
	var worldbankchartoptions = { ...options };
	worldbankchartoptions.scales.x = { ...scale_x };
	// worldbankchartoptions.onHover = Utils.verticalLineOnHover;	// Using Cross-Hair instead

	var container = document.getElementById('MacroEconomicAnalysisContainer');
	const ctx = document.getElementById('MacroEconomicAnalysis').getContext('2d');
	const myInteractiveLineChart = new Chart(ctx, {
		type: 'line',
	options: worldbankchartoptions,
	// plugins: [Utils.verticalLine]	// Using Cross-Hair instead
	});

	const actions = GetWorldBankDataButtonactions()
	Utils.createButtonAsync({actions, container, myInteractiveLineChart})

	let data;
	// var api = `${configSettings[environment]['python']['pythonApiUrl']}/get_yfinance_market_data/[[indicator]]_normalised_max`
	var api = categorySchemes.find((obj) => obj['mainAgencyID'] === 'YFinance')['source'] + '_normalised_max'
	api = api.replace('[[indicator]]','SNP500');
	const response = await Utils.fetchJsonApi(api);
	data = Object.values(response['data']).map(entry => ({ 
		x: window.luxon.DateTime.fromObject({
												year: Utils.DateTime.fromMillis(entry.x).c.year
												, month: Utils.DateTime.fromMillis(entry.x).c.month
											})
		, y: entry.c 
	}));

	data = Utils.normalizeArray(data, 'y', minValueWorldBankData, maxValueWorldBankData);

	await Utils.updateChart(data, 'S&P 500', myInteractiveLineChart);
}
