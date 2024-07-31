// 獲取HTML元素
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const downloadLink = document.getElementById('download');

// 啟動前置攝像頭
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
})
.then(function(stream) {
    video.srcObject = stream;
    video.play();
})
.catch(function(err) {
    console.log("發生錯誤: " + err);
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
});
