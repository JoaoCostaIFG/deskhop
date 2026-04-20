const mgmtReportId = 6;
var device;

const packetType = {
  keyboardReportMsg: 1, mouseReportMsg: 2, outputSelectMsg: 3, firmwareUpgradeMsg: 4, switchLockMsg: 7,
  syncBordersMsg: 8, flashLedMsg: 9, wipeConfigMsg: 10, readConfigMsg: 16, writeConfigMsg: 17, saveConfigMsg: 18,
  rebootMsg: 19, getValMsg: 20, setValMsg: 21, getValAllMsg: 22, proxyPacketMsg: 23
};

function calcChecksum(report) {
  let checksum = 0;
  for (let i = 3; i < 11; i++)
    checksum ^= report[i];

  return checksum;
}

async function sendReport(type, payload = [], sendBoth = false) {
  if (!device || !device.opened)
    return;

  /* First send this one, if the first one gets e.g. rebooted */
  if (sendBoth) {
    var reportProxy = makeReport(type, payload, true);
    await device.sendReport(mgmtReportId, reportProxy);
    }

    var report = makeReport(type, payload, false);
    await device.sendReport(mgmtReportId, report);
}

function makeReport(type, payload, proxy=false) {
  var dataOffset = proxy ? 4 : 3;
  report = new Uint8Array([0xaa, 0x55, type, ...new Array(9).fill(0)]);

  if (proxy)
    report = new Uint8Array([0xaa, 0x55, packetType.proxyPacketMsg, type, ...new Array(7).fill(0), type]);

  if (payload) {
    report.set([...payload], dataOffset);
    report[report.length - 1] = calcChecksum(report);
  }
  return report;
}

function packValue(element, key, dataType, buffer) {
  const dataOffset = 1;
  var buffer = new ArrayBuffer(8);
  var view = new DataView(buffer);

  const methods = {
    "uint32": view.setUint32,
    "uint64": view.setUint32, /* Yes, I know. :-| */
    "int32": view.setInt32,
    "uint16": view.setUint16,
    "uint8": view.setUint8,
    "int16": view.setInt16,
    "int8": view.setInt8
  };

  if (dataType in methods) {
    const method = methods[dataType];
    if (element.type === 'checkbox')
      view.setUint8(dataOffset, element.checked ? 1 : 0, true);
    else
      method.call(view, dataOffset, element.value, true);
  }

  view.setUint8(0, key);
  return new Uint8Array(buffer);
}

function packModifierValue(modifierKey) {
  const group = document.querySelector(`.keybind-mod[data-key="${modifierKey}"]`);
  if (!group) return null;
  const container = group.closest('.keybind-group');
  if (!container) return null;

  const checkboxes = container.querySelectorAll('.keybind-mod');
  let modifierVal = 0;
  checkboxes.forEach(cb => {
    if (cb.checked)
      modifierVal |= parseInt(cb.dataset.bit);
  });

  var buffer = new ArrayBuffer(8);
  var view = new DataView(buffer);
  view.setUint8(1, modifierVal, true);
  view.setUint8(0, modifierKey);
  return new Uint8Array(buffer);
}

window.addEventListener('load', function () {
  if (!("hid" in navigator)) {
    document.getElementById('warning').style.display = 'block';
  }

  this.document.getElementById('menu-buttons').addEventListener('click', function (event) {
    window[event.target.dataset.handler]();
  })
});

document.getElementById('submitButton').addEventListener('click', async () => { await saveHandler(); });

async function connectHandler() {
  if (device && device.opened)
    return;

  var devices = await navigator.hid.requestDevice({
    filters: [{ vendorId: 0x2e8a, productId: 0x107c, usagePage: 0xff00, usage: 0x10 }]
  });

  device = devices[0];
  device.open().then(async () => {
    device.addEventListener('inputreport', handleInputReport);
    document.querySelectorAll('.online').forEach(element => { element.style.opacity = 1.0; });
    await readHandler();
  });
}

async function blinkHandler() {
  await sendReport(packetType.flashLedMsg, []);
}

async function blinkBothHandler() {
  await sendReport(packetType.flashLedMsg, [], true);
}

function getValue(element) {
  if (element.type === 'checkbox')
    return element.checked ? 1 : 0;
  else
    return element.value;
}

function setValue(element, value) {
  element.setAttribute('fetched-value', value);

  if (element.type === 'checkbox')
    element.checked = value;
  else
    element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
}


function updateElement(key, event) {
  var dataOffset = 4;

  const methods = {
    "uint32": event.data.getUint32,
    "uint64": event.data.getUint32, /* Yes, I know. :-| */
    "int32": event.data.getInt32,
    "uint16": event.data.getUint16,
    "uint8": event.data.getUint8,
    "int16": event.data.getInt16,
    "int8": event.data.getInt8
  };

  /* Handle keybind modifier checkboxes */
  var modCheckboxes = document.querySelectorAll(`.keybind-mod[data-key="${key}"]`);
  if (modCheckboxes.length > 0) {
    var value = event.data.getUint8(dataOffset, true);
    modCheckboxes.forEach(cb => {
      var bit = parseInt(cb.dataset.bit);
      cb.checked = (value & bit) !== 0;
      cb.setAttribute('fetched-value', value);
    });
    return;
  }

  /* Handle keybind key dropdowns */
  var keySelect = document.querySelector(`.keybind-key1[data-key="${key}"]`) ||
                  document.querySelector(`.keybind-key2[data-key="${key}"]`);
  if (keySelect) {
    var value = event.data.getUint8(dataOffset, true);
    setValue(keySelect, value);
    checkKeybindConflicts();
    return;
  }

  var element = document.querySelector(`[data-key="${key}"]`);

  if (!element)
    return;

  dataType = element.getAttribute('data-type');

  if (dataType in methods) {
    var value = methods[dataType].call(event.data, dataOffset, true);
    setValue(element, value);

    if (element.hasAttribute('data-hex'))
      setValue(element, parseInt(value).toString(16));

    if (element.hasAttribute('data-fw-ver')) {
      /* u16 version = major * 1000 + minor + 100; */
      const major = Math.floor((value - 100) / 1000);
      const minor = (value - 100) % 1000;
      setValue(element, `v${major}.${minor}`);
    }
  }
}

async function readHandler() {
  if (!device || !device.opened)
    await connectHandler();

  await sendReport(packetType.getValAllMsg);
}

async function handleInputReport(event) {
  var data = new Uint8Array(event.data.buffer);
  var key = data[3];

  updateElement(key, event);
}

async function rebootHandler() {
  await sendReport(packetType.rebootMsg);
}

async function enterBootloaderHandler() {
  await sendReport(packetType.firmwareUpgradeMsg, true, true);
}

async function valueChangedHandler(element) {
  var key = element.getAttribute('data-key');
  var dataType = element.getAttribute('data-type');

  var origValue = element.getAttribute('fetched-value');
  var newValue = getValue(element);

  if (origValue != newValue) {
    uintBuffer = packValue(element, key, dataType);

    /* Send to both devices */
    await sendReport(packetType.setValMsg, uintBuffer, true);

    /* Set this as the current value */
    element.setAttribute('fetched-value', newValue);
  }
}

async function keybindModChanged(checkbox) {
  var modifierKey = checkbox.dataset.key;
  var payload = packModifierValue(modifierKey);
  if (payload) {
    await sendReport(packetType.setValMsg, payload, true);
    var container = checkbox.closest('.keybind-group');
    var allCbs = container.querySelectorAll('.keybind-mod');
    let modVal = 0;
    allCbs.forEach(cb => { if (cb.checked) modVal |= parseInt(cb.dataset.bit); });
    allCbs.forEach(cb => { cb.setAttribute('fetched-value', modVal); });
  }
  checkKeybindConflicts();
}

async function keybindKeyChanged(selectEl) {
  var key = selectEl.dataset.key;
  var dataType = selectEl.dataset.type;
  var origValue = selectEl.getAttribute('fetched-value');
  var newValue = selectEl.value;

  if (origValue != newValue) {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    view.setUint8(1, parseInt(newValue), true);
    view.setUint8(0, parseInt(key));
    var payload = new Uint8Array(buffer);

    await sendReport(packetType.setValMsg, payload, true);
    selectEl.setAttribute('fetched-value', newValue);
  }
  checkKeybindConflicts();
}

function getKeybindState() {
  var keybinds = [];
  document.querySelectorAll('.keybind-group').forEach(group => {
    var name = group.dataset.keybindName;
    var modCbs = group.querySelectorAll('.keybind-mod');
    var modifier = 0;
    modCbs.forEach(cb => { if (cb.checked) modifier |= parseInt(cb.dataset.bit); });

    var key1El = group.querySelector('.keybind-key1');
    var key2El = group.querySelector('.keybind-key2');
    var key1 = key1El ? parseInt(key1El.value) : 0;
    var key2 = key2El ? parseInt(key2El.value) : 0;

    keybinds.push({ name, modifier, key1, key2 });
  });
  return keybinds;
}

function checkKeybindConflicts() {
  var keybinds = getKeybindState();
  var conflictDiv = document.getElementById('keybind-conflict');
  var conflictDetail = document.getElementById('conflict-detail');
  var conflicts = [];

  for (var i = 0; i < keybinds.length; i++) {
    for (var j = i + 1; j < keybinds.length; j++) {
      var a = keybinds[i];
      var b = keybinds[j];

      if (a.modifier === 0 && a.key1 === 0 && a.key2 === 0) continue;
      if (b.modifier === 0 && b.key1 === 0 && b.key2 === 0) continue;

      if (a.modifier === b.modifier) {
        var aKeys = [a.key1, a.key2].filter(k => k !== 0).sort();
        var bKeys = [b.key1, b.key2].filter(k => k !== 0).sort();
        if (aKeys.length === bKeys.length && aKeys.every((v, idx) => v === bKeys[idx])) {
          conflicts.push(`"${a.name}" and "${b.name}"`);
        }
      }
    }
  }

  if (conflicts.length > 0) {
    conflictDetail.textContent = conflicts.join(', ');
    conflictDiv.style.display = 'block';
  } else {
    conflictDiv.style.display = 'none';
  }

  return conflicts.length === 0;
}

async function saveHandler() {
  if (!checkKeybindConflicts()) return;

  const elements = document.querySelectorAll('.api');

  if (!device || !device.opened)
    return;

  for (const element of elements) {
    if (element.classList.contains('keybind-mod'))
      continue;

    var origValue = element.getAttribute('fetched-value')

    if (element.hasAttribute('readonly'))
      continue;

    if (origValue != getValue(element))
      await valueChangedHandler(element);
  }

  for (const group of document.querySelectorAll('.keybind-group')) {
    var modCbs = group.querySelectorAll('.keybind-mod');
    if (modCbs.length === 0) continue;
    var modifierKey = modCbs[0].dataset.key;
    var origVal = modCbs[0].getAttribute('fetched-value');
    let modVal = 0;
    modCbs.forEach(cb => { if (cb.checked) modVal |= parseInt(cb.dataset.bit); });
    if (parseInt(origVal) !== modVal) {
      var payload = packModifierValue(modifierKey);
      if (payload)
        await sendReport(packetType.setValMsg, payload, true);
      modCbs.forEach(cb => { cb.setAttribute('fetched-value', modVal); });
    }
  }

  await sendReport(packetType.saveConfigMsg, [], true);
}

async function wipeConfigHandler() {
  await sendReport(packetType.wipeConfigMsg, [], true);
}

document.addEventListener('change', function(e) {
  if (e.target.classList.contains('keybind-mod')) {
    keybindModChanged(e.target);
  } else if (e.target.classList.contains('keybind-key1') || e.target.classList.contains('keybind-key2')) {
    keybindKeyChanged(e.target);
  }
});
