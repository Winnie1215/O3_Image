const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const analyzeButton = document.getElementById('analyze');
const resultsDiv = document.getElementById('results');

// 檢查 DOM 元素是否正確獲取
console.log('video:', video);
console.log('canvas:', canvas);
console.log('snapButton:', snapButton);
console.log('analyzeButton:', analyzeButton);
console.log('resultsDiv:', resultsDiv);

// 設置攝像頭
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error: " + err);
    });

// 捕捉照片
snapButton.addEventListener('click', () => {
    console.log('Snap button clicked');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
});

// 分析功能
analyzeButton.addEventListener('click', function() {
    console.log('Analyze button clicked');
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const ppm0_2Box = getBoxCoordinates('ppm0_2');
    const ppm5Box = getBoxCoordinates('ppm5');
    const sampleBox = getBoxCoordinates('sample');

    const ppmValues = {
        '0.2': getAverageColor(imgData, ppm0_2Box),
        '5': getAverageColor(imgData, ppm5Box)
    };
    const sampleValue = getAverageColor(imgData, sampleBox);

    displayResults(ppmValues, sampleValue);

    const samplePpm = calculatePpm(ppmValues, sampleValue);
    alert('Sample PPM: ' + samplePpm);
});

function getBoxCoordinates(id) {
    const box = document.getElementById(id);
    const rect = box.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();

    const x = (rect.left - videoRect.left) / videoRect.width * video.videoWidth;
    const y = (rect.top - videoRect.top) / videoRect.height * video.videoHeight;
    const width = rect.width / videoRect.width * video.videoWidth;
    const height = rect.height / videoRect.height * video.videoHeight;

    return { x, y, width, height };
}

function getAverageColor(imgData, box) {
    let r = 0, g = 0, b = 0, count = 0;
    for (let y = box.y; y < box.y + box.height; y++) {
        for (let x = box.x; x < box.x + box.width; x++) {
            const index = (y * imgData.width + x) * 4;
            r += imgData.data[index];
            g += imgData.data[index + 1];
            b += imgData.data[index + 2];
            count++;
        }
    }

    return { r: r / count, g: g / count, b: b / count };
}

function calculatePpm(ppmValues, sampleValue) {
    const ppm0_2 = ppmValues['0.2'];
    const ppm5 = ppmValues['5'];
    const sampleColor = sampleValue;

    const ppm0_2Sum = ppm0_2.r + ppm0_2.g + ppm0_2.b;
    const ppm5Sum = ppm5.r + ppm5.g + ppm5.b;
    const sampleSum = sampleColor.r + sampleColor.g + sampleColor.b;

    const ppmRange = 5 - 0.2;
    const colorRange = ppm0_2Sum - ppm5Sum;
    const sampleOffset = ppm0_2Sum - sampleSum;

    const samplePpm = 0.2 + (sampleOffset / colorRange) * ppmRange;

    return samplePpm.toFixed(2) + ' ppm';
}

function displayResults(ppmValues, sampleValue) {
    resultsDiv.innerHTML = `
        <p>0.2 ppm: R=${ppmValues['0.2'].r.toFixed(2)}, G=${ppmValues['0.2'].g.toFixed(2)}, B=${ppmValues['0.2'].b.toFixed(2)}</p>
        <p>5 ppm: R=${ppmValues['5'].r.toFixed(2)}, G=${ppmValues['5'].g.toFixed(2)}, B=${ppmValues['5'].b.toFixed(2)}</p>
        <p>Sample: R=${sampleValue.r.toFixed(2)}, G=${sampleValue.g.toFixed(2)}, B=${sampleValue.b.toFixed(2)}</p>
    `;
}
