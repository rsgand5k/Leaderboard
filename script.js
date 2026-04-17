let pxPerMs = 0.0003;
let timeMode = "igt";
let ratio_screen = 65;

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

function filterBestRuns(list, firstKey, secondKey) {
  const best = new Map();

  list.forEach(run => {
    const total = getTimeValue(run, firstKey) + getTimeValue(run, secondKey);

    if (!best.has(run.name) || total < best.get(run.name).total) {
      best.set(run.name, { ...run, total });
    }
  });

  return [...best.values()];
}

function sortByTotalTime(list, firstKey, secondKey) {
  return list.slice().sort((a,b) =>
    (getTimeValue(a, firstKey) + getTimeValue(a, secondKey)) -
    (getTimeValue(b, firstKey) + getTimeValue(b, secondKey))
  );
}

function filterF3(list) {
  const showF3 = document.getElementById("showF3").checked;
  const showNoF3 = document.getElementById("showNoF3").checked;

  return list.filter(run => {
    const isF3 = Boolean(run.f3 ?? run.F3);
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

function updatePxPerMsForBoard(board) {
  if (!board.list || board.list.length === 0) return;

  const maxTotal = Math.max(...board.list.map(r =>
    getTimeValue(r, board.first) + getTimeValue(r, board.second)
  ));

  if (maxTotal === 0) return 0;

  return (window.innerWidth * (ratio_screen / 100)) / maxTotal;
}

function renderBoard(list, containerId, firstKey, secondKey, localPxPerMs) {
  const board = document.getElementById(containerId);
  if (!board) return;

  board.querySelectorAll(".row").forEach(e => e.remove());

  const fragment = document.createDocumentFragment();

  list.forEach((p, index) => {
    const part1 = getTimeValue(p, firstKey);
    const part2 = getTimeValue(p, secondKey);
    const total = part1 + part2;
    if (total === 0) return;

    const row = document.createElement("div");
    row.className = "row";
    row.style.display = "flex";
    row.style.position = "relative";

    const rank = document.createElement("div");
    rank.style.width = "40px";
    rank.style.fontWeight = "bold";
    rank.style.marginRight = "10px";
    rank.textContent = (index + 1) + getSuffix(index + 1);

    const img = new Image();
    img.src = `Heads/${p.name}.png`;

    img.onload = () => {
      img.style.width = "30px";
      img.style.display = "block";
      img.style.marginTop = "5px";
      img.style.border = "1px solid white";
      rank.appendChild(img);
    };

    const info = document.createElement("div");
    info.className = "info-row";

    const createSpan = (text, style = "") => {
      const span = document.createElement("span");
      span.innerHTML = text;
      if (style) span.style.cssText = style;
      return span;
    };

    info.appendChild(createSpan(p.name));
    info.appendChild(createSpan(countryToFlag(p.country)));
    info.appendChild(createSpan(p.version));
    info.appendChild(createSpan(p.f3 ? "F3" : "No F3"));
    info.appendChild(createSpan(p.difficulty));
    info.appendChild(createSpan(p.date));
    info.appendChild(createSpan(p.mods));
    info.appendChild(createSpan(p.seed, "color:#9f9;"));

    const bar = document.createElement("div");
    bar.className = "bar-container";
    bar.style.width = (total * localPxPerMs) + "px";

    const b1 = document.createElement("div");
    b1.className = firstKey === "main" ? "igt" : "time";
    b1.style.width = (part1 / total * 100) + "%";
    b1.textContent = formatTime(part1);

    const b2 = document.createElement("div");
    b2.className = secondKey === "main" ? "igt" : "time";
    b2.style.width = (part2 / total * 100) + "%";
    b2.textContent = formatTime(part2);

    bar.appendChild(b1);
    bar.appendChild(b2);

    const totalTxt = document.createElement("div");
    totalTxt.className = "total-time";
    totalTxt.textContent = formatTime(total);

    const barRow = document.createElement("div");
    barRow.className = "run";
    barRow.style.display = "flex";
    barRow.style.alignItems = "center";

    const barWrapper = document.createElement("div");
    barWrapper.style.flex = "1";
    barWrapper.appendChild(bar);

    barRow.appendChild(barWrapper);
    barRow.appendChild(totalTxt);

    const link = document.createElement("a");

    if (p.link) {
      link.href = p.link;
      link.textContent = "Run link";
      link.style.color = "#4287f5";
      link.style.textDecoration = "underline";
      link.target = "_blank";
    } else {
      link.href = "#";
      link.textContent = "No link";
      link.style.color = "#f54291";
      link.style.textDecoration = "none";
      link.style.cursor = "default";
      link.onclick = (e) => e.preventDefault();
    }

    link.style.marginTop = "4px";
    link.style.fontSize = "14px";
    link.style.alignSelf = "flex-end";

    const col = document.createElement("div");
    col.style.flex = "1";
    col.style.display = "flex";
    col.style.flexDirection = "column";

    col.appendChild(info);
    col.appendChild(barRow);
    col.appendChild(link);

    row.appendChild(rank);
    row.appendChild(col);

    fragment.appendChild(row);
  });

if (!fragment.hasChildNodes()) {
	board.style.opacity = "0.2";
  } else {
	board.style.opacity = "1";
  }
  
  board.appendChild(fragment);
}

const runs_any_5K = [
  { name:"Antoine", date:"2025-11-23", version:"1.16.1", f3:true, country:"FR", mods:"Modded", difficulty:"Easy", igt:{h:0,m:18,s:55,ms:394}, rta:{h:0,m:19,s:38,ms:397}, time:{h:0,m:31,s:24,ms:0}, seed:"?", link:"" },
  { name:"Ludovik", date:"2025-11-27", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hardcore", igt:{h:0,m:25,s:5,ms:576}, rta:{h:0,m:25,s:39,ms:714}, time:{h:0,m:22,s:13,ms:0}, seed:"-5068990900990481486", link:"" },
  { name:"DesktopFolder", date:"2025-11-29", version:"1.16.1", f3:true, country:"CA", mods:"Modded", difficulty:"Easy", igt:{h:0,m:16,s:10,ms:699}, rta:{h:0,m:16,s:36,ms:958}, time:{h:0,m:22,s:44,ms:150}, seed:"4460252521909011407", link:"https://www.youtube.com/watch?v=nizPV0YUZ4Q" },
  { name:"Blyde", date:"2025-11-30", version:"1.16.1", f3:true, country:"FR", mods:"Modded", difficulty:"Easy", igt:{h:0,m:19,s:57,ms:71}, rta:{h:0,m:20,s:42,ms:53}, time:{h:0,m:22,s:55,ms:0}, seed:"5528818920531833096", link:"" },
  { name:"Fr4nkey", date:"2025-12-02", version:"1.16.1", f3:true, country:"RU", mods:"Modded", difficulty:"Easy", igt:{h:0,m:13,s:57,ms:820}, rta:{h:0,m:14,s:15,ms:0}, time:{h:0,m:25,s:17,ms:0}, seed:"8929439908023461646", link:"https://www.youtube.com/watch?v=PjCsG_eJcKA" },
  { name:"Fr4nkey", date:"2025-12-13", version:"1.16.1", f3:true, country:"RU", mods:"Modded", difficulty:"Easy", igt:{h:0,m:11,s:20,ms:327}, rta:{h:0,m:11,s:31,ms:0}, time:{h:0,m:22,s:14,ms:240}, seed:"6869386029071364720", link:"https://www.youtube.com/watch?v=GoI8jzo3C6Y" },
  { name:"Ludovik", date:"2026-01-17", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hardcore", igt:{h:0,m:17,s:17,ms:235}, rta:{h:0,m:18,s:06,ms:272}, time:{h:0,m:19,s:34,ms:500}, seed:"-1026921766230817449", link:"https://www.youtube.com/watch?v=M3GxF49uBFA" },
  { name:"Legoboy1243", date:"2026-03-31", version:"1.16.1", f3:true, country:"US", mods:"Modded", difficulty:"Easy", igt:{h:0,m:11,s:48,ms:717}, rta:{h:0,m:12,s:04,ms:875}, time:{h:0,m:28,s:12,ms:0}, seed:"5211054053007582760", link:"https://youtu.be/ICxFfBU9yA8" },
];

const runs_5K_any = [
  { name:"Ludovik", date:"2025-11-23", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:0,m:48,s:1,ms:62}, rta:{h:0,m:49,s:2,ms:164}, time:{h:0,m:19,s:57,ms:0}, seed:"9209975185873643422", link:"" },
  { name:"Ludovik", date:"2025-11-26", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:0,m:37,s:30,ms:681}, rta:{h:0,m:38,s:19,ms:254}, time:{h:0,m:26,s:34,ms:0}, seed:"-8377709639459139130", link:"" },
  { name:"Ludovik", date:"2025-12-27", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:0,m:42,s:39,ms:821}, rta:{h:0,m:42,s:54,ms:017}, time:{h:0,m:18,s:22,ms:900}, seed:"3852899728699119638", link:"https://www.twitch.tv/videos/2654352051" },
  { name:"Ludovik", date:"2026-02-11", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hardcore", igt:{h:0,m:28,s:30,ms:893}, rta:{h:0,m:29,s:47,ms:938}, time:{h:0,m:18,s:31,ms:0}, seed:"471589420443183072", link:"https://www.twitch.tv/videos/2694879300" },
  { name:"DesktopFolder", date:"2026-03-05", version:"1.16.1", f3:true, country:"CA", mods:"Modded", difficulty:"Easy", igt:{h:0,m:21,s:57,ms:073}, rta:{h:0,m:22,s:42,ms:551}, time:{h:0,m:23,s:47,ms:0}, seed:"-6113485235216793906", link:"https://www.youtube.com/watch?v=ImcDBA5ZppE" },
  { name:"Doog4321", date:"2026-03-10", version:"1.16.1", f3:true, country:"US", mods:"Modded", difficulty:"Easy", igt:{h:0,m:23,s:53,ms:027}, rta:{h:0,m:25,s:19,ms:0}, time:{h:0,m:26,s:41,ms:0}, seed:"5179192011070350515", link:"https://www.youtube.com/live/HATy5dF9na0?t=446s" },
  { name:"DesktopFolder", date:"2026-04-09", version:"1.16.1", f3:true, country:"CA", mods:"Modded", difficulty:"Easy", igt:{h:0,m:21,s:46,ms:705}, rta:{h:0,m:22,s:57,ms:844}, time:{h:0,m:21,s:27,ms:0},seed:"8680437627049885912", link:"https://youtu.be/F5lUv1d8fS8?si=p1hlDgZMZ7cIODF1" },
];

const runs_half_10K = [
  { name:"Ludovik", date:"2026-04-13", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:1,m:11,s:15,ms:274}, rta:{h:1,m:13,s:33,ms:548}, time:{h:0,m:49,s:15,ms:0}, seed:"8955576644772799517", link:"" },
  { name:"Ludovik", date:"2026-04-17", version:"1.16.5", f3:false, country:"FR", mods:"Modded", difficulty:"Hardcore", igt:{h:0,m:54,s:08,ms:898}, rta:{h:0,m:54,s:59,ms:294}, time:{h:0,m:50,s:06,ms:0}, seed:"4722933392814446678", link:"" },
];


const runs_10K_half = [
  { name:"DesktopFolder", date:"2026-04-04", version:"1.16.1", f3:true, country:"CA", mods:"Modded", difficulty:"Easy", igt:{h:0,m:45,s:51,ms:227}, rta:{h:0,m:49,s:53,ms:915}, time:{h:0,m:51,s:01,ms:0}, seed:"-7226257513615693532", link:"https://www.youtube.com/watch?v=FUJaNkovjZQ" },
  { name:"Ludovik", date:"2026-04-11", version:"1.16.1", f3:false, country:"FR", mods:"Modded", difficulty:"Hard", igt:{h:0,m:40,s:25,ms:344}, rta:{h:0,m:42,s:29,ms:110}, time:{h:0,m:51,s:53,ms:0}, seed:"-5260968053087870447", link:"" },
  { name:"DesktopFolder", date:"2026-04-11", version:"1.16.1", f3:true, country:"CA", mods:"Modded", difficulty:"Easy", igt:{h:0,m:30,s:25,ms:733}, rta:{h:0,m:34,s:14,ms:997}, time:{h:0,m:46,s:57,ms:0}, seed:"-3498854702721201773 ", link:"https://www.youtube.com/watch?v=XLt7Vciqefw" },
];

const runs_ab_15K = [];
const runs_15K_ab = [];

const runs_hdwgh_21K = [];
const runs_21K_hdwgh = [];

const runs_aa_42K = [];
const runs_42K_aa = [];

const allBoards = [
  { data: runs_any_5K, id: "any-5K", first: "main", second: "time" },
  { data: runs_5K_any, id: "5K-any", first: "time", second: "main" },

  { data: runs_half_10K, id: "half-10K", first: "main", second: "time" },
  { data: runs_10K_half, id: "10K-half", first: "time", second: "main" },
  
  { data: runs_ab_15K, id: "ab-15K", first: "main", second: "time" },
  { data: runs_15K_ab, id: "15K-ab", first: "time", second: "main" },

  { data: runs_hdwgh_21K, id: "hdwgh-21K", first: "main", second: "time" },
  { data: runs_21K_hdwgh, id: "21K-hdwgh", first: "time", second: "main" },

  { data: runs_aa_42K, id: "aa-42K", first: "main", second: "time" },
  { data: runs_42K_aa, id: "42K-aa", first: "time", second: "main" }
];

function getTimeValue(run, key) {
  let t = null;

  if (key === "main") t = run[timeMode];
  if (key === "time") t = run.time;

  if (!t) return 0;

  return parseTime(t);
}

function applyFilter() {
  const date = document.getElementById('dateFilter')?.value;
  const topX = Number(document.getElementById('topX')?.value || 10);
  const showObsolete = document.getElementById('showObsolete')?.checked;

  allBoards.forEach(board => {
    let list = board.data;

    list = list.filter(r => !date || r.date <= date);

    if (!showObsolete) {
      list = filterBestRuns(list, board.first, board.second);
    }

    list = filterF3(list);

    list = sortByTotalTime(list, board.first, board.second).slice(0, topX);

    board.list = list;

    const localPx = updatePxPerMsForBoard(board);

    renderBoard(list, board.id, board.first, board.second, localPx);
  });
}

window.addEventListener("DOMContentLoaded", applyFilter);
window.addEventListener("resize", applyFilter);

document.getElementById('dateFilter')?.addEventListener('change', applyFilter);
document.getElementById('topX')?.addEventListener('input', applyFilter);
document.getElementById('showObsolete')?.addEventListener('change', applyFilter);

document.querySelectorAll('input[name="timeMode"]').forEach(r =>
  r.addEventListener('change', e => {
    timeMode = e.target.value;
    applyFilter();
  })
);

document.getElementById("showF3")?.addEventListener("change", applyFilter);
document.getElementById("showNoF3")?.addEventListener("change", applyFilter);

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
