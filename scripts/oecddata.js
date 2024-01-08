
document.addEventListener('DOMContentLoaded', initializeMacroChart);


async function initializeMacroChart() {
	
	// var api = 'https://api.worldbank.org/v2/country/xd/indicator/BX.KLT.DINV.WD.GD.ZS?format=json';

	var macrochartoptions = { ...options };
	macrochartoptions.scales.x = scale_x;
	// macrochartoptions.onHover = Utils.verticalLineOnHover;	// Using Cross-Hair instead

	var container = document.getElementById('MacroEconomicAnalysisContainer2');
	const ctx = document.getElementById('MacroEconomicAnalysis2').getContext('2d');
	const myInteractiveLineChart = new Chart(ctx, {
		type: 'line',
	options: macrochartoptions,
	// plugins: [Utils.verticalLine]	// Using Cross-Hair instead
	});

	const actions = GetMacroDataButtonactions()
	Utils.createButtonAsync({actions, container, myInteractiveLineChart})
}