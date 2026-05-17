const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwlvRLS6XKBBLObcEcofuk7UvoPLj470nofWJ2ZdrEvCzmNU57S-EXE7J7zKTYQviL8MA/exec",
  FRONTEND_BASE_URL: "https://chika-jom-frontend.pages.dev/"
};
const LOGO_URL = "https://lh3.googleusercontent.com/d/1hftGSs3xj2bwCRFUTE6UmQMhX3uIrYqe";

const dummyApplications = [
  {
    orderId:"CJ2505001",
    name:"Siti Nor Syafinaz bint Md Jalil",
    ic:"900101-01-1234",
    phone:"012-345 6789",
    agent:"HIDAYAH @~1annzz",
    agentPhone:"601162111013",
    agentId:"AG002",
    type:"Kerajaan",
    status:"New Submission",
    folder:"#"
  },
  {
    orderId:"CJ2505002",
    name:"Muhd Nur Syazwan",
    ic:"880202-02-2345",
    phone:"013-456 7800",
    agent:"HIDAYAH @~1annzz",
    agentPhone:"601162111013",
    agentId:"AG002",
    type:"Kerajaan",
    status:"Rejected",
    folder:"#"
  },
  {
    orderId:"CJ2505003",
    name:"Azuhairi",
    ic:"920303-03-3456",
    phone:"014-567 8901",
    agent:"Fitri @amad",
    agentPhone:"60123456789",
    agentId:"AG001",
    type:"Swasta",
    status:"Approved",
    folder:"#"
  },
  {
    orderId:"CJ2505004",
    name:"Aishah Binti Shamsuri",
    ic:"910404-04-4567",
    phone:"015-678 9012",
    agent:"LEA @+60 11-6211 1013",
    agentPhone:"601162111013",
    agentId:"AG003",
    type:"Kerajaan",
    status:"Pending Document",
    folder:"#"
  }
];

const dummyAgents = [
  {id:"AG001", name:"Fitri", phone:"60123456789", tag:"@amad", status:"Active"},
  {id:"AG002", name:"Hidayah", phone:"601162111013", tag:"@~1annzz", status:"Active"},
  {id:"AG003", name:"Lea", phone:"601162111013", tag:"@+60 11-6211 1013", status:"Active"}
];

function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function $(id){
  return document.getElementById(id);
}

function statusBadge(status){
  const map = {
    "New Submission":"status-new",
    "In Review":"status-review",
    "Pending Checking":"status-pending",
    "Pending Document":"status-pending",
    "Approved":"status-approved",
    "Layak":"status-approved",
    "Rejected":"status-rejected",
    "Tak Layak":"status-rejected"
  };
  return `<span class="badge ${map[status] || "status-new"}">${status}</span>`;
}

function initApplyPage(){
  if(!$("applyForm")) return;

  const agent = getParam("agent") || "AG001";
  const type = getParam("type") || "";

  $("agentDisplay").value = `${agent} - Chika Jom Consult`;
  if(type) $("applicationType").value = type;

  $("applicationType").addEventListener("change", toggleApplicationType);
  $("spouseWorking").addEventListener("change", toggleSpouseSalary);
  $("professionalCert").addEventListener("change", toggleProfessionalCert);
  $("akpk").addEventListener("change", toggleAkpk);
  $("ctosOption").addEventListener("change", toggleCtos);

  toggleApplicationType();
  toggleSpouseSalary();
  toggleProfessionalCert();
  toggleAkpk();
  toggleCtos();

  $("applyForm").addEventListener("submit", handleApplySubmit);
}

function toggleApplicationType(){
  const type = $("applicationType").value;
  $("kerajaanSection").style.display = type === "Kerajaan" ? "block" : "none";
  $("swastaSection").style.display = type === "Swasta" ? "block" : "none";
}

function toggleInput(inputId, enabled, placeholder){
  const el = $(inputId);
  if(!el) return;
  if(enabled){
    el.disabled = false;
    el.removeAttribute("disabled");
    el.placeholder = placeholder || "";
  }else{
    el.value = "";
    el.disabled = true;
    el.setAttribute("disabled","disabled");
    el.placeholder = "Tidak perlu isi";
  }
}

function toggleSpouseSalary(){
  toggleInput("spouseNetSalary", $("spouseWorking").value === "Ya", "Contoh: RM2500");
}

function toggleProfessionalCert(){
  toggleInput("professionalCertName", $("professionalCert").value === "Ya", "BEM / MBOT / ACCA / MIA / CFA / dll");
}

function toggleAkpk(){
  toggleInput("akpkPeriod", $("akpk").value === "Ya", "Contoh: 1 tahun");
}

function toggleCtos(){
  $("ctosConsentBox").style.display = $("ctosOption").value === "Chika Bantu Semakan" ? "block" : "none";
}

function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function collectFile(inputId, label, files){
  const input = $(inputId);
  if(!input || !input.files || !input.files[0]) return;
  const file = input.files[0];

  if(file.size > 5 * 1024 * 1024){
    throw new Error(`${label} melebihi 5MB.`);
  }

  const base64 = await fileToBase64(file);
  files.push({
    name: `${label} - ${file.name}`,
    mimeType: file.type,
    data: base64.split(",")[1]
  });
}

async function handleApplySubmit(e){
  e.preventDefault();

  const submitBtn = $("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = "UPLOADING... PLEASE WAIT";

  try{
    const files = [];
    await collectFile("fileIC", "IC Document", files);
    await collectFile("filePayslip", "Payslip", files);
    await collectFile("fileCTOS", "CTOS CCRIS", files);
    await collectFile("fileOther", "Other Supporting Documents", files);

    const payload = {
      agentId: getParam("agent") || "",
      type: $("applicationType").value,
      customerName: $("customerName").value.trim(),
      ic: $("ic").value.trim(),
      phone: $("phone").value.trim(),
      email: $("email").value.trim(),
      employerName: $("employerName").value.trim(),
      employerAddress: $("employerAddress").value.trim(),
      position: $("position").value.trim(),
      employmentStatus: $("employmentStatus").value,
      startWorkDate: $("startWorkDate").value,
      workingPeriod: $("workingPeriod").value.trim(),
      hrAllowSalaryTransfer: $("hrAllowSalaryTransfer").value,
      homePostcode: $("homePostcode").value.trim(),
      spouseWorking: $("spouseWorking").value,
      spouseNetSalary: $("spouseNetSalary").value.trim(),
      previousEmployerName: $("previousEmployerName").value.trim(),
      previousEmployerPosition: $("previousEmployerPosition").value.trim(),
      previousEmployerPeriod: $("previousEmployerPeriod").value.trim(),
      professionalCert: $("professionalCert").value,
      professionalCertName: $("professionalCertName").value.trim(),
      akpk: $("akpk").value,
      akpkPeriod: $("akpkPeriod").value.trim(),
      ctosOption: $("ctosOption").value,
      ctosConsent: $("ctosOption").value === "Chika Bantu Semakan" ? "YES" : "NO",
      files
    };

    if(!payload.customerName || !payload.ic || !payload.phone || !payload.type){
      throw new Error("Sila lengkapkan Nama, IC, No Telefon dan Jenis Permohonan.");
    }

    /*
      BACKEND INTEGRATION:
      Replace this demo timeout with real Apps Script fetch.
      fetch(CONFIG.APPS_SCRIPT_URL, {
        method:"POST",
        body: JSON.stringify(payload)
      })
    */

    await fetch(CONFIG.APPS_SCRIPT_URL, {
  method: "POST",
  mode: "no-cors",
  headers: {
    "Content-Type": "text/plain"
  },
  body: JSON.stringify(payload)
});

alert("Permohonan berjaya dihantar. Admin akan membuat semakan.");

    if(getParam("type")) $("applicationType").value = getParam("type");
    toggleApplicationType();
    toggleSpouseSalary();
    toggleProfessionalCert();
    toggleAkpk();
    toggleCtos();
  }catch(err){
    alert(err.message || "Ralat semasa menghantar permohonan.");
  }finally{
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span class="arrow">➜</span> SUBMIT APPLICATION`;
  }
}

function loadApplicationsFromSheet() {
  return new Promise((resolve, reject) => {
    const callbackName = "handleApplications_" + Date.now();

    window[callbackName] = function(data) {
      resolve(data);
      delete window[callbackName];
      script.remove();
    };

    const script = document.createElement("script");
    script.src = CONFIG.APPS_SCRIPT_URL + "?action=getApplications&callback=" + callbackName;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
function initAdminPage(){
 async function initAdminPage(){
  if(!$("applicationTableBody")) return;

  try {
    const sheetData = await loadApplicationsFromSheet();

    const applications = sheetData.map(row => ({
      orderId: row.OrderID || "",
      name: row.CustomerName || "",
      ic: row.IC || "",
      phone: row.Phone || "",
      agent: row.AgentName || "",
      agentPhone: "",
      agentId: row.AgentID || "",
      type: row.Type || "",
      status: row.Status || "New Submission",
      folder: row.FolderLink || "#"
    }));

    window.liveApplications = applications;
    renderApplications(applications);
  } catch (err) {
    console.error(err);
    renderApplications(dummyApplications);
  }

  ["searchInput","statusFilter","typeFilter","agentFilter"].forEach(id=>{
    if($(id)) $(id).addEventListener("input", filterApplications);
  });
}

function filterApplications(){
  const q = $("searchInput").value.toLowerCase();
  const status = $("statusFilter").value;
  const type = $("typeFilter").value;
  const agent = $("agentFilter").value;

 const source = window.liveApplications || dummyApplications;
const filtered = source.filter(app=>{
    const text = `${app.orderId} ${app.name} ${app.ic} ${app.phone}`.toLowerCase();
    return (!q || text.includes(q)) &&
      (!status || app.status === status) &&
      (!type || app.type === type) &&
      (!agent || app.agentId === agent);
  });

  renderApplications(filtered);
}

function renderApplications(applications){

  const tbody = $("applicationTableBody");

  if(!tbody) return;

  tbody.innerHTML = "";

  if(!applications || applications.length === 0){

    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;padding:30px;">
          Tiada data permohonan
        </td>
      </tr>
    `;

    return;
  }

  applications.reverse().forEach(app=>{

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${app.orderId || '-'}</td>
      <td>${app.name || '-'}</td>
      <td>${app.ic || '-'}</td>
      <td>${app.phone || '-'}</td>
      <td>${app.agent || '-'}</td>
      <td>${app.type || '-'}</td>
      <td>
        <span class="status-badge">
          ${app.status || 'New Submission'}
        </span>
      </td>
      <td>
        ${
          app.folder
          ? `<a href="${app.folder}" target="_blank">📁 Folder</a>`
          : '-'
        }
      </td>
      <td>
        <button onclick="openWhatsAppModal('${app.orderId}')">
          WhatsApp
        </button>
      </td>
    `;

    tbody.appendChild(tr);

  });

}

function openStatusModal(app){
  $("selectedCustomerName").textContent = app.name;
  $("modalOrderId").value = app.orderId;
  $("modalAgentName").value = app.agent;
  $("modalAgentPhone").value = app.agentPhone;
  $("statusModal").classList.add("show");
}

function closeStatusModal(){
  $("statusModal").classList.remove("show");
}

function formatMoney(value){
  if(!value) return "";
  return String(value).replace(/[^\d]/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",");
}

function buildWhatsappMessage(){
  const customer = $("selectedCustomerName").textContent;
  const agent = $("modalAgentName").value;
  const status = $("statusSelect").value;
  const remark = $("remarkText").value.trim();

  if(status === "Layak"){
    const loan = formatMoney($("loanAmount").value);
    const monthly = formatMoney($("monthlyPayment").value);
    const tenure = $("tenure").value.trim();
    const deduction = formatMoney($("deduction").value);
    const cash = formatMoney($("cashInHand").value);
    const agency = formatMoney($("agencyFee").value);
    const sst = formatMoney($("sst").value);
    const net = formatMoney($("netCash").value);

    return `CLIENT : ${customer}
AGENT : ${agent}

Layak ✅

Loan RM${loan}
Bulanan RM${monthly}
Tempoh ${tenure}

Deduction RM${deduction}

Cash in hand RM${cash}

Agency fee RM${agency}
SST RM${sst}

Net cash in hand RM${net}`;
  }

  const statusMap = {
    "Tak Layak":"❌ Tak Layak",
    "Pending Checking":"❗ Pending checking",
    "Pending Document":"⚠️ Pending document",
    "In Review":"🔎 In Review",
    "Approved":"✅ Approved",
    "Rejected":"❌ Rejected",
    "New Submission":"🆕 New Submission"
  };

  const bulletRemark = remark
    ? remark.split("\n").filter(Boolean).map(x=>`• ${x.replace(/^•\s*/,"")}`).join("\n")
    : "";

  return `CLIENT : ${customer}
AGENT : ${agent}

REMARK :
${bulletRemark}

STATUS :
${statusMap[status] || status}`;
}

function previewWhatsapp(){
  $("messagePreview").textContent = buildWhatsappMessage();
}

function copyWhatsapp(){
  const msg = buildWhatsappMessage();
  navigator.clipboard.writeText(msg);
  alert("Message copied.");
}

function openWhatsapp(){
  const phone = $("modalAgentPhone").value.replace(/[^\d]/g,"");
  const msg = encodeURIComponent(buildWhatsappMessage());
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
}

function openWhatsappModal(app){
  openStatusModal(app);
  setTimeout(previewWhatsapp, 0);
}

function initAgentsPage(){
  if(!$("agentsTableBody")) return;
  renderAgents(dummyAgents);

  $("agentForm").addEventListener("submit", e=>{
    e.preventDefault();
    const agent = {
      id:$("agentId").value.trim(),
      name:$("agentName").value.trim(),
      phone:$("agentPhone").value.trim(),
      tag:$("agentTag").value.trim(),
      status:$("agentStatus").value
    };
    dummyAgents.push(agent);
    renderAgents(dummyAgents);
    e.target.reset();
  });
}

function makeApplyLink(agentId,type){
  return `${CONFIG.FRONTEND_BASE_URL}/apply.html?agent=${encodeURIComponent(agentId)}&type=${encodeURIComponent(type)}`;
}

function copyText(text){
  navigator.clipboard.writeText(text);
  alert("Copied.");
}

function renderAgents(list){
  const tbody = $("agentsTableBody");
  tbody.innerHTML = list.map(a=>{
    const kerajaan = makeApplyLink(a.id, "Kerajaan");
    const swasta = makeApplyLink(a.id, "Swasta");
    return `
      <tr>
        <td><strong>${a.id}</strong></td>
        <td>${a.name}</td>
        <td>${a.phone}</td>
        <td>${a.tag || ""}</td>
        <td>${statusBadge(a.status === "Active" ? "Approved" : "Rejected")}</td>
        <td><button class="btn btn-small btn-yellow" onclick="copyText('${kerajaan}')">Salin Link</button></td>
        <td><button class="btn btn-small btn-pink" onclick="copyText('${swasta}')">Salin Link</button></td>
        <td><button class="btn btn-small btn-light">Edit</button></td>
      </tr>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", ()=>{
  initApplyPage();
  initAdminPage();
  initAgentsPage();
});
