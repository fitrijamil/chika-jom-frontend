```javascript
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwlvRLS6XKBBLObcEcofuk7UvoPLj470nofWJ2ZdrEvCzmNU57S-EXE7J7zKTYQviL8MA/exec",
  FRONTEND_BASE_URL: "https://chika-jom-frontend.pages.dev"
};

function $(id) {
  return document.getElementById(id);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function statusBadge(status) {

  const map = {
    "New Submission": "status-new",
    "In Review": "status-review",
    "Pending Checking": "status-pending",
    "Pending Document": "status-pending",
    "Approved": "status-approved",
    "Layak": "status-approved",
    "Rejected": "status-rejected",
    "Tak Layak": "status-rejected"
  };

  const cssClass = map[status] || "status-new";

  return '<span class="badge ' + cssClass + '">' + status + '</span>';
}

function fileToBase64(file) {

  return new Promise(function(resolve, reject) {

    const reader = new FileReader();

    reader.onload = function() {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}

async function collectFile(inputId, label, files) {

  const input = $(inputId);

  if (!input || !input.files || !input.files[0]) return;

  const file = input.files[0];

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(label + " melebihi 5MB.");
  }

  const base64 = await fileToBase64(file);

  files.push({
    name: label + " - " + file.name,
    mimeType: file.type,
    data: base64.split(",")[1]
  });

}

function toggleInput(inputId, enabled, placeholder) {

  const el = $(inputId);

  if (!el) return;

  if (enabled) {

    el.disabled = false;
    el.removeAttribute("disabled");
    el.placeholder = placeholder || "";

  } else {

    el.value = "";
    el.disabled = true;
    el.setAttribute("disabled", "disabled");
    el.placeholder = "Tidak perlu isi";

  }

}

function toggleApplicationType() {

  const type = $("applicationType").value;

  if ($("kerajaanSection")) {
    $("kerajaanSection").style.display =
      type === "Kerajaan" ? "block" : "none";
  }

  if ($("swastaSection")) {
    $("swastaSection").style.display =
      type === "Swasta" ? "block" : "none";
  }

}

function toggleSpouseSalary() {

  toggleInput(
    "spouseNetSalary",
    $("spouseWorking").value === "Ya",
    "Contoh: RM2500"
  );

}

function toggleProfessionalCert() {

  toggleInput(
    "professionalCertName",
    $("professionalCert").value === "Ya",
    "BEM / MBOT / ACCA / MIA"
  );

}

function toggleAkpk() {

  toggleInput(
    "akpkPeriod",
    $("akpk").value === "Ya",
    "Contoh: 1 tahun"
  );

}

function toggleCtos() {

  if ($("ctosConsentBox")) {

    $("ctosConsentBox").style.display =
      $("ctosOption").value === "Chika Bantu Semakan"
        ? "block"
        : "none";

  }

}

function initApplyPage() {

  if (!$("applyForm")) return;

  const agent = getParam("agent") || "AG001";
  const type = getParam("type") || "";

  if ($("agentDisplay")) {
    $("agentDisplay").value =
      agent + " - Chika Jom Consult";
  }

  if (type && $("applicationType")) {
    $("applicationType").value = type;
  }

  if ($("applicationType")) {
    $("applicationType").addEventListener("change", toggleApplicationType);
  }

  if ($("spouseWorking")) {
    $("spouseWorking").addEventListener("change", toggleSpouseSalary);
  }

  if ($("professionalCert")) {
    $("professionalCert").addEventListener("change", toggleProfessionalCert);
  }

  if ($("akpk")) {
    $("akpk").addEventListener("change", toggleAkpk);
  }

  if ($("ctosOption")) {
    $("ctosOption").addEventListener("change", toggleCtos);
  }

  toggleApplicationType();
  toggleSpouseSalary();
  toggleProfessionalCert();
  toggleAkpk();
  toggleCtos();

  $("applyForm").addEventListener("submit", handleApplySubmit);

}

async function handleApplySubmit(e) {

  e.preventDefault();

  const submitBtn = $("submitBtn");

  submitBtn.disabled = true;
  submitBtn.innerHTML = "UPLOADING... PLEASE WAIT";

  try {

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

      ctosConsent:
        $("ctosOption").value === "Chika Bantu Semakan"
          ? "YES"
          : "NO",

      files: files

    };

    await fetch(CONFIG.APPS_SCRIPT_URL, {

      method: "POST",

      mode: "no-cors",

      headers: {
        "Content-Type": "text/plain"
      },

      body: JSON.stringify(payload)

    });

    alert("Permohonan berjaya dihantar.");

    $("applyForm").reset();

  } catch (err) {

    console.error(err);

    alert("Ralat semasa submit.");

  } finally {

    submitBtn.disabled = false;

    submitBtn.innerHTML =
      '<span class="arrow">➜</span> SUBMIT APPLICATION';

  }

}

function loadApplicationsFromSheet() {

  return new Promise(function(resolve, reject) {

    const callbackName = "cb_apps_" + Date.now();

    window[callbackName] = function(data) {

      resolve(data || []);

      delete window[callbackName];

      script.remove();

    };

    const script = document.createElement("script");

    script.src =
      CONFIG.APPS_SCRIPT_URL +
      "?action=getApplications&callback=" +
      callbackName;

    script.onerror = reject;

    document.body.appendChild(script);

  });

}

async function initAdminPage() {

  if (!$("applicationTableBody")) return;

  try {

    const sheetData = await loadApplicationsFromSheet();

    window.liveApplications = sheetData.map(function(row) {

      return {

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

      };

    });

    renderApplications(window.liveApplications);

  } catch (err) {

    console.error(err);

    renderApplications([]);

  }

  ["searchInput", "statusFilter", "typeFilter", "agentFilter"]
    .forEach(function(id) {

      if ($(id)) {
        $(id).addEventListener("input", filterApplications);
      }

    });

}

function filterApplications() {

  const source = window.liveApplications || [];

  const q =
    $("searchInput") ?
    $("searchInput").value.toLowerCase() :
    "";

  const status =
    $("statusFilter") ?
    $("statusFilter").value :
    "";

  const type =
    $("typeFilter") ?
    $("typeFilter").value :
    "";

  const agent =
    $("agentFilter") ?
    $("agentFilter").value :
    "";

  const filtered = source.filter(function(app) {

    const text =
      (
        app.orderId + " " +
        app.name + " " +
        app.ic + " " +
        app.phone
      ).toLowerCase();

    return (!q || text.includes(q)) &&
      (!status || app.status === status) &&
      (!type || app.type === type) &&
      (!agent || app.agentId === agent);

  });

  renderApplications(filtered);

}

function renderApplications(applications) {

  const tbody = $("applicationTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!applications || applications.length === 0) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="9" style="text-align:center;padding:30px;">' +
      'Tiada data permohonan' +
      '</td>' +
      '</tr>';

    return;

  }

  applications.reverse().forEach(function(app) {

    const row =
      '<tr>' +

      '<td>' + (app.orderId || "-") + '</td>' +

      '<td><strong>' +
      (app.name || "-") +
      '</strong></td>' +

      '<td>' + (app.ic || "-") + '</td>' +

      '<td>' + (app.phone || "-") + '</td>' +

      '<td>' + (app.agent || "-") + '</td>' +

      '<td>' + (app.type || "-") + '</td>' +

      '<td>' +
      statusBadge(app.status || "New Submission") +
      '</td>' +

      '<td>' +

      (
        app.folder && app.folder !== "#"
          ? '<a href="' + app.folder + '" target="_blank">📁 Folder</a>'
          : "-"
      ) +

      '</td>' +

      '<td>' +

      '<button class="btn btn-small btn-black">' +
      'Update' +
      '</button>' +

      '</td>' +

      '</tr>';

    tbody.innerHTML += row;

  });

}

function initAgentsPage() {

  if (!$("agentsTableBody")) return;

}

document.addEventListener("DOMContentLoaded", function() {

  initApplyPage();

  initAdminPage();

  initAgentsPage();

});
```
