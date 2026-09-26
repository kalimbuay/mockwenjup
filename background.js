// Impor library ethers
importScripts('ethers.js');

const RPC_URL = "https://sepolia-rpc.giwa.io";
const CHAIN_ID = 91342;
const CONTRACT_ADDRESS = "0x37cD68C3aa5CbB95918844F0Cc341d1905F4fCbd"; // Alamat 'to' dari data Anda
const DATA_PAYLOAD = "0x1272dc25"; // Data function call pacu kuda

// !!! PERINGATAN: Gunakan Private Key Burner Wallet (Jangan wallet utama!)
const PRIVATE_KEY = "MASUKKAN_PRIVATE_KEY_WALLET_ANDA_DI_SINI"; 

// Mendengarkan sinyal dari halaman web untuk eksekusi transaksi
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendTransaction") {
        executeAutoTx().then((result) => {
            sendResponse(result);
        }).catch((err) => {
            sendResponse({ success: false, error: err.message });
        });
        return true; // Menjaga channel tetap terbuka untuk asynchronous response
    }
});

async function executeAutoTx() {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // Menyiapkan parameter transaksi sesuai data Anda
        const tx = {
            to: CONTRACT_ADDRESS,
            data: DATA_PAYLOAD,
            chainId: CHAIN_ID,
            gasLimit: ethers.utils.hexlify(68135) // Mengonversi gas "0x10a27" ke decimal/hex aman
        };

        console.log("Mengirim transaksi otomatis ke blockchain...");
        const txResponse = await wallet.sendTransaction(tx);
        console.log("Transaksi terkirim! Hash:", txResponse.hash);

        // Menunggu transaksi selesai divalidasi oleh network
        const receipt = await txResponse.wait();
        return { success: true, txHash: receipt.transactionHash };
    } catch (error) {
        console.error("Gagal kirim transaksi:", error);
        return { success: false, error: error.message };
    }
}
