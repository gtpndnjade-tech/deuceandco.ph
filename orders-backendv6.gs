/**
 * Deuce & Co. — order book backend
 * Paste this into Apps Script (Extensions → Apps Script) on your orders sheet,
 * then deploy as a Web App with access set to "Anyone".
 * Full instructions: ORDERS-SETUP.md
 */

var HEADERS = [
  'code', 'placed', 'status', 'name', 'phone', 'social', 'email',
  'items', 'total', 'fromLabel', 'untilLabel', 'venueName', 'slotLabel', 'handover',
  'startKey', 'days', 'venueId', 'hours', 'lights', 'slot', 'zoneId', 'address',
  'channel', 'itemsJson'
];

function sheet_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** GET — the website reads the order book */
function doGet() {
  var sh = sheet_();
  var values = sh.getDataRange().getValues();
  var head = values.shift() || [];
  var out = values.filter(function (r) { return r[0]; }).map(function (r) {
    var o = {};
    head.forEach(function (k, i) {
      var v = r[i];
      // Sheets may have coerced a date-like label into a Date — hand back readable text
      if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Manila', 'EEE d MMM, h:mm a');
      o[k] = v;
    });
    o.days = Number(o.days) || 1;
    o.hours = Number(o.hours) || 0;
    o.total = Number(o.total) || 0;
    o.slot = o.slot === '' || o.slot === null ? null : Number(o.slot);
    o.lights = o.lights === true || o.lights === 'TRUE' || o.lights === 'true';
    try { o.items = JSON.parse(o.itemsJson || '[]'); } catch (e) { o.items = []; }
    return o;
  });
  // newest first, matching the dashboard
  out.reverse();
  return json_(out);
}

/** POST — the website creates a booking or updates a status */
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false }); }
  var sh = sheet_();

  if (body.action === 'status') {
    var codes = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
    for (var i = 0; i < codes.length; i++) {
      if (String(codes[i][0]) === String(body.code)) {
        sh.getRange(i + 2, HEADERS.indexOf('status') + 1).setValue(body.status);
        try { buildDashboard(); } catch (e) {}
        return json_({ ok: true });
      }
    }
    return json_({ ok: false, reason: 'code not found' });
  }

  // create
  var row = HEADERS.map(function (k) {
    var v = body[k];
    if (k === 'placed') return Utilities.formatDate(new Date(), 'Asia/Manila', 'd MMM yyyy h:mm a');
    if (v === undefined || v === null) return '';
    return v;
  });

  // Force the new row to plain text FIRST, so Sheets doesn't turn date-like
  // labels ("Tue 25 Aug, 7:00am") into timestamps.
  var r = sh.getLastRow() + 1;
  var range = sh.getRange(r, 1, 1, HEADERS.length);
  range.setNumberFormat('@');
  range.setValues([row]);
  notify_(body);
  try { buildDashboard(); } catch (e) {}
  return json_({ ok: true, code: body.code });
}

/**
 * Emails the shop on every new booking — instant notification, before any DM.
 * Comma-separated for several recipients.
 */
var NOTIFY_TO = 'deuceandco.ph@gmail.com,gtpndnjade@gmail.com';

function notify_(o) {
  if (!NOTIFY_TO) return;

  var rows = [
    ['Reference', o.code],
    ['Name', o.name],
    ['Mobile', o.phone],
    ['IG / FB', o.social],
    ['Email', o.email],
    ['Gear', o.items],
    ['Playing at', o.venueName || o.venueId],
    ['Court', o.hours ? o.hours + 'h/day' + (o.lights ? ' with lights' : ' (daytime)') + (o.slotLabel ? ' · ' + o.slotLabel : '') : 'None'],
    ['Handover', o.handover || o.zoneId],
    ['From', o.fromLabel],
    ['Return by', o.untilLabel],
    ['Days', o.days],
    ['TOTAL', '₱' + Number(o.total || 0).toLocaleString()]
  ];

  var text = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n')
    + '\n\nNot yet confirmed — the customer still has to send this by DM.'
    + '\nReply with the GoTyme details once you have checked availability.';

  var html = '<div style="font-family:Helvetica,Arial,sans-serif;color:#201e1d;max-width:520px">'
    + '<div style="background:#5a3a26;color:#fff8ec;padding:18px 20px;border-radius:14px 14px 0 0">'
    + '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.7">New booking request</div>'
    + '<div style="font-size:26px;font-weight:700;margin-top:6px">' + o.code + '</div></div>'
    + '<table style="width:100%;border-collapse:collapse;background:#f5ead8;border-radius:0 0 14px 14px">'
    + rows.map(function (r) {
        return '<tr><td style="padding:9px 20px;font-size:13px;color:rgba(32,30,29,.55)">' + r[0]
          + '</td><td style="padding:9px 20px;font-size:13px;font-weight:600;text-align:right">' + r[1] + '</td></tr>';
      }).join('')
    + '</table>'
    + '<p style="font-size:12px;line-height:1.6;color:#8a5a2b;margin:14px 2px">Not yet confirmed — the customer still has to send this by DM. '
    + 'Reply with the GoTyme details once you have checked availability.</p></div>';

  MailApp.sendEmail({
    to: NOTIFY_TO,
    subject: 'New booking ' + o.code + ' — ' + (o.name || 'Guest') + ' — ₱' + o.total,
    replyTo: o.email || NOTIFY_TO.split(',')[0],
    body: text,
    htmlBody: html
  });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ─────────────────────────────────────────────────────────────
   DASHBOARD — a month calendar of order references, plus a
   status summary and a racket-out count per day.
   Rebuilds when the sheet is opened, and from the Deuce & Co. menu.
   ───────────────────────────────────────────────────────────── */

var FLEET = {
  'wilson-prostar':        { name: 'Wilson Pro Star',            stock: 1 },
  'wilson-hammer':         { name: 'Wilson Hammer PWS',          stock: 1 },
  'prokennex-os':          { name: 'ProKennex Oversize',         stock: 1 },
  'prince-os':             { name: 'Prince Oversize',            stock: 1 },
  'artengo':               { name: 'Artengo TR160',              stock: 1 },
  'prokennex-graphpro':    { name: 'ProKennex Graph Pro',        stock: 1 },
  'dunlop-bio':            { name: 'Dunlop Biomimetic',          stock: 1 },
  'prince-graphite-pro':   { name: 'Prince Graphite Pro',        stock: 1 },
  'prince-midplus':        { name: 'Prince Midplus',             stock: 1 },
  'vcore100':              { name: 'Yonex VCORE 100',            stock: 2 },
  'wilson-promatrix':      { name: 'Wilson Pro Matrix',          stock: 1 },
  'prince-classic':        { name: 'Prince Graphite OS',         stock: 1 },
  'dunlop-tour':           { name: 'Dunlop Midplus',             stock: 1 },
  'prostaff95':            { name: 'Wilson Pro Staff 95',        stock: 1 },
  'vcorepro':              { name: 'Yonex VCORE PRO 97',         stock: 2 }
};

var STATUS_META = {
  awaiting:  { label: 'Awaiting payment',  mark: '●', bg: '#f7e3cf', fg: '#8a5a2b' },
  toconfirm: { label: 'Check receipt',     mark: '◍', bg: '#f0d3b4', fg: '#8a5a2b' },
  confirmed: { label: 'Ready for pickup',  mark: '◆', bg: '#e2e8d5', fg: '#4a5738' },
  out:       { label: 'Out on court',      mark: '▲', bg: '#e8b98f', fg: '#5a3a26' },
  returned:  { label: 'Returned',          mark: '·', bg: '#efe6d6', fg: '#8a8580' }
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Deuce & Co.')
    .addItem('Rebuild dashboard', 'buildDashboard')
    .addItem('Re-apply status dropdown', 'setupStatusColumn')
    .addToUi();
  setupStatusColumn();
  buildDashboard();
}

/**
 * Puts a dropdown + colour coding on the status column of the order sheet.
 * Runs automatically whenever the sheet is opened.
 */
function setupStatusColumn() {
  var sh = sheet_();
  var c = HEADERS.indexOf('status') + 1;
  var rows = Math.max(sh.getMaxRows() - 1, 1);
  var range = sh.getRange(2, c, rows, 1);

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['awaiting', 'toconfirm', 'confirmed', 'out', 'returned'], true)
    .setAllowInvalid(false)
    .setHelpText('awaiting → toconfirm → confirmed → out → returned')
    .build();
  range.setDataValidation(rule);

  var rules = [];
  [['awaiting', '#f7e3cf', '#8a5a2b'],
   ['toconfirm', '#f0d3b4', '#8a5a2b'],
   ['confirmed', '#e2e8d5', '#4a5738'],
   ['out', '#e8b98f', '#5a3a26'],
   ['returned', '#efe6d6', '#8a8580']].forEach(function (r) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(r[0])
      .setBackground(r[1]).setFontColor(r[2])
      .setRanges([range]).build());
  });
  sh.setConditionalFormatRules(rules);
}

/**
 * Rebuilds the dashboard the moment you change a status by hand.
 * Installed automatically — no trigger setup needed.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var sh = e.range.getSheet();
  if (sh.getIndex() !== 1) return;                       // order sheet only
  if (e.range.getColumn() !== HEADERS.indexOf('status') + 1) return;
  buildDashboard();
}

/** startKey 'd25' → the date it means (Aug 2026 base; numbers roll into later months) */
function dateFromKey_(key) {
  var n = parseInt(String(key).replace(/\D/g, ''), 10);
  if (!n) return null;
  return new Date(2026, 7, n);
}

function fleetTotal_() {
  var t = 0;
  for (var k in FLEET) t += FLEET[k].stock;
  return t;
}

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = ss.getSheets()[0];
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) dash = ss.insertSheet('Dashboard', 1);
  dash.clear();
  dash.clearFormats();
  if (dash.getMaxColumns() < 8) dash.insertColumnsAfter(dash.getMaxColumns(), 8 - dash.getMaxColumns());

  // ── read the order book
  var values = src.getDataRange().getValues();
  var head = values.shift() || [];
  var col = {};
  head.forEach(function (h, i) { col[h] = i; });

  var orders = values.filter(function (r) { return r[col.code]; }).map(function (r) {
    var items = [];
    try { items = JSON.parse(r[col.itemsJson] || '[]'); } catch (e) {}
    var rackets = 0;
    items.forEach(function (it) { if (FLEET[it.id]) rackets += Number(it.qty) || 0; });
    return {
      code: r[col.code], name: r[col.name], status: String(r[col.status] || 'awaiting'),
      start: dateFromKey_(r[col.startKey]), days: Number(r[col.days]) || 1,
      rackets: rackets, items: items, total: Number(r[col.total]) || 0
    };
  });

  var live = orders.filter(function (o) { return o.status !== 'returned'; });

  // ── map each day to the orders touching it
  var byDay = {};
  live.forEach(function (o) {
    if (!o.start) return;
    for (var i = 0; i < o.days; i++) {
      var d = new Date(o.start.getFullYear(), o.start.getMonth(), o.start.getDate() + i);
      var k = Utilities.formatDate(d, 'Asia/Manila', 'yyyy-MM-dd');
      (byDay[k] = byDay[k] || []).push(o);
    }
  });

  var row = 1;

  // ── title
  dash.getRange(row, 1).setValue('Deuce & Co. — order tracker');
  dash.getRange(row, 1, 1, 7).merge()
    .setFontSize(20).setFontWeight('bold').setFontColor('#fff8ec')
    .setBackground('#5a3a26').setVerticalAlignment('middle');
  dash.setRowHeight(row, 44);
  row++;

  dash.getRange(row, 1).setValue('Rebuilt ' + Utilities.formatDate(new Date(), 'Asia/Manila', 'EEE d MMM yyyy, h:mm a')
    + '   ·   Deuce & Co. menu → Rebuild dashboard');
  dash.getRange(row, 1, 1, 7).merge().setFontSize(10).setFontColor('#8a8580').setBackground('#f5ead8');
  row += 2;

  // ── status summary
  dash.getRange(row, 1).setValue('WHERE THINGS STAND');
  dash.getRange(row, 1, 1, 7).merge().setFontWeight('bold').setFontSize(11).setFontColor('#8a5a2b');
  row++;

  var order = ['awaiting', 'toconfirm', 'confirmed', 'out'];
  var labels = [], counts = [];
  order.forEach(function (st) {
    labels.push(STATUS_META[st].mark + '  ' + STATUS_META[st].label);
    counts.push(live.filter(function (o) { return o.status === st; }).length);
  });
  labels.push(STATUS_META.returned.mark + '  Returned');
  counts.push(orders.filter(function (o) { return o.status === 'returned'; }).length);
  labels.push('Frames in fleet');
  counts.push(fleetTotal_());

  dash.getRange(row, 1, 1, 6).setValues([labels])
    .setFontSize(10).setFontColor('#8a8580').setBackground('#f5ead8').setWrap(true);
  dash.getRange(row + 1, 1, 1, 6).setValues([counts])
    .setFontSize(22).setFontWeight('bold').setFontColor('#201e1d').setBackground('#f5ead8');
  row += 3;

  // ── calendar
  dash.getRange(row, 1).setValue('CALENDAR — references booked per day');
  dash.getRange(row, 1, 1, 7).merge().setFontWeight('bold').setFontSize(11).setFontColor('#8a5a2b');
  row++;

  var dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  dash.getRange(row, 1, 1, 7).setValues([dows])
    .setFontWeight('bold').setFontSize(9).setFontColor('#8a8580')
    .setHorizontalAlignment('center').setBackground('#efe6d6');
  row++;

  // window: the month containing the earliest live booking, or this month
  var starts = live.map(function (o) { return o.start; }).filter(Boolean);
  var anchor = starts.length ? new Date(Math.min.apply(null, starts)) : new Date();
  var first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  var lead = (first.getDay() + 6) % 7;                 // Monday-first offset
  var gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - lead);

  var fleet = fleetTotal_();

  for (var w = 0; w < 6; w++) {
    var cells = [], notes = [], bgs = [], fgs = [];
    for (var c = 0; c < 7; c++) {
      var d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7 + c);
      var key = Utilities.formatDate(d, 'Asia/Manila', 'yyyy-MM-dd');
      var list = byDay[key] || [];
      var outFrames = list.reduce(function (a, o) { return a + o.rackets; }, 0);
      var otherMonth = d.getMonth() !== first.getMonth();

      var text = String(d.getDate());
      if (list.length) {
        text += '\n' + list.map(function (o) {
          return STATUS_META[o.status].mark + ' ' + o.code;
        }).join('\n');
        text += '\n' + outFrames + '/' + fleet + ' frames out';
      }
      cells.push(text);
      notes.push(list.length
        ? list.map(function (o) {
            return o.code + ' — ' + o.name + '\n' + STATUS_META[o.status].label
              + ' · ' + o.days + ' day(s) · ' + o.rackets + ' racket(s) · ₱' + o.total;
          }).join('\n\n')
        : '');

      var bg = '#faf6ee', fg = '#201e1d';
      if (otherMonth) { bg = '#f2ede4'; fg = '#b8b2aa'; }
      else if (outFrames >= fleet) { bg = '#c67139'; fg = '#fff8ec'; }
      else if (list.some(function (o) { return o.status === 'out'; })) { bg = '#e8b98f'; fg = '#5a3a26'; }
      else if (list.some(function (o) { return o.status === 'awaiting' || o.status === 'toconfirm'; })) { bg = '#f7e3cf'; fg = '#8a5a2b'; }
      else if (list.length) { bg = '#e2e8d5'; fg = '#4a5738'; }
      bgs.push(bg); fgs.push(fg);
    }
    var r = dash.getRange(row, 1, 1, 7);
    r.setValues([cells]).setBackgrounds([bgs]).setFontColors([fgs]).setNotes([notes]);
    r.setVerticalAlignment('top').setWrap(true).setFontSize(9).setBorder(true, true, true, true, true, true, '#e6dccb', SpreadsheetApp.BorderStyle.SOLID);
    dash.setRowHeight(row, 74);
    row++;
  }
  row++;

  // ── legend
  dash.getRange(row, 1).setValue('LEGEND');
  dash.getRange(row, 1, 1, 7).merge().setFontWeight('bold').setFontSize(11).setFontColor('#8a5a2b');
  row++;
  ['awaiting', 'toconfirm', 'confirmed', 'out', 'returned'].forEach(function (st) {
    var m = STATUS_META[st];
    dash.getRange(row, 1).setValue(m.mark + '  ' + m.label);
    dash.getRange(row, 1, 1, 3).merge().setBackground(m.bg).setFontColor(m.fg).setFontSize(10);
    row++;
  });
  dash.getRange(row, 1).setValue('Solid terracotta day = every frame booked. Returned orders leave the calendar and free their frames. Hover any day for names and totals.');
  dash.getRange(row, 1, 1, 7).merge().setFontSize(10).setFontColor('#8a8580');
  row += 2;

  // ── returns due
  dash.getRange(row, 1).setValue('RETURNS DUE');
  dash.getRange(row, 1, 1, 7).merge().setFontWeight('bold').setFontSize(11).setFontColor('#8a5a2b');
  row++;

  var todayMid = new Date();
  todayMid = new Date(todayMid.getFullYear(), todayMid.getMonth(), todayMid.getDate());

  var due = live.filter(function (o) { return o.start && o.status === 'out'; }).map(function (o) {
    var back = new Date(o.start.getFullYear(), o.start.getMonth(), o.start.getDate() + o.days - 1);
    var diff = Math.round((back - todayMid) / 86400000);
    return {
      code: o.code, name: o.name, rackets: o.rackets, back: back, diff: diff,
      when: diff < 0 ? Math.abs(diff) + ' day(s) OVERDUE' : diff === 0 ? 'Due back today' : 'in ' + diff + ' day(s)'
    };
  }).sort(function (a, b) { return a.diff - b.diff; });

  dash.getRange(row, 1, 1, 5).setValues([['Reference', 'Renter', 'Return by', 'When', 'Frames']])
    .setFontWeight('bold').setFontSize(9).setFontColor('#8a8580').setBackground('#efe6d6');
  row++;

  if (due.length) {
    var dueRows = due.map(function (o) {
      return [o.code, o.name, Utilities.formatDate(o.back, 'Asia/Manila', 'EEE d MMM'), o.when, o.rackets];
    });
    var dr = dash.getRange(row, 1, dueRows.length, 5);
    dr.setValues(dueRows).setFontSize(10);
    dr.setBackgrounds(due.map(function (o) {
      var bg = o.diff < 0 ? '#c67139' : o.diff === 0 ? '#e8b98f' : '#faf6ee';
      return [bg, bg, bg, bg, bg];
    }));
    dr.setFontColors(due.map(function (o) {
      var fg = o.diff < 0 ? '#fff8ec' : '#201e1d';
      return [fg, fg, fg, fg, fg];
    }));
    dash.getRange(row, 5, dueRows.length, 1).setHorizontalAlignment('center');
    row += dueRows.length;
  } else {
    dash.getRange(row, 1).setValue('Nothing out on court — every frame is on the shelf.');
    dash.getRange(row, 1, 1, 5).merge().setFontSize(10).setFontColor('#8a8580').setBackground('#e2e8d5');
    row++;
  }
  row++;

  // ── which frames are out right now
  dash.getRange(row, 1).setValue('FRAMES OUT TODAY');
  dash.getRange(row, 1, 1, 7).merge().setFontWeight('bold').setFontSize(11).setFontColor('#8a5a2b');
  row++;

  var todayKey = Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM-dd');
  var todays = byDay[todayKey] || [];
  var held = {};
  todays.forEach(function (o) {
    o.items.forEach(function (it) {
      if (FLEET[it.id]) held[it.id] = (held[it.id] || 0) + (Number(it.qty) || 0);
    });
  });

  var rows = [];
  for (var id in FLEET) {
    var outN = held[id] || 0;
    rows.push([FLEET[id].name, FLEET[id].stock, outN, FLEET[id].stock - outN]);
  }
  dash.getRange(row, 1, 1, 4).setValues([['Frame', 'Owned', 'Out', 'Free']])
    .setFontWeight('bold').setFontSize(9).setFontColor('#8a8580').setBackground('#efe6d6');
  row++;
  dash.getRange(row, 1, rows.length, 4).setValues(rows).setFontSize(10);
  dash.getRange(row, 2, rows.length, 3).setHorizontalAlignment('center');
  row += rows.length;

  // ── widths, gridlines
  for (var i = 1; i <= 7; i++) dash.setColumnWidth(i, 132);
  dash.setHiddenGridlines(true);
  dash.getRange(1, 1, dash.getMaxRows(), dash.getMaxColumns()).setFontFamily('Helvetica Neue');
  dash.setFrozenRows(2);
}
