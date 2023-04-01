const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('submitBtn');
const plantName = document.getElementById('plantName');
const commonNames = document.getElementById('commonNames');
const wikiUrl = document.getElementById('wikiUrl');
const wikiDescription = document.getElementById('wikiDescription');
const preview = document.getElementById('preview');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

async function fetchInvasiveSpecies() {
const response = await fetch('/data/invasive_species.csv');
const csvData = await response.text();
const rows = csvData.split('\n').slice(1);
console.log('CSV rows:', rows); // Add this line
const invasiveSpecies = {};

rows.forEach(row => {
const [name, value] = row.split(','); // Change this line
if (name && value) {
    invasiveSpecies[name.trim()] = value.trim();
}
});

return invasiveSpecies;
}


function imageToBase64(img) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = "block"; // Add this line
            resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(img);
    });
}

async function identifyPlant(base64Image) {
    const response = await fetch('https://solvefortomorrow.herokuapp.com/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
    });

    const data = await response.json();
    return data.suggestions[0];
}

fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        imageToBase64(e.target.files[0]);
    }
});

submitBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) {
        alert('Please upload an image');
        return;
    }

    submitBtn.disabled = true;
    loading.style.display = 'block';

    const base64Image = await imageToBase64(fileInput.files[0]);
    const plantData = await identifyPlant(base64Image);

    plantName.textContent = plantData.plant_name;
    commonNames.textContent = `Common names: ${plantData.plant_details.common_names ? plantData.plant_details.common_names.join(', ') : ''}`;
    wikiUrl.href = plantData.plant_details.url;
    wikiDescription.textContent = plantData.plant_details.wiki_description.value;

    result.style.display = 'block';
    loading.style.display = 'none';
    submitBtn.disabled = false;
    console.log(plantData.plant_name);

    const invasiveSpecies = await fetchInvasiveSpecies();
    const isInvasive = invasiveSpecies.hasOwnProperty(plantData.plant_name);

    if (isInvasive) {
        const invasiveValue = invasiveSpecies[plantData.plant_name];
        invasiveStatus.textContent = `Invasive status: ${invasiveValue}`;

        const warningSign = document.createElement('span');
        warningSign.textContent = '⚠️';
        warningSign.style.fontSize = '1.5em';

        if (invasiveValue.toLowerCase() === 'low') {
            warningSign.style.color = 'yellow';
        } else if (invasiveValue.toLowerCase() === 'medium') {
            warningSign.style.color = 'orange';
        } else if (invasiveValue.toLowerCase() === 'high') {
            warningSign.style.color = 'red';
        }
    }else {
        invasiveStatus.textContent = '';
    }
});
