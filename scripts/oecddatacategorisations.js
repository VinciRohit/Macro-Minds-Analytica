document.addEventListener('DOMContentLoaded', fetchOECDDataCategorisations);
document.addEventListener('DOMContentLoaded', fetchOECDDataIndicators);

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

async function fetchOECDDataIndicators() {
    // Add index data
    const oecdCategoryScheme = categorySchemes.find(categoryScheme => categoryScheme.mainAgencyID === 'OECD');
    
    try {
        api = 'https://sdmx.oecd.org/public/rest/categoryscheme';
        const jsonData = await Utils.fetchJsonApi(api, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.sdmx.structure+json; charset=utf-8; version=1.0'
            }
        });

        oecdCategoryScheme.categories = oecdCategoryScheme.categories? oecdCategoryScheme.categories : [];

        function nestedCategories(categories, pushSchemeCategory) {
            for (let category of categories) {

                pushSchemeCategory.push({
                    id: category.id,
                    name: category.name,
                })

                if (category.categories){
                    const nestedPushSchemeCategory = pushSchemeCategory.find(categoryScheme => categoryScheme.id === category.id);
                    nestedPushSchemeCategory.categories = nestedPushSchemeCategory.categories? nestedPushSchemeCategory.categories : [];
                    nestedCategories(category.categories, nestedPushSchemeCategory.categories)
                }
            }
        }
        
        nestedCategories(jsonData.data.categorySchemes[0].categories, oecdCategoryScheme.categories);

        // create dropdowns
        await Utils2.categorySchemesDropdownFilteringAndEventHandling();

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

