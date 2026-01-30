// ----------------- Sayfa geçişleri -----------------
function nextPage(current) {
    const currentPage = document.getElementById(`page${current}`);
    if (currentPage) currentPage.classList.remove('active');

    const next = current + 1;

    if (next <= 7) {
        const nextPage = document.getElementById(`page${next}`);
        if (nextPage) nextPage.classList.add('active');
    } else {
        const cakePage = document.getElementById('cake');
        if (cakePage) {
            cakePage.classList.add('active');

            // Mikrofonu yalnızca pasta sayfasında başlat
            initBlowDetection();
        }
    }
}

// ----------------- Mumları söndürme -----------------
function blowOutCandles() {
    const candles = document.querySelectorAll('.candle');
    candles.forEach(candle => candle.classList.add('snatched'));

    // Konfeti patlat
    launchConfetti(200);

    // Mum alevleri söndü, küçük duman ekle
    const cake = document.getElementById('cake');
    const smoke = document.createElement('div');
    smoke.classList.add('smoke');

    // Cake divinin üstüne ortala
    smoke.style.position = 'absolute';
    smoke.style.top = '20px'; // mumların hemen üstü
    smoke.style.left = '50%';
    smoke.style.transform = 'translateX(-50%)';
    smoke.style.zIndex = '50'; // diğer katmanların üstünde

    cake.appendChild(smoke);

    setTimeout(() => smoke.remove(), 2500); // 2.5 saniye sonra kaybolur

    // 3 saniye sonra yeni sayfayı göster
    setTimeout(() => {
        document.getElementById('cake').classList.remove('active');
        document.getElementById('page8').classList.add('active');
    }, 3000);
}




// ----------------- Konfeti fonksiyonu -----------------
function launchConfetti(count) {
    const cake = document.getElementById('cake');
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Rastgele pozisyon, dönüş ve boyut
        const xMove = (Math.random() - 0.5) * 200;
        const rotation = Math.random() * 720;
        const startX = Math.random() * 90;
        const size = 5 + Math.random() * 6;

        confetti.style.setProperty('--x', xMove + 'px');
        confetti.style.setProperty('--rot', rotation + 'deg');
        confetti.style.left = startX + 'vw';
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.backgroundColor = `hsl(${Math.random()*360}, 80%, 60%)`;
        confetti.style.animationDuration = 2 + Math.random() * 1.5 + 's';

        cake.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3500);
    }
}

// ----------------- Mikrofon ile üfleme -----------------
let microphoneStarted = false; // sadece bir kez başlat

async function initBlowDetection() {
    if (microphoneStarted) return; // zaten başladıysa tekrar başlatma
    microphoneStarted = true;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function detectBlow() {
            analyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const value = (dataArray[i] - 128) / 128;
                sum += value * value;
            }
            const rms = Math.sqrt(sum / dataArray.length);

            if (rms > 0.20) { // üfleme eşik değeri
                blowOutCandles(); // mumları söndür
                return; // sadece bir kez
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    } catch (err) {
        console.error('Mikrofon erişimi reddedildi veya desteklenmiyor.', err);
    }
}
