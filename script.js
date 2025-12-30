// ============================
// AUTH CHECK
// ============================
const role = localStorage.getItem("userRole");

if (!role) {
    window.location.href = "index.html";
}

if (role === "host") {
    document.getElementById("host-panel").style.display = "block";
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// ============================
// CONFIG
// ============================
const sheetURL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIp2laD55RuKc2tn-m5X8JVMR70mjgfFCLuyB7IirpUDwZQUMp3u_dfd16oNEOmVZfOGpeqktlndg8/pub?output=csv";

const classroomSheetURL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0anoFy_YNRIVWoulfmJFN7XY3wSmdwwr4-bwXVa_26uzqFLDKOAMc68og3Cq3vVht4ZHMPQ2VJiFF/pub?output=csv";

// ============================
// CSV PARSER
// ============================
function parseCSV(text) {
    return text.split("\n").map(row => {
        const result = [];
        let val = "", inside = false;
        for (let i = 0; i < row.length; i++) {
            const c = row[i], next = row[i + 1];
            if (c === '"' && inside && next === '"') { val += '"'; i++; }
            else if (c === '"') inside = !inside;
            else if (c === ',' && !inside) { result.push(val); val = ""; }
            else val += c;
        }
        result.push(val);
        return result;
    });
}

// ============================
// ANNOUNCEMENTS
// ============================
fetch(sheetURL)
    .then(res => res.text())
    .then(text => {
        const data = parseCSV(text);
        const headers = data[0];
        const rows = data.slice(1);

        const idx = name => headers.indexOf(name);

        const container = document.getElementById("announcements-container");
        container.innerHTML = "";

        rows.forEach(r => {
            if (!r[idx("Column 2")]) return;

            const card = document.createElement("div");
            card.className = "announcement-card";
            card.innerHTML = `
            <h3>${r[idx("Column 2")]}</h3>
            <p>${r[idx("DESCRIPTION")] || ""}</p>
            <small>
                ${r[idx("WHICH YEAR")] || ""} |
                ${r[idx("DATE")] || ""} |
                ${r[idx("TIMING")] || ""}
            </small>
        `;
            container.appendChild(card);
        });
    });

// ============================
// CLASSROOM AVAILABILITY
// ============================
fetch(classroomSheetURL)
    .then(res => res.text())
    .then(text => {
        const data = parseCSV(text);
        const headers = data[0].map(h => h.trim());

        const r = headers.indexOf("ROOM NO");
        const t = headers.indexOf("TIMING");
        const s = headers.indexOf("STATUS");

        const tbody = document.querySelector("#classroom-table tbody");
        tbody.innerHTML = "";

        data.slice(1).forEach(row => {
            if (!row[r]) return;
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${row[r]}</td>
            <td>${row[t]}</td>
            <td>${row[s]}</td>
        `;
            tbody.appendChild(tr);
        });
    });
