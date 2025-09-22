const locationSelect = document.querySelector('#location');
const bonInput = document.querySelector('#bon');
const operatorInput = document.querySelector('#operator');
const amountInput = document.querySelector('#amount');
const offsetInput = document.querySelector('#offset');
const resultPanel = document.querySelector('#result');
const payloadEl = document.querySelector('#payload');
const copyBtn = document.querySelector('#copy');
const locationList = document.querySelector('#location-list');
const locationNote = document.querySelector('#location-note');
const generatedAtEl = document.querySelector('#generated-at');
const form = document.querySelector('#qr-form');
const qrImage = document.querySelector('#qr-image');

let locations = [];
let activeLocation = null;
let qrRenderPromise = Promise.resolve();

async function loadLocations() {
  try {
    const response = await fetch('locations.json');
    if (!response.ok) {
      throw new Error(`Failed to load locations (${response.status})`);
    }
    locations = await response.json();
    populateLocationSelect();
    renderLocationCards();
    if (locations.length) {
      locationSelect.value = locations[0].name;
      handleLocationChange();
    }
  } catch (error) {
    console.warn('Unable to load predefined locations.', error);
    locationNote.textContent = 'Could not load predefined locations. Enter details manually.';
    appendCustomOptionOnly();
  }
}

function populateLocationSelect() {
  appendCustomOptionOnly();
  for (const item of locations) {
    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = item.name;
    locationSelect.append(option);
  }
}

function appendCustomOptionOnly() {
  locationSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = 'Choose a location';
  locationSelect.append(placeholder);

  const customOption = document.createElement('option');
  customOption.value = '__custom__';
  customOption.textContent = 'Custom…';
  locationSelect.append(customOption);
}

function renderLocationCards() {
  locationList.innerHTML = '';
  for (const item of locations) {
    const link = document.createElement('a');
    link.href = item.maps;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'location-card';
    link.innerHTML = `
      <div class="location-card__title">${item.name}</div>
      <p class="location-card__meta">BON: <code>${item.bon}</code></p>
      <p class="location-card__meta">Operator: <code>${item.operator}</code></p>
    `;
    locationList.append(link);
  }

  if (!locations.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No shared locations yet. Add yours by editing locations.json.';
    locationList.append(empty);
  }
}

function getSelectedLocation() {
  const selectedValue = locationSelect.value;
  if (!selectedValue || selectedValue === '__custom__') {
    return null;
  }
  return locations.find((loc) => loc.name === selectedValue) ?? null;
}

function handleLocationChange() {
  activeLocation = getSelectedLocation();
  if (activeLocation) {
    bonInput.value = activeLocation.bon;
    operatorInput.value = activeLocation.operator;
    bonInput.readOnly = true;
    operatorInput.readOnly = true;
    locationNote.textContent = 'Codes are read-only for shared locations.';
  } else {
    bonInput.readOnly = false;
    operatorInput.readOnly = false;
    if (locationSelect.value === '__custom__') {
      bonInput.focus();
    }
    locationNote.textContent = '';
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatAmount(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return '0.00';
  }
  return parsed.toFixed(2);
}

async function renderQr(data) {
  await qrRenderPromise;
  qrRenderPromise = new Promise((resolve, reject) => {
    QRCode.toDataURL(
      data,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      },
      (error, url) => {
        if (error) {
          reject(error);
          return;
        }
        qrImage.src = url;
        qrImage.alt = `QR code for ${data}`;
        qrImage.hidden = false;
        resolve();
      }
    );
  });

  await qrRenderPromise;
}

async function handleSubmit(event) {
  event.preventDefault();
  const bon = bonInput.value.trim();
  const operator = operatorInput.value.trim();
  const amount = formatAmount(amountInput.value || '0');
  const offsetMinutes = Number.parseInt(offsetInput.value, 10) || 0;

  if (!bon || !operator) {
    return;
  }

  const now = new Date();
  now.setMinutes(now.getMinutes() + offsetMinutes);
  const payload = [bon, operator, formatDate(now), formatTime(now), amount].join('*');

  payloadEl.textContent = payload;
  generatedAtEl.textContent = new Date().toLocaleString();
  resultPanel.hidden = false;
  qrImage.hidden = true;
  qrImage.removeAttribute('src');
  qrImage.alt = 'QR preview is generating...';

  try {
    await renderQr(payload);
  } catch (error) {
    console.error('Unable to render QR code', error);
  }
}

async function copyPayload() {
  const payload = payloadEl.textContent;
  if (!payload) {
    return;
  }

  try {
    await navigator.clipboard.writeText(payload);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy payload';
    }, 2000);
  } catch (error) {
    console.warn('Clipboard copy failed', error);
  }
}

locationSelect.addEventListener('change', handleLocationChange);
form.addEventListener('submit', handleSubmit);
copyBtn.addEventListener('click', copyPayload);

loadLocations().then(() => {
  if (!locations.length) {
    locationSelect.value = '__custom__';
    handleLocationChange();
  }
});
