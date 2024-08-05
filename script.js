// 獲取HTML元素
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const analyzeButton = document.getElementById('analyze');
const downloadLink = document.getElementById('download');

// 啟動前視鏡頭（後置鏡頭）
navigator.mediaDevices.getUserMedia({
    video: { facingMode: { exact: "environment" } }
})
.then(function(stream) {
    video.srcObject = stream;
    video.play();
})
.catch(function(err) {
    console.log("發生錯誤: " + err);
    alert("無法啟動前視鏡頭（後置鏡頭），請檢查設備是否支援。");
});

// 拍照功能
snapButton.addEventListener('click', function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    downloadLink.href = dataUrl;
    downloadLink.download = 'photo.png';
    downloadLink.style.display = 'block';
    downloadLink.textContent = '下載照片';
    analyzeButton.style.display = 'block';
});

// 分析功能
analyzeButton.addEventListener('click', function() {
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const ppmValues = {
        '0.2': getAverageColor(imgData, 15, 50, 0.5),
        '5': getAverageColor(imgData, 85, 50, 0.5)
    };
    const sampleValue = getAverageColor(imgData, 50, 80, 0.1);
    console.log('PPM Values:', ppmValues);
    console.log('Sample Value:', sampleValue);

    // 根據PPM數值推算Sample的濃度
    const samplePpm = calculatePpm(ppmValues, sampleValue);
    alert('Sample PPM: ' + samplePpm);
});

function getAverageColor(imgData, centerXPercent, centerYPercent, heightPercent) {
    const centerX = Math.floor(imgData.width * (centerXPercent / 100));
    const centerY = Math.floor(imgData.height * (centerYPercent / 100));
    const halfHeight = Math.floor(imgData.height * (heightPercent / 2));
    
    let r = 0, g = 0, b = 0, count = 0;
    for (let y = centerY - halfHeight; y < centerY + halfHeight; y++) {
        for (let x = centerX - 1; x <= centerX + 1; x++) {
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
    const ppmKeys = Object.keys(ppmValues).map(Number).sort((a, b) => a - b);
    let closestPpm = ppmKeys[0];
    let closestDifference = getColorDifference(ppmValues[closestPpm], sampleValue);

    for (const ppm of ppmKeys) {
        const difference = getColorDifference(ppmValues[ppm], sampleValue);
        if (difference < closestDifference) {
            closestDifference = difference;
            closestPpm = ppm;
        }
    }

    return closestPpm;
}

function getColorDifference(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}
