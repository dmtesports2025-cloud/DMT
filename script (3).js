// Simple prototype logic. Uses localStorage to persist reports.

const EMERGENCY_NUMBER = "102"; // change as required (102/108 based on region)
const STORAGE_KEY = "mahakumbh_med_reports_v1";

// Preloaded sample medical centers (edit as needed)
const medicalCenters = [
    {name:"Ganga Ghat Medical Camp", phone:"+919876543210", place:"Ganga Ghat - Sector A", mapQuery:"Ganga Ghat, Haridwar"},
    {name:"Temporary Medical Tent - North", phone:"+919812345678", place:"Near Main Entrance - North", mapQuery:"Haridwar main entrance"},
    {name:"Mahakumbh Central Hospital (Helpdesk)", phone:"+919700112233", place:"Central Zone", mapQuery:"Haridwar central hospital"}
];

// Utility: load/save
function loadReports(){ 
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw? JSON.parse(raw): [];
    } catch(e){ return []; }
}
function saveReports(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

// initial render
document.addEventListener("DOMContentLoaded", ()=>{
    setupButtons();
    renderHome();
});

// setup top buttons
function setupButtons(){
    document.getElementById("callAmbBtn").addEventListener("click", ()=> {
        // open phone dialer
        window.location.href = `tel:${EMERGENCY_NUMBER}`;
    });
    document.getElementById("reportBtn").addEventListener("click", showReportForm);
    document.getElementById("centersBtn").addEventListener("click", showCenters);
    document.getElementById("tipsBtn").addEventListener("click", showTips);
}

// Home content
function renderHome(){
    const html = `
        <h2 style="margin-top:0">Quick Actions</h2>
        <p style="color:#536b89">Use the CALL AMBULANCE button for immediate life-threatening situations. Otherwise you can quickly report an emergency or find nearest medical centers.</p>
        <div style="margin-top:12px">
            <button class="btn-primary" onclick="showReportForm()">Report Emergency</button>
        </div>
        <hr />
        <h3>Recent Reports</h3>
        ${renderReportsTable(5)}
    `;
    document.getElementById("contentArea").innerHTML = html;
}

// Show report form
function showReportForm(){
    const html = `
        <h2>Report Medical Emergency</h2>
        <form onsubmit="submitReport(event)">
            <input type="text" id="rName" placeholder="Reporter Name (your name)" required />
            <div class="row">
                <input type="number" id="rAge" placeholder="Age of patient (optional)" />
                <input type="tel" id="rContact" placeholder="Contact number" required />
            </div>
            <input type="text" id="rLocation" placeholder="Last seen / Current Location (be specific)" required />
            <textarea id="rDesc" placeholder="Brief description (symptoms, injury, conscious/unconscious)"></textarea>
            <div class="form-actions">
                <button class="btn-primary" type="submit">Submit Report</button>
                <button type="button" class="btn-muted" onclick="renderHome()">Cancel</button>
            </div>
        </form>
    `;
    document.getElementById("contentArea").innerHTML = html;
}

// Submit a report
function submitReport(e){
    e.preventDefault();
    const name = document.getElementById("rName").value.trim();
    const age = document.getElementById("rAge").value.trim() || "--";
    const contact = document.getElementById("rContact").value.trim();
    const location = document.getElementById("rLocation").value.trim();
    const desc = document.getElementById("rDesc").value.trim();

    if(!name || !contact || !location){
        alert("Please fill required fields.");
        return;
    }

    const reports = loadReports();
    const rpt = {
        id: Date.now(),
        status: "Missing/Needs Help",
        name, age, contact, location, desc,
        time: new Date().toLocaleString()
    };
    reports.unshift(rpt);
    saveReports(reports);

    alert("Report submitted. Volunteers and medical staff should review it.");
    showReportList();
}

// Show all reports (volunteer/medical view)
function showReportList(){
    const reports = loadReports();
    const html = `
        <h2>All Reports (${reports.length})</h2>
        ${renderReportsTable()}
        <div style="margin-top:12px">
            <button class="btn-muted" onclick="clearReports()">Clear All (demo)</button>
            <button class="btn-muted" onclick="renderHome()">Back</button>
        </div>
    `;
    document.getElementById("contentArea").innerHTML = html;
}

// helper: render reports table, limit optional
function renderReportsTable(limit=0){
    const reports = loadReports();
    if(reports.length===0) return `<p style="color:${'#55667a'}">No reports yet.</p>`;
    let rows = "";
    const use = limit>0 ? reports.slice(0,limit) : reports;
    rows += `<table><tr><th>When</th><th>Location</th><th>Details</th><th>Contact</th><th>Action</th></tr>`;
    use.forEach(r => {
        rows += `<tr>
            <td>${r.time}</td>
            <td>${escapeHtml(r.location)}</td>
            <td><strong>${escapeHtml(r.name)}</strong> • Age: ${r.age}<br/>${escapeHtml(r.desc || '')}</td>
            <td><a href="tel:${r.contact}">${r.contact}</a></td>
            <td><button class="btn-primary" onclick="openMap('${encodeURIComponent(r.location)}')">Open Map</button></td>
        </tr>`;
    });
    rows += `</table>`;
    if(limit>0 && reports.length>limit) rows += `<div style="margin-top:8px"><button class="btn-primary" onclick="showReportList()">View all reports</button></div>`;
    return rows;
}

// centers list
function showCenters(){
    let html = `<h2>Nearest Medical Centers</h2>`;
    medicalCenters.forEach(c => {
        html += `
            <div class="center-card">
                <div>
                    <h4>${escapeHtml(c.name)}</h4>
                    <div style="color:var(--muted)">${escapeHtml(c.place)}</div>
                </div>
                <div class="center-actions">
                    <a href="tel:${c.phone}"><button class="btn-primary">Call</button></a>
                    <button class="btn-muted" onclick="openMap('${encodeURIComponent(c.mapQuery)}')">Map</button>
                </div>
            </div>
        `;
    });
    html += `<div style="margin-top:12px"><button class="btn-muted" onclick="renderHome()">Back</button></div>`;
    document.getElementById("contentArea").innerHTML = html;
}

// tips
function showTips(){
    const tips = [
        "If someone is unconscious and not breathing, call ambulance and start CPR if trained.",
        "If bleeding heavily, apply firm pressure with clean cloth and elevate injured part if possible.",
        "For heatstroke or dehydration: move to shade, give sips of water if conscious, cool body with water.",
        "Keep airway open and avoid giving food/drink to unconscious person.",
        "If suspected fracture, immobilize limb and avoid moving unless necessary."
    ];
    let html = `<h2>Quick First-aid Tips</h2><div class="tips">`;
    tips.forEach(t => html += `<div class="tip">${escapeHtml(t)}</div>`);
    html += `</div><div style="margin-top:12px"><button class="btn-muted" onclick="renderHome()">Back</button></div>`;
    document.getElementById("contentArea").innerHTML = html;
}

// open map (Google Maps) in new tab
function openMap(query){
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
}

// clear demo reports
function clearReports(){
    if(confirm("Clear all reports from local storage? This is demo-only.")){
        localStorage.removeItem(STORAGE_KEY);
        renderHome();
    }
}

// small escape
function escapeHtml(str){ return (str||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
