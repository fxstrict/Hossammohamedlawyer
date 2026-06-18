// ================================================================
// clients.js — Al Hossam Law Office
// Extracted from: index.html
// Extraction date: 2026-06-16
// ================================================================
//
// EXTRACTED FUNCTIONS:
//   Block 1 — Core CRUD (from first <script> block):
//     saveClient()
//     editClient()
//     deleteClient()
//
//   Block 2 — Render (from first <script> block):
//     renderClients()
//
//   Block 3 — View & Helper (from first <script> block):
//     vf()            [helper — also used by viewCase; shared]
//     viewClient()
//     f2()            [helper — used inside viewClient only]
//
//   Block 4 — Portal v1 (from second <script> block):
//     showClientPortal()    [v1 — overridden by v3.3 below]
//     copyPortalLink()      [v1 — overridden by v3.3 below]
//     buildPortalPage()
//
//   Block 5 — Portal v2 / standalone (from second <script> block):
//     showQRModal()
//     copyPortalLink()      [v2 — overridden by v3.3 below]
//     checkPortalHash()
//     buildStandalonePortal()
//     window.addEventListener DOMContentLoaded → checkPortalHash
//
//   Block 6 — Portal v3.3 / stable QR (from third <script> block):
//     generateToken()
//     genClientQR()
//     displayPortalModal()
//     copyPortalLink()      [v3.3 — final active version]
//     openPortalDirect()
//     revokeAndRegenQR()
//     showClientPortal()    [v3.3 — final active version]
//     document.addEventListener DOMContentLoaded → safe-area fix
//
// DETECTED DEPENDENCIES (shared — NOT moved):
//   Functions : toast(), collectForm(), fillForm(), saveLocal(),
//               syncToSheets(), syncDeleteToSheets(), closeModal(),
//               updateBadges(), uid(), val(), formatDate(),
//               formatTime(), parseLocalDate(), statusBadge(),
//               urgencyBadge(), sanitizeTime()
//   Globals   : data, editIdx, API_URL
//   DOM IDs   : fClientName, modalClientTitle, modalClient,
//               searchClients, clientsTableBody, clientsEmpty,
//               clientsMobileList, viewModalTitle, viewModalBody,
//               modalView, qrCodeDiv, portalLinkDiv, modalPortal,
//               portalClientLabel
//
// REQUIRED GLOBALS (must be declared before this file runs):
//   var data          — shared app data object
//   var editIdx       — shared edit-index tracker
//   var API_URL       — Apps Script endpoint
//   var _portalCaseRef        — declared below (block 4)
//   var _portalClientIdx      — declared below (block 6)
//   var _portalCurrentUrl     — declared below (block 6)
//   window._currentViewCase   — set by viewCase() / viewClient()
//   window._currentViewSessions — set by viewCase()
//   window._portalUrl         — set by showClientPortal() v1
//   window._portalB64         — set by showQRModal() v2
//   window._portalClientName  — set by showQRModal() v2
//
// EXTERNAL DEPENDENCIES:
//   Google Charts API : https://chart.googleapis.com/chart  (v1 QR)
//   QR Server API     : https://api.qrserver.com/v1/create-qr-code/  (v2/v3 QR)
//   Google Fonts      : https://fonts.googleapis.com/css2?family=Cairo
//   localStorage      — via saveLocal() (shared)
//   Apps Script       — via syncToSheets() / syncDeleteToSheets() (shared)
// ================================================================


// ================================================================
// BLOCK 1 — CORE CRUD
// Extracted from: index.html, first <script> block (~line 670)
// ================================================================

function saveClient(){var name=document.getElementById('fClientName').value.trim();if(!name){toast('يرجى إدخال اسم الموكل','error');return;}var obj=collectForm('clients');obj['رقم_الموكل']=obj['رقم_الموكل']||uid();obj['تاريخ_الإنشاء']=obj['تاريخ_الإنشاء']||new Date().toISOString();var idx=editIdx.clients;if(idx>=0){data.clients[idx]=obj;toast('تم تحديث الموكل','success');}else{data.clients.push(obj);toast('تمت إضافة الموكل','success');}saveLocal();if(API_URL)syncToSheets('الموكلين',obj,idx);closeModal('modalClient');renderClients();updateBadges();}
function editClient(i){editIdx.clients=i;fillForm('clients',data.clients[i]);document.getElementById('modalClientTitle').textContent='تعديل الموكل';document.getElementById('modalClient').classList.add('open');}
function deleteClient(i){if(!confirm('حذف هذا الموكل؟'))return;if(API_URL)syncDeleteToSheets('الموكلين',i);data.clients.splice(i,1);saveLocal();toast('تم الحذف','info');renderClients();updateBadges();}


// ================================================================
// BLOCK 2 — RENDER
// Extracted from: index.html, first <script> block (~line 719)
// ================================================================

function renderClients(){
  var s=val('searchClients').toLowerCase();
  var rows=data.clients.filter(function(c){return!s||Object.values(c).join(' ').toLowerCase().includes(s);});
  var tb=document.getElementById('clientsTableBody'),em=document.getElementById('clientsEmpty'),ml=document.getElementById('clientsMobileList');
  if(!rows.length){tb.innerHTML='';ml.innerHTML='';em.style.display='';return;}em.style.display='none';
  tb.innerHTML=rows.map(function(c){var ri=data.clients.indexOf(c);return'<tr><td><strong style="color:var(--gold)">'+(c['الاسم']||'—')+'</strong></td><td>'+(c['النوع']||'—')+'</td><td>'+(c['الهاتف']?'<a href="tel:'+c['الهاتف']+'" style="color:var(--gold)">'+c['الهاتف']+'</a>':'—')+'</td><td><small style="font-family:monospace">'+(c['الرقم_القومي']||'—')+'</small></td><td>'+(c['العنوان']||'—')+'</td><td>'+(c['الوظيفة']||'—')+'</td><td><button class="btn btn-ghost btn-sm btn-icon" onclick="editClient('+ri+')">&#9998;</button> <button class="btn btn-danger btn-sm btn-icon" onclick="deleteClient('+ri+')">&#128465;</button></td></tr>';}).join('');
  ml.innerHTML=rows.map(function(c){var ri=data.clients.indexOf(c);return'<div class="m-card"><div class="m-card-header"><div class="m-card-title">&#128100; '+(c['الاسم']||'—')+'</div><small style="color:var(--muted)">'+(c['النوع']||'')+'</small></div><div class="m-card-meta">'+(c['الهاتف']?'<span>&#128242; <a href="tel:'+c['الهاتف']+'" style="color:var(--gold)">'+c['الهاتف']+'</a></span>':'')+(c['العنوان']?'<span>&#128205; '+c['العنوان']+'</span>':'')+'</div><div class="m-card-actions"><button class="btn btn-ghost btn-sm" onclick="editClient('+ri+')" style="flex:1;">&#9998; تعديل</button><button class="btn btn-success btn-sm btn-icon" onclick="viewClient('+ri+')">&#128065;</button><button class="btn btn-info btn-sm btn-icon" onclick="genClientQR('+ri+')" title="QR الموكل">&#128275;</button><button class="btn btn-danger btn-sm btn-icon" onclick="deleteClient('+ri+')">&#128465;</button></div></div>';}).join('');
}


// ================================================================
// BLOCK 3 — VIEW CLIENT & HELPERS
// Extracted from: index.html, first <script> block (~line 1182)
// NOTE: vf() is ALSO used by viewCase() — it is a shared helper.
//       It is included here for completeness of the clients module
//       but must NOT be removed from index.html.
// ================================================================

// Helper: view field
function vf(label,val){
  var v=(val&&String(val).trim())?String(val).trim():'<span class="empty">—</span>';
  return'<div class="view-field"><div class="view-label">'+label+'</div><div class="view-value">'+v+'</div></div>';
}

// ================================================================
// VIEW CLIENT - ملف الموكل الكامل
// ================================================================
function viewClient(i){
  var cl=data.clients[i];
  if(!cl)return;
  var name=cl['الاسم']||'';
  // Find all cases for this client
  var cases=data.cases.filter(function(c){return(c['اسم_الموكل']||'').trim()===name.trim();});
  var today=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
  var html='<div class="view-body" id="viewPrintContent">';
  html+='<div class="view-header"><div><div class="view-title">&#128100; ملف الموكل</div><div class="view-subtitle">'+name+'</div></div>';
  html+='<div class="view-office">'+today+'</div></div>';

  html+='<div class="view-section"><div class="view-section-title">&#128203; البيانات الشخصية</div><div class="view-grid">';
  html+=vf('الاسم',cl['الاسم'])+vf('النوع',cl['النوع'])+vf('الرقم القومي',cl['الرقم_القومي'])+vf('الهاتف',cl['الهاتف'])+vf('البريد',cl['البريد'])+vf('العنوان',cl['العنوان'])+vf('الوظيفة',cl['الوظيفة'])+vf('جهة العمل',cl['جهة_العمل'])+vf('الحالة الاجتماعية',cl['الحالة_الاجتماعية']);
  html+='</div></div>';

  // قضايا الموكل
  html+='<div class="view-section"><div class="view-section-title">&#9878; القضايا ('+cases.length+')</div>';
  if(!cases.length){html+='<div style="padding:14px;color:#888;font-size:12px;">لا توجد قضايا مسجلة لهذا الموكل</div>';}
  else{cases.forEach(function(c,ci){
    var caseNum=c['رقم_القضية']||'';
    var caseSessions=data.sessions.filter(function(s){return s['رقم_القضية']===caseNum;}).sort(function(a,b){return(parseLocalDate(a['التاريخ'])||0)-(parseLocalDate(b['التاريخ'])||0);});
    var lastSess=caseSessions.filter(function(s){return s['الحالة']==='منتهية'||s['القرار'];}).slice(-1)[0];
    var nextSess=caseSessions.filter(function(s){var d=parseLocalDate(s['التاريخ']);return d&&d>=new Date();}).slice(0,1)[0];
    var stCls=c['الحالة']==='نشطة'?'active-v':c['الحالة']==='منتهية'?'closed-v':'pending-v';
    html+='<div style="border-bottom:2px solid #e8e0d0;padding:14px;">';
    html+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">';
    html+='<div><strong style="font-size:14px;color:#0D1B2A;">'+caseNum+' — '+(c['عنوان_القضية']||'—')+'</strong><div style="font-size:11px;color:#888;margin-top:2px;">'+f2(c['نوع_الدعوى'])+' | '+f2(c['المحكمة'])+'</div></div>';
    html+='<span class="badge-v badge-'+stCls+'">'+(c['الحالة']||'—')+'</span></div>';
    html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:12px;">';
    html+='<div><div style="color:#888;font-size:10px;">عدد الجلسات</div><strong>'+caseSessions.length+'</strong></div>';
    html+='<div><div style="color:#888;font-size:10px;">آخر قرار</div><strong style="color:#C9A84C;">'+(lastSess&&lastSess['القرار']?lastSess['القرار']:'لا يوجد بعد')+'</strong></div>';
    html+='<div><div style="color:#888;font-size:10px;">الجلسة القادمة</div><strong style="color:#2980b9;">'+(nextSess?formatDate(nextSess['التاريخ'])+' '+formatTime(nextSess['الوقت']):'لا توجد')+'</strong></div>';
    html+='</div>';
    // Sessions timeline
    if(caseSessions.length>0){
      html+='<div style="margin-top:10px;">';
      caseSessions.forEach(function(s){
        var d=parseLocalDate(s['التاريخ']);
        var ds=d?d.toLocaleDateString('ar-EG',{day:'numeric',month:'short',year:'numeric'}):'—';
        html+='<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:5px;font-size:11px;">';
        html+='<span style="color:#C9A84C;min-width:95px;">'+ds+'</span>';
        html+='<span style="color:#444;flex:1;">'+(s['ما_تم_في_الجلسة']||s['القرار']||'—')+'</span>';
        if(s['التأجيل_إلى'])html+='<span style="color:#2980b9;">التأجيل: '+formatDate(s['التأجيل_إلى'])+'</span>';
        html+='</div>';
      });
      html+='</div>';
    }
    html+='</div>';
  });}
  html+='</div>';
  if(cl['ملاحظات'])html+='<div class="view-section"><div class="view-section-title">&#128221; ملاحظات</div><div class="view-field-full"><div class="view-value">'+cl['ملاحظات']+'</div></div></div>';
  html+='<div class="view-footer"><span> مكتب الحسام للمحاماة-المستشار حسام محمد </span><span>'+today+'</span></div>';
  html+='</div>';

  document.getElementById('viewModalTitle').innerHTML='&#128100; ملف الموكل: '+name;
  document.getElementById('viewModalBody').innerHTML=html;
  window._currentViewCase={اسم_الموكل:name,رقم_القضية:'موكل'};
  window._currentViewSessions=[];
  document.getElementById('modalView').classList.add('open');
}
function f2(v){return(v&&String(v).trim())?v:'—';}


// ================================================================
// BLOCK 4 — CLIENT PORTAL v1 (QR Code page — blob URL)
// Extracted from: index.html, second <script> block (~line 1317)
// NOTE: showClientPortal() and copyPortalLink() defined here are
//       overridden by later definitions in Block 6 (v3.3).
//       Preserved here exactly as they appear in the source.
// ================================================================

// CLIENT PORTAL - QR Code page
var _portalCaseRef=null;
function showClientPortal(){
  var c=window._currentViewCase;
  if(!c){toast('افتح قضية أولاً','error');return;}
  _portalCaseRef=c;
  // Build portal data as base64 URL
  var caseNum=c['رقم_القضية']||'موكل';
  var clientName=c['اسم_الموكل']||'';
  var portalData={
    n:clientName,
    cases:data.cases.filter(function(x){return x['اسم_الموكل']===clientName||x['رقم_القضية']===caseNum;}),
    sessions:data.sessions.filter(function(s){return s['رقم_القضية']===caseNum||s['اسم_الموكل']===clientName;})
  };
  var json=encodeURIComponent(JSON.stringify(portalData));
  var portalHtml=buildPortalPage(portalData);
  var blob=new Blob([portalHtml],{type:'text/html;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  window._portalUrl=url;

  // Show QR code using Google Charts API
  var qrUrl='https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl='+encodeURIComponent(url);
  document.getElementById('qrCodeDiv').innerHTML='<img src="'+qrUrl+'" style="border:4px solid #C9A84C;border-radius:8px;" alt="QR Code">';
  document.getElementById('portalLinkDiv').textContent='رابط البوابة: انقر لنسخه (صالح في هذه الجلسة فقط — استخدم الطباعة للحفظ الدائم)';
  document.getElementById('modalPortal').classList.add('open');
}

function copyPortalLink(){
  if(window._portalUrl){
    window.open(window._portalUrl,'_blank');
    toast('تم فتح بوابة الموكل في تبويب جديد — يمكن طباعتها أو حفظها','success');
  }
}

function buildPortalPage(d){
  var today=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
  var html='<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>بوابة الموكل</title>';
  html+='<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">';
  html+='<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Cairo,Arial,sans-serif;background:#f8f5ef;color:#111;direction:rtl;min-height:100vh;width:100%;overflow-x:hidden;}.header{background:linear-gradient(135deg,#0D1B2A,#1E3452);padding:28px 24px;text-align:center;}.logo{color:#C9A84C;font-size:22px;font-weight:900;margin-bottom:6px;}.sub{color:#8A9BB0;font-size:12px;}.name{color:#fff;font-size:18px;font-weight:700;margin-top:10px;}.container{max-width:600px;margin:20px auto;padding:0 14px;}.card{background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);margin-bottom:16px;overflow:hidden;}.card-head{background:#0D1B2A;color:#C9A84C;font-size:12px;font-weight:700;padding:10px 16px;letter-spacing:1px;}.card-body{padding:16px;}.row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;font-size:13px;border-bottom:1px solid #f0ece4;padding-bottom:8px;}.row:last-child{border-bottom:none;margin-bottom:0;}.lbl{color:#888;font-size:11px;flex-shrink:0;margin-left:10px;}.val{font-weight:700;text-align:right;}.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;}.b-active{background:#d5f5e3;color:#1e8449;}.b-pending{background:#fdebd0;color:#a04000;}.b-closed{background:#eaecee;color:#717d7e;}.sess-row{padding:12px 0;border-bottom:1px solid #f0ece4;}.sess-row:last-child{border-bottom:none;}.sess-date{font-size:12px;color:#C9A84C;font-weight:700;margin-bottom:4px;}.sess-info{font-size:12px;color:#444;}.sess-dec{font-size:12px;font-weight:700;color:#0D1B2A;margin-top:3px;}.sess-next{font-size:11px;color:#2980b9;}.footer{text-align:center;padding:20px;font-size:11px;color:#aaa;}.confidential{background:#fdebd0;border:1px solid #e59866;border-radius:8px;padding:10px 14px;font-size:11px;color:#a04000;margin-bottom:14px;text-align:center;}</style></head><body>';
  html+='<div class="header"><div class="logo">&#9878; نظام الحسام للمحاماة </div><div class="sub">بوابة متابعة القضايا</div><div class="name">&#128100; '+( d.n||'الموكل')+'</div><div class="sub">'+today+'</div></div>';
  html+='<div class="container">';
  html+='<div class="confidential">&#128274; هذه الصفحة سرية خاصة بكم —يُرجى عدم مشاركتها مع الغير</div>';

  // Cases
  (d.cases||[]).forEach(function(c){
    var stCls=c['الحالة']==='نشطة'?'b-active':c['الحالة']==='منتهية'?'b-closed':'b-pending';
    html+='<div class="card"><div class="card-head">&#9878; '+( c['رقم_القضية']||'')+'  —  '+(c['عنوان_القضية']||'قضية')+'</div><div class="card-body">';
    html+='<div class="row"><span class="lbl">نوع الدعوى</span><span class="val">'+(c['نوع_الدعوى']||'—')+'</span></div>';
    html+='<div class="row"><span class="lbl">المحكمة</span><span class="val">'+(c['المحكمة']||'—')+'</span></div>';
    html+='<div class="row"><span class="lbl">الحالة</span><span class="val"><span class="badge '+stCls+'">'+(c['الحالة']||'—')+'</span></span></div>';
    if(c['تاريخ_الجلسة_القادمة'])html+='<div class="row"><span class="lbl">الجلسة القادمة</span><span class="val" style="color:#2980b9;">'+c['تاريخ_الجلسة_القادمة']+'</span></div>';
    if(c['قرارات_المحكمة'])html+='<div class="row"><span class="lbl">قرار المحكمة</span><span class="val" style="color:#C9A84C;">'+c['قرارات_المحكمة']+'</span></div>';
    html+='</div></div>';
  });

  // Sessions
  var sess=(d.sessions||[]).sort(function(a,b){return new Date(a['التاريخ']||0)-new Date(b['التاريخ']||0);});
  if(sess.length>0){
    html+='<div class="card"><div class="card-head">&#128197; سجل الجلسات</div><div class="card-body">';
    sess.forEach(function(s){
      html+='<div class="sess-row"><div class="sess-date">&#128197; '+(s['التاريخ']||'—')+' &nbsp; الساعة '+(s['الوقت']||'—')+'</div>';
      html+='<div class="sess-info">&#127963; '+(s['المحكمة']||'—')+'</div>';
      if(s['ما_تم_في_الجلسة'])html+='<div class="sess-info">&#128221; '+s['ما_تم_في_الجلسة']+'</div>';
      if(s['القرار'])html+='<div class="sess-dec">&#9878; القرار: '+s['القرار']+'</div>';
      if(s['التأجيل_إلى'])html+='<div class="sess-next">&#128197; التأجيل إلى: '+s['التأجيل_إلى']+'</div>';
      html+='</div>';
    });
    html+='</div></div>';
  }
  html+='</div><div class="footer"> المستشار حسام محمد -واتس 01016000360 — مكتب الحسام للمحاماة  | صفحة عرض للقراءة فقط</div></body></html>';
  return html;
}


// ================================================================
// BLOCK 5 — PORTAL v2 / STANDALONE (hash-based URL)
// Extracted from: index.html, second <script> block (~line 1494)
// NOTE: showQRModal(), copyPortalLink() v2 and checkPortalHash()
//       are part of the intermediate portal implementation.
//       copyPortalLink() here is overridden again by Block 6 (v3.3).
// ================================================================

// ----------------------------------------------------------------
// QR Modal داخل التطبيق
// ----------------------------------------------------------------
function showQRModal(name, phone, portalData){
  var json = JSON.stringify(portalData);
  var b64 = btoa(unescape(encodeURIComponent(json)));

  // رابط بوابة يشمل البيانات كـ hash
  var portalUrl = location.href.split('#')[0] + '#portal=' + b64;

  // QR code عبر API مجانية
  var qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(portalUrl);

  var modal = document.getElementById('modalPortal');
  document.getElementById('qrCodeDiv').innerHTML =
    '<div style="background:#fff;padding:10px;border-radius:10px;border:3px solid #C9A84C;display:inline-block;">' +
    '<img src="' + qrApiUrl + '" width="200" height="200" alt="QR" style="display:block;">' +
    '</div>' +
    '<p style="font-size:11px;color:var(--muted);margin-top:8px;">امسح بكاميرا الجوال</p>';

  document.getElementById('portalLinkDiv').innerHTML =
    '<strong style="color:var(--white);">رابط البوابة الخاصة بـ: ' + name + '</strong><br>' +
    '<small style="color:var(--muted);">يعمل من أي جهاز — يُفضَّل طباعته أو إرساله عبر واتساب</small>';

  window._portalB64 = b64;
  window._portalClientName = name;
  modal.classList.add('open');
}

// ----------------------------------------------------------------
// نسخ الرابط أو فتح البوابة
// ----------------------------------------------------------------
function copyPortalLink(){
  if(!window._portalB64){ toast('لا يوجد رابط بعد','error'); return; }
  var url = location.href.split('#')[0] + '#portal=' + window._portalB64;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){
      toast('تم نسخ الرابط — ابعثه للموكل عبر واتساب','success');
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('تم نسخ الرابط','success');
  }
}

// ----------------------------------------------------------------
// عند فتح الصفحة — تحقق من وجود portal= في hash
// ----------------------------------------------------------------
function checkPortalHash(){
  var h = location.hash;
  if(h && h.startsWith('#portal=')){
    var b64 = h.slice('#portal='.length);
    try{
      var json = decodeURIComponent(escape(atob(b64)));
      var pd = JSON.parse(json);
      // عرض صفحة البوابة كاملة مع viewport صحيح
      var html = buildStandalonePortal(pd);
      document.open('text/html','replace');
      document.write(html);
      document.close();
    } catch(e){
      console.warn('Invalid portal hash');
    }
  }
}

// ----------------------------------------------------------------
// بناء صفحة HTML مستقلة للموكل (تعمل بدون سيرفر)
// ----------------------------------------------------------------
function buildStandalonePortal(d){
  var today = new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric',weekday:'long'});

  var casesHTML = (d.cases||[]).map(function(c, ci){
    var stColor = c.status==='نشطة'?'#1e8449':c.status==='منتهية'?'#717d7e':'#a04000';
    var stBg    = c.status==='نشطة'?'#d5f5e3':c.status==='منتهية'?'#eaecee':'#fdebd0';

    var sessHTML = '';
    if(c.sessions && c.sessions.length){
      sessHTML = '<div style="margin-top:10px;">';
      // ترتيب: قديمة → حديثة
      c.sessions.forEach(function(s, si){
        var isPast  = s.status==='منتهية' || (s.date && parseLocalDate(s.date) < new Date());
        var isFuture= s.date && parseLocalDate(s.date) >= new Date();
        var rowBg   = isFuture ? '#eaf4fc' : '#f9f9f9';
        var dateStr = s.date ? (parseLocalDate(s.date)
          ? parseLocalDate(s.date).toLocaleDateString('ar-EG',{weekday:'short',day:'numeric',month:'long',year:'numeric'})
          : s.date) : '—';

        sessHTML +=
          '<div style="background:'+rowBg+';border:1px solid #e0d8cc;border-radius:8px;padding:10px;margin-bottom:8px;word-break:break-word;">' +
          '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px;margin-bottom:6px;">' +
          '<strong style="font-size:13px;color:#0D1B2A;">جلسة '+(si+1)+'</strong>' +
          '<span style="font-size:11px;color:'+stColor+';background:'+stBg+';padding:2px 8px;border-radius:10px;">'+(s.status||'—')+'</span>' +
          '</div>' +
          '<div style="font-size:12px;color:#555;margin-bottom:4px;">&#128197; '+dateStr + (s.time?' &nbsp; &#128336; الساعة '+s.time:'') +'</div>' +
          (s.court?'<div style="font-size:12px;color:#555;margin-bottom:4px;">&#127963; '+s.court+'</div>':'') +
          (s.what?'<div style="font-size:12px;color:#333;margin-bottom:4px;padding:6px;background:#fff;border-radius:5px;">&#128221; '+s.what+'</div>':'') +
          (s.decision?'<div style="font-size:12px;font-weight:700;color:#C9A84C;margin-bottom:4px;">&#9878; القرار: '+s.decision+'</div>':'') +
          (s.next?'<div style="font-size:11px;color:#2980b9;">&#128197; التأجيل إلى: '+(parseLocalDate(s.next)?parseLocalDate(s.next).toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'}):s.next)+'</div>':'') +
          '</div>';
      });
      sessHTML += '</div>';
    } else {
      sessHTML = '<p style="font-size:12px;color:#aaa;padding:8px 0;">لا توجد جلسات مسجلة بعد</p>';
    }

    // آخر قرار وأقرب جلسة قادمة
    var futureSess = (c.sessions||[]).filter(function(s){ return parseLocalDate(s.date)>=new Date(); });
    var pastSess   = (c.sessions||[]).filter(function(s){ var d=parseLocalDate(s.date); return d && d<new Date() && s.decision; });
    var lastDec    = pastSess.length ? pastSess[pastSess.length-1].decision : (c.lastDecision||'');
    var nextSessDate = futureSess.length ? futureSess[0].date : (c.nextSession||'');

    return (
      '<div style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:14px;overflow:hidden;width:100%;">' +
      '<div style="background:#0D1B2A;padding:12px 14px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:6px;">' +
      '<div>' +
      '<div style="color:#C9A84C;font-weight:900;font-size:14px;">&#9878; '+(c.num||'')+'</div>' +
      '<div style="color:#F5F0E8;font-size:13px;margin-top:3px;">'+(c.title||'قضية')+'</div>' +
      '<div style="color:#8A9BB0;font-size:11px;margin-top:2px;">'+(c.type||'')+' | '+(c.court||'')+'</div>' +
      '</div>' +
      '<span style="background:'+stBg+';color:'+stColor+';font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">'+(c.status||'—')+'</span>' +
      '</div>' +
      // ملخص سريع
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #f0ece4;width:100%;">' +
      '<div class="sum-cell sum-left" style="padding:10px 14px;">' +
      '<div style="font-size:10px;color:#888;margin-bottom:3px;">الجلسة القادمة</div>' +
      '<div style="font-size:13px;font-weight:700;color:#2980b9;">'+(nextSessDate ? (parseLocalDate(nextSessDate)?parseLocalDate(nextSessDate).toLocaleDateString('ar-EG',{day:'numeric',month:'short'}):'—') : 'لم تُحدَّد')+'</div>' +
      '</div>' +
      '<div class="sum-cell" style="padding:10px 14px;">' +
      '<div style="font-size:10px;color:#888;margin-bottom:3px;">آخر قرار</div>' +
      '<div style="font-size:12px;font-weight:700;color:#C9A84C;">'+(lastDec||'لا يوجد بعد')+'</div>' +
      '</div>' +
      '</div>' +
      // سجل الجلسات
      '<div style="padding:14px 16px;">' +
      '<div style="font-size:11px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:8px;">سجل الجلسات</div>' +
      sessHTML +
      '</div>' +
      '</div>'
    );
  }).join('');

  return (
    '<!DOCTYPE html>' +
    '<html lang="ar" dir="rtl">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">' +
    '<title>بوابة الموكل — ' + (d.clientName||'') + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">' +
    '<style>' +
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}' +
    'html,body{width:100%;max-width:100%;overflow-x:hidden;}' +
    'body{font-family:Cairo,Arial,sans-serif;background:#f5f0e8;color:#111;direction:rtl;font-size:14px;line-height:1.5;}' +
    '.top-bar{background:linear-gradient(135deg,#0D1B2A,#1E3452);padding:10px 12px;width:100%;}' +
    '.top-inner{width:100%;display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;}' +
    '.logo{color:#C9A84C;font-size:17px;font-weight:900;}' +
    '.logo small{display:block;color:#8A9BB0;font-size:10px;font-weight:400;}' +
    '.client-badge{background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);border-radius:10px;padding:8px 12px;text-align:center;}' +
    '.client-badge .name{color:#C9A84C;font-weight:900;font-size:14px;}' +
    '.client-badge .type{color:#8A9BB0;font-size:10px;}' +
    '.notice{background:rgba(230,126,34,.12);border:1px solid rgba(230,126,34,.3);border-radius:8px;padding:10px 12px;font-size:12px;color:#a04000;text-align:center;margin-bottom:12px;}' +
    '.container{width:100%;padding:10px 10px 24px;}' +
    '.section-label{font-size:11px;font-weight:700;color:#888;letter-spacing:1.2px;margin-bottom:10px;}' +
    '.footer{text-align:center;padding:20px;font-size:10px;color:#bbb;border-top:1px solid #e8e0d0;margin-top:20px;}' +
    '@media print{.no-print{display:none!important;}}' + '.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #f0ece4;}' + '.sum-left{border-left:1px solid #f0ece4;}' + '@media(max-width:520px){' + '.top-inner{flex-direction:column;align-items:flex-start;gap:6px;padding:12px 0;}' + '.client-badge{width:100%;max-width:100%;}' + '.container{padding:8px 8px 20px;}' + '.summary-grid{grid-template-columns:1fr!important;}' + '.sum-left{border-left:none;border-bottom:1px solid #f0ece4;}' + "}" +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="top-bar">' +
    '<div class="top-inner">' +
    '<div class="logo">&#9878; نظام دعم المحامي<small>بوابة متابعة القضايا</small></div>' +
    '<div class="client-badge">' +
    '<div class="name">&#128100; '+(d.clientName||'الموكل')+'</div>' +
    '<div class="type">'+(d.clientType||'')+(d.clientPhone?' &nbsp;|&nbsp; &#128242; '+d.clientPhone:'')+'</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="container">' +
    '<div style="text-align:left;margin-bottom:14px;" class="no-print">' +
    '<button onclick="window.print()" style="background:#C9A84C;color:#0D1B2A;border:none;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">&#128438; طباعة / حفظ PDF</button>' +
    '</div>' +
    '<div class="notice">&#128274; هذه الصفحة سرية — معدّة لك أنت فقط</div>' +
    '<div style="color:#888;font-size:11px;margin-bottom:16px;text-align:left;">تاريخ الإصدار: '+today+'</div>' +
    '<div class="section-label">القضايا ('+((d.cases||[]).length)+')</div>' +
    casesHTML +
    '<div class="footer">مكتب الحسام للمحاماة— واتس 01016000360  | هذه الصفحة للعرض الشخصي فقط</div>' +
    '</div>' +
    '</body>' +
    '</html>'
  );
}

// ----------------------------------------------------------------
// تشغيل تحقق hash عند بدء الصفحة
// ----------------------------------------------------------------
window.addEventListener('DOMContentLoaded', function(){
  if(location.hash && location.hash.startsWith('#portal=')){
    checkPortalHash();
  }
}, false);


// ================================================================
// BLOCK 6 — نظام QR الثابت لكل موكل — v3.3
// Extracted from: index.html, third <script> block (~line 1700)
// This block contains the FINAL active versions of:
//   genClientQR(), showClientPortal(), copyPortalLink()
// ================================================================

var _portalClientIdx  = null;   // index الموكل الحالي في portal modal
var _portalCurrentUrl = '';     // الرابط الحالي

// ----------------------------------------------------------------
// توليد token فريد لموكل
// ----------------------------------------------------------------
function generateToken(clientName, clientPhone) {
  var base = 'law_' + Math.random().toString(36).slice(2,10) +
             Math.random().toString(36).slice(2,6);
  return base;
}

// ----------------------------------------------------------------
// genClientQR — الدالة الرئيسية
// ----------------------------------------------------------------
function genClientQR(i) {
  if (!API_URL) {
    toast('يجب ربط Apps Script أولاً من الإعدادات لاستخدام QR الثابت', 'error');
    return;
  }
  var cl = data.clients[i];
  if (!cl) { toast('الموكل غير موجود', 'error'); return; }

  _portalClientIdx = i;

  // تحقق من وجود token أو أنشئ جديداً
  if (!cl['portal_token']) {
    cl['portal_token'] = generateToken(cl['الاسم'] || '', cl['الهاتف'] || '');
    data.clients[i] = cl;
    saveLocal();
    // مزامنة مع Sheets
    syncToSheets('الموكلين', cl, i);
    toast('تم إنشاء رمز QR ثابت للموكل', 'success');
  }

  displayPortalModal(i, cl);
}

// ----------------------------------------------------------------
// عرض نافذة QR
// ----------------------------------------------------------------
function displayPortalModal(i, cl) {
  var token   = cl['portal_token'] || '';
  var name    = cl['الاسم'] || 'الموكل';
  var portalUrl = API_URL + '?action=portal&token=' + encodeURIComponent(token);

  _portalCurrentUrl = portalUrl;

  // عنوان النافذة
  document.getElementById('portalClientLabel').textContent = 'بوابة الموكل: ' + name;
  document.getElementById('portalLinkDiv').textContent = 'رابط QR ثابت خاص بـ: ' + name;

  // QR code عبر api.qrserver.com
  var qrDiv = document.getElementById('qrCodeDiv');
  var qrDiv = document.getElementById('qrCodeDiv');
  var qrSize = Math.min(window.innerWidth - 80, 200);
  qrDiv.innerHTML = '<div style="background:#fff;padding:10px;border-radius:12px;border:3px solid #C9A84C;display:inline-block;">' +
    '<img src="https://api.qrserver.com/v1/create-qr-code/?size='+qrSize+'x'+qrSize+'&ecc=M&data=' +
    encodeURIComponent(portalUrl) +
    '" width="'+qrSize+'" height="'+qrSize+'" alt="QR Code" style="display:block;max-width:100%;height:auto;" ' +
    'onerror="this.parentNode.innerHTML=\'<div style=&quot;width:160px;height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;&quot;><div style=&quot;font-size:30px;&quot;>&#128275;</div><small style=&quot;color:#888;font-size:11px;text-align:center;&quot;>تحقق من اتصال الإنترنت</small></div>\'">'+
    '</div>' +
    '<p style="font-size:11px;color:#8A9BB0;margin-top:8px;">امسح بكاميرا الجوال مباشرة</p>';

  document.getElementById('modalPortal').classList.add('open');
}

// ----------------------------------------------------------------
// نسخ الرابط
// ----------------------------------------------------------------
function copyPortalLink() {
  if (!_portalCurrentUrl) { toast('لا يوجد رابط بعد', 'error'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(_portalCurrentUrl).then(function() {
      toast('تم نسخ رابط بوابة الموكل — ابعثه عبر واتساب', 'success');
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = _portalCurrentUrl;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('تم نسخ الرابط', 'success');
  }
}

// ----------------------------------------------------------------
// فتح البوابة مباشرة
// ----------------------------------------------------------------
function openPortalDirect() {
  if (_portalCurrentUrl) window.open(_portalCurrentUrl, '_blank');
}

// ----------------------------------------------------------------
// إلغاء QR القديم وإنشاء جديد
// ----------------------------------------------------------------
function revokeAndRegenQR() {
  if (_portalClientIdx === null) return;
  if (!confirm('هل تريد إلغاء رمز QR الحالي وإنشاء جديد؟\nالرمز القديم لن يعمل بعد الآن.')) return;

  var cl = data.clients[_portalClientIdx];
  if (!cl) return;

  // توليد token جديد
  cl['portal_token'] = generateToken(cl['الاسم'] || '', cl['الهاتف'] || '');
  data.clients[_portalClientIdx] = cl;
  saveLocal();
  syncToSheets('الموكلين', cl, _portalClientIdx);

  toast('تم إنشاء رمز QR جديد — الرمز القديم ألغي', 'success');

  // تحديث العرض
  displayPortalModal(_portalClientIdx, cl);
}

// ----------------------------------------------------------------
// تحديث showClientPortal لاستخدام النظام الجديد
// ----------------------------------------------------------------
function showClientPortal() {
  // هذا يُستدعى من نافذة عرض القضية
  var c = window._currentViewCase;
  if (!c) { toast('افتح قضية أولاً', 'error'); return; }

  var clientName = c['اسم_الموكل'] || '';
  // البحث عن الموكل
  var ci = data.clients.findIndex(function(x) {
    return (x['الاسم'] || '').trim() === clientName.trim();
  });

  if (ci < 0) {
    toast('لم يُضَف هذا الموكل في قسم الموكلين بعد', 'info');
    return;
  }

  genClientQR(ci);
}

// ----------------------------------------------------------------
// إصلاح موبايل: safe area للـ modals
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  // تأكد أن جميع modals تراعي safe area على iOS
  document.querySelectorAll('.modal-overlay').forEach(function(el) {
    el.style.paddingTop = 'max(14px, env(safe-area-inset-top))';
  });
});
