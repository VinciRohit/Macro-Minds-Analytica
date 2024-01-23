document.addEventListener('DOMContentLoaded', fetchOECDDataIndicators);

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
        
        nestedCategories(jsonData.data.categorySchemes[0].categories, oecdCategoryScheme.categories)

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
            filterByTopic2(filterid.reverse());
        });



    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


function filterByTopic2(selectedTopics) {
    const indicatorsDropdown = document.getElementById('indicators2');
    let indicators = indicatorsDropdown.querySelectorAll('option');
    const AgencyScheme = categorySchemes.find(categoryScheme => categoryScheme.mainAgencyID === selectedTopics[0]);

    let dataflows = [];
    let scheme = categorySchemes.find(categoryScheme => categoryScheme.mainAgencyID === selectedTopics[0]);
    let topic;

    for (let i = 1; i < selectedTopics.length; i++) {
        scheme = scheme.categories.find(categoryScheme => categoryScheme.id === selectedTopics[i]);
        if (i === selectedTopics.length - 1) {
            dataflows = scheme.dataflows;
            topic = selectedTopics[i]
            // console.log(dataflows);
            break;
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

}


async function getDimensions() {
    const indicator = document.getElementById('indicators2');
    const selectedOption = indicator.options[indicator.selectedIndex];
    const div = document.getElementById('MacroEconomicAnalysisIndicators2');
    let data;

    // Remove all previous filters
    while (div.lastElementChild && (div.lastElementChild.id != 'indicators2')) {
        div.removeChild(div.lastElementChild)
    }

    if (selectedOption.mainAgencyID === 'YFinance') {
    } else if (selectedOption.mainAgencyID === 'OECD') {
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
    }
}