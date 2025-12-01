let pxPerMs = 0.0003;
let timeMode = "igt";

function countryToFlag(code) {
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

function parseTime(t) {
  return t.h*3600000 + t.m*60000 + t.s*1000 + t.ms;
}

function formatTime(ms) {
  const h = Math.floor(ms/3600000); ms%=3600000;
  const m = Math.floor(ms/60000); ms%=60000;
  const s = Math.floor(ms/1000); ms%=1000;
  if (h >= 1) return `${h}h ${m}m ${s}s ${ms}ms`;
  return `${m}m ${s}s ${ms}ms`;
}

function filterBestRuns(list) {
  const best = new Map();
  list.forEach(run => {
    const total = parseTime(run[timeMode]) + parseTime(run.k5);
    if (!best.has(run.name) || total < best.get(run.name).total)
      best.set(run.name, { ...run, total });
  });
  return [...best.values()];
}

function sortByTotalTime(list) {
  return list.slice().sort((a,b) =>
    (parseTime(a[timeMode]) + parseTime(a.k5)) -
    (parseTime(b[timeMode]) + parseTime(b.k5))
  );
}

function updatePxPerMs(l1, l2) {
  const all = [...l1, ...l2];
  if (!all.length) return;
  const maxTotal = Math.max(...all.map(r =>
    parseTime(r[timeMode]) + parseTime(r.k5)
  ));
  pxPerMs = (window.innerWidth * 0.70) / maxTotal;
}

function filterF3(list) {
  const showF3 = document.getElementById("showF3").checked;
  const showNoF3 = document.getElementById("showNoF3").checked;

  return list.filter(run => {
    const hasF3 = (typeof run.F3 !== 'undefined') ? run.F3 : run.f3;
    const isF3 = Boolean(hasF3);

    if (isF3 && showF3) return true;
    if (!isF3 && showNoF3) return true;
    return false;
  });
}

function getSuffix(n) {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
}

function renderBoard(list, containerId, firstKey, secondKey) {
  const board = document.getElementById(containerId);
  board.querySelectorAll(".row").forEach(e => e.remove());

  list.forEach((p, index) => {
    const tRsg = parseTime(p[timeMode]);
    const t5k = parseTime(p.k5);

    const part1 = (firstKey === "rsg") ? tRsg : t5k;
    const part2 = (secondKey === "rsg") ? tRsg : t5k;

    const total = part1 + part2;

    const row = document.createElement("div");
    row.className = "row";
    row.style.display = "flex";
    row.style.position = "relative";

    row.addEventListener("mouseenter", () => {

    const nameSpan = row.querySelector(".name");
    const rect = nameSpan.getBoundingClientRect();

    const x = rect.left;
    const y = rect.top - 10;

    showTooltip(`
        <b>${p.name}</b><br>
        <a href="${p.link ?? '#'}" target="_blank" style="color:#4af; text-decoration:underline;">
            ▶ Open run link
        </a>
        <br><br>
        Seed : <span style="color:#9f9;">${p.seed}</span><br>
        Date : ${p.date}<br>
        Version : ${p.version}
    `, x, y);
	});

    // Rank
    const rank = document.createElement("div");
    rank.style.width = "40px";
    rank.style.fontWeight = "bold";
    rank.style.marginRight = "10px";
    rank.textContent = (index+1) + getSuffix(index+1);

    const f3Txt = p.f3 ? "F3" : "No F3";

    const info = document.createElement("div");
    info.className = "info-row";
    info.innerHTML = `
      <span class="name">${p.name}</span>
      <span>${countryToFlag(p.country)}</span>
      <span>${p.version}</span>
      <span>${f3Txt}</span>
      <span>${p.date}</span>
      <span>${p.mods}</span>
      <span>${p.difficulty}</span>
      <span>🌱${p.seed}</span>
    `;

    const bar = document.createElement("div");
    bar.className = "bar-container";
    bar.style.width = (total * pxPerMs) + "px";

    // 1st bar
    const b1 = document.createElement("div");
    b1.className = (firstKey === "rsg") ? "igt" : "k5";
    b1.style.width = (part1 / total * 100) + "%";
    b1.textContent = formatTime(part1);

    // 2nd bar
    const b2 = document.createElement("div");
    b2.className = (secondKey === "rsg") ? "igt" : "k5";
    b2.style.width = (part2 / total * 100) + "%";
    b2.textContent = formatTime(part2);

    bar.appendChild(b1);
    bar.appendChild(b2);

    const totalTxt = document.createElement("div");
    totalTxt.style.marginLeft = "10px";
    totalTxt.textContent = formatTime(total);

    const barRow = document.createElement("div");
    barRow.style.display = "flex";
    barRow.appendChild(bar);
    barRow.appendChild(totalTxt);

    const col = document.createElement("div");
    col.style.flex = "1";
    col.appendChild(info);
    col.appendChild(barRow);

    row.appendChild(rank);
    row.appendChild(col);

    board.appendChild(row);
  });
}

const runsRsg5k = [
  { name:"Antoine", date:"2025-11-23", version:"1.16.1", f3:true, country:"FR", mods:"Modded", difficulty:"Easy", igt:{h:0,m:18,s:55,ms:394}, rta:{h:0,m:19,s:38,ms:397}, k5:{h:0,m:31,s:24,ms:0}, seed:"?", link:"https://www.twitch.tv/videos/2625908254" },
  { name:"LudovikMC", date:"2025-11-27", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hardcore", igt:{h:0,m:25,s:5,ms:576}, rta:{h:0,m:25,s:39,ms:714}, k5:{h:0,m:22,s:13,ms:0}, seed:"-5068990900990481486", link:"https://www.twitch.tv/ludomcsr" },
  { name:"DesktopFolder", date:"2025-11-29", version:"1.16.1", f3:true, country:"CA", mods:"Modded", difficulty:"Easy", igt:{h:0,m:16,s:10,ms:699}, rta:{h:0,m:16,s:36,ms:958}, k5:{h:0,m:22,s:44,ms:150}, seed:"4460252521909011407", link:"https://www.youtube.com/watch?v=nizPV0YUZ4Q" },
  { name:"Blyde", date:"2025-11-30", version:"1.16.1", f3:true, country:"FR", mods:"Modded", difficulty:"Easy", igt:{h:0,m:19,s:57,ms:71}, rta:{h:0,m:20,s:42,ms:53}, k5:{h:0,m:22,s:55,ms:0}, seed:"5528818920531833096", link:"https://www.twitch.tv/blyde19" }
];

const runs5kRsg = [
  { name:"LudovikMC", date:"2025-11-23", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:0,m:48,s:1,ms:62}, rta:{h:0,m:49,s:2,ms:164}, k5:{h:0,m:19,s:57,ms:0}, seed:"9209975185873643422", link:"https://www.twitch.tv/ludomcsr" },
  { name:"LudovikMC", date:"2025-11-26", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:0,m:37,s:30,ms:681}, rta:{h:0,m:38,s:19,ms:254}, k5:{h:0,m:26,s:34,ms:0}, seed:"-8377709639459139130", link:"https://www.twitch.tv/ludomcsr" },
];

function applyFilter() {
  const date = document.getElementById('dateFilter').value;
  const topX = Number(document.getElementById('topX').value || 10);
  const showObsolete = document.getElementById('showObsolete').checked;

  let f1 = runsRsg5k.filter(r => !date || r.date <= date);
  let f2 = runs5kRsg.filter(r => !date || r.date <= date);

  if (!showObsolete) {
    f1 = filterBestRuns(f1);
    f2 = filterBestRuns(f2);
  }

  f1 = filterF3(f1);
  f2 = filterF3(f2);

  f1 = sortByTotalTime(f1).slice(0, topX);
  f2 = sortByTotalTime(f2).slice(0, topX);

  updatePxPerMs(f1, f2);

  renderBoard(f1, "leftBoard", "rsg", "k5");
  renderBoard(f2, "rightBoard", "k5", "rsg");
}

window.addEventListener("DOMContentLoaded", applyFilter);
window.addEventListener("resize", applyFilter);

document.getElementById('dateFilter').addEventListener('change', applyFilter);
document.getElementById('topX').addEventListener('input', applyFilter);
document.getElementById('showObsolete').addEventListener('change', applyFilter);

document.querySelectorAll('input[name="timeMode"]').forEach(r =>
  r.addEventListener('change', e => {
    timeMode = e.target.value;
    applyFilter();
  })
);

document.getElementById("showF3").addEventListener("change", applyFilter);
document.getElementById("showNoF3").addEventListener("change", applyFilter);

const tooltip = document.getElementById("tooltip");
let tooltipLocked = false;

function showTooltip(html, x, y) {
    tooltip.innerHTML = html;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
    tooltip.style.display = "block";
}

function hideTooltip() {
    tooltip.style.display = "none";
}

document.addEventListener("click", (e) => {
    if (!tooltip.contains(e.target)) {
        hideTooltip();
    }
});
