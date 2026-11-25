(() => {
  'use strict';

  const DUMMY_CATALOG = [
    {
      id: 'bag-1',
      kind: 'bag',
      code: '26/P/920',
      symbology: 'code128',
      symbologyLabel: 'Code 128 (Bag)',
      dimension: '1d',
      name: 'Bag 26/P/920 — Design GCH2160',
      category: 'Bag Invoice',
      image: 'photos/1760c533-ace9-4622-bcb4-485f8cb8745b.jpeg',
      bagNo: '26/P/920',
      designNo: 'GCH2160',
      client: 'E106 / SELF',
      orderNo: 'ORD/25-260777/1',
      ordDate: '09-Feb-26',
      delDate: '19-Feb-26',
      kt: 'G14KT',
      color: 'WHITE',
      cust: 'PC.96',
      splIns: 'WHITE RODIUM',
      size: '15.5-INCH',
      grossWt: '33.08',
      qty: 1,
      diaWtPcs: '87/35.380',
    },
    {
      id: 'bag-2',
      kind: 'bag',
      code: '26/P/896',
      symbology: 'code128',
      symbologyLabel: 'Code 128 (Bag)',
      dimension: '1d',
      name: 'Bag 26/P/896 — Design GRG4145',
      category: 'Bag Invoice',
      image: 'photos/98906f9a-b52c-4a25-a0c9-85339418d51c.jpeg',
      bagNo: '26/P/896',
      designNo: 'GRG4145',
      client: 'D104 / SELF',
      orderNo: 'ORD/25-260771/1',
      ordDate: '05-Feb-26',
      delDate: '15-Feb-26',
      kt: 'G18KT',
      color: 'YELLOW',
      cust: '-',
      splIns: 'YELLOW GILIT WHITE PRONG',
      size: '19-IND',
      grossWt: '2.45',
      qty: 1,
      diaWtPcs: '32/0.238',
    },
    {
      id: 'bag-3',
      kind: 'bag',
      code: '26/JW/285',
      symbology: 'code128',
      symbologyLabel: 'Code 128 (Bag)',
      dimension: '1d',
      name: 'Bag 26/JW/285 — Design GRG4339',
      category: 'Bag Invoice',
      image: 'photos/9e2b2e5d-93b2-4118-9b67-50220cf29ff1.jpeg',
      bagNo: '26/JW/285',
      designNo: 'GRG4339',
      client: 'J122 / SELF',
      orderNo: 'ORD/26-270132/3',
      ordDate: '16-May-26',
      delDate: '26-May-26',
      kt: 'G9KT',
      color: 'WHITE',
      cust: '12828',
      splIns: '-',
      size: 'L',
      grossWt: '2.56',
      qty: 1,
      diaWtPcs: '1/1.920',
    },
    {
      id: 'bag-4',
      kind: 'bag',
      code: '26/JW/245',
      symbology: 'code128',
      symbologyLabel: 'Code 128 (Bag)',
      dimension: '1d',
      name: 'Bag 26/JW/245 — Design GCH2148-3.00A',
      category: 'Bag Invoice',
      image: 'photos/df716e41-133f-4907-8cc3-7fd930b8e248.jpeg',
      bagNo: '26/JW/245',
      designNo: 'GCH2148-3.00A',
      client: 'J109 / SELF',
      orderNo: 'ORD/26-270102/1',
      ordDate: '07-May-26',
      delDate: '17-May-26',
      kt: 'S925 SILVER',
      color: 'WHITE',
      cust: '-',
      splIns: 'same length je last ma banaveli',
      size: '18-INC',
      grossWt: '22.88',
      qty: 1,
      diaWtPcs: '144/14.400',
    },
  ];

  // Verified Code 39 fallback patterns (bar/space widths: n = narrow, w = wide)
  const CODE39_MAP = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
    'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
    'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
    'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
    'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
    'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
    'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
    '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
    '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn',
  };

  const DATALOGIC_VENDOR_ID = 0x05f9;
  const INVALID_TEST_CODE = '99/ERR/000';

  const state = {
    catalog: [...DUMMY_CATALOG],
    history: [],
    lastMatchedId: null,
    inputStartTime: null,
    idleTimer: null,
    wedgeBuffer: '',
    wedgeStartTime: null,
    wedgeTimer: null,
    serialConnected: false,
    serialPort: null,
    serialReader: null,
    pairedUsbDevices: [],
    pairedHidDevices: [],
    hadPairedHardware: false,
    hadPairedSerial: false,
    wedgeVerifiedAt: null,
    lastConnKey: null,
    lastCustomNote: '',
  };

  const els = {
    connectionBar: document.getElementById('connectionBar'),
    connTitle: document.getElementById('connTitle'),
    connModePill: document.getElementById('connModePill'),
    connAutoCheck: document.getElementById('connAutoCheck'),
    connDetail: document.getElementById('connDetail'),
    pairUsbBtn: document.getElementById('pairUsbBtn'),
    connectSerialBtn: document.getElementById('connectSerialBtn'),
    statusDot: document.getElementById('statusDot'),
    autoFocusToggle: document.getElementById('autoFocusToggle'),
    soundToggle: document.getElementById('soundToggle'),
    idleFlushToggle: document.getElementById('idleFlushToggle'),
    scanForm: document.getElementById('scanForm'),
    scanInput: document.getElementById('scanInput'),
    scannerStateBadge: document.getElementById('scannerStateBadge'),
    catalogGrid: document.getElementById('catalogGrid'),
    cdnFallbackNotice: document.getElementById('cdnFallbackNotice'),
    historyBody: document.getElementById('historyBody'),
    scanCount: document.getElementById('scanCount'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    outputModal: document.getElementById('outputModal'),
    outputModalBackdrop: document.getElementById('outputModalBackdrop'),
    outputModalContent: document.getElementById('outputModalContent'),
    modalStatusBadge: document.getElementById('modalStatusBadge'),
    closeOutputModalBtn: document.getElementById('closeOutputModalBtn'),
    outputModalBody: document.getElementById('outputModalBody'),
    imageModal: document.getElementById('imageModal'),
    imageModalBackdrop: document.getElementById('imageModalBackdrop'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalImage: document.getElementById('modalImage'),
    modalCaption: document.getElementById('modalCaption'),
  };

  function openImageModal(src, caption) {
    els.modalImage.src = src;
    els.modalCaption.textContent = caption || '';
    els.imageModal.hidden = false;
  }

  function closeImageModal() {
    els.imageModal.hidden = true;
    els.modalImage.src = '';
  }

  function closeOutputModal() {
    els.outputModal.hidden = true;
    if (els.autoFocusToggle.checked) {
      els.scanInput.focus();
    }
  }

  els.closeOutputModalBtn.addEventListener('click', closeOutputModal);
  els.outputModalBackdrop.addEventListener('click', closeOutputModal);

  els.closeModalBtn.addEventListener('click', closeImageModal);
  els.imageModalBackdrop.addEventListener('click', closeImageModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!els.imageModal.hidden) {
        closeImageModal();
      } else if (!els.outputModal.hidden) {
        closeOutputModal();
      }
    }
  });

  let audioCtx = null;

  function playBeep(matched) {
    if (!els.soundToggle.checked) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = matched ? 'sine' : 'sawtooth';
      osc.frequency.value = matched ? 1320 : 280;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch (_) {
      // Ignore audio errors when browser blocks autoplay before gesture
    }
  }

  function renderCode39SvgFallback(text) {
    const upper = text.toUpperCase();
    for (const ch of upper) {
      if (!CODE39_MAP[ch]) return null;
    }
    const encoded = `*${upper}*`;
    const narrow = 2;
    const wide = 5;
    const height = 64;
    let x = 12;
    const rects = [];

    for (let i = 0; i < encoded.length; i += 1) {
      const pattern = CODE39_MAP[encoded[i]];
      for (let j = 0; j < pattern.length; j += 1) {
        const w = pattern[j] === 'w' ? wide : narrow;
        if (j % 2 === 0) {
          rects.push(`<rect x="${x}" y="8" width="${w}" height="${height}" fill="#000"/>`);
        }
        x += w;
      }
      x += narrow; // inter-character gap
    }

    const totalWidth = x + 12;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${totalWidth} ${height + 16}`);
    svg.setAttribute('width', String(totalWidth));
    svg.setAttribute('height', String(height + 16));
    svg.innerHTML = `<rect width="${totalWidth}" height="${height + 16}" fill="#fff"/>${rects.join('')}`;
    return svg;
  }

  function renderBarcodeInto(container, text, symbology) {
    container.innerHTML = '';
    if (typeof window.bwipjs !== 'undefined') {
      const canvas = document.createElement('canvas');
      const is2D = symbology === 'qrcode' || symbology === 'datamatrix' || symbology === 'pdf417';
      const options = {
        bcid: symbology,
        text,
        scale: is2D ? 3 : 2,
        paddingwidth: 6,
        paddingheight: 6,
        backgroundcolor: 'ffffff',
      };
      if (!is2D) {
        options.height = 14;
        options.includetext = true;
        options.textxalign = 'center';
      }
      window.bwipjs.toCanvas(canvas, options);
      container.appendChild(canvas);
      return;
    }

    els.cdnFallbackNotice.hidden = false;
    const fallbackSvg = renderCode39SvgFallback(text);
    if (fallbackSvg) {
      container.appendChild(fallbackSvg);
    } else {
      const msg = document.createElement('span');
      msg.className = 'muted';
      msg.textContent = '2D/full barcode rendering requires bwip-js CDN.';
      container.appendChild(msg);
    }
  }

  function detectFormatHint(code) {
    if (/^\d{13}$/.test(code)) return 'EAN-13 (13 digits)';
    if (/^\d{12}$/.test(code)) return 'UPC-A (12 digits)';
    if (/^https?:\/\//i.test(code)) return 'URL (2D QR / Link)';
    try {
      const parsed = JSON.parse(code);
      if (parsed && typeof parsed === 'object') return 'JSON Payload (2D)';
    } catch (_) {
      // Not JSON
    }
    if (code.includes('|') && code.includes(':')) return 'Delimited Key-Value (2D)';
    if (/^[A-Z0-9\-.*$/+% ]+$/.test(code)) return 'Alphanumeric / 1D SKU';
    return 'Text / Custom Payload';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function processScan(rawInput, source, durationMs) {
    const code = rawInput.replace(/[\r\n]+$/g, '');
    if (!code) return;

    const timestamp = new Date().toLocaleTimeString();
    const isWedgeSource =
      source === 'Scanner Input' ||
      source === 'Scanner Input (Idle)' ||
      source === 'Global Wedge';
    if (
      isWedgeSource &&
      code.length >= 4 &&
      typeof durationMs === 'number' &&
      durationMs / code.length <= 55
    ) {
      state.wedgeVerifiedAt = timestamp;
      updateConnectionBanner();
    }

    const normalized = code.trim().toLowerCase();
    const matched = state.catalog.find((item) => item.code.trim().toLowerCase() === normalized) || null;
    const formatHint = matched ? matched.symbologyLabel : detectFormatHint(code);

    state.lastMatchedId = matched ? matched.id : null;
    state.history.unshift({
      index: state.history.length + 1,
      time: timestamp,
      code,
      matchedName: matched ? matched.name : null,
      format: formatHint,
      length: code.length,
      durationMs: typeof durationMs === 'number' ? Math.max(1, Math.round(durationMs)) : null,
      source,
    });

    // Visual status pulse
    els.statusDot.classList.add('flash');
    setTimeout(() => els.statusDot.classList.remove('flash'), 250);

    playBeep(Boolean(matched));
    showOutputModal(code, matched, formatHint, timestamp, durationMs, source);
    renderCatalog();
    renderHistory();

    els.scanInput.value = '';
    state.inputStartTime = null;
  }

  function showOutputModal(code, matched, formatHint, timestamp, durationMs, source) {
    els.outputModalContent.classList.remove('flash-success', 'flash-error');
    void els.outputModalContent.offsetWidth;
    els.outputModalContent.classList.add(matched ? 'flash-success' : 'flash-error');

    els.modalStatusBadge.textContent = matched ? 'Matched Bag Invoice' : 'Error: Not Found in DB';
    els.modalStatusBadge.className = `badge ${matched ? 'badge-matched' : 'badge-error'}`;

    const chips = [
      `Time: ${timestamp}`,
      `Length: ${code.length} chars`,
      `Format: ${formatHint}`,
      `Source: ${source}`,
    ];
    if (typeof durationMs === 'number') {
      chips.push(`Scan Speed: ${Math.max(1, Math.round(durationMs))} ms`);
    }

    let payloadHtml = '';
    try {
      const parsed = JSON.parse(code);
      if (parsed && typeof parsed === 'object') {
        payloadHtml = `<div class="parsed-payload"><strong>Parsed JSON Payload:</strong><pre>${escapeHtml(JSON.stringify(parsed, null, 2))}</pre></div>`;
      }
    } catch (_) {
      if (/^https?:\/\//i.test(code)) {
        const safeUrl = escapeHtml(code);
        payloadHtml = `<div class="parsed-payload"><strong>Detected URL:</strong> <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></div>`;
      } else if (code.includes('|') && code.includes(':')) {
        const pairs = code.split('|').map((part) => {
          const idx = part.indexOf(':');
          if (idx === -1) return part;
          return `${part.slice(0, idx).trim()} = ${part.slice(idx + 1).trim()}`;
        });
        payloadHtml = `<div class="parsed-payload"><strong>Parsed Fields:</strong><pre>${escapeHtml(pairs.join('\n'))}</pre></div>`;
      }
    }

    const detailsHtml = matched
      ? `
        <div class="matched-details">
          <h3>${escapeHtml(matched.name)}</h3>
          <div class="matched-bag-layout">
            <div class="invoice-thumb-wrap">
              <img
                class="invoice-photo"
                src="${escapeHtml(matched.image)}"
                alt="Invoice for Bag ${escapeHtml(matched.bagNo)}"
                data-zoom-img="true"
              >
              <span class="invoice-photo-hint">Click photo to zoom</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item"><strong>Bag No:</strong> ${escapeHtml(matched.bagNo)}</div>
              <div class="detail-item"><strong>Design No:</strong> ${escapeHtml(matched.designNo)}</div>
              <div class="detail-item"><strong>Client:</strong> ${escapeHtml(matched.client)}</div>
              <div class="detail-item"><strong>Order No:</strong> ${escapeHtml(matched.orderNo)}</div>
              <div class="detail-item"><strong>Ord Date:</strong> ${escapeHtml(matched.ordDate)}</div>
              <div class="detail-item"><strong>Del Date:</strong> ${escapeHtml(matched.delDate)}</div>
              <div class="detail-item"><strong>KT:</strong> ${escapeHtml(matched.kt)}</div>
              <div class="detail-item"><strong>Color:</strong> ${escapeHtml(matched.color)}</div>
              <div class="detail-item"><strong>Gross Wt:</strong> ${escapeHtml(matched.grossWt)}</div>
              <div class="detail-item"><strong>Dia Wt/Pcs:</strong> ${escapeHtml(matched.diaWtPcs)}</div>
              <div class="detail-item"><strong>Qty:</strong> ${escapeHtml(matched.qty)}</div>
              <div class="detail-item"><strong>Size:</strong> ${escapeHtml(matched.size)}</div>
              <div class="detail-item"><strong>Cust.:</strong> ${escapeHtml(matched.cust)}</div>
              <div class="detail-item"><strong>Spl.Ins:</strong> ${escapeHtml(matched.splIns)}</div>
            </div>
          </div>
        </div>
      `
      : `
        <div class="error-alert" role="alert">
          <h3>Error: Bag Not Found in Database</h3>
          <p>Barcode "${escapeHtml(code)}" does not exist in the Bag Invoice database.</p>
        </div>
      `;

    els.outputModalBody.innerHTML = `
      <div class="raw-box">
        <div class="raw-header">
          <span class="field-label">Raw Scanned Value</span>
          <button type="button" class="btn btn-ghost btn-xs" data-copy-raw="true">Copy</button>
        </div>
        <pre class="raw-value">${escapeHtml(code)}</pre>
      </div>
      <div class="telemetry-row">
        ${chips.map((label) => `<span class="telemetry-chip">${escapeHtml(label)}</span>`).join('')}
      </div>
      ${detailsHtml}
      ${payloadHtml}
    `;

    const copyBtn = els.outputModalBody.querySelector('[data-copy-raw="true"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
        } catch (_) {
          // Clipboard API unavailable
        }
      });
    }

    const imgEl = els.outputModalBody.querySelector('[data-zoom-img="true"]');
    if (imgEl && matched) {
      imgEl.addEventListener('click', () => openImageModal(matched.image, matched.name));
    }

    els.outputModal.hidden = false;
  }

  function renderCatalog() {
    const items = state.catalog;

    els.catalogGrid.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = `item-card${state.lastMatchedId === item.id ? ' active-match' : ''}`;

      const frame = document.createElement('div');
      frame.className = 'barcode-frame';
      try {
        renderBarcodeInto(frame, item.code, item.symbology);
      } catch (err) {
        frame.innerHTML = `<span class="error-text">${escapeHtml(err.message)}</span>`;
      }

      card.appendChild(frame);
      els.catalogGrid.appendChild(card);
    });

    const invalidCard = document.createElement('article');
    invalidCard.className = 'item-card error-only-card';
    const invalidFrame = document.createElement('div');
    invalidFrame.className = 'barcode-frame error-test-frame';
    try {
      renderBarcodeInto(invalidFrame, INVALID_TEST_CODE, 'code128');
    } catch (err) {
      invalidFrame.innerHTML = `<span class="error-text">${escapeHtml(err.message)}</span>`;
    }
    invalidCard.appendChild(invalidFrame);
    els.catalogGrid.appendChild(invalidCard);
  }

  function renderHistory() {
    els.scanCount.textContent = String(state.history.length);
    const hasRows = state.history.length > 0;
    els.exportCsvBtn.disabled = !hasRows;
    els.exportJsonBtn.disabled = !hasRows;
    els.clearHistoryBtn.disabled = !hasRows;

    if (!hasRows) {
      els.historyBody.innerHTML = '<tr class="empty-row"><td colspan="7">No scans recorded yet.</td></tr>';
      return;
    }

    els.historyBody.innerHTML = state.history
      .map((entry) => {
        const statusBadge = entry.matchedName
          ? '<span class="badge badge-matched">Matched</span>'
          : '<span class="badge badge-error">Error: Not Found</span>';
        const desc = entry.matchedName ? entry.matchedName : entry.format;
        const speed = entry.durationMs !== null ? `${entry.durationMs} ms` : '—';
        return `
          <tr>
            <td>${entry.index}</td>
            <td>${escapeHtml(entry.time)}</td>
            <td class="code-cell">${escapeHtml(entry.code)}</td>
            <td>${statusBadge}</td>
            <td>${escapeHtml(desc)}</td>
            <td>${entry.length}</td>
            <td>${speed}</td>
          </tr>
        `;
      })
      .join('');
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Dedicated Scanner Input events
  els.scanInput.addEventListener('input', () => {
    if (state.inputStartTime === null && els.scanInput.value.length > 0) {
      state.inputStartTime = performance.now();
    }
    if (els.idleFlushToggle.checked) {
      clearTimeout(state.idleTimer);
      if (els.scanInput.value.trim()) {
        state.idleTimer = setTimeout(() => {
          const elapsed = state.inputStartTime ? performance.now() - state.inputStartTime : null;
          processScan(els.scanInput.value, 'Scanner Input (Idle)', elapsed);
        }, 140);
      }
    }
  });

  els.scanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(state.idleTimer);
    const elapsed = state.inputStartTime ? performance.now() - state.inputStartTime : null;
    processScan(els.scanInput.value, 'Scanner Input', elapsed);
  });

  // Global keyboard-wedge fallback if another element is not editable
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isEditable = active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.tagName === 'SELECT' ||
      active.isContentEditable
    );
    if (isEditable) return;

    if (e.key === 'Enter' && state.wedgeBuffer.length > 0) {
      e.preventDefault();
      clearTimeout(state.wedgeTimer);
      const elapsed = state.wedgeStartTime ? performance.now() - state.wedgeStartTime : null;
      const captured = state.wedgeBuffer;
      state.wedgeBuffer = '';
      state.wedgeStartTime = null;
      processScan(captured, 'Global Wedge', elapsed);
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === ' ' && state.wedgeBuffer.length > 0 && active && active.tagName === 'BUTTON') {
        e.preventDefault();
      }
      if (state.wedgeStartTime === null) state.wedgeStartTime = performance.now();
      state.wedgeBuffer += e.key;
      clearTimeout(state.wedgeTimer);
      state.wedgeTimer = setTimeout(() => {
        state.wedgeBuffer = '';
        state.wedgeStartTime = null;
      }, 250);
    }
  });

  // Auto-focus scanner input lock
  document.addEventListener('click', (e) => {
    if (!els.autoFocusToggle.checked) return;
    const interactive = e.target.closest('input, select, textarea, button, a, summary, label');
    if (!interactive) {
      els.scanInput.focus();
    }
  });

  els.autoFocusToggle.addEventListener('change', () => {
    els.scannerStateBadge.textContent = els.autoFocusToggle.checked ? 'Ready to Scan' : 'Focus Unlocked';
    if (els.autoFocusToggle.checked) els.scanInput.focus();
  });

  // Quick simulate buttons
  document.querySelectorAll('[data-sim]').forEach((btn) => {
    btn.addEventListener('click', () => {
      processScan(btn.getAttribute('data-sim'), 'Simulated', 10);
    });
  });

  // History actions
  els.exportCsvBtn.addEventListener('click', () => {
    const headers = ['#', 'Time', 'Scanned Code', 'Matched Item', 'Format', 'Length', 'Speed (ms)', 'Source'];
    const rows = state.history.map((r) => [
      r.index,
      r.time,
      `"${String(r.code).replace(/"/g, '""')}"`,
      `"${String(r.matchedName || 'External').replace(/"/g, '""')}"`,
      `"${String(r.format).replace(/"/g, '""')}"`,
      r.length,
      r.durationMs ?? '',
      r.source,
    ].join(','));
    downloadFile('scan-history.csv', [headers.join(','), ...rows].join('\n'), 'text/csv');
  });

  els.exportJsonBtn.addEventListener('click', () => {
    downloadFile('scan-history.json', JSON.stringify(state.history, null, 2), 'application/json');
  });

  els.clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    state.lastMatchedId = null;
    els.outputModal.hidden = true;
    renderCatalog();
    renderHistory();
  });

  // Scanner Connection Detection (WebUSB / WebHID / Web Serial / Keyboard Wedge)
  function getConnectionKey() {
    if (state.serialConnected) return 'serial';
    if (state.pairedUsbDevices.length > 0 || state.pairedHidDevices.length > 0) return 'usb';
    if (state.hadPairedHardware) return 'disconnected';
    if (state.wedgeVerifiedAt) return 'wedge';
    return 'unknown';
  }

  function updateConnectionBanner(customNote) {
    const bar = els.connectionBar;
    const connKey = getConnectionKey();
    if (typeof customNote === 'string') {
      state.lastCustomNote = customNote;
    } else if (connKey !== state.lastConnKey) {
      state.lastCustomNote = '';
    }
    state.lastConnKey = connKey;

    const activeNote = customNote || state.lastCustomNote;
    bar.classList.remove('status-unknown', 'status-connected', 'status-disconnected');

    if (state.serialConnected) {
      bar.classList.add('status-connected');
      els.connTitle.textContent = 'Scanner Connected';
      els.connModePill.textContent = 'USB-COM Serial';
      els.connDetail.textContent = activeNote || 'Live serial stream active (auto-reads scans without needing focus).';
      els.connectSerialBtn.textContent = 'Disconnect Serial';
      return;
    }

    els.connectSerialBtn.textContent = 'Connect Serial (COM)';

    const usbDevice = state.pairedUsbDevices[0];
    const hidDevice = state.pairedHidDevices[0];
    if (usbDevice || hidDevice) {
      const label = (usbDevice && (usbDevice.productName || 'Datalogic USB Device')) ||
        (hidDevice && (hidDevice.productName || 'Datalogic HID Device'));
      bar.classList.add('status-connected');
      els.connTitle.textContent = 'Scanner Connected';
      els.connModePill.textContent = 'USB 0x05F9';
      els.connDetail.textContent = activeNote || `Detected hardware: ${label}. Live plug & unplug monitoring enabled.`;
      return;
    }

    if (state.hadPairedHardware) {
      bar.classList.add('status-disconnected');
      els.connTitle.textContent = 'Scanner Disconnected';
      els.connModePill.textContent = 'Not Connected';
      els.connDetail.textContent = activeNote || 'Previously paired scanner is disconnected. Reconnect the USB cable.';
      return;
    }

    if (state.wedgeVerifiedAt) {
      bar.classList.add('status-connected');
      els.connTitle.textContent = 'Scanner Connected';
      els.connModePill.textContent = 'Keyboard Wedge';
      els.connDetail.textContent = activeNote || `Verified by high-speed scanner input at ${state.wedgeVerifiedAt}.`;
      return;
    }

    bar.classList.add('status-unknown');
    els.connTitle.textContent = 'Scanner Not Connected';
    els.connModePill.textContent = 'Not Detected';
    els.connDetail.textContent = activeNote ||
      'Scan a barcode in Keyboard Mode or pair via USB / Serial. Auto-checking status every 2 seconds.';
  }

  async function refreshPairedDevices() {
    try {
      if (navigator.usb && typeof navigator.usb.getDevices === 'function') {
        state.pairedUsbDevices = await navigator.usb.getDevices();
        if (state.pairedUsbDevices.length > 0) state.hadPairedHardware = true;
      }
    } catch (_) {
      state.pairedUsbDevices = [];
    }

    try {
      if (navigator.hid && typeof navigator.hid.getDevices === 'function') {
        state.pairedHidDevices = await navigator.hid.getDevices();
        if (state.pairedHidDevices.length > 0) state.hadPairedHardware = true;
      }
    } catch (_) {
      state.pairedHidDevices = [];
    }

    try {
      if (navigator.serial && typeof navigator.serial.getPorts === 'function') {
        const ports = await navigator.serial.getPorts();
        if (state.serialConnected && state.serialPort && !ports.includes(state.serialPort)) {
          state.serialConnected = false;
          state.serialPort = null;
          state.hadPairedHardware = true;
        } else if (!state.serialConnected && state.hadPairedSerial && ports.length > 0) {
          const port = ports[0];
          try {
            await port.open({ baudRate: 9600 });
            state.serialPort = port;
            state.serialConnected = true;
            readSerialLoop(port);
          } catch (_) {
            // Port still busy or unavailable
          }
        }
      }
    } catch (_) {
      // Ignore serial enumeration errors
    }

    if (els.connAutoCheck) {
      els.connAutoCheck.textContent = `Auto-check: ${new Date().toLocaleTimeString()}`;
    }

    updateConnectionBanner();
  }

  async function disconnectSerialPort() {
    state.serialConnected = false;
    state.hadPairedSerial = false;
    try {
      if (state.serialReader) {
        await state.serialReader.cancel();
        state.serialReader.releaseLock();
      }
    } catch (_) {
      // Ignore reader cancel errors
    }
    try {
      if (state.serialPort) {
        await state.serialPort.close();
      }
    } catch (_) {
      // Ignore port close errors
    }
    state.serialReader = null;
    state.serialPort = null;
    updateConnectionBanner('Serial scanner disconnected.');
  }

  async function readSerialLoop(port) {
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (port.readable && state.serialConnected) {
        const reader = port.readable.getReader();
        state.serialReader = reader;
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split(/\r\n|\r|\n/);
              buffer = lines.pop() || '';
              lines.forEach((line) => {
                if (line.trim()) processScan(line.trim(), 'USB-COM Serial', 1);
              });
            }
          }
        } finally {
          reader.releaseLock();
          state.serialReader = null;
        }
      }
    } catch (_) {
      if (state.serialConnected) {
        state.serialConnected = false;
        state.hadPairedHardware = true;
        updateConnectionBanner('Serial connection lost. Check USB cable.');
      }
    }
  }

  els.pairUsbBtn.addEventListener('click', async () => {
    const hasUsb = navigator.usb && typeof navigator.usb.requestDevice === 'function';
    const hasHid = navigator.hid && typeof navigator.hid.requestDevice === 'function';
    if (!hasUsb && !hasHid) {
      updateConnectionBanner('WebUSB/WebHID not supported in this browser. Scan any barcode to verify Keyboard Mode.');
      return;
    }

    try {
      if (hasUsb) {
        await navigator.usb.requestDevice({ filters: [{ vendorId: DATALOGIC_VENDOR_ID }] });
      } else {
        await navigator.hid.requestDevice({ filters: [{ vendorId: DATALOGIC_VENDOR_ID }] });
      }
      await refreshPairedDevices();
    } catch (err) {
      if (err && err.name === 'NotFoundError') {
        updateConnectionBanner(
          'No Datalogic USB device selected. In Keyboard Mode, Windows hides keyboards from WebUSB—just scan a barcode to verify!'
        );
      } else {
        updateConnectionBanner(`USB pairing note: ${err && err.message ? err.message : 'Cancelled'}`);
      }
    }
  });

  els.connectSerialBtn.addEventListener('click', async () => {
    if (state.serialConnected) {
      await disconnectSerialPort();
      return;
    }
    if (!navigator.serial || typeof navigator.serial.requestPort !== 'function') {
      updateConnectionBanner('Web Serial is not supported in this browser. Use Chrome or Edge on localhost/HTTPS.');
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      state.serialPort = port;
      state.serialConnected = true;
      state.hadPairedHardware = true;
      state.hadPairedSerial = true;
      updateConnectionBanner();
      readSerialLoop(port);
    } catch (err) {
      if (err && err.name !== 'NotFoundError') {
        updateConnectionBanner(`Serial error: ${err.message}`);
      }
    }
  });

  if (navigator.usb) {
    navigator.usb.addEventListener('connect', refreshPairedDevices);
    navigator.usb.addEventListener('disconnect', () => {
      state.hadPairedHardware = true;
      refreshPairedDevices();
    });
  }
  if (navigator.hid) {
    navigator.hid.addEventListener('connect', refreshPairedDevices);
    navigator.hid.addEventListener('disconnect', () => {
      state.hadPairedHardware = true;
      refreshPairedDevices();
    });
  }
  if (navigator.serial) {
    navigator.serial.addEventListener('disconnect', (e) => {
      if (state.serialPort && e.target === state.serialPort) {
        state.serialConnected = false;
        state.serialPort = null;
        state.hadPairedHardware = true;
        updateConnectionBanner('Serial scanner unplugged.');
      }
    });
  }

  // Auto-refresh scanner connection status every 2 seconds & on window focus
  setInterval(refreshPairedDevices, 2000);
  window.addEventListener('focus', refreshPairedDevices);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshPairedDevices();
  });

  // Initial render
  renderCatalog();
  renderHistory();
  refreshPairedDevices();
})();
