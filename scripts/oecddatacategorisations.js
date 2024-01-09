document.addEventListener('DOMContentLoaded', fetchOECDDataCategorisations);

async function fetchOECDDataCategorisations() {
    // Add index data
    const oecdCategoryScheme = categorySchemes.find(categoryScheme => categoryScheme.mainAgencyID === 'OECD');
    
    try {
        api = 'https://sdmx.oecd.org/public/rest/categorisation';
        const xmlDoc = await Utils.fetchXmlApi(api, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.sdmx.structure+xml; charset=utf-8; version=2.1'
            }
        });

        const categorisations = xmlDoc.getElementsByTagName("structure:Categorisation");

        for (let category of categorisations) {
            let name = category.getElementsByTagName("common:Name")[0].textContent;
            let source = category.getElementsByTagName("structure:Source")[0].getElementsByTagName("Ref")[0].attributes.id.textContent;
            let agencyID = category.getElementsByTagName("structure:Source")[0].getElementsByTagName("Ref")[0].attributes.agencyID.textContent;
            let target = category.getElementsByTagName("structure:Target")[0].getElementsByTagName("Ref")[0].attributes.id.textContent;
            let topics = target.split(".");

            let nextScheme = {...oecdCategoryScheme}

            for (let topic of topics) {
                nextScheme = nextScheme.categories.find(categoryScheme => categoryScheme.id === topic);
                nextScheme.dataflows = nextScheme.dataflows? nextScheme.dataflows : []
                nextScheme.dataflows.push({id: source, name: name, attributes: {agencyID: agencyID}});
            }
        }

        


    } catch (error) {
        console.error('Error fetching data:', error);
    }
}