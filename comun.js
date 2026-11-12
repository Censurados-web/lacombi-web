/* La Combi · comportamiento común: menú, letras vivas y "la ruta" */
(function(){
  // Menú móvil
  var b=document.querySelector('.boton-menu'), m=document.querySelector('.menu');
  if(b&&m){b.addEventListener('click',function(){var a=m.classList.toggle('abierto');b.setAttribute('aria-expanded',a)});
    m.addEventListener('click',function(e){if(e.target.tagName==='A'){m.classList.remove('abierto')}})}

  // Letras «vivas»: cada letra un poco distinta (manual v6, p. 7)
  window.letrasVivas=function(el){
    if(!el||el.dataset.viva)return; el.dataset.viva=1; el.classList.add('viva');
    var t=el.textContent, seed=0; el.textContent='';
    t.split(' ').forEach(function(pal,k){
      if(k)el.appendChild(document.createTextNode(' '));
      var w=document.createElement('span'); w.className='pal';
      for(var i=0;i<pal.length;i++){seed=(seed*9301+49297+pal.charCodeAt(i)*7)%233280;
        var r=seed/233280, s=document.createElement('span'); s.textContent=pal[i];
        s.style.transform='translateY('+((r-.5)*0.08).toFixed(3)+'em) rotate('+((r-.5)*7).toFixed(1)+'deg)';
        w.appendChild(s)}
      el.appendChild(w)});
    el.setAttribute('aria-label',t);
  };
  document.querySelectorAll('[data-viva]').forEach(function(e){e.removeAttribute('data-viva');letrasVivas(e)});

  // La ruta: un camino de trazos (pastillas redondas) que entra por un borde y sale por otro.
  // G = 8,5 % del ancho de la pieza (aquí limitado para pantallas); trazo 1,9 G, hueco 0,9 G, curvas 2 G.
  var NS='http://www.w3.org/2000/svg', n=0;
  function forma(tipo,W,H,G){
    var r=2*G, m=1.3*G, o=G; // m: distancia al borde
    switch(tipo){
      case 'esquina': // entra por la izquierda abajo, sube por la derecha y sale por arriba
        return 'M'+(-o)+' '+(H-m)+' H'+(W-m-r)+' Q'+(W-m)+' '+(H-m)+' '+(W-m)+' '+(H-m-r)+' V'+(-o);
      case 'esquina-izq': // entra por arriba a la izquierda, baja y sale por la derecha abajo
        return 'M'+m+' '+(-o)+' V'+(H-m-r)+' Q'+m+' '+(H-m)+' '+(m+r)+' '+(H-m)+' H'+(W+o);
      case 'techo': // recorre el techo de la pieza
        return 'M'+(-o)+' '+m+' H'+(W+o);
      case 'suelo':
        return 'M'+(-o)+' '+(H-m)+' H'+(W+o);
      case 's': // baja por la derecha, cruza y sale por abajo a la izquierda
        var x1=W-m, x2=W*0.62, y=H*0.55;
        return 'M'+x1+' '+(-o)+' V'+(y-r)+' Q'+x1+' '+y+' '+(x1-r)+' '+y+' H'+(x2+r)+' Q'+x2+' '+y+' '+x2+' '+(y+r)+' V'+(H+o);
      case 'u': // entra por la izquierda arriba, baja, cruza el suelo y sale por la derecha arriba
        return 'M'+m+' '+(-o)+' V'+(H-m-r)+' Q'+m+' '+(H-m)+' '+(m+r)+' '+(H-m)+' H'+(W-m-r)+' Q'+(W-m)+' '+(H-m)+' '+(W-m)+' '+(H-m-r)+' V'+(-o);
    }
  }
  function dibujaRuta(sec){
    var tipo=sec.dataset.ruta, color=sec.dataset.rutaColor||'#fff';
    var old=sec.querySelector(':scope > svg.ruta'); if(old)old.remove();
    var W=sec.clientWidth, H=sec.clientHeight; if(!W||!H)return;
    if(W<720&&tipo!=='techo')tipo='suelo';
    var G=Math.max(26,Math.min(48,W*0.032)), w=0.42*G;
    var svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','ruta'); svg.setAttribute('aria-hidden','true');
    svg.setAttribute('width',W); svg.setAttribute('height',H); svg.style.left=0; svg.style.top=0;
    var id='rm'+(++n), d=forma(tipo,W,H,G);
    var mask=document.createElementNS(NS,'mask'); mask.setAttribute('id',id); mask.setAttribute('maskUnits','userSpaceOnUse');
    mask.setAttribute('x',-200);mask.setAttribute('y',-200);mask.setAttribute('width',W+400);mask.setAttribute('height',H+400);
    var mp=document.createElementNS(NS,'path'); mp.setAttribute('d',d); mp.setAttribute('stroke','#fff'); mp.setAttribute('stroke-width',w*2); mp.setAttribute('class','dibuja');
    mask.appendChild(mp); svg.appendChild(mask);
    var p=document.createElementNS(NS,'path'); p.setAttribute('d',d); p.setAttribute('stroke',color); p.setAttribute('stroke-width',w);
    p.setAttribute('stroke-dasharray',(1.9*G-w).toFixed(1)+' '+(0.9*G+w).toFixed(1)); p.setAttribute('mask','url(#'+id+')');
    svg.appendChild(p); sec.insertBefore(svg,sec.firstChild);
    var L=mp.getTotalLength(); mp.style.setProperty('--len',L);
    if(!('IntersectionObserver' in window)){mp.style.animation='none';mp.style.strokeDashoffset=0;return}
    mp.style.animationPlayState='paused';
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){mp.style.animationPlayState='running';io.disconnect()}})},{threshold:.25});
    io.observe(sec);
  }
  var secs=[].slice.call(document.querySelectorAll('[data-ruta]'));
  function todas(){secs.forEach(dibujaRuta)}
  window.addEventListener('load',todas);
  var t; window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(todas,250)});
  if(document.readyState==='complete')todas();
})();
