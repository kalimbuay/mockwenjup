console.log("Pabal AI Full Auto Bot Aktif!");

let isRunning = false;
let isProcessing = false;

// Shortcut Keyboard: Enter untuk mulai, Spasi untuk berhenti
window.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        isRunning = true;
        alert("Bot Full Auto Pabal AI: DIAKTIFKAN!");
    }
    if (event.key === ' ' || event.code === 'Space') {
        isRunning = false;
        alert("Bot Full Auto Pabal AI: DIHENTIKAN!");
        event.preventDefault();
    }
});

// Loop otomatisasi
setInterval(async () => {
    if (!isRunning || isProcessing) return;

    const buttons = document.querySelectorAll('button');
    let targetButton = null;

    for (let button of buttons) {
        if (button.innerText.includes('Push ahead')) {
            targetButton = button;
            break;
        }
    }

    if (targetButton && !targetButton.disabled) {
        isProcessing = true;
        console.log("Bot: Memicu transaksi otomatis ke background...");
        
        // Kirim perintah ke background.js untuk tanda tangan & kirim transaksi via RPC
        chrome.runtime.sendMessage({ action: "sendTransaction" }, (response) => {
            if (response && response.success) {
                console.log("Berhasil! Hash:", response.txHash);
            } else {
                console.error("Gagal:", response ? response.error : "Unknown error");
            }
            // Beri jeda sejenak sebelum siap klik berikutnya
            setTimeout(() => {
                isProcessing = false;
            }, 3000);
        });
    }
}, 2000);
