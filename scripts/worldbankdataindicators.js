
document.addEventListener('DOMContentLoaded', fetchWorldBankDataIndicators);

async function fetchWorldBankDataIndicators() {
    // Add index data
    let jsonArray = [{id:'SNP500', name:'S&P 500', topics:[{id:'Index',value:'Market Indices'}]}]
    
    try {
        api = 'https://api.worldbank.org/v2/indicators?format=json&source=2';
        const jsonData = await Utils.fetchJsonApi(api);
        jsonArray = jsonArray.concat(jsonData[1]);

        const topicsDropdown = document.getElementById('topics');
        const indicatorsDropdown = document.getElementById('indicators');

        const topicsSet = new Set();

        jsonArray.forEach(indicator => {
            const id = indicator.id;
            const name = indicator.name;

            // Populate indicators dropdown
            const option = document.createElement('option');
            option.value = id;
            option.topics = new Set();
            option.textContent = `${name}`;
            indicatorsDropdown.appendChild(option);

            // Collect unique topics for filtering
            if (indicator.topics && indicator.topics.length > 0) {
                indicator.topics.forEach(topic => {
                    topic.id ? topicsSet.add(JSON.stringify(topic)) : false;
                    topic.id ? option.topics.add(topic.id) : false;
                }
            )}
        });

        const jsonParsedTopicsSet = Array.from(topicsSet).map(JSON.parse);

        // Populate topics dropdown
        jsonParsedTopicsSet.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            // option.textContent = `${topic.id} - ${topic.value}`;
            option.textContent = `${topic.value}`;
            topicsDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function filterByTopic() {
    const selectedTopic = document.getElementById('topics').value;
    const indicatorsDropdown = document.getElementById('indicators');
    const indicators = indicatorsDropdown.querySelectorAll('option');
    // console.log(selectedTopic, !selectedTopic)

    optionsSet = [];
    indicators.forEach(option => {
        // let topics;
        // try {
        //     topics = JSON.parse(option.topics)
        // } catch {
        //     topics = option.topics; // Extract topic from option text
        // }

        const topics = option.topics;
        // console.log(option.value, selectedTopic, !option.value);
        option.style.display = 'none';

        if (!selectedTopic || !option.value) {
            option.style.display = 'block';
            optionsSet.push(option);
        } else {
            topics.forEach(topic => {
                if (topic.length > 0) {
                    if (topic === selectedTopic) {
                        option.style.display = 'block';
                        optionsSet.push(option);
                    }
                }
            })
        }
    });
    optionsSet[0].selected = true;
}