chrome.storage.local.get(['keyCeo', 'keyBlues', 'keyGemini', 'keyFree', 'keyVikey', 'keyAgent', 'keyEvomap', 'keyUnimodel', 'keyHcnsec'], function(res) {
  if (res.keyCeo) document.getElementById('keyCeo').value = res.keyCeo;
  if (res.keyBlues) document.getElementById('keyBlues').value = res.keyBlues;
  if (res.keyGemini) document.getElementById('keyGemini').value = res.keyGemini;
  if (res.keyFree) document.getElementById('keyFree').value = res.keyFree;
  if (res.keyVikey) document.getElementById('keyVikey').value = res.keyVikey;
  if (res.keyAgent) document.getElementById('keyAgent').value = res.keyAgent;
  if (res.keyEvomap) document.getElementById('keyEvomap').value = res.keyEvomap;
  if (res.keyUnimodel) document.getElementById('keyUnimodel').value = res.keyUnimodel;
  if (res.keyHcnsec) document.getElementById('keyHcnsec').value = res.keyHcnsec;
});

async function tryGemini(key, prompt) {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'];
  for (let model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          return { text: data.candidates[0].content.parts[0].text, activeModel: model };
        }
      }
    } catch (e) {}
  }
  throw new Error("Gemini gagal");
}

async function tryOpenAIProvider(baseUrl, key, models, prompt) {
  for (let model of models) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }] })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0]) {
          return { text: data.choices[0].message.content, activeModel: model };
        }
      }
    } catch (e) {}
  }
  throw new Error(`Gagal di ${baseUrl}`);
}

document.getElementById('startBtn').addEventListener('click', async () => {
  const ai = document.getElementById('aiSelect').value;
  const topic = document.getElementById('topic').value.trim();
  const count = document.getElementById('count').value;
  const delayMin = parseInt(document.getElementById('delayMin').value);
  const delayMax = parseInt(document.getElementById('delayMax').value);
  
  const keyCeo = document.getElementById('keyCeo').value.trim();
  const keyBlues = document.getElementById('keyBlues').value.trim();
  const keyGemini = document.getElementById('keyGemini').value.trim();
  const keyFree = document.getElementById('keyFree').value.trim();
  const keyVikey = document.getElementById('keyVikey').value.trim();
  const keyAgent = document.getElementById('keyAgent').value.trim();
  const keyEvomap = document.getElementById('keyEvomap').value.trim();
  const keyUnimodel = document.getElementById('keyUnimodel').value.trim();
  const keyHcnsec = document.getElementById('keyHcnsec').value.trim();

  if (!topic) { alert("❌ Topik wajib diisi!"); return; }
  if (delayMin > delayMax) { alert("❌ Jeda minimal tidak boleh lebih besar dari maksimal!"); return; }
  
  chrome.storage.local.set({ keyCeo, keyBlues, keyGemini, keyFree, keyVikey, keyAgent, keyEvomap, keyUnimodel, keyHcnsec });

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('activeApiInfo').innerText = "Provider Aktif: 🔍 Mencari server...";
  const statusEl = document.getElementById('status');

  const promptText = `Buatkan ${count} pertanyaan natural untuk diskusi tentang "${topic}". Jangan gunakan nomor awalan. Jangan gunakan teks pembuka atau penutup. HANYA berikan daftar pertanyaannya saja, pisahkan tiap pertanyaan dengan baris baru (enter).`;
  
  let generatedText = "";
  let activeApiName = "-";

  statusEl.innerText = "Status: 🧠 Sedang membuat prompt...";
  
  // 1. CeoWeb3
  if (keyCeo && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://dashboard.ceoweb3.dev/v1', keyCeo, ['gemini-3.5-flash-lite', 'minimax-m2.5', 'deepseek-v4-flash'], promptText); 
      generatedText = result.text; activeApiName = `CeoWeb3 (${result.activeModel})`;
    } catch(e) {}
  }

  // 2. BluesMinds
  if (keyBlues && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://api.bluesminds.com/v1', keyBlues, ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash'], promptText); 
      generatedText = result.text; activeApiName = `BluesMinds (${result.activeModel})`;
    } catch(e) {}
  }

  // 3. Gemini
  if (keyGemini && !generatedText) {
    try { 
      const result = await tryGemini(keyGemini, promptText); 
      generatedText = result.text; activeApiName = `Google Gemini (${result.activeModel})`;
    } catch(e) {}
  }

  // 4. ViKey
  if (keyVikey && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://api.vikey.ai/v1', keyVikey, ['deepseek/deepseek-v4.1-flash', 'gemini/gemini-3.7-flash-high', 'deepseek-v4.1-flash'], promptText); 
      generatedText = result.text; activeApiName = `ViKey AI (${result.activeModel})`;
    } catch(e) {}
  }

  // 5. Agent Router
  if (keyAgent && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://agentrouter.org/v1', keyAgent, ['gpt-4o-mini', 'deepseek-v4-flash', 'deepseek-chat'], promptText); 
      generatedText = result.text; activeApiName = `Agent Router (${result.activeModel})`;
    } catch(e) {}
  }

  // 6. EvoMap
  if (keyEvomap && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://api.evomap.ai/v1', keyEvomap, ['gemini-3.1-pro-preview', 'gpt-4o-mini', 'deepseek-chat'], promptText); 
      generatedText = result.text; activeApiName = `EvoMap AI (${result.activeModel})`;
    } catch(e) {}
  }

  // 7. UniModel
  if (keyUnimodel && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://api.unimodel.ai/v1', keyUnimodel, ['deepseek-v4-flash', 'gpt-4o-mini', 'claude-3-haiku'], promptText); 
      generatedText = result.text; activeApiName = `UniModel AI (${result.activeModel})`;
    } catch(e) {}
  }

  // 8. FreeTokenFaucet
  if (keyFree && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://freetokenfaucet.com/v1', keyFree, ['gpt-5.6-luna', 'gpt-3.5-turbo', 'claude-fable-5'], promptText); 
      generatedText = result.text; activeApiName = `FreeTokenFaucet (${result.activeModel})`;
    } catch(e) {}
  }

  // 9. HCNSEC
  if (keyHcnsec && !generatedText) {
    try { 
      const result = await tryOpenAIProvider('https://api.hcnsec.cn/v1', keyHcnsec, ['step-3.7-flash', 'DeepSeek-V4.1-Flash', 'MiniMax-M3'], promptText); 
      generatedText = result.text; activeApiName = `HCNSEC (${result.activeModel})`;
    } catch(e) {}
  }

  if (!generatedText) {
    statusEl.innerText = "❌ Gagal: Semua API yang diisi sedang error / penuh.";
    document.getElementById('activeApiInfo').innerText = "Provider Aktif: ❌ Semua Gagal";
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    return;
  }

  document.getElementById('activeApiInfo').innerText = `Provider Aktif: 🚀 ${activeApiName}`;

  const prompts = generatedText.split('\n').map(p => p.replace(/^\d+[\.\-\)]\s*/, '').trim()).filter(p => p.length > 10);
  statusEl.innerText = `Status: ✅ Berhasil membuat ${prompts.length} pertanyaan. Memulai chat...`;

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "start", ai, prompts, delayMin, delayMax });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('status').innerText = "Status: 🛑 Dihentikan.";
  document.getElementById('delayCountdown').innerText = "Timer: 0s";
  document.getElementById('activeApiInfo').innerText = "Provider Aktif: -"; 
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "stop" });
});

chrome.runtime.onMessage.addListener((req) => {
   if (req.statusUpdate) document.getElementById('status').innerText = `Status: ${req.statusUpdate}`;
   if (req.progress) {
       document.getElementById('promptProgress').innerText = `Progres: ${req.progress.current}/${req.progress.total}`;
   }
   if (req.countdown !== undefined) {
       document.getElementById('delayCountdown').innerText = `Timer: ${req.countdown}s`;
   }
   if (req.done) {
       document.getElementById('startBtn').disabled = false;
       document.getElementById('stopBtn').disabled = true;
   }
});
