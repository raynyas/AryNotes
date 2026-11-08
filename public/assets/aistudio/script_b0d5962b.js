const D={id:{dash:"Dashboard",alarm:"Alarm",set:"Settings",add:"Tambah tugas…",todo:"Belum selesai",done:"Selesai (dihapus otomatis 7 hari)",empty:"Belum ada tugas",nf:"Tidak ditemukan",search:"Cari tugas…",mo:"Bulan",dy:"Tanggal",dl:"Tenggat waktu (opsional)",hr:"Jam",mi:"Menit",se:"Detik",late:"Tugas belum diselesaikan",lang:"Bahasa",theme:"Tema",light:"Terang",dark:"Gelap",color:"Warna aksen",rem:"Notifikasi pengingat",daily:"Setiap hari",weekly:"Seminggu sekali",custom:"Custom",wall:"Wallpaper dashboard",use:"Pakai",cancel:"Batal",save:"Simpan",zoom:"Ukuran",posx:"Horizontal",posy:"Vertikal",reset:"Tanpa wallpaper",sound:"Suara alarm",addS:"Tambah suara custom",noal:"Belum ada alarm",stop:"Matikan",remMsg:"Kamu masih punya tugas yang belum selesai",nosave:"Terlalu besar untuk disimpan permanen"},
en:{dash:"Dashboard",alarm:"Alarm",set:"Settings",add:"Add a task…",todo:"To do",done:"Done (auto-deleted in 7 days)",empty:"No tasks yet",nf:"Nothing found",search:"Search tasks…",mo:"Month",dy:"Date",dl:"Deadline (optional)",hr:"Hour",mi:"Minute",se:"Second",late:"Task not finished",lang:"Language",theme:"Theme",light:"Light",dark:"Dark",color:"Accent color",rem:"Reminder notification",daily:"Every day",weekly:"Once a week",custom:"Custom",wall:"Dashboard wallpaper",use:"Use",cancel:"Cancel",save:"Save",zoom:"Size",posx:"Horizontal",posy:"Vertical",reset:"No wallpaper",sound:"Alarm sound",addS:"Add custom sound",noal:"No alarms yet",stop:"Stop",remMsg:"You still have unfinished tasks",nosave:"Too large to save permanently"}};
const BI={beep:{n:"Beep",w:"sine",s:[[880,.25],[0,.35]]},digital:{n:"Digital",w:"square",s:[[1500,.08],[0,.08],[1500,.08],[0,.08],[1500,.08],[0,.5]]},chime:{n:"Chime",w:"triangle",s:[[784,.25],[988,.25],[1319,.5],[0,.4]]},melody:{n:"Melody",w:"sine",s:[[523,.2],[659,.2],[784,.2],[1047,.4],[0,.5]]},radar:{n:"Radar",w:"sawtooth",s:[[600,.15],[900,.15],[1200,.15],[0,.7]]}};
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
let S=Object.assign({lang:"id",theme:matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light",ac:"#6c8ebf",rem:"daily",last:Date.now(),cd:[1],ch:9,cm:0,cs:0,snd:"beep",wp:null},ld("st",{}));
let T=ld("tk",[]),A=ld("al",[]),WL=ld("wl",[]),SNDS=ld("sd",[]),pg="dash",Q="",PV=null,SP=false,WV=null,SEL=S.snd||"beep";
const t=k=>D[S.lang][k],$=i=>document.getElementById(i),save=()=>sv("st",S),loc=()=>S.lang==="id"?"id-ID":"en-GB";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const PL='<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',TR='<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';
const IC={dash:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',alarm:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M4 4l3-2M20 4l-3-2"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'};
function theme(){const r=document.documentElement;r.dataset.theme=S.theme;r.style.setProperty("--ac",S.ac)}
function purge(){const n=Date.now(),l=T.length;T=T.filter(x=>!x.d||n-x.d<6048e5);if(T.length!==l)sv("tk",T)}
function nav(){$("nv").innerHTML=["dash","alarm","set"].map(k=>`<button class="${pg===k?"on":""}" onclick="go('${k}')" aria-label="${t(k)}"><svg viewBox="0 0 24 24">${IC[k]}</svg></button>`).join("")}
function go(p){pg=p;SP=false;stopSnd();draw()}
function draw(){theme();purge();nav();$("stop").textContent=t("stop");
$("hd").innerHTML=pg==="dash"?`<span class="gt">AryNotes</span><div class="mu" style="font-weight:500;letter-spacing:0">${t("dash")}</div>`:t(pg);
const m=$("mn"),pc=$("pc"),sc=pc?pc.scrollTop:0;if($("ah"))WV=["ah","am","as"].map(i=>Math.round($(i).scrollTop/50));
if(pg==="dash")dash(m);else{m.innerHTML='<div class="sc" id="pc"></div>';(pg==="alarm"?alarm:sett)($("pc"));$("pc").scrollTop=sc}
wp()}
const wsty=(el,w)=>{const x=w.x??50,y=w.y??50,z=(w.z||100)/100;el.style.cssText=`background-image:url(${w.u});background-position:${x}% ${y}%;transform:scale(${z});transform-origin:${x}% ${y}%`};
const sl=(k,l,mn,mx,p)=>`<div class="row" style="margin:6px 0"><span class="mu" style="width:84px">${l}</span><input type="range" min="${mn}" max="${mx}" value="${p[k]??(k==="z"?100:50)}" style="flex:1;accent-color:var(--ac)" oninput="wadj('${k}',+this.value)" onchange="sv('wl',WL)"></div>`;
function wadj(k,v){const w=WL.find(x=>x.id===PV);if(!w)return;w[k]=v;wsty($("pwi"),w)}
function wp(){const w=WL.find(x=>x.id===S.wp),e=$("wp");if(pg!=="dash"||!w||!$("lst")){e.style.display="none";return}
e.style.display="block";wsty(e.firstChild,w);e.style.top=$("lst").getBoundingClientRect().top+"px"}
addEventListener("resize",wp);
const MN=()=>Array.from({length:12},(_,i)=>new Date(2024,i,1).toLocaleDateString(loc(),{month:"long"}));
const opt=(ph,arr,off)=>`<option value="">${ph}</option>`+arr.map((v,i)=>`<option value="${i+off}">${v}</option>`).join("");
const pad=i=>String(i).padStart(2,"0"),R=n=>Array.from({length:n},(_,i)=>i);
const fm=i=>new Date(i).toLocaleString(loc(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const late=x=>x.e&&!x.d&&Date.now()>x.e;
function dash(m){m.innerHTML=`<div class="top"><div class="row">

<input type="text" class="srch" style="flex:1;width:auto" placeholder="🔍 ${t("search")}" value="${esc(Q)}" oninput="Q=this.value;lst()"><button class="ib" onclick="openAdd()" aria-label="+">${PL}</button></div></div><div class="sc" id="lst"></div>`;lst()}
function lst(){const q=Q.toLowerCase(),f=T.filter(x=>x.n.toLowerCase().includes(q)),a=f.filter(x=>!x.d),b=f.filter(x=>x.d);
const dt=i=>new Date(i).toLocaleDateString(loc(),{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const li=x=>`<div class="cd row ${x.d?"done":""}"><input class="ck" type="checkbox" ${x.d?"checked":""} onchange="tg(${x.i})"><div style="flex:1;min-width:0"><span class="t">${esc(x.n)}</span><div class="mu">${dt(x.i)}</div>${x.e?`<div class="mu ${late(x)?"red":""}">⏰ ${fm(x.e)}</div>`:""}</div><button class="x" onclick="rm(${x.i})">×</button></div>`;
$("lst").innerHTML=(f.length?"":`<p class="mu" style="text-align:center;margin-top:40px">${t(T.length?"nf":"empty")}</p>`)+(a.length?`<h3>${t("todo")}</h3>`+a.map(li).join(""):"")+(b.length?`<h3>${t("done")}</h3>`+b.map(li).join(""):"")}
function openAdd(){const m=$("md");m.innerHTML=`<div class="sh" onclick="event.stopPropagation()"><input type="text" id="ni" style="width:100%" placeholder="${t("add")}" onkeydown="if(event.key==='Enter')ad()"><div class="mu" style="margin:14px 4px 0">⏰ ${t("dl")}</div><div class="row" style="margin:6px 0 16px"><select id="dm" style="flex:1.3">${opt(t("mo"),MN(),0)}</select><select id="dd" style="flex:1">${opt(t("dy"),R(31).map(i=>i+1),1)}</select><select id="dh" style="flex:1">${opt(t("hr"),R(24).map(pad),0)}</select></div><div class="row"><button class="gh" style="flex:1" onclick="closeAdd()">${t("cancel")}</button><button class="btn" style="flex:1" onclick="ad()">${t("save")}</button></div></div>`;m.style.display="flex";setTimeout(()=>$("ni").focus(),60)}
function closeAdd(){$("md").style.display="none"}
function ad(){const v=$("ni").value.trim();if(!v)return;const mo=$("dm").value,dy=$("dd").value,hr=$("dh").value;let e=0;
if(mo!==""&&dy!=="")e=new Date(new Date().getFullYear(),+mo,+dy,+(hr||0)).getTime();
T.unshift({i:Date.now(),n:v,d:0,e});sv("tk",T);notifyAsk();closeAdd();draw()}
function tg(i){const x=T.find(y=>y.i===i);x.d=x.d?0:Date.now();sv("tk",T);draw()}
function rm(i){T=T.filter(y=>y.i!==i);sv("tk",T);draw()}
const wheel=(id,mx,l)=>`<div style="flex:1"><div class="mu" style="text-align:center;margin-bottom:4px">${l}</div><div class="ww"><div class="wh" id="${id}">${R(mx+1).map(i=>`<div>${pad(i)}</div>`).join("")}</div></div></div>`;
const snm=id=>BI[id]?BI[id].n:(SNDS.find(x=>x.id===id)||{n:"Beep"}).n;
function alarm(c){c.innerHTML=`<div class="cd"><div class="row">${wheel("ah",23,t("hr"))}${wheel("am",59,t("mi"))}${wheel("as",59,t("se"))}</div><button class="btn" style="width:100%;margin-top:10px" onclick="aa()">+</button></div><div class="cd" id="spc"></div>`+
(A.length?A.map(x=>`<div class="cd row sp"><div><span style="font-size:28px;font-weight:600;font-variant-numeric:tabular-nums">${pad(x.h)}:${pad(x.m)}:${pad(x.s)}</span><div class="mu">${esc(snm(x.snd))}</div></div><span class="row"><input class="sw2" type="checkbox" ${x.on?"checked":""} onchange="ta(${x.i})"><button class="x" onclick="ra(${x.i})">×</button></span></div>`).join(""):`<p class="mu" style="text-align:center">${t("noal")}</p>`);
const n=new Date(),v=WV||[n.getHours(),n.getMinutes(),n.getSeconds()];["ah","am","as"].forEach((i,k)=>$(i).scrollTop=v[k]*50);spr()}
function aa(){const g=i=>Math.round($(i).scrollTop/50);A.push({i:Date.now(),h:g("ah"),m:g("am"),s:g("as"),on:1,snd:SEL});WV=null;sv("al",A);notifyAsk();draw()}
function ta(i){const x=A.find(y=>y.id===i||y.i===i);x.on=x.on?0:1;sv("al",A)}
function ra(i){A=A.filter(y=>y.i!==i);sv("al",A);draw()}
function spr(){const all=Object.keys(BI).map(k=>({id:k,n:BI[k].n})).concat(SNDS.map(x=>({id:x.id,n:x.n,c:1})));
let h=`<div class="row sp" style="cursor:pointer" onclick="SP=!SP;if(!SP)stopSnd();spr()"><span>${t("sound")}</span><span class="mu">${esc(snm(SEL))} ${SP?"▴":"▾"}</span></div>`;
if(SP)h+=`<div style="margin-top:8px">`+all.map(s=>`<div class="sr" onclick="ss('${s.id}')"><span class="rd ${SEL===s.id?"on":""}"></span><span style="flex:1">${esc(s.n)}</span>${s.c?`<button class="x" onclick="event.stopPropagation();ds('${s.id}')">×</button>`:""}</div>`).join("")+`<label class="gh" style="display:block;text-align:center;margin-top:10px;cursor:pointer">+ ${t("addS")}<input type="file" accept="audio/*" hidden onchange="pS(this)"></label></div>`;
$("spc").innerHTML=h}
function ss(id){SEL=id;S.snd=id;save();playSnd(id,false);spr()}
function ds(id){SNDS=SNDS.filter(x=>x.id!==id);sv("sd",SNDS);if(SEL===id){SEL="beep";S.snd="beep";save()}stopSnd();spr()}
function pS(e){const f=e.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const id="c"+Date.now();SNDS.push({id,n:f.name,u:r.result});if(!sv("sd",SNDS))toast(t("nosave"));ss(id)};r.readAsDataURL(f)}
let AC,stopFn=null,tm;
function stopSnd(){if(stopFn){stopFn();stopFn=null}}
function playSnd(id,loop){stopSnd();const c=SNDS.find(x=>x.id===id);
if(c){const au=new Audio(c.u);au.loop=!!loop;au.play().catch(()=>{});stopFn=()=>au.pause();return}
const b=BI[id]||BI.beep;AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();let live=1;
const run=()=>{if(!live)return;let t0=AC.currentTime;b.s.forEach(([f,d])=>{if(f){const o=AC.createOscillator(),g=AC.createGain();o.type=b.w;o.frequency.value=f;g.gain.setValueAtTime(.25,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g);g.connect(AC.destination);o.start(t0);o.stop(t0+d)}t0+=d});if(loop)tm=setTimeout(run,Math.max(100,(t0-AC.currentTime)*1000))};
run();stopFn=()=>{live=0;clearTimeout(tm)}}
function ringNow(id){$("ring").style.display="flex";playSnd(id,true);if(navigator.vibrate)navigator.vibrate([400,200,400]);try{if(Notification.permission==="granted")new Notification("⏰ Alarm")}catch(e){}}
$("stop").onclick=()=>{$("ring").style.display="none";stopSnd()};
const sel=(k,n,l)=>`<select style="flex:1" onchange="S.${k}=+this.value;save()">${R(n).map(i=>`<option value="${i}" ${S[k]===i?"selected":""}>${l} ${pad(i)}</option>`).join("")}</select>`;
function cus(){const wk=[1,2,3,4,5,6,0];return`<div class="chips">${wk.map((d,i)=>`<button class="chip ${S.cd.includes(d)?"on":""}" onclick="cdt(${d},this)">${new Date(2024,0,1+i).toLocaleDateString(loc(),{weekday:"short"})}</button>`).join("")}</div><div class="row">${sel("ch",24,t("hr"))}${sel("cm",60,t("mi"))}${sel("cs",60,t("se"))}</div>`}
function cdt(d,b){S.cd=S.cd.includes(d)?S.cd.filter(x=>x!==d):S.cd.concat(d);save();b.classList.toggle("on")}
function wl(){const pv=WL.find(x=>x.id===PV);
return`<div class="row sp"><span>${t("wall")}</span><label class="ib sm" aria-label="+">${PL}<input type="file" accept="image/*" hidden onchange="pw(this)"></label></div><div class="grid">${WL.map(w=>`<div class="th ${S.wp===w.id?"on":""}" style="background-image:url(${w.u})" onclick="PV='${w.id}';draw()"><button class="tr" onclick="event.stopPropagation();dw('${w.id}')" aria-label="delete">${TR}</button></div>`).join("")}</div>`+
(pv?`<div class="ph"><div class="w"><div class="wi" id="pwi"></div></div><b class="gt" style="position:absolute;left:12px;top:10px;font-size:13px">AryNotes</b><i style="top:34px;height:18px"></i><i style="top:92px;height:26px"></i><i style="top:124px;height:26px"></i><i style="top:156px;height:26px"></i><i style="bottom:8px;height:26px;border-radius:14px"></i></div>${sl("z",t("zoom"),100,300,pv)}${sl("x",t("posx"),0,100,pv)}${sl("y",t("posy"),0,100,pv)}<div class="row" style="margin-top:8px"><button class="btn" style="flex:1" onclick="S.wp=PV;PV=null;save();draw()">${t("use")}</button><button class="gh" onclick="PV=null;draw()">${t("cancel")}</button></div>`:"")+
`<button class="gh" style="width:100%;margin-top:10px" onclick="S.wp=null;PV=null;save();draw()">${t("reset")}</button>`}
function sett(c){const sw=["#6c8ebf","#8fae8b","#d4a373","#c98ba5","#8e7cc3","#5aa9a3"];
c.innerHTML=`<div class="cd row sp"><span>${t("lang")}</span><select onchange="S.lang=this.value;save();draw()"><option value="id" ${S.lang==="id"?"selected":""}>Indonesia</option><option value="en" ${S.lang==="en"?"selected":""}>English</option></select></div>
<div class="cd"><div style="margin-bottom:8px">${t("theme")}</div><div class="seg"><button class="gh ${S.theme==="light"?"on":""}" onclick="S.theme='light';save();draw()">${t("light")}</button><button class="gh ${S.theme==="dark"?"on":""}" onclick="S.theme='dark';save();draw()">${t("dark")}</button></div></div>
<div class="cd"><div style="margin-bottom:8px">${t("color")}</div><div class="row" style="flex-wrap:wrap">${sw.map(x=>`<button class="sw" style="background:${x}" onclick="S.ac='${x}';save();draw()"></button>`).join("")}<input type="color" value="${S.ac}" onchange="S.ac=this.value;save();draw()" style="width:34px;height:34px;border:0;padding:0;background:none"></div></div>
<div class="cd"><div style="margin-bottom:8px">${t("rem")}</div><select style="width:100%" onchange="S.rem=this.value;S.last=Date.now();save();notifyAsk();draw()">${["daily","weekly","custom"].map(k=>`<option value="${k}" ${S.rem===k?"selected":""}>${t(k)}</option>`).join("")}</select>${S.rem==="custom"?cus():""}</div>
<div class="cd">${wl()}</div>`;const pp=WL.find(x=>x.id===PV);if(pp)wsty($("pwi"),pp)}
function pw(e){const f=e.files[0];if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);const id="w"+Date.now();WL.push({id,u:c.toDataURL("image/jpeg",.7)});if(!sv("wl",WL))toast(t("nosave"));PV=id;draw()};im.src=URL.createObjectURL(f);e.value=""}
function dw(id){WL=WL.filter(x=>x.id!==id);sv("wl",WL);if(S.wp===id){S.wp=null;save()}if(PV===id)PV=null;draw()}
function notifyAsk(){try{if("Notification"in window&&Notification.permission==="default")Notification.requestPermission()}catch(e){}}
function toast(s){const e=$("toast");e.textContent=s;e.style.display="block";setTimeout(()=>e.style.display="none",5000);try{if(Notification.permission==="granted")new Notification("AryNotes",{body:s})}catch(x){}}
let ls="";setInterval(()=>{const n=new Date(),k=n.getHours()+":"+n.getMinutes()+":"+n.getSeconds();
if(k!==ls){ls=k;A.filter(a=>a.on&&a.h===n.getHours()&&a.m===n.getMinutes()&&a.s===n.getSeconds()).slice(0,1).forEach(a=>ringNow(a.snd));
const c=T.filter(x=>!x.d).length;if(c&&S.rem==="custom"&&S.cd.includes(n.getDay())&&S.ch===n.getHours()&&S.cm===n.getMinutes()&&S.cs===n.getSeconds())toast(t("remMsg")+" ("+c+")")}
const iv=S.rem==="daily"?864e5:S.rem==="weekly"?6048e5:0;
if(iv&&Date.now()-S.last>=iv){S.last=Date.now();save();const c=T.filter(x=>!x.d).length;if(c)toast(t("remMsg")+" ("+c+")")}
const ov=T.filter(x=>x.e&&!x.d&&!x.nt&&Date.now()>x.e);if(ov.length){ov.forEach(x=>x.nt=1);sv("tk",T);toast(t("late")+": "+ov.map(x=>x.n).join(", "));if($("lst"))lst()}
purge()},500);
draw();
