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

/* =========================
   APPLY FORM
========================= */

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
  const type = $("applicationType") ? $("applicationType").value : "";

  if ($("kerajaanSection")) {
    $("kerajaanSection").style.display = type === "Kerajaan" ? "block" : "none";
  }

  if ($("swastaSection")) {
    $("swastaSection").style.display = type === "Swasta" ? "block" : "none";
  }
}

function toggleSpouseSalary() {
  if (!$("spouseWorking")) return;

  toggleInput(
    "spouseNetSalary",
    $("spouseWorking").value === "Ya",
    "Contoh: RM2500"
  );
}

function toggleProfessionalCert() {
  if (!$("professionalCert")) return;

  toggleInput(
    "professionalCertName",
    $("professionalCert").value === "Ya",
    "BEM / MBOT / ACCA / MIA"
  );
}

function toggleAkpk() {
  if (!$("akpk")) return;

  toggleInput(
    "akpkPeriod",
    $("akpk").value === "Ya",
    "Contoh: 1 tahun"
  );
}

function toggleCtos() {
  if (!$("ctosOption") || !$("ctosConsentBox")) return;

  $("ctosConsentBox").style.display =
    $("ctosOption").value === "Chika Bantu Semakan" ? "block" : "none";
}

function initApplyPage() {
  if (!$("applyForm")) return;

  const agent = getParam("agent") || "AG001";
  const type = getParam("type") || "";

  if ($("agentDisplay")) {
    $("agentDisplay").value = agent + " - Chika Jom Consult";
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
      type: $("applicationType") ? $("applicationType").value : "",
      customerName: $("customerName") ? $("customerName").value.trim() : "",
      ic: $("ic") ? $("ic").value.trim() : "",
      phone: $("phone") ? $("phone").value.trim() : "",
      email: $("email") ? $("email").value.trim() : "",
      employerName: $("employerName") ? $("employerName").value.trim() : "",
      employerAddress: $("employerAddress") ? $("employerAddress").value.trim() : "",
      position: $("position") ? $("position").value.trim() : "",
      employmentStatus: $("employmentStatus") ? $("employmentStatus").value : "",
      startWorkDate: $("startWorkDate") ? $("startWorkDate").value : "",
      workingPeriod: $("workingPeriod") ? $("workingPeriod").value.trim() : "",
      hrAllowSalaryTransfer: $("hrAllowSalaryTransfer") ? $("hrAllowSalaryTransfer").value : "",
      homePostcode: $("homePostcode") ? $("homePostcode").value.trim() : "",
      spouseWorking: $("spouseWorking") ? $("spouseWorking").value : "",
      spouseNetSalary: $("spouseNetSalary") ? $("spouseNetSalary").value.trim() : "",
      previousEmployerName: $("previousEmployerName") ? $("previousEmployerName").value.trim() : "",
      previousEmployerPosition: $("previousEmployerPosition") ? $("previousEmployerPosition").value.trim() : "",
      previousEmployerPeriod: $("previousEmployerPeriod") ? $("previousEmployerPeriod").value.trim() : "",
      professionalCert: $("professionalCert") ? $("professionalCert").value : "",
      professionalCertName: $("professionalCertName") ? $("professionalCertName").value.trim() : "",
      akpk: $("akpk") ? $("akpk").value : "",
      akpkPeriod: $("akpkPeriod") ? $("akpkPeriod").value.trim() : "",
      ctosOption: $("ctosOption") ? $("ctosOption").value : "",
      ctosConsent: $("ctosOption") && $("ctosOption").value === "Chika Bantu Semakan" ? "YES" : "NO",
      files: files
    };

    if (!payload.customerName || !payload.ic || !payload.phone || !payload.type) {
      throw new Error("Sila lengkapkan Nama, IC, No Telefon dan Jenis Permohonan.");
    }

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

    if (getParam("type") && $("applicationType")) {
      $("applicationType").value = getParam("type");
    }

    toggleApplicationType();
    toggleSpouseSalary();
    toggleProfessionalCert();
    toggleAkpk();
    toggleCtos();

  } catch (err) {
    console.error(err);
    alert(err.message || "Ralat semasa submit.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="arrow">➜</span> SUBMIT APPLICATION';
  }
}

/* =========================
   ADMIN DASHBOARD REAL DATA
========================= */

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
        agentPhone: row.AgentPhone || "",
        agentId: row.AgentID || "",
        type: row.Type || "",
        status: row.Status || "New Submission",
        folder: row.FolderLink || "#"
      };
    });

    renderApplications(window.liveApplications);
    updateDashboardCards(window.liveApplications);

  } catch (err) {
    console.error("Failed loading applications:", err);
    renderApplications([]);
  }

  ["searchInput", "statusFilter", "typeFilter", "agentFilter"].forEach(function(id) {
    if ($(id)) {
      $(id).addEventListener("input", filterApplications);
    }
  });
}

function filterApplications() {
  const source = window.liveApplications || [];

  const q = $("searchInput") ? $("searchInput").value.toLowerCase() : "";
  const status = $("statusFilter") ? $("statusFilter").value : "";
  const type = $("typeFilter") ? $("typeFilter").value : "";
  const agent = $("agentFilter") ? $("agentFilter").value : "";

  const filtered = source.filter(function(app) {
    const text = (
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

  const list = applications.slice().reverse();

  list.forEach(function(app) {
    const row =
      '<tr>' +
      '<td>' + (app.orderId || "-") + '</td>' +
      '<td><strong>' + (app.name || "-") + '</strong></td>' +
      '<td>' + (app.ic || "-") + '</td>' +
      '<td>' + (app.phone || "-") + '</td>' +
      '<td>' + (app.agent || "-") + '</td>' +
      '<td>' + (app.type || "-") + '</td>' +
      '<td>' + statusBadge(app.status || "New Submission") + '</td>' +
      '<td>' +
      (
        app.folder && app.folder !== "#"
          ? '<a href="' + app.folder + '" target="_blank">📁 Folder</a>'
          : "-"
      ) +
      '</td>' +
      '<td>' +
      '<button class="btn btn-small btn-black" onclick="openStatusModalById(\'' + app.orderId + '\')">Update</button>' +
      '</td>' +
      '</tr>';

    tbody.innerHTML += row;
  });
}

function updateDashboardCards(applications) {
  const total = applications.length;
  const newSub = applications.filter(function(x) { return x.status === "New Submission"; }).length;
  const review = applications.filter(function(x) { return x.status === "In Review"; }).length;
  const approved = applications.filter(function(x) {
    return x.status === "Approved" || x.status === "Layak";
  }).length;
  const rejected = applications.filter(function(x) {
    return x.status === "Rejected" || x.status === "Tak Layak";
  }).length;

  const metrics = document.querySelectorAll(".metric b");

  if (metrics.length >= 5) {
    metrics[0].textContent = total;
    metrics[1].textContent = newSub;
    metrics[2].textContent = review;
    metrics[3].textContent = approved;
    metrics[4].textContent = rejected;
  }
}

/* =========================
   STATUS MODAL + WHATSAPP
========================= */

function openStatusModalById(orderId) {
  const apps = window.liveApplications || [];
  const app = apps.find(function(x) {
    return x.orderId === orderId;
  });

  if (app) {
    openStatusModal(app);
  }
}

function openStatusModal(app) {
  if (!$("statusModal")) return;

  if ($("selectedCustomerName")) $("selectedCustomerName").textContent = app.name || "";
  if ($("modalOrderId")) $("modalOrderId").value = app.orderId || "";
  if ($("modalAgentName")) $("modalAgentName").value = app.agent || "";
  if ($("modalAgentPhone")) $("modalAgentPhone").value = app.agentPhone || "";

  $("statusModal").classList.add("show");

  previewWhatsapp();
}

function closeStatusModal() {
  if ($("statusModal")) {
    $("statusModal").classList.remove("show");
  }
}

function formatMoney(value) {
  if (!value) return "";
  return String(value)
    .replace(/[^\d]/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildWhatsappMessage() {
  const customer = $("selectedCustomerName") ? $("selectedCustomerName").textContent : "";
  const agent = $("modalAgentName") ? $("modalAgentName").value : "";
  const status = $("statusSelect") ? $("statusSelect").value : "";
  const remark = $("remarkText") ? $("remarkText").value.trim() : "";

  if (status === "Layak") {
    const loan = $("loanAmount") ? formatMoney($("loanAmount").value) : "";
    const monthly = $("monthlyPayment") ? formatMoney($("monthlyPayment").value) : "";
    const tenure = $("tenure") ? $("tenure").value.trim() : "";
    const deduction = $("deduction") ? formatMoney($("deduction").value) : "";
    const cash = $("cashInHand") ? formatMoney($("cashInHand").value) : "";
    const agency = $("agencyFee") ? formatMoney($("agencyFee").value) : "";
    const sst = $("sst") ? formatMoney($("sst").value) : "";
    const net = $("netCash") ? formatMoney($("netCash").value) : "";

    return "CLIENT : " + customer + "\n" +
      "AGENT : " + agent + "\n\n" +
      "Layak ✅\n\n" +
      "Loan RM" + loan + "\n" +
      "Bulanan RM" + monthly + "\n" +
      "Tempoh " + tenure + "\n\n" +
      "Deduction RM" + deduction + "\n\n" +
      "Cash in hand RM" + cash + "\n\n" +
      "Agency fee RM" + agency + "\n" +
      "SST RM" + sst + "\n\n" +
      "Net cash in hand RM" + net;
  }

  const statusMap = {
    "Tak Layak": "❌ Tak Layak",
    "Pending Checking": "❗ Pending checking",
    "Pending Document": "⚠️ Pending document",
    "In Review": "🔎 In Review",
    "Approved": "✅ Approved",
    "Rejected": "❌ Rejected",
    "New Submission": "🆕 New Submission"
  };

  let bulletRemark = "";

  if (remark) {
    bulletRemark = remark
      .split("\n")
      .filter(Boolean)
      .map(function(x) {
        return "• " + x.replace(/^•\s*/, "");
      })
      .join("\n");
  }

  return "CLIENT : " + customer + "\n" +
    "AGENT : " + agent + "\n\n" +
    "REMARK :\n" +
    bulletRemark + "\n\n" +
    "STATUS :\n" +
    (statusMap[status] || status);
}

function previewWhatsapp() {
  if ($("messagePreview")) {
    $("messagePreview").textContent = buildWhatsappMessage();
  }
}

function copyWhatsapp() {
  const msg = buildWhatsappMessage();

  navigator.clipboard.writeText(msg).then(function() {
    alert("Message copied.");
  });
}

function openWhatsapp() {
  const phone = $("modalAgentPhone") ? $("modalAgentPhone").value.replace(/[^\d]/g, "") : "";
  const msg = encodeURIComponent(buildWhatsappMessage());

  if (!phone) {
    alert("Nombor agent tiada.");
    return;
  }

  window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
}

/* =========================
   AGENT MANAGEMENT
========================= */

const dummyAgents = [
  { id: "AG001", name: "Fitri", phone: "60123456789", tag: "@amad", status: "Active" },
  { id: "AG002", name: "Hidayah", phone: "601162111013", tag: "@~1annzz", status: "Active" },
  { id: "AG003", name: "Lea", phone: "601162111013", tag: "@+60 11-6211 1013", status: "Active" }
];

function makeApplyLink(agentId, type) {
  return CONFIG.FRONTEND_BASE_URL +
    "/apply.html?agent=" +
    encodeURIComponent(agentId) +
    "&type=" +
    encodeURIComponent(type);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(function() {
    alert("Copied.");
  });
}

function renderAgents(list) {
  const tbody = $("agentsTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  list.forEach(function(a) {
    const kerajaan = makeApplyLink(a.id, "Kerajaan");
    const swasta = makeApplyLink(a.id, "Swasta");

    const row =
      '<tr>' +
      '<td><strong>' + a.id + '</strong></td>' +
      '<td>' + a.name + '</td>' +
      '<td>' + a.phone + '</td>' +
      '<td>' + (a.tag || "") + '</td>' +
      '<td>' + a.status + '</td>' +
      '<td><button class="btn btn-small btn-yellow" onclick="copyText(\'' + kerajaan + '\')">Salin Link</button></td>' +
      '<td><button class="btn btn-small btn-pink" onclick="copyText(\'' + swasta + '\')">Salin Link</button></td>' +
      '<td><button class="btn btn-small btn-light">Edit</button></td>' +
      '</tr>';

    tbody.innerHTML += row;
  });
}

function loadAgentsFromSheet() {

  return new Promise(function(resolve, reject) {

    const callbackName = "cb_agents_" + Date.now();

    window[callbackName] = function(data) {

      resolve(data || []);

      delete window[callbackName];

      script.remove();

    };

    const script = document.createElement("script");

    script.src =
      CONFIG.APPS_SCRIPT_URL +
      "?action=getAgents&callback=" +
      callbackName;

    script.onerror = reject;

    document.body.appendChild(script);

  });

}

function addAgentToSheet(agent) {

  return new Promise(function(resolve, reject) {

    const callbackName = "cb_add_agent_" + Date.now();

    window[callbackName] = function(data) {

      resolve(data);

      delete window[callbackName];

      script.remove();

    };

    const script = document.createElement("script");

    script.src =
      CONFIG.APPS_SCRIPT_URL +
      "?action=addAgent" +
      "&agentId=" + encodeURIComponent(agent.id) +
      "&agentName=" + encodeURIComponent(agent.name) +
      "&phone=" + encodeURIComponent(agent.phone) +
      "&status=" + encodeURIComponent(agent.status) +
      "&callback=" + callbackName;

    script.onerror = reject;

    document.body.appendChild(script);

  });

}

async function renderAgentsReal() {

  const agents = await loadAgentsFromSheet();

  const tbody = $("agentsTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  agents.forEach(function(a) {

    tbody.innerHTML += `
      <tr>
        <td><strong>${a.AgentID}</strong></td>
        <td>${a.AgentName}</td>
        <td>${a.Phone}</td>
        <td>${a.Status}</td>

        <td>
          <button class="btn btn-small btn-yellow"
            onclick="copyText('${a.KerajaanLink}')">
            Kerajaan
          </button>
        </td>

        <td>
          <button class="btn btn-small btn-pink"
            onclick="copyText('${a.SwastaLink}')">
            Swasta
          </button>
        </td>

      </tr>
    `;

  });

}

function initAgentsPage() {

  if (!$("agentsTableBody")) return;

  renderAgentsReal();

  if ($("agentForm")) {

    $("agentForm").addEventListener("submit", async function(e) {

      e.preventDefault();

      const agent = {

        id: $("agentId").value.trim(),

        name: $("agentName").value.trim(),

        phone: $("agentPhone").value.trim(),

        status: $("agentStatus").value

      };

      const result = await addAgentToSheet(agent);

      if (result.success) {

        alert("Agent berjaya ditambah.");

        $("agentForm").reset();

        renderAgentsReal();

      } else {

        alert("Gagal tambah agent.");

      }

    });

  }

}

    const script = document.createElement("script");

    script.src =
      CONFIG.APPS_SCRIPT_URL +
      "?action=updateStatus" +
      "&orderId=" + encodeURIComponent(orderId) +
      "&status=" + encodeURIComponent(status) +
      "&remark=" + encodeURIComponent(remark) +
      "&callback=" + callbackName;

    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function saveStatusUpdate() {
  const orderId = $("modalOrderId").value;
  const status = $("statusSelect").value;
  const remark = $("remarkText").value.trim();

  const result = await updateStatusToSheet(orderId, status, remark);

  if (result.success) {
    alert("Status berjaya dikemaskini.");
    closeStatusModal();
    await initAdminPage();
  } else {
    alert("Gagal update status.");
  }
}
/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", function() {
  initApplyPage();
  initAdminPage();
  initAgentsPage();
});
