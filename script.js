// ===== HERO SLIDER =====
(function(){
  const slider = document.querySelector('.hero-slider');
  if(!slider) return;

  const track  = slider.querySelector('.slider-track');
  const slides = Array.from(track.children || []);
  const prev   = slider.querySelector('.prev');
  const next   = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.dots');

  if (!track || slides.length === 0 || !prev || !next || !dotsWrap) return;

  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label','go to slide '+(i+1));
    if(i===0) b.classList.add('active');
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  let index = 0, direction = 1, autoTimer = null;
  let isDragging = false, startX = 0, currentX = 0, delta = 0;
  const DRAG_THRESHOLD=60, AUTO_DURATION=2500, EASE='cubic-bezier(.22,1,.36,1)';
  slides.forEach(s=>s.querySelectorAll('img').forEach(img=>img.setAttribute('draggable','false')));

  function update(){
    track.style.transform=`translateX(${-index*100}%)`;
    dots.forEach((d,i)=>d.classList.toggle('active',i===index));
  }
  function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
  function go(i,{setDir}={}){ 
    const n=clamp(i,0,slides.length-1); 
    if(setDir&&n!==index){direction=n>index?1:-1}
    index=n; 
    track.style.transition=`transform .6s ${EASE}`;
    update(); 
    restartAuto(); 
  }
  function autoSlide(){ 
    if(index===slides.length-1) direction=-1; 
    else if(index===0) direction=1; 
    index+=direction; 
    track.style.transition=`transform .6s ${EASE}`; 
    update(); 
  }
  function startAuto(){ if(!autoTimer) autoTimer=setInterval(autoSlide,AUTO_DURATION); }
  function stopAuto(){ if(autoTimer){ clearInterval(autoTimer); autoTimer=null; } }
  function restartAuto(){ stopAuto(); startAuto(); }
  startAuto();

  next.addEventListener('click', ()=>{direction=1;autoSlide();});
  prev.addEventListener('click', ()=>{direction=-1;autoSlide();});
  dots.forEach((d,i)=>d.addEventListener('click',()=>go(i,{setDir:true})));

  const onDown=(x,ev)=>{
    if(ev&&ev.target&&ev.target.closest('a')) return;
    isDragging=true; startX=currentX=x; delta=0; stopAuto();
    track.style.transition='none'; slider.classList.add('dragging');
    if(ev&&ev.preventDefault) ev.preventDefault();
  };
  const onMove=(x)=>{
    if(!isDragging) return;
    currentX=x; delta=currentX-startX;
    let percent=(delta/slider.clientWidth)*100;
    if((index===0&&percent>0)||(index===slides.length-1&&percent<0)){ percent*=0.35; }
    track.style.transform=`translateX(calc(${-index*100}% + ${percent}%))`;
  };
  const onUp=()=>{
    if(!isDragging) return;
    isDragging=false; slider.classList.remove('dragging');
    track.style.transition=`transform .6s ${EASE}`;
    if(Math.abs(delta)>DRAG_THRESHOLD){
      if(delta<0){direction=1;autoSlide();}
      else {direction=-1;autoSlide();}
    } else {
      update(); startAuto();
    }
    delta=0;
  };

  slider.addEventListener('mousedown', e=>onDown(e.clientX,e));
  window.addEventListener('mousemove', e=>onMove(e.clientX));
  window.addEventListener('mouseup', onUp);
  window.addEventListener('mouseleave', onUp);
  slider.addEventListener('touchstart', e=>onDown(e.touches[0].clientX,e), {passive:false});
  slider.addEventListener('touchmove',  e=>onMove(e.touches[0].clientX),  {passive:true});
  slider.addEventListener('touchend', onUp);
  slider.addEventListener('touchcancel', onUp);

  window.addEventListener('keydown', e=>{
    if(e.key==='ArrowRight'){direction=1;autoSlide();}
    if(e.key==='ArrowLeft'){direction=-1;autoSlide();}
  });
  window.addEventListener('resize', ()=>{
    track.style.transition='none'; update();
    requestAnimationFrame(()=>{ track.style.transition=`transform .6s ${EASE}`; });
  });

  update();
})();

// ===== Featured Thumbs Switch (ถ้ายังไม่มี section นี้ จะข้าม) =====
(function(){
  const fvPlayerWrap = document.getElementById('fvPlayer');
  const thumbsWrap   = document.getElementById('fvThumbs');
  const sec          = document.getElementById('featured');

  if (sec){
    sec.style.opacity=0; sec.style.transform='translateY(16px)';
    const io=new IntersectionObserver(es=>{
      es.forEach(e=>{
        if(e.isIntersecting){
          sec.style.transition='opacity .5s ease, transform .5s ease';
          sec.style.opacity=1; sec.style.transform='none'; io.disconnect();
        }
      })
    },{threshold:.15});
    io.observe(sec);
  }

  if (!fvPlayerWrap || !thumbsWrap) return;

  const player = fvPlayerWrap.querySelector('iframe');
  const thumbs = Array.from(thumbsWrap.querySelectorAll('.thumb'));
  const title  = document.querySelector('.fv-title');
  const desc   = document.querySelector('.fv-desc');
  const eye    = document.querySelector('.fv-eyebrow');

  thumbs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      thumbs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const src=btn.dataset.src, t=btn.dataset.title||'', d=btn.dataset.desc||'', e=btn.dataset.eyebrow||'';
      if(src&&player) player.src=src;
      if(title) title.textContent=t;
      if(desc)  desc.textContent=d;
      if(eye)   eye.textContent=e;
    });
  });
})();

// ===== Product Index active state =====
(function(){
  const list=document.getElementById('piList');
  if(!list) return;
  list.addEventListener('click', e=>{
    const a=e.target.closest('a'); if(!a) return;
    list.querySelectorAll('li').forEach(li=>li.classList.remove('active'));
    a.parentElement.classList.add('active');
  });
})();
// ===== Product detail switch (left list -> right content) =====
(function(){
  const list = document.getElementById('piList');
  const img  = document.getElementById('piImage');
  const name = document.getElementById('piName');
  const desc = document.getElementById('piDesc');
  const cta  = document.getElementById('piCta');
  if(!list || !img || !name || !desc || !cta) return;

  // กำหนดข้อมูลของแต่ละรายการ (แก้ชื่อไฟล์/ข้อความได้ตามจริง)
  const PRODUCTS = {
    blueprint: {
      title: 'Acoustic design & prediction software',
      desc : 'Blueprint AV™ helps you design, simulate, and verify networked audio systems with precision and speed.',
      img  : 'img/IMG_1102.JPG',
      link : '#'
    },
    eSeries: {
      title: 'Flagship touring performance',
      desc : 'The E-Series delivers uncompromising SPL, coverage, and reliability for large-scale touring.',
      img  : 'img/IMG_1103.JPG',
      link : '#'
    },
    csSeries: {
      title: 'Networked amplifiers with Milan-AVB',
      desc : 'CS-Series brings integrated DSP, networking, and redundancy for modern installations.',
      img  : 'img/IMG_1108.JPG',
      link : '#'
    },
    sSeries: {
      title: 'Class leading SPL in a compact design',
      desc : 'S-Series solves consistent coverage with excellent power out of a sub-compact system.',
      img  : 'img/IMG_1102.JPG',
      link : '#'
    },
    isSeries: {
      title: 'Installation focused, discreet look',
      desc : 'IS-Series provides the same acoustic DNA with an architecture-friendly enclosure.',
      img  : 'img/IMG_1103.JPG',
      link : '#'
    },
    pointSeries: {
      title: 'Point source versatility',
      desc : 'Point Series covers near-field to medium-throw applications with clarity and output.',
      img  : 'img/IMG_1108.JPG',
      link : '#'
    },
    mSeries: {
      title: 'Monitor reference on stage',
      desc : 'M-Series stage monitors offer power, stability, and translation for demanding artists.',
      img  : 'img/IMG_1102.JPG',
      link : '#'
    }
  };

  function setDetail(key){
    const d = PRODUCTS[key]; if(!d) return;
    // ถ้ารูปไม่พบ ให้คงรูปเดิม
    if (d.img) img.src = d.img;
    name.textContent = d.title || '';
    desc.textContent = d.desc || '';
    cta.href = d.link || '#';
  }

  // คลิกรายการซ้ายเพื่อสลับรายละเอียดฝั่งขวา
  list.addEventListener('click', (e)=>{
    const a = e.target.closest('a'); if(!a) return;
    e.preventDefault();
    list.querySelectorAll('li').forEach(li=>li.classList.remove('active'));
    a.parentElement.classList.add('active');
    const key = a.dataset.key;
    setDetail(key);
  });

  // ค่าเริ่มต้น (อิงจากรายการที่ active)
  const first = list.querySelector('a[data-key].active') || list.querySelector('a[data-key]');
  setDetail((first && first.dataset.key) || 'sSeries');
})();
