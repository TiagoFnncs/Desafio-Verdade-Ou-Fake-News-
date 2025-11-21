const SCREENS = [
  "splash",
  "avatar",
  "permission",
  "home",
  "chat-voice",
  "chat-text",
  "see-screen",
  "fake-detector",
  "fake-result",
  "fake-library",
  "game-share",
  "educativos",
  "edu-checar",
  "edu-golpes",
  "edu-direitos",
  "edu-politica",
  "accessibility",
  "community",
  "alerts",
  "contacts",
  "emergency",
  "block-links", // added new screen id
  "programa-cidadao", // nova tela Programa Cidadão Tech 60+
  "avatar-ze", // new conditional informational screen for Zé
  "boleto-pix", // new boleto/pix safety screen
];

const state = {
  current: "splash",
  avatar: null, // 'gracinha' | 'ze'
  fontScale: 1,
  ttsOn: true,
  tiredMode: false,
  singleTouch: false,
  contrast: false,
  gameScore: 0,
  blockAuto: false, // whether user authorized automatic blocking
};

const tts = {
  speak(text) {
    if (!state.ttsOn) return;
    if (!("speechSynthesis" in window)) return;
    // Sanitize text: remove emojis and pictographic/visual symbols so narration doesn't read icons
    // Remove characters in common emoji/pictograph Unicode ranges and extra symbolic punctuation
    const sanitize = (str) => {
      if (!str) return "";
      // remove variation selectors and zero-width chars
      str = str.replace(/[\uFE0F\uFE0E\u200D]/g, "");
      // remove broad emoji / pictograph blocks
      // Emoticons, Misc Symbols and Pictographs, Transport and Map, Supplemental Symbols, Dingbats, etc.
      str = str.replace(/[\u{1F300}-\u{1F6FF}]/gu, "");
      str = str.replace(/[\u{1F900}-\u{1F9FF}]/gu, "");
      str = str.replace(/[\u{1F700}-\u{1F77F}]/gu, "");
      str = str.replace(/[\u{2600}-\u{26FF}]/gu, "");
      str = str.replace(/[\u{2700}-\u{27BF}]/gu, "");
      str = str.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, ""); // flags
      // remove miscellaneous symbols that are purely visual
      str = str.replace(/[\u{2300}-\u{23FF}]/gu, "");
      // collapse multiple spaces and trim
      str = str.replace(/\s{2,}/g, " ").trim();
      return str;
    };

    const clean = sanitize(String(text));
    if (!clean) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "pt-BR";
    window.speechSynthesis.speak(utter);
  },
};

function setScreen(screenId) {
  state.current = screenId;
  SCREENS.forEach((id) => {
    const el = document.getElementById(`screen-${id}`);
    if (!el) return;
    el.classList.toggle("screen-active", id === screenId);
  });
  // show or hide floating accessibility control: hide on splash
  const accFloat = document.getElementById("acc-float");
  if (accFloat) accFloat.style.display = screenId === "splash" ? "none" : "flex";
  announceScreen(screenId);
}

function announceScreen(screenId) {
  // New behaviour: ONLY speak a short description for each screen (no long automatic reads)
  const mapShort = {
    splash: "Tela de abertura do aplicativo 60 mais Digital.",
    avatar: "Escolha quem vai falar com você, Gracinha ou Zé.",
    permission: "Permitir que a assistente ajude você a usar o celular.",
    home: "Você está na área principal da assistência digital. Aqui você pode pedir ajuda rápida, checar notícias, aprender coisas novas e deixar o celular mais seguro. Toque nos botões para ouvir o que cada um faz.",
    "chat-voice": "Tela para falar com a assistente por voz.",
    "chat-text": "Tela para escrever mensagem para a assistente.",
    "see-screen": "IA que enxerga a tela. Toque em uma pergunta.",
    "fake-detector": "Detector de notícias falsas.",
    "fake-result": "Resultado da análise da notícia.",
    "fake-library": "Exemplos de golpes e notícias falsas.",
    "game-share": "Jogo do compartilhar. Decida se compartilha ou não.",
    educativos: "Conteúdos educativos curtos.",
    "edu-checar": "Como checar informações rapidamente para saber se uma notícia é confiável.",
    "edu-direitos": "Direitos da pessoa idosa. Informações claras sobre seus direitos e como garanti-los.",
    accessibility: "Configurações de acessibilidade.",
    community: "Comunidade e atividades intergeracionais.",
    alerts: "Alertas de segurança digital.",
    contacts: "Ligações e contatos rápidos.",
    emergency: "Ajuda emergencial.",
    "block-links": "Bloquear links suspeitos. Cole um link e autorize bloqueio automático se desejar.",
    "programa-cidadao": "Programa Cidadão Tech 60+. Informações sobre cursos, inscrições e contato.",
    "avatar-ze": "Você pode falar comigo a qualquer momento, dizendo “Oi Zé”. Use sua voz para pedir ajuda rápida ou perguntar sobre mensagens e links. Se quiser, toque em continuar para permitir que seu assistente ajude no celular. Continuar. Pular",
    "boleto-pix": "Nesta área você pode verificar boletos e PIX antes de fazer qualquer pagamento. Sempre diga ‘Oi Zé’ para pedir ajuda e conferir se o boleto ou PIX é real."
  };
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (!state.ttsOn) return;
  // small delay to allow DOM updates
  setTimeout(() => {
    const short = mapShort[screenId];
    if (short) tts.speak(short);
    // NOTE: do NOT auto-read lists or long text anymore
  }, 120);
}

function applyAvatar() {
  const nameEl = document.getElementById("header-avatar-name");
  const emojiEl = document.getElementById("header-avatar-emoji");
  const permissionText = document.getElementById("permission-text");
  if (!state.avatar) return;
  if (state.avatar === "gracinha") {
    nameEl.textContent = "Eu sou a Gracinha.";
    emojiEl.textContent = "👵";
  } else {
    nameEl.textContent = "Eu sou o Zé.";
    emojiEl.textContent = "👴";
  }
  permissionText.textContent = `Permitir que ${state.avatar === "gracinha" ? "a Gracinha" : "o Zé"} ajude você a usar o celular?`;
}

function applyFontScale() {
  document.documentElement.style.setProperty("--font-scale", state.fontScale);
}

function applyTheme() {
  const root = document.querySelector(".app-root");
  root.classList.toggle("app-tired", state.tiredMode);
  root.classList.toggle("app-contrast", state.contrast);
}

function initNavigation() {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav], [data-quick], .assistant-card, .security-item, .list-item, .btn-primary, .btn-secondary");
    if (!btn) return;
    // speak what the button does (short) — this will only run if TTS enabled
    try { speakActionForElement(btn); } catch (err) {}
    const nav = btn.getAttribute("data-nav");
    if (!nav) return;
    setScreen(nav);
  });
}

function initAvatarSelection() {
  const cards = document.querySelectorAll(".avatar-card");
  const continuar = document.getElementById("avatar-continuar");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("avatar-card-selected"));
      card.classList.add("avatar-card-selected");
      const avatar = card.getAttribute("data-avatar");
      state.avatar = avatar === "gracinha" ? "gracinha" : "ze";
      continuar.disabled = false;
      applyAvatar();
      const name = state.avatar === "gracinha" ? "Gracinha" : "Zé";
      tts.speak(`Você escolheu ${name}.`);
    });
  });
  continuar.addEventListener("click", () => {
    // Conditional navigation: if user selected Zé, show the special info screen first
    if (state.avatar === "ze") {
      setScreen("avatar-ze");
      return;
    }
    // otherwise continue as before
    setScreen("permission");
  });
}

function initAccessibilitySettings() {
  document.getElementById("font-small").addEventListener("click", () => {
    state.fontScale = 0.9;
    applyFontScale();
  });
  document.getElementById("font-normal").addEventListener("click", () => {
    state.fontScale = 1;
    applyFontScale();
  });
  document.getElementById("font-big").addEventListener("click", () => {
    state.fontScale = 1.2;
    applyFontScale();
  });

  const ttsToggle = document.getElementById("toggle-tts");
  const tiredToggle = document.getElementById("toggle-tired");
  const singleToggle = document.getElementById("toggle-single-touch");
  const contrastToggle = document.getElementById("toggle-contrast");

  function setToggle(el, on) {
    el.classList.toggle("toggle-on", on);
  }

  ttsToggle.addEventListener("click", () => {
    state.ttsOn = !state.ttsOn;
    setToggle(ttsToggle, state.ttsOn);
    if (state.ttsOn) tts.speak("Narração automática ligada.");
  });

  tiredToggle.addEventListener("click", () => {
    state.tiredMode = !state.tiredMode;
    setToggle(tiredToggle, state.tiredMode);
    applyTheme();
  });

  singleToggle.addEventListener("click", () => {
    state.singleTouch = !state.singleTouch;
    setToggle(singleToggle, state.singleTouch);
    tts.speak("Modo toque único ativado.");
  });

  contrastToggle.addEventListener("click", () => {
    state.contrast = !state.contrast;
    setToggle(contrastToggle, state.contrast);
    applyTheme();
  });

  // inicial
  setToggle(ttsToggle, state.ttsOn);
}

function initChatText() {
  const input = document.getElementById("chat-text-input");
  const send = document.getElementById("chat-text-send");
  const bubbles = document.getElementById("chat-text-bubbles");

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    const userB = document.createElement("div");
    userB.className = "chat-bubble chat-bubble-user";
    userB.textContent = text;
    bubbles.appendChild(userB);
    input.value = "";

    const reply = document.createElement("div");
    reply.className = "chat-bubble chat-bubble-assistant";
    reply.textContent =
      "Entendi. Vou explicar de um jeito simples: use sempre a desconfiança a seu favor. Em dúvida, não clique e me pergunte.";
    bubbles.appendChild(reply);
    tts.speak(reply.textContent);
  }

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

function initSeeScreen() {
  const buttons = document.querySelectorAll(".see-btn");
  const answer = document.getElementById("see-screen-answer");
  const listen = document.getElementById("see-screen-listen");
  let lastText = answer.textContent;

  const map = {
    "o-que":
      "Estou vendo uma tela com botões grandes. Os de baixo são o menu principal: início, fake news, comunidade, ligações e ajuda.",
    seguro:
      "Veja se o site tem nome conhecido, se não pede senha ou código. Se estiver em dúvida, não informe dados pessoais.",
    botao:
      "Procure o botão em verde ou com a palavra continuar. Se nada estiver claro, volte e me pergunte antes.",
    explique:
      "Posso descrever partes da tela para você. Assim, você decide com calma o que fazer.",
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-see");
      const text = map[key] || answer.textContent;
      lastText = text;
      answer.textContent = text;
      tts.speak(text);
    });
  });

  listen.addEventListener("click", () => {
    tts.speak(lastText);
  });
}

function initFakeDetector() {
  const fileInput = document.getElementById("fake-file-input");
  const photoBtn = document.getElementById("btn-detector-photo");
  const pasteBtn = document.getElementById("btn-detector-paste");
  const linkInput = document.getElementById("fake-link-input");
  // these elements may not exist in all variants of the page — guard them
  const readBtn = document.getElementById("btn-detector-read");
  const textInput = document.getElementById("fake-text-input");
  const analyzeBtn = document.getElementById("btn-detector-analyze");

  const resultArea = document.getElementById("fake-result-area");
  const resultQuick = document.getElementById("fake-result-quick");
  const resultExplain = document.getElementById("fake-result-explain");
  const resultTipsList = document.getElementById("fake-result-tips-list");
  const resultMeta = document.getElementById("fake-result-meta");

  let lastSubmitted = { type: null, content: null, file: null };

  // Recording elements
  const recBtn = document.getElementById("btn-detector-record");
  const recCard = document.getElementById("rec-card");
  let mediaRecorder = null;
  let recordingChunks = [];
  let isRecording = false;

  function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      tts.speak("Seu navegador não suporta gravação de áudio.");
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      recordingChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size) recordingChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunks, { type: "audio/webm" });
        lastSubmitted = { type: "audio", content: "Áudio gravado", file: blob };
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        // provide short feedback and auto-run analysis
        tts.speak("Áudio recebido. Analisando e lendo agora.");
        // visual: remove recording class
        if (recCard) recCard.classList.remove("rec-recording");
        // call analyze automatically
        performAnalysisForLastSubmission();
      };
      mediaRecorder.start();
      isRecording = true;
      if (recCard) recCard.classList.add("rec-recording");
    }).catch(() => {
      tts.speak("Não foi possível acessar o microfone.");
    });
  }

  function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;
    mediaRecorder.stop();
    isRecording = false;
  }

  // Press and hold behavior for mouse and touch
  if (recBtn) {
    recBtn.addEventListener("mousedown", (e) => { e.preventDefault(); startRecording(); });
    recBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startRecording(); }, { passive: false });
    document.addEventListener("mouseup", (e) => { if (isRecording) stopRecording(); });
    document.addEventListener("touchend", (e) => { if (isRecording) stopRecording(); }, { passive: false });

    // visual toggle: when recording start/stop, toggle class on rec-card for red state
    const recCardEl = document.getElementById("rec-card");
    const updateRecVisual = (on) => {
      if (!recCardEl) return;
      if (on) recCardEl.classList.add("rec-recording");
      else recCardEl.classList.remove("rec-recording");
    };

    // wrap start/stop to update visuals
    const _startRecording = startRecording;
    const _stopRecording = stopRecording;
    startRecording = function() {
      updateRecVisual(true);
      _startRecording();
    };
    stopRecording = function() {
      _stopRecording();
      updateRecVisual(false);
    };
  }

  // open camera / image picker
  if (photoBtn && fileInput) {
    photoBtn.addEventListener("click", () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      lastSubmitted = { type: "image", content: f.name, file: f };
      // show a brief confirmation and enable result area
      showResultPlaceholder(`Imagem recebida: ${f.name}`);
      tts.speak("Foto recebida. Toque em Analisar notícia para começar.");
    });
  }

  // paste link: focus input so user can paste
  if (pasteBtn && linkInput) {
    pasteBtn.addEventListener("click", async () => {
      // attempt to read from clipboard for convenience
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.startsWith("http")) {
          linkInput.value = text;
          lastSubmitted = { type: "link", content: text };
          tts.speak("Link colado. Toque em Analisar notícia para começar.");
          showResultPlaceholder("Link colado, pronto para análise.");
          return;
        }
      } catch (err) {
        // ignore clipboard errors
      }
      linkInput.focus();
      tts.speak("Cole ou digite o link da notícia no campo abaixo.");
    });
  }

  // read aloud: prefers text input, then link (reads link text), else tries to read filename
  if (readBtn) {
    readBtn.addEventListener("click", () => {
      // deprecated: read button text-area was removed; keep compatibility if present
      const link = linkInput && linkInput.value ? linkInput.value.trim() : "";
      if (link) {
        tts.speak("Lendo o link: " + link);
        lastSubmitted = { type: "link", content: link };
        return;
      }
      tts.speak("Nenhuma notícia encontrada para ler. Envie uma foto, cole um link ou grave um áudio pressionando o botão.");
    });
  }

  // analyze: simple heuristic + randomized friendly verdicts with explanation + tips
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
      // decide which input to use
      const txt = textInput && textInput.value ? textInput.value.trim() : "";
      const link = linkInput && linkInput.value ? linkInput.value.trim() : "";
      const file = fileInput && fileInput.files && fileInput.files[0];

      if (txt) lastSubmitted = { type: "text", content: txt, file: file || null };
      else if (link) lastSubmitted = { type: "link", content: link, file: file || null };
      else if (file) lastSubmitted = { type: "image", content: file.name, file };
      else {
        tts.speak("Por favor, envie uma foto, cole um link ou cole o texto antes de analisar.");
        showResultPlaceholder("Nenhum conteúdo para analisar. Envie uma foto, link ou texto.");
        return;
      }

      // show analyzing state
      showResultPlaceholder("Analisando a notícia...");

      // simulate quick processing delay
      await new Promise((r) => setTimeout(r, 900));

      // heuristics: simple checks on text and link content
      let verdict = "Incompleta";
      let explanation = "Não foi possível identificar suficientes evidências.";
      const tips = [];

      if (lastSubmitted.type === "image") {
        // images require OCR; we simulate by treating as "Duvidosa" with guidance
        verdict = "Duvidosa";
        explanation = "Imagem recebida; sem contexto adicional é difícil confirmar a fonte. Pode conter recortes ou texto fora de contexto.";
        tips.push("Compare com um site de notícia confiável.");
        tips.push("Procure por assinatura do veículo e data.");
        tips.push("Não clique em links presentes na imagem sem checar.");
      } else if (lastSubmitted.type === "link") {
        // inspect link for suspicious patterns
        const l = lastSubmitted.content.toLowerCase();
        if (l.includes("fake") || l.includes("gratuito") || l.includes("ganhe") || l.includes("premio") || l.includes("click")) {
          verdict = "Duvidosa";
          explanation = "O link contém termos comuns em golpes ou páginas sensacionalistas.";
          tips.push("Verifique domínio e procure o mesmo conteúdo em sites oficiais.");
        } else if (l.startsWith("https://") && (l.includes(".gov") || l.includes(".edu") || l.includes("g1.") || l.includes("bbc"))) {
          verdict = "Confiável";
          explanation = "Link aponta para fonte conhecida ou site institucional, provavelmente confiável.";
          tips.push("Mesmo assim, confirme a data e se vários veículos publicaram a mesma informação.");
        } else {
          // fallback randomize between Incompleta / Duvidosa
          verdict = Math.random() < 0.5 ? "Incompleta" : "Duvidosa";
          explanation = verdict === "Incompleta" ? "Não há dados suficientes no link para um veredito claro." : "O link pode ser sensacionalista ou parcial.";
          tips.push("Procure o mesmo assunto em mais de uma fonte confiável.");
        }
        tips.push("Nunca forneça dados pessoais ou codigo recebido por SMS.");
      } else if (lastSubmitted.type === "text") {
        const content = lastSubmitted.content.toLowerCase();
        // look for warning patterns
        if (content.match(/ganh.*pr[eê]mio|clique aqui|urgente|compartilha|compartilhe|grátis|promo/)) {
          verdict = "Falsa";
          explanation = "Texto usa urgência e promessas fáceis — padrão comum em golpes e desinformação.";
          tips.push("Não repasse mensagens que pedem ação imediata.");
        } else if (content.length < 80) {
          verdict = "Incompleta";
          explanation = "Pouco conteúdo para verificar; procure mais informações ou uma fonte oficial.";
          tips.push("Busque a notícia em jornais confiáveis antes de compartilhar.");
        } else {
          verdict = "Confiável";
          explanation = "Texto apresenta informações que parecem descritivas e sem apelo sensacionalista. Ainda assim, confirme a fonte.";
          tips.push("Cheque nomes, datas e fontes citadas no texto.");
        }
        tips.push("Se tiver dúvidas, não clique em links nem forneça códigos.");
      }

      // render result
      if (resultArea) resultArea.removeAttribute("hidden");
      if (resultQuick) resultQuick.textContent = `Veredito: ${verdict}`;
      if (resultExplain) resultExplain.textContent = explanation;
      // meta info
      const time = new Date().toLocaleString();
      if (resultMeta) resultMeta.textContent = `Tipo: ${lastSubmitted.type || "—"} • Recebido: ${lastSubmitted.content || ""} • ${time}`;
      // tips list
      if (resultTipsList) {
        resultTipsList.innerHTML = "";
        tips.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t;
          resultTipsList.appendChild(li);
        });
      }

      // verbal short announce
      tts.speak(`Análise pronta. Veredito: ${verdict}. ${explanation}`);
    });
  }

  // helper to perform analysis when audio is submitted (or to centralize analyze)
  async function performAnalysisForLastSubmission() {
    // show analyzing state
    showResultPlaceholder("Analisando a notícia...");
    await new Promise((r) => setTimeout(r, 900));
    let verdict = "Incompleta";
    let explanation = "Não foi possível identificar suficientes evidências.";
    const tips = [];

    if (lastSubmitted.type === "audio") {
      // For audio we 'transcribe' and then provide reading and summary (simulated)
      verdict = "Incompleta";
      explanation = "Áudio recebido; consigo ler e resumir, mas não confirmar fonte. Vou ler o conteúdo detectado.";
      tips.push("Se for uma gravação de notícia, verifique a fonte escrita quando possível.");
      // simulate a short readout of the (simulated) transcription
      tts.speak("Resumo da gravação: esta mensagem fala sobre um suposto prêmio; tenha cuidado antes de compartilhar.");
    } else {
      // fallback call existing analyze button's logic by simulating click
      if (analyzeBtn) {
        analyzeBtn.click();
        return;
      }
    }

    // render
    if (resultArea) resultArea.removeAttribute("hidden");
    if (resultQuick) resultQuick.textContent = `Veredito: ${verdict}`;
    if (resultExplain) resultExplain.textContent = explanation;
    const time = new Date().toLocaleString();
    if (resultMeta) resultMeta.textContent = `Tipo: ${lastSubmitted.type || "—"} • Recebido: ${lastSubmitted.content || ""} • ${time}`;
    if (resultTipsList) {
      resultTipsList.innerHTML = "";
      tips.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        resultTipsList.appendChild(li);
      });
    }
  }

  function showResultPlaceholder(text) {
    if (resultArea) resultArea.removeAttribute("hidden");
    if (resultQuick) resultQuick.textContent = `Status: ${text}`;
    if (resultExplain) resultExplain.textContent = "";
    if (resultTipsList) resultTipsList.innerHTML = "";
    if (resultMeta) resultMeta.textContent = "";
  }
}

function initGameShare() {
  const qEl = document.getElementById("game-question");
  const scoreEl = document.getElementById("game-score");
  const fbEl = document.getElementById("game-feedback");
  const yesBtn = document.getElementById("game-btn-yes");
  const noBtn = document.getElementById("game-btn-no");

  // updated set of example messages and feedback
  const questions = [
    {
      text: '“Você ganhou um prêmio milionário! Clique aqui rápido!!!”',
      correct: "no",
      feedback:
        "O melhor é NÃO compartilhar mensagens com promessa fácil de dinheiro. Isso é um sinal comum de golpe.",
    },
    {
      text: '“Seu banco bloqueou sua conta. Envie o código que recebeu por SMS.”',
      correct: "no",
      feedback:
        "Correto: bancos verdadeiros nunca pedem códigos por mensagem. Peça ajuda antes de agir.",
    },
    {
      text: '“Vacinação gratuita no posto X — confira o site oficial da prefeitura.”',
      correct: "yes",
      feedback:
        "Certo. Informações vindas de sites oficiais ou comunicados locais confiáveis são mais seguras — verifique domínio e data.",
    },
  ];

  let index = 0;

  function renderQuestion() {
    const q = questions[index % questions.length];
    qEl.textContent = q.text;
    fbEl.textContent = "Pense com calma antes de escolher.";
  }

  function showImmediateFeedback(isYes) {
    const q = questions[index % questions.length];
    const chosen = isYes ? "yes" : "no";
    if (chosen === q.correct) {
      state.gameScore += 1;
      fbEl.textContent = q.feedback;
      tts.speak(q.feedback);
    } else {
      fbEl.textContent =
        "O melhor é NÃO compartilhar mensagens com promessa fácil de dinheiro. Isso é um sinal comum de golpe.";
      tts.speak(fbEl.textContent);
    }
    scoreEl.textContent = "Pontos: " + state.gameScore;
    index += 1;
    // small delay then show next example
    setTimeout(renderQuestion, 1800);
  }

  yesBtn.addEventListener("click", () => showImmediateFeedback(true));
  noBtn.addEventListener("click", () => showImmediateFeedback(false));

  // when entering this screen, render first question
  const observer = new MutationObserver(() => {
    const screen = document.getElementById("screen-game-share");
    if (screen.classList.contains("screen-active")) {
      renderQuestion();
    }
  });
  observer.observe(document.getElementById("app-root"), {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

function initEducation() {
  const detailTitle = document.getElementById("edu-title");
  const detailText = document.getElementById("edu-text");
  const listenBtn = document.getElementById("edu-listen");
  let lastContent = "";

  const contentMap = {
    checar:
      "Para checar uma informação, veja se aparece em mais de um jornal conhecido. Desconfie de mensagens com muito medo e pressa.",
    golpes:
      "Golpes digitais tentam fazer você agir rápido. Nunca informe senha, código por SMS ou dados do cartão em links estranhos.",
    direitos:
      "A pessoa idosa tem direito a respeito, prioridade e informação clara. Você pode exigir atendimento respeitoso em serviços públicos.",
    politica:
      "Política faz parte do dia a dia. É importante ouvir mais de uma opinião e desconfiar de mensagens que atacam pessoas.",
    seguranca:
      "Segurança digital é cuidar das suas senhas, não compartilhar dados pessoais e só aceitar ajuda de pessoas de confiança.",
  };

  // Add micro animation and ripple effect on cards
  document.querySelectorAll(".edu-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // ripple effect
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = e.offsetX + "px";
      ripple.style.top = e.offsetY + "px";
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      const key = card.getAttribute("data-edu");
      const text = contentMap[key] || "";
      const title = card.querySelector(".edu-card-title").textContent.trim();

      // If the user touched the "checar" card, navigate to the dedicated page
      if (key === "checar") {
        setScreen("edu-checar");
        return;
      }
      // If the user touched the "golpes" card, navigate to the new dedicated page
      if (key === "golpes") {
        setScreen("edu-golpes");
        return;
      }

      // If the user touched the "direitos" card, navigate to the dedicated rights page
      if (key === "direitos") {
        setScreen("edu-direitos");
        return;
      }

      // If the user touched the "politica" card, navigate to the dedicated politics page
      if (key === "politica") {
        setScreen("edu-politica");
        return;
      }

      detailTitle.textContent = title;
      detailText.textContent = text;
      lastContent = title + ". " + text;
      tts.speak(lastContent);
    });
  });

  listenBtn.addEventListener("click", () => {
    if (lastContent) tts.speak(lastContent);
  });

  // Add floating accessibility button for this screen
  const eduScreen = document.getElementById("screen-educativos");
  if (eduScreen) {
    const float = document.createElement("div");
    float.className = "edu-acc-float";
    float.innerHTML = `
      <button id="edu-acc-btn" class="edu-acc-btn" aria-label="Acessibilidade: abrir opções de narração" title="Acessibilidade">🔊</button>
      <div id="edu-acc-popup" class="edu-acc-popup" role="dialog" aria-label="Opções de acessibilidade" hidden>
        <div class="edu-acc-popup-actions">
          <button id="edu-acc-enable" class="btn-primary btn-large">Ativar narração</button>
          <button id="edu-acc-disable" class="btn-secondary btn-large">Desativar narração</button>
        </div>
      </div>
    `;
    eduScreen.appendChild(float);

    const accBtn = document.getElementById("edu-acc-btn");
    const accPopup = document.getElementById("edu-acc-popup");
    const accEnable = document.getElementById("edu-acc-enable");
    const accDisable = document.getElementById("edu-acc-disable");

    function refreshAccButton() {
      if (state.ttsOn) {
        accBtn.classList.add("acc-on");
        accBtn.setAttribute("title", "Narração ativada");
      } else {
        accBtn.classList.remove("acc-on");
        accBtn.setAttribute("title", "Narração desativada");
      }
    }

    accBtn.addEventListener("click", (e) => {
      const isHidden = accPopup.hasAttribute("hidden");
      if (isHidden) {
        accPopup.removeAttribute("hidden");
        setTimeout(() => accEnable.focus(), 80);
      } else {
        accPopup.setAttribute("hidden", "");
      }
    });

    accEnable.addEventListener("click", () => {
      state.ttsOn = true;
      refreshAccButton();
      accPopup.setAttribute("hidden", "");
      tts.speak("Narração ativada.");
      setTimeout(() => announceScreen("educativos"), 120);
    });

    accDisable.addEventListener("click", () => {
      state.ttsOn = false;
      refreshAccButton();
      accPopup.setAttribute("hidden", "");
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    });

    document.addEventListener("click", (e) => {
      const inside = e.target.closest && e.target.closest(".edu-acc-float");
      if (!inside && !accPopup.hasAttribute("hidden")) {
        accPopup.setAttribute("hidden", "");
      }
    });

    refreshAccButton();
  }
}

function initQuickActions() {
  // wire up all assistant cards (new structure)
  document.querySelectorAll(".assistant-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Prevent double-speak: speakActionForElement already invoked by initNavigation delegation
      // If card has navigation, allow navigation to proceed via initNavigation; otherwise do quick speech for data-quick
      const quick = card.getAttribute("data-quick");
      const nav = card.getAttribute("data-nav");
      if (!nav && quick) {
        // Use mapping to speak short phrase (kept for consistency)
        speakActionForElement(card);
      }
    });
  });
}

/* new helper: speak short phrase for a clicked/actionable element */
function speakActionForElement(el) {
  if (!state.ttsOn || !el) return;
  // exact phrases required for screen-home (Tela 4) as provided by user
  const homePhrases = {
    "btn-voice": "Pode falar comigo.",
    "chat-voice": "Pode falar comigo.",
    "chat-text": "Pode digitar o que você precisa.",
    "fake-detector": "Vou verificar se essa notícia é verdadeira.",
    "bloquear-links": "Vou analisar este link e bloquear se for perigoso.",
    "alerts": "Vou mostrar alertas importantes de segurança.",
    "fake-library": "Aqui você encontra exemplos de notícias falsas.",
    "game-share": "Vamos treinar seu senso crítico com um jogo simples.",
    "ensinar": "Vou ensinar algo novo agora.",
    "microaulas": "Aqui estão aulas curtinhas para aprender no seu ritmo.",
    "see-screen": "Vou olhar sua tela e te ajudar.",
    "guia-passo": "Eu vou te guiar passo a passo na tela.",
    "ler-mensagens": "Vou ler suas mensagens para você.",
    "whatsapp": "Abrindo o WhatsApp.",
    "enviar-pre": "Vou enviar uma mensagem pronta.",
    "abrir-apps": "Abrindo o aplicativo que você escolher.",
    "ajustar-volume": "Ajustando o volume.",
    "modo-silencioso": "Colocando no silencioso.",
    "ajustar-brilho": "Ajustando o brilho da tela.",
    "community": "Aqui você encontra atividades com outras pessoas.",
    "educativos": "Vou te mostrar conteúdos educativos.",
    "oficinas": "Aqui estão oficinas e vídeos para participar.",
    "aviso-golpes": "Cuidado com pedidos de código ou dinheiro. Veja exemplos aqui.",
  };

  // priority: data-quick, data-nav, id, fallback to text short
  const quick = el.getAttribute && el.getAttribute("data-quick");
  const nav = el.getAttribute && el.getAttribute("data-nav");
  const elId = el.id || "";

  // Normalize keys for a few data-nav values to match mapping above
  let key = quick || nav || elId;

  // some data-nav values correspond to keys in the map (e.g., fake-detector -> fake-detector)
  // The user's exact required phrases use a certain set of keys; map some known nav->key
  const normalize = {
    "fake-detector": "fake-detector",
    "fake-library": "fake-library",
    "game-share": "game-share",
    "see-screen": "see-screen",
    "educativos": "educativos",
    "community": "community",
    "alerts": "alerts",
    "chat-voice": "chat-voice",
    "chat-text": "chat-text",
  };
  if (!key && el.textContent) {
    key = el.textContent.trim().toLowerCase().split(/\s+/)[0];
  }
  if (normalize[key]) key = normalize[key];

  // if on home screen and there is a dedicated phrase mapping, use it
  if (state.current === "home") {
    // special handling: some security buttons use data-quick or data-nav values like bloquear-links
    if (homePhrases[key]) {
      tts.speak(homePhrases[key]);
      return;
    }
    // also check element dataset for recognizable keys
    if (quick && homePhrases[quick]) {
      tts.speak(homePhrases[quick]);
      return;
    }
    if (nav && homePhrases[nav]) {
      tts.speak(homePhrases[nav]);
      return;
    }
  }

  // Generic short-button narration for non-home screens or fallback:
  // If element has data-quick and there's a short generic mapping in initQuickActions, use it
  const genericMap = {
    whatsapp: "Abrindo WhatsApp.",
    "ler-mensagens": "Vou ler suas mensagens.",
    ligar: "Posso ajudar a realizar uma ligação. Escolha o contato.",
    "enviar-pre": "Enviando mensagem pré-definida para o contato selecionado.",
    "abrir-apps": "Abrindo a lista de aplicativos.",
    "ajustar-volume": "Ajustando o volume do celular.",
    "modo-silencioso": "Colocando no silencioso.",
    "ajustar-brilho": "Ajustando o brilho da tela.",
    "bloquear-links": "Bloqueando links suspeitos e avisando você.",
    "guia-passo": "Vou guiar você passo a passo. Toque no botão indicado quando aparecer.",
    ensinar: "Vou ensinar algo novo com calma e clareza.",
    microaulas: "Abrindo microaulas de 3 a 5 minutos.",
  };

  if (quick && genericMap[quick]) {
    tts.speak(genericMap[quick]);
    return;
  }

  if (nav && genericMap[nav]) {
    tts.speak(genericMap[nav]);
    return;
  }

  // fallback: short speak of the element text (trimmed first 6 words)
  const txt = (el.textContent || "").trim();
  if (txt) {
    const short = txt.split(/\s+/).slice(0, 6).join(" ");
    tts.speak(short + (txt.split(/\s+/).length > 6 ? "..." : ""));
  }
}

/* new helper: read all visible text elements in a screen for narration */
function readAllScreen(screenId) {
  if (!state.ttsOn) return;
  const screenEl = document.getElementById(`screen-${screenId}`);
  if (!screenEl) return;
  const parts = [];
  // 1. title
  const title = screenEl.querySelector(".screen-title");
  if (title && title.offsetParent !== null) parts.push(title.textContent.trim());
  // 2. description / subtitles
  const descSelectors = [".splash-subtitle", ".screen-text", ".splash-title", ".header-greeting", ".header-helper-name", ".see-section-title", ".section-title"];
  descSelectors.forEach((sel) => {
    screenEl.querySelectorAll(sel).forEach((el) => {
      if (el === title) return;
      if (!(el.offsetParent !== null)) return;
      const txt = el.textContent.trim();
      if (txt) parts.push(txt);
    });
  });
  // 3. buttons and actionable items (labels)
  const actionSelectors = [".btn-primary", ".btn-secondary", ".btn-ghost", ".btn-special-text", ".quick-card", ".list-item", ".avatar-name", ".avatar-desc", ".bottom-nav-btn"];
  actionSelectors.forEach((sel) => {
    screenEl.querySelectorAll(sel).forEach((el) => {
      if (!(el.offsetParent !== null)) return;
      const txt = el.textContent.trim();
      if (txt) parts.push(txt);
    });
  });
  // 4. footer / small print
  const footerSelectors = [".splash-footer", ".game-score"];
  footerSelectors.forEach((sel) => {
    screenEl.querySelectorAll(sel).forEach((el) => {
      if (!(el.offsetParent !== null)) return;
      const txt = el.textContent.trim();
      if (txt) parts.push(txt);
    });
  });
  // dedupe preserving order
  const seen = new Set();
  const utterText = parts.filter((p) => {
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  }).join(". ");
  if (utterText) tts.speak(utterText);
}

function initFloatingAcc() {
  const accBtn = document.getElementById("acc-float-btn");
  const accPopup = document.getElementById("acc-popup");
  const accEnable = document.getElementById("acc-enable");
  const accDisable = document.getElementById("acc-disable");

  if (!accBtn || !accPopup) return;

  function refreshAccButton() {
    if (state.ttsOn) {
      accBtn.classList.add("acc-on");
      accBtn.setAttribute("title", "Narração ativada");
    } else {
      accBtn.classList.remove("acc-on");
      accBtn.setAttribute("title", "Narração desativada");
    }
  }

  accBtn.addEventListener("click", (e) => {
    // toggle popup visibility
    const isHidden = accPopup.hasAttribute("hidden");
    if (isHidden) {
      accPopup.removeAttribute("hidden");
      // focus first actionable for accessibility
      setTimeout(() => accEnable.focus(), 80);
    } else {
      accPopup.setAttribute("hidden", "");
    }
  });

  // When enabling narração via popup
  accEnable.addEventListener("click", () => {
    state.ttsOn = true;
    refreshAccButton();
    accPopup.setAttribute("hidden", "");
    // speak only short confirmation and the current screen short description (no long reads)
    tts.speak("Narração ativada.");
    setTimeout(() => announceScreen(state.current || "home"), 120);
  });

  accDisable.addEventListener("click", () => {
    state.ttsOn = false;
    refreshAccButton();
    accPopup.setAttribute("hidden", "");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  // close popup when clicking outside
  document.addEventListener("click", (e) => {
    const inside = e.target.closest && e.target.closest("#acc-float");
    if (!inside && !accPopup.hasAttribute("hidden")) accPopup.setAttribute("hidden", "");
  });

  // initial visual state
  refreshAccButton();
  // hide on splash initially
  const accFloat = document.getElementById("acc-float");
  if (accFloat) accFloat.style.display = state.current === "splash" ? "none" : "flex";
}

function initBlockLinks() {
  const pasteBtn = document.getElementById("btn-block-paste");
  const checkBtn = document.getElementById("btn-block-check");
  const input = document.getElementById("block-link-input");
  const checkbox = document.getElementById("block-auto-checkbox");
  const saveBtn = document.getElementById("btn-block-save");
  const cancelBtn = document.getElementById("btn-block-cancel");
  const statusCard = document.getElementById("block-status");
  const statusText = document.getElementById("block-status-text");

  if (!input || !checkbox || !saveBtn) return;

  // initialize checkbox from state
  checkbox.checked = !!state.blockAuto;

  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.startsWith("http")) {
          input.value = text;
          tts.speak("Link colado.");
        } else {
          input.focus();
          tts.speak("Área de transferência vazia ou sem link. Cole o link manualmente.");
        }
      } catch (err) {
        input.focus();
        tts.speak("Não foi possível acessar a área de transferência. Cole manualmente.");
      }
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener("click", async () => {
      const link = (input.value || "").trim();
      if (!link) {
        tts.speak("Cole um link antes de verificar.");
        if (statusCard) { statusCard.style.display = "block"; statusText.textContent = "Cole um link para verificar."; }
        return;
      }
      // quick heuristic check
      let verdict = "Inconclusivo";
      if (/(\bgratuit|ganh|premi|click|clique|urgent)/i.test(link)) {
        verdict = "Suspeito";
      } else if (/(\.gov|\.edu|bbc|g1|globo|terra)/i.test(link)) {
        verdict = "Provavelmente confiável";
      } else if (!/^https?:\/\//i.test(link)) {
        verdict = "Formato de link incomum";
      } else {
        verdict = Math.random() < 0.5 ? "Suspeito" : "Inconclusivo";
      }
      if (statusCard) {
        statusCard.style.display = "block";
        statusText.textContent = `Veredito: ${verdict}. Link: ${link}`;
      }
      tts.speak(`Verificação concluída. Resultado: ${verdict}.`);
    });
  }

  saveBtn.addEventListener("click", () => {
    state.blockAuto = !!checkbox.checked;
    // persist to localStorage for simple persistence
    try { localStorage.setItem("blockAuto", state.blockAuto ? "1" : "0"); } catch (e) {}
    tts.speak(state.blockAuto ? "Bloqueio automático autorizado." : "Bloqueio automático desautorizado.");
    // give quick feedback on screen
    if (statusCard) {
      statusCard.style.display = "block";
      statusText.textContent = state.blockAuto ? "Bloqueio automático ativado." : "Bloqueio automático desativado.";
    }
  });

  cancelBtn && cancelBtn.addEventListener("click", () => {
    setScreen("home");
  });

  // Load persisted preference if present
  try {
    const stored = localStorage.getItem("blockAuto");
    if (stored !== null) state.blockAuto = stored === "1";
    checkbox.checked = !!state.blockAuto;
  } catch (e) {}
}

function initChatVoice() {
  const btn = document.getElementById("btn-voice");
  const simEl = document.getElementById("voice-simulated-question");
  const respEl = document.getElementById("voice-response");
  if (!btn || !simEl || !respEl) return;

  // simulated live phrase to reveal progressively while pressing
  const simulatedFull =
    "Eu vi hoje aqui no meu celular uma oferta de um iPhone por 300 reais na promoção, é verdade, Ze?";
  let charIndex = 0;
  let revealInterval = null;

  function startListeningVisual() {
    // reset UI
    simEl.classList.add("listening");
    respEl.hidden = true;
    simEl.textContent = "";
    charIndex = 0;
    // show subtle dots + text
    const dots = document.createElement("span");
    dots.className = "voice-listen-dots";
    dots.innerHTML = '<span></span><span></span><span></span>';
    simEl.appendChild(dots);
    // after a short delay, begin revealing simulated transcription
    setTimeout(() => {
      if (!simEl) return;
      // remove dots when real chars start
      if (simEl.contains(dots)) simEl.removeChild(dots);
      revealInterval = setInterval(() => {
        charIndex += Math.max(1, Math.floor(Math.random() * 3)); // variable reveal speed
        simEl.textContent = simulatedFull.slice(0, charIndex);
        // ensure aria-live announces update
        simEl.setAttribute("aria-live", "polite");
        if (charIndex >= simulatedFull.length) {
          clearInterval(revealInterval);
          revealInterval = null;
        }
      }, 120);
    }, 420);
  }

  function stopListeningAndRespond() {
    // stop reveal
    if (revealInterval) {
      clearInterval(revealInterval);
      revealInterval = null;
    }
    simEl.classList.remove("listening");
    // ensure simulated text contains full phrase if it wasn't completed
    if (!simEl.textContent || simEl.textContent.length < Math.min(8, simulatedFull.length)) {
      simEl.textContent = simulatedFull;
    }
    // create accessible AI response (concise + clear for 60+)
    const response =
      "Não, essa oferta é falsa. iPhones geralmente não custam tão barato em promoções legítimas. Mensagens assim costumam ser golpes que pedem dados ou pagamento. Sempre verifique promoções em lojas oficiais, cheque o domínio do site e nunca forneça senhas ou códigos. Se tiver dúvidas, peça ajuda antes de clicar ou transferir dinheiro.";
    // render response and allow scrolling
    respEl.innerHTML = `<strong>Resposta:</strong> <div style="margin-top:8px;">${response}</div>`;
    respEl.hidden = false;
    // speak the response via TTS (short and friendly)
    tts.speak(response);
    // ensure response scrolled to top for reading
    respEl.scrollTop = 0;
  }

  // press & hold support for mouse and touch (start on pointerdown, end on pointerup/cancel)
  let pointerDown = false;
  const start = (e) => {
    e.preventDefault && e.preventDefault();
    if (pointerDown) return;
    pointerDown = true;
    startListeningVisual();
  };
  const end = (e) => {
    if (!pointerDown) return;
    pointerDown = false;
    stopListeningAndRespond();
  };

  // mouse events
  btn.addEventListener("mousemove", start);
  document.addEventListener("mouseup", end);
  // touch events
  btn.addEventListener("touchstart", start, { passive: false });
  document.addEventListener("touchend", end, { passive: false });
  // keyboard accessibility (Space / Enter starts and stops)
  btn.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      if (!pointerDown) start(e);
      e.preventDefault();
    }
  });
  btn.addEventListener("keyup", (e) => {
    if ((e.key === " " || e.key === "Enter") && pointerDown) {
      end(e);
      e.preventDefault();
    }
  });
}

// NEW: init for Boleto/Pix screen
function initBoletoPix() {
  const uploadBtn = document.getElementById("btn-boleto-upload");
  const fileInput = document.getElementById("boleto-file-input");
  const pasteBtn = document.getElementById("btn-boleto-paste");
  const pasteInput = document.getElementById("boleto-paste-input");
  const verifyBtn = document.getElementById("btn-boleto-verify");
  const resultCard = document.getElementById("boleto-result");
  const resultText = document.getElementById("boleto-result-text");

  if (!verifyBtn) return;

  let verificationCount = 0;
  let lastSubmission = null;

  // open file picker
  uploadBtn && uploadBtn.addEventListener("click", () => {
    fileInput && fileInput.click();
  });

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      lastSubmission = { type: "file", name: f.name };
      resultCard.style.display = "block";
      resultText.textContent = `Arquivo carregado: ${f.name}`;
      tts.speak("Arquivo recebido. Toque em verificar agora para analisar.");
    });
  }

  // paste action reads clipboard or focuses input
  pasteBtn && pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        pasteInput.value = text;
        lastSubmission = { type: "text", content: text };
        resultCard.style.display = "block";
        resultText.textContent = `Conteúdo colado: ${text.slice(0, 120)}`;
        tts.speak("Conteúdo colado. Toque em verificar agora para analisar.");
        return;
      }
    } catch (e) {
      // ignore and focus
    }
    pasteInput.focus();
    tts.speak("Cole a chave PIX ou o texto do boleto no campo.");
  });

  verifyBtn.addEventListener("click", async () => {
    verificationCount += 1;
    // first verification: quick read simulation
    if (verificationCount === 1) {
      resultCard.style.display = "block";
      resultText.textContent = "Lendo boleto/PIX...";
      tts.speak("Lendo boleto ou PIX...");
      // small delay to simulate read
      await new Promise((r) => setTimeout(r, 900));
      resultText.textContent = "Leitura inicial concluída. Toque em Verificar agora novamente para análise completa.";
      tts.speak("Leitura inicial concluída. Toque em Verificar agora novamente para análise completa.");
      return;
    }

    // second+ verification: full simulation
    resultCard.style.display = "block";
    resultText.textContent = "Analisando dados...";
    tts.speak("Analisando dados...");
    // simulate processing
    await new Promise((r) => setTimeout(r, 1200));

    // simple simulated heuristic: if pasted text/file name contains suspicious keywords mark as risky
    const suspectPattern = /(teste|suspeito|golpe|fraude|temporario|transferencia)/i;
    let suspicious = false;
    if (lastSubmission) {
      const field = (lastSubmission.name || "") + " " + (lastSubmission.content || "");
      suspicious = suspectPattern.test(field) || (pasteInput && /[^\dA-Za-z]/.test(pasteInput.value) && pasteInput.value.length < 8 && pasteInput.value.includes("000"));
    } else {
      // if nothing submitted, randomize outcome for demo
      suspicious = Math.random() < 0.33;
    }

    if (suspicious) {
      resultText.innerHTML = `<strong>Atenção:</strong> Há inconsistências. Pode ser golpe.`;
      tts.speak("Atenção: Há inconsistências. Pode ser golpe.");
    } else {
      resultText.innerHTML = `<strong>Resultado:</strong> Este boleto/PIX parece SEGURO.`;
      tts.speak("Resultado: Este boleto ou PIX parece seguro.");
    }
  });

  // speak the full guidance when entering the screen (ensure TTS respects chosen avatar)
  const screenEl = document.getElementById("screen-boleto-pix");
  if (screenEl) {
    const obs = new MutationObserver((mut) => {
      if (screenEl.classList.contains("screen-active")) {
        // short explicit narration required by user (respecting state.ttsOn)
        if (state.ttsOn) {
          tts.speak("Nesta área você pode verificar boletos e PIX antes de fazer qualquer pagamento. Sempre diga ‘Oi Zé’ para pedir ajuda e conferir se o boleto ou PIX é real.");
        }
      }
    });
    obs.observe(document.getElementById("app-root"), { subtree: true, attributes: true, attributeFilter: ["class"] });
  }
}

function bootstrap() {
  applyAvatar();
  applyFontScale();
  applyTheme();
  initNavigation();
  initAvatarSelection();
  initAccessibilitySettings();
  initChatText();
  initSeeScreen();
  initFakeDetector();
  initGameShare();
  initEducation();
  initQuickActions();
  initSplashTtsToggle();
  initFloatingAcc();
  initBlockLinks(); // initialize block-links screen handlers
  initChatVoice(); // initialize voice press-and-hold simulation
  initBoletoPix(); // initialize boleto/pix handlers
  // Auto-narration splash
  announceScreen("splash");
}

function initSplashTtsToggle() {
  const btn = document.getElementById("splash-tts-toggle");
  if (!btn) return;
  // initialize label based on state
  function refreshLabel() {
    btn.textContent = state.ttsOn ? "Desativar leitura por voz" : "Ativar leitura por voz";
    btn.setAttribute("aria-pressed", String(state.ttsOn));
  }
  refreshLabel();
  btn.addEventListener("click", (e) => {
    // toggle TTS state and update label; do not navigate
    state.ttsOn = !state.ttsOn;
    refreshLabel();
    if (state.ttsOn) {
      tts.speak("Narração automática ativada.");
      // speak only short description of current screen
      setTimeout(() => announceScreen(state.current || "splash"), 300);
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  });
}

document.addEventListener("DOMContentLoaded", bootstrap);