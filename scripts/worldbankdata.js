
document.addEventListener('DOMContentLoaded', initializeWorldBankChart);


async function initializeWorldBankChart() {
	
	// var api = 'https://api.worldbank.org/v2/country/xd/indicator/BX.KLT.DINV.WD.GD.ZS?format=json';

	var worldbankchartoptions = { ...options };
	worldbankchartoptions.scales.x = scale_x;
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
	var filename = `python/data/SNP500_normalised_max.json`;
	var response = await Utils.fetchFile(filename);
	data = Object.values(response).map(entry => ({ 
		x: window.luxon.DateTime.fromObject({
												year: Utils.DateTime.fromMillis(entry.x).c.year
												, month: Utils.DateTime.fromMillis(entry.x).c.month
											})
		, y: entry.c 
	}));
	// data = Utils.orderByDate(data).map(entry => ({ x: window.luxon.DateTime.fromObject({year: entry.date, month: 12}).ts, y: entry.value }));

	// try {
	// 	const response = await Utils.fetchJsonApi(api);
	// 	data = Utils.orderByDate(response[1]).map(entry => ({ x: window.luxon.DateTime.fromObject({year: entry.date, month: 12}).ts, y: entry.value }));
	// } catch (error) {
	// 	throw error;
	// }

	data = Utils.normalizeArray(data, 'y', minValueWorldBankData, maxValueWorldBankData);
	// console.log(minValueWorldBankData, maxValueWorldBankData, data)

	// await Utils.updateChart(data, 'Foreign direct investment, net inflows (% of GDP)', myInteractiveLineChart);
	await Utils.updateChart(data, 'S&P 500', myInteractiveLineChart);
}
