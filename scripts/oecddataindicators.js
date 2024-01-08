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

    for (let i = 1; i < selectedTopics.length; i++) {
        scheme = scheme.categories.find(categoryScheme => categoryScheme.id === selectedTopics[i]);
        if (i === selectedTopics.length - 1) {
            dataflows = scheme.dataflows;
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
            option.datatype = AgencyScheme.datatype;
            option.mainAgencyID = AgencyScheme.mainAgencyID;
            option.dataflowAttributes = indicator.attributes;
            option.value = indicator.id;
            option.textContent = `${indicator.name}`;
            indicatorsDropdown.appendChild(option);
            option.style.display = 'block';
            optionsSet.push(option);
        }

    })

    optionsSet[0].selected = true;

}