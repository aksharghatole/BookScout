(() => {
'use strict';
const root=document.documentElement,select=document.getElementById('theme'),media=matchMedia('(prefers-color-scheme: dark)'),allowed=['system','light','dark'];
let setting='system';try{const value=localStorage.getItem('bookscout-theme');if(allowed.includes(value))setting=value;}catch{}
select.value=setting;
function apply(){const dark=setting==='dark'||(setting==='system'&&media.matches);root.dataset.theme=dark?'dark':'light';document.querySelector('meta[name="theme-color"]').content=dark?'#18211d':'#f5f2ec';}
select.addEventListener('change',()=>{setting=allowed.includes(select.value)?select.value:'system';try{localStorage.setItem('bookscout-theme',setting)}catch{}apply();});
media.addEventListener('change',apply);apply();
})();
