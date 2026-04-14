# ASODICOM
Es el repositorio de una organización social que desea generar una web y posteriormente una app
# ASODICOM
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ASODICOM — Asociación de Diálogo Comunitario</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    /* ═══════════════════════════════════════════════
       VARIABLES Y RESET
    ═══════════════════════════════════════════════ */
    :root {
      --rojo:       #c91618;
      --vino:       #861723;
      --rojo-medio: #cd2526;
      --salmon:     #ef8079;
      --negro:      #000000;
      --gris-oscuro:#383837;
      --gris-azul:  #2d2f3a;
      --blanco:     #ffffff;
      --gris-claro: #f5f5f5;
      --gris-medio: #e8e8e8;
      --font-head:  'Oswald', sans-serif;
      --font-body:  'Crimson Pro', serif;
      --font-mono:  'Space Mono', monospace;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      font-size: 18px;
      color: var(--negro);
      background: var(--blanco);
      overflow-x: hidden;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }
    ul { list-style: none; }

    /* ═══════════════════════════════════════════════
       UTILIDADES
    ═══════════════════════════════════════════════ */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    .section-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--rojo);
      margin-bottom: 0.75rem;
      display: block;
    }
    .section-title {
      font-family: var(--font-head);
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .section-title .accent { color: var(--rojo); }
    .divider {
      width: 60px;
      height: 4px;
      background: var(--rojo);
      margin: 1.5rem 0;
    }
    .btn {
      display: inline-block;
      font-family: var(--font-head);
      font-weight: 600;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.9rem 2.2rem;
      cursor: pointer;
      transition: all 0.25s ease;
      border: none;
    }
    .btn-primary {
      background: var(--rojo);
      color: var(--blanco);
    }
    .btn-primary:hover { background: var(--vino); transform: translateY(-2px); }
    .btn-outline {
      background: transparent;
      color: var(--blanco);
      border: 2px solid var(--blanco);
    }
    .btn-outline:hover { background: var(--blanco); color: var(--negro); }
    .btn-dark {
      background: var(--negro);
      color: var(--blanco);
    }
    .btn-dark:hover { background: var(--gris-azul); transform: translateY(-2px); }

    /* ═══════════════════════════════════════════════
       SVG LOGO
    ═══════════════════════════════════════════════ */
    .logo-svg { display: inline-flex; align-items: center; gap: 0.6rem; }
    .logo-svg svg { width: 36px; height: 36px; }
    .logo-wordmark {
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 1.4rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .logo-slogan {
      font-family: var(--font-body);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.75;
      display: block;
      line-height: 1;
      margin-top: 1px;
    }

    /* ═══════════════════════════════════════════════
       NAVEGACIÓN
    ═══════════════════════════════════════════════ */
    #nav {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 1000;
      background: var(--negro);
      border-bottom: 3px solid var(--rojo);
      transition: all 0.3s ease;
    }
    #nav.scrolled {
      background: rgba(0,0,0,0.97);
      box-shadow: 0 4px 30px rgba(201,22,24,0.2);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .nav-logo { color: var(--blanco); }
    .nav-menu {
      display: flex;
      gap: 0.1rem;
      align-items: center;
    }
    .nav-menu a {
      font-family: var(--font-head);
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.7);
      padding: 0.5rem 0.75rem;
      transition: color 0.2s;
      white-space: nowrap;
    }
    .nav-menu a:hover { color: var(--salmon); }
    .nav-menu .nav-cta {
      background: var(--rojo);
      color: var(--blanco);
      padding: 0.5rem 1.2rem;
      margin-left: 0.5rem;
    }
    .nav-menu .nav-cta:hover { background: var(--vino); color: var(--blanco); }
    .nav-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 0.5rem;
    }
    .nav-toggle span {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--blanco);
      transition: all 0.3s;
    }

    /* ═══════════════════════════════════════════════
       HERO
    ═══════════════════════════════════════════════ */
    #hero {
      min-height: 100vh;
      background: var(--negro);
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
      overflow: hidden;
      padding-top: 70px;
    }
    .hero-bg-pattern {
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 59px,
          rgba(201,22,24,0.06) 59px,
          rgba(201,22,24,0.06) 60px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 59px,
          rgba(201,22,24,0.06) 59px,
          rgba(201,22,24,0.06) 60px
        );
      pointer-events: none;
    }
    .hero-red-bar {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 50%;
      background: var(--rojo);
      clip-path: polygon(0 0, 90% 0, 100% 100%, 0 100%);
      opacity: 0.08;
    }
    .hero-content {
      grid-column: 1 / 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 6rem 3rem 6rem 4rem;
      position: relative;
      z-index: 2;
    }
    .hero-eyebrow {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.3em;
      color: var(--salmon);
      text-transform: uppercase;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .hero-eyebrow::before {
      content: '';
      width: 40px;
      height: 2px;
      background: var(--rojo);
    }
    .hero-title {
      font-family: var(--font-head);
      font-size: clamp(3rem, 6vw, 5.5rem);
      font-weight: 700;
      color: var(--blanco);
      text-transform: uppercase;
      line-height: 0.95;
      letter-spacing: 0.02em;
      margin-bottom: 1rem;
    }
    .hero-title em {
      font-style: normal;
      color: var(--rojo);
      display: block;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.7;
      max-width: 480px;
      margin-bottom: 2.5rem;
      font-weight: 300;
    }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
    .hero-visual {
      grid-column: 2 / 3;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
    }
    .hero-circles {
      position: relative;
      width: 460px;
      height: 460px;
    }
    .hero-circles svg {
      width: 100%;
      height: 100%;
      animation: rotateCircles 20s linear infinite;
    }
    @keyframes rotateCircles {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .hero-stat-badge {
      position: absolute;
      background: var(--rojo);
      color: var(--blanco);
      padding: 1rem 1.5rem;
      font-family: var(--font-head);
    }
    .hero-stat-badge .num {
      font-size: 2.2rem;
      font-weight: 700;
      display: block;
      line-height: 1;
    }
    .hero-stat-badge .lbl {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      opacity: 0.9;
    }
    .hero-stat-badge:nth-child(2) { top: 10%; right: -5%; }
    .hero-stat-badge:nth-child(3) { bottom: 18%; left: -2%; background: var(--gris-azul); }
    .hero-stat-badge:nth-child(4) { bottom: 38%; right: -8%; background: var(--vino); }
    .hero-scroll {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255,255,255,0.4);
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .hero-scroll-line {
      width: 1px;
      height: 50px;
      background: linear-gradient(to bottom, var(--rojo), transparent);
      animation: scrollPulse 2s ease-in-out infinite;
    }
    @keyframes scrollPulse {
      0%, 100% { opacity: 0.4; transform: scaleY(1); }
      50% { opacity: 1; transform: scaleY(1.2); }
    }

    /* ═══════════════════════════════════════════════
       SECCIÓN: QUIÉNES SOMOS
    ═══════════════════════════════════════════════ */
    #quienes {
      padding: 7rem 0;
      background: var(--blanco);
    }
    .quienes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      align-items: start;
    }
    .quienes-intro p {
      line-height: 1.8;
      color: var(--gris-oscuro);
      margin-bottom: 1.2rem;
      font-size: 1.05rem;
    }
    .mvv-cards {
      display: grid;
      gap: 1px;
      background: var(--gris-medio);
      border: 1px solid var(--gris-medio);
    }
    .mvv-card {
      background: var(--blanco);
      padding: 2rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    .mvv-card:hover { transform: translateX(6px); }
    .mvv-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: var(--rojo);
    }
    .mvv-card h3 {
      font-family: var(--font-head);
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--rojo);
      margin-bottom: 0.75rem;
    }
    .mvv-card p { font-size: 0.95rem; line-height: 1.7; color: var(--gris-oscuro); }
    .valores-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .valor-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: var(--font-head);
      font-size: 0.82rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--gris-oscuro);
    }
    .valor-dot {
      width: 8px;
      height: 8px;
      background: var(--rojo);
      flex-shrink: 0;
    }

    /* ═══════════════════════════════════════════════
       SECCIÓN: EQUIPO
    ═══════════════════════════════════════════════ */
    #equipo {
      padding: 7rem 0;
      background: var(--gris-azul);
    }
    #equipo .section-title { color: var(--blanco); }
    #equipo .divider { background: var(--rojo); }
    .equipo-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .equipo-card {
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .equipo-card-inner {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 2rem 1.5rem;
      transition: all 0.3s ease;
      height: 100%;
    }
    .equipo-card:hover .equipo-card-inner {
      background: var(--rojo);
      border-color: var(--rojo);
      transform: translateY(-6px);
    }
    .equipo-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--rojo);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-head);
      font-size: 1.6rem;
      color: var(--blanco);
      margin-bottom: 1.2rem;
      transition: background 0.3s;
    }
    .equipo-card:hover .equipo-avatar { background: rgba(255,255,255,0.2); }
    .equipo-card h3 {
      font-family: var(--font-head);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--blanco);
      margin-bottom: 0.3rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .equipo-card .rol {
      font-size: 0.8rem;
      color: var(--salmon);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: var(--font-mono);
      transition: color 0.3s;
    }
    .equipo-card:hover .rol { color: rgba(255,255,255,0.8); }
    .equipo-card p {
      font-size: 0.88rem;
      color: rgba(255,255,255,0.6);
      margin-top: 0.75rem;
      line-height: 1.6;
      transition: color 0.3s;
    }
    .equipo-card:hover p { color: rgba(255,255,255,0.9); }

    /* ═══════════════════════════════════════════════
       SECCIÓN: LÍNEAS DE ACCIÓN
    ═══════════════════════════════════════════════ */
    #lineas {
      padding: 7rem 0;
      background: var(--blanco);
    }
    .lineas-tabs {
      display: flex;
      gap: 0;
      border-bottom: 2px solid var(--gris-medio);
      margin-bottom: 3rem;
      overflow-x: auto;
    }
    .linea-tab {
      font-family: var(--font-head);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 1rem 1.5rem;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      color: var(--gris-oscuro);
      transition: all 0.2s;
      white-space: nowrap;
      background: none;
      border-top: none;
      border-left: none;
      border-right: none;
    }
    .linea-tab.active, .linea-tab:hover {
      color: var(--rojo);
      border-bottom-color: var(--rojo);
    }
    .linea-panel { display: none; }
    .linea-panel.active { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
    .linea-panel-text h3 {
      font-family: var(--font-head);
      font-size: 1.8rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .linea-panel-text p { line-height: 1.8; color: var(--gris-oscuro); margin-bottom: 1rem; font-size: 1rem; }
    .metodologia-list { margin-top: 1.5rem; }
    .metodologia-list li {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gris-medio);
      font-size: 0.95rem;
      color: var(--gris-oscuro);
    }
    .metodologia-list li::before {
      content: '→';
      color: var(--rojo);
      font-family: var(--font-mono);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .proyectos-list { display: flex; flex-direction: column; gap: 1rem; }
    .proyecto-item {
      border-left: 4px solid var(--gris-medio);
      padding: 1rem 1.25rem;
      transition: border-color 0.2s;
    }
    .proyecto-item:hover { border-left-color: var(--rojo); }
    .proyecto-item .status {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 0.4rem;
    }
    .status-active { color: #2a9d6b; }
    .status-done { color: var(--gris-oscuro); }
    .proyecto-item h4 {
      font-family: var(--font-head);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
    }
    .proyecto-item p { font-size: 0.88rem; color: var(--gris-oscuro); line-height: 1.5; }

    /* ═══════════════════════════════════════════════
       SECCIÓN: IMPACTO (NÚMEROS)
    ═══════════════════════════════════════════════ */
    #impacto {
      padding: 7rem 0;
      background: var(--rojo);
      position: relative;
      overflow: hidden;
    }
    .impacto-bg {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 30px,
        rgba(0,0,0,0.04) 30px,
        rgba(0,0,0,0.04) 31px
      );
    }
    #impacto .section-title { color: var(--blanco); }
    #impacto .section-label { color: rgba(255,255,255,0.7); }
    #impacto .divider { background: rgba(255,255,255,0.4); }
    .impacto-header { position: relative; z-index: 2; margin-bottom: 4rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      background: rgba(0,0,0,0.1);
      position: relative;
      z-index: 2;
    }
    .stat-box {
      background: rgba(0,0,0,0.15);
      padding: 3rem 2rem;
      text-align: center;
      transition: background 0.3s;
    }
    .stat-box:hover { background: rgba(0,0,0,0.3); }
    .stat-num {
      font-family: var(--font-head);
      font-size: clamp(3rem, 5vw, 4.5rem);
      font-weight: 700;
      color: var(--blanco);
      line-height: 1;
      display: block;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.75);
    }
    .casos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 4rem;
      position: relative;
      z-index: 2;
    }
    .caso-card {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      padding: 2rem;
      transition: all 0.3s;
    }
    .caso-card:hover { background: rgba(255,255,255,0.18); transform: translateY(-4px); }
    .caso-card .icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .caso-card h3 {
      font-family: var(--font-head);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--blanco);
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }
    .caso-card p { font-size: 0.92rem; color: rgba(255,255,255,0.8); line-height: 1.7; }

    /* ═══════════════════════════════════════════════
       SECCIÓN: INCIDENCIA
    ═══════════════════════════════════════════════ */
    #incidencia {
      padding: 7rem 0;
      background: var(--gris-claro);
    }
    .incidencia-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 4rem;
      align-items: start;
    }
    .docs-list { display: flex; flex-direction: column; gap: 1px; background: var(--gris-medio); }
    .doc-item {
      background: var(--blanco);
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      cursor: pointer;
      transition: all 0.2s;
    }
    .doc-item:hover { background: var(--negro); color: var(--blanco); }
    .doc-item:hover .doc-tipo { color: var(--salmon); }
    .doc-item:hover .doc-title { color: var(--blanco); }
    .doc-icon {
      width: 42px;
      height: 42px;
      background: var(--rojo);
      color: var(--blanco);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .doc-tipo {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--rojo);
      margin-bottom: 0.25rem;
    }
    .doc-title {
      font-family: var(--font-head);
      font-size: 0.95rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .doc-date { font-size: 0.8rem; color: rgba(0,0,0,0.4); margin-top: 0.2rem; }
    .redes-section { margin-top: 3rem; }
    .redes-section h3 {
      font-family: var(--font-head);
      font-size: 1.3rem;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }
    .redes-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .red-tag {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.5rem 1rem;
      border: 1px solid var(--gris-oscuro);
      cursor: pointer;
      transition: all 0.2s;
    }
    .red-tag:hover { background: var(--rojo); color: var(--blanco); border-color: var(--rojo); }

    /* ═══════════════════════════════════════════════
       SECCIÓN: TRANSPARENCIA
    ═══════════════════════════════════════════════ */
    #transparencia {
      padding: 7rem 0;
      background: var(--negro);
    }
    #transparencia .section-title { color: var(--blanco); }
    #transparencia .section-label { color: var(--salmon); }
    .transparencia-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .transparencia-card {
      border: 1px solid rgba(255,255,255,0.1);
      padding: 2.5rem 2rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
    }
    .transparencia-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--rojo);
    }
    .transparencia-card:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); }
    .transparencia-card .tc-num {
      font-family: var(--font-head);
      font-size: 3.5rem;
      font-weight: 700;
      color: rgba(201,22,24,0.2);
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .transparencia-card h3 {
      font-family: var(--font-head);
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--blanco);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.75rem;
    }
    .transparencia-card p { font-size: 0.9rem; color: rgba(255,255,255,0.55); line-height: 1.7; }
    .aliados-section { margin-top: 4rem; padding-top: 3rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .aliados-section h3 {
      font-family: var(--font-head);
      font-size: 1.2rem;
      color: var(--blanco);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2rem;
    }
    .aliados-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1px;
      background: rgba(255,255,255,0.08);
    }
    .aliado-item {
      background: rgba(255,255,255,0.03);
      padding: 1.5rem;
      text-align: center;
      transition: background 0.2s;
    }
    .aliado-item:hover { background: rgba(201,22,24,0.15); }
    .aliado-item span {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
    }

    /* ═══════════════════════════════════════════════
       SECCIÓN: PARTICIPACIÓN
    ═══════════════════════════════════════════════ */
    #participacion {
      padding: 7rem 0;
      background: var(--blanco);
    }
    .participacion-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2rem;
      margin-top: 3rem;
    }
    .participa-card {
      border: 2px solid var(--gris-medio);
      padding: 2.5rem 2rem;
      transition: all 0.3s;
      position: relative;
    }
    .participa-card:hover { border-color: var(--rojo); }
    .participa-card .card-num {
      font-family: var(--font-head);
      font-size: 4rem;
      font-weight: 700;
      color: var(--gris-medio);
      line-height: 1;
      position: absolute;
      top: 1rem;
      right: 1.5rem;
      transition: color 0.3s;
    }
    .participa-card:hover .card-num { color: rgba(201,22,24,0.15); }
    .participa-card h3 {
      font-family: var(--font-head);
      font-size: 1.3rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      position: relative;
    }
    .participa-card p { font-size: 0.95rem; line-height: 1.7; color: var(--gris-oscuro); margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gris-oscuro);
      margin-bottom: 0.4rem;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--gris-medio);
      border-radius: 0;
      font-family: var(--font-body);
      font-size: 0.9rem;
      background: var(--gris-claro);
      transition: border-color 0.2s;
      outline: none;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: var(--rojo);
      background: var(--blanco);
    }
    .convocatorias-list { display: flex; flex-direction: column; gap: 1rem; }
    .convocatoria-item {
      background: var(--gris-claro);
      padding: 1.25rem;
      border-left: 4px solid var(--rojo);
      transition: transform 0.2s;
    }
    .convocatoria-item:hover { transform: translateX(4px); }
    .convocatoria-item .fecha {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      color: var(--rojo);
      text-transform: uppercase;
      margin-bottom: 0.3rem;
    }
    .convocatoria-item h4 {
      font-family: var(--font-head);
      font-size: 0.95rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }
    .convocatoria-item p { font-size: 0.82rem; color: var(--gris-oscuro); }

    /* ═══════════════════════════════════════════════
       SECCIÓN: DONACIONES
    ═══════════════════════════════════════════════ */
    #donaciones {
      padding: 7rem 0;
      background: var(--rojo);
      position: relative;
      overflow: hidden;
    }
    .donaciones-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--vino) 0%, var(--rojo) 50%, var(--rojo-medio) 100%);
    }
    #donaciones .section-title { color: var(--blanco); position: relative; z-index: 2; }
    #donaciones .section-label { color: rgba(255,255,255,0.7); position: relative; z-index: 2; }
    #donaciones .divider { background: rgba(255,255,255,0.4); position: relative; z-index: 2; }
    .donaciones-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .donaciones-texto p { color: rgba(255,255,255,0.85); line-height: 1.8; margin-bottom: 1rem; font-size: 1.05rem; }
    .donaciones-opciones { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
    .donacion-opcion {
      background: rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .donacion-opcion:hover, .donacion-opcion.selected {
      background: rgba(0,0,0,0.3);
      border-color: var(--blanco);
    }
    .donacion-opcion h4 {
      font-family: var(--font-head);
      font-size: 1rem;
      color: var(--blanco);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .donacion-opcion p { font-size: 0.85rem; color: rgba(255,255,255,0.65); margin-top: 0.3rem; }
    .qr-box {
      background: var(--blanco);
      padding: 2.5rem;
      text-align: center;
    }
    .qr-placeholder {
      width: 180px;
      height: 180px;
      background: var(--gris-claro);
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--gris-oscuro);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 2px dashed var(--gris-medio);
    }
    .qr-box h3 {
      font-family: var(--font-head);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--negro);
      text-transform: uppercase;
    }
    .qr-box p { font-size: 0.85rem; color: var(--gris-oscuro); margin-top: 0.4rem; }

    /* ═══════════════════════════════════════════════
       SECCIÓN: REPOSITORIO
    ═══════════════════════════════════════════════ */
    #repositorio {
      padding: 7rem 0;
      background: var(--gris-claro);
    }
    .repo-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .repo-card {
      background: var(--blanco);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
    }
    .repo-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
    .repo-card-header {
      height: 8px;
      background: var(--rojo);
    }
    .repo-card.tipo-blog .repo-card-header { background: var(--gris-azul); }
    .repo-card.tipo-video .repo-card-header { background: var(--vino); }
    .repo-card-body { padding: 1.75rem; }
    .repo-tipo {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--rojo);
      margin-bottom: 0.6rem;
    }
    .repo-card.tipo-blog .repo-tipo { color: var(--gris-azul); }
    .repo-card.tipo-video .repo-tipo { color: var(--vino); }
    .repo-card h3 {
      font-family: var(--font-head);
      font-size: 1.05rem;
      font-weight: 600;
      text-transform: uppercase;
      line-height: 1.3;
      margin-bottom: 0.6rem;
    }
    .repo-card p { font-size: 0.88rem; color: var(--gris-oscuro); line-height: 1.6; }
    .repo-card-footer {
      padding: 1rem 1.75rem;
      border-top: 1px solid var(--gris-medio);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.4);
    }
    .repo-card-footer a {
      color: var(--rojo);
      font-weight: 700;
    }

    /* ═══════════════════════════════════════════════
       SECCIÓN: NOTICIAS
    ═══════════════════════════════════════════════ */
    #noticias {
      padding: 7rem 0;
      background: var(--blanco);
    }
    .noticias-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 3rem;
      margin-top: 3rem;
    }
    .noticia-featured {
      cursor: pointer;
      overflow: hidden;
    }
    .noticia-featured-img {
      height: 320px;
      background: var(--gris-azul);
      position: relative;
      overflow: hidden;
    }
    .noticia-featured-img-inner {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--gris-azul) 0%, var(--negro) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s ease;
    }
    .noticia-featured:hover .noticia-featured-img-inner { transform: scale(1.04); }
    .noticia-featured-img .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
    }
    .noticia-categoria {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      background: var(--rojo);
      color: var(--blanco);
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.3rem 0.8rem;
    }
    .noticia-featured-body { padding: 1.75rem 0; }
    .noticia-fecha {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--rojo);
      margin-bottom: 0.6rem;
    }
    .noticia-featured h2 {
      font-family: var(--font-head);
      font-size: 1.6rem;
      font-weight: 700;
      text-transform: uppercase;
      line-height: 1.2;
      margin-bottom: 0.75rem;
    }
    .noticia-featured p { font-size: 1rem; color: var(--gris-oscuro); line-height: 1.7; }
    .noticias-sidebar { display: flex; flex-direction: column; gap: 0; }
    .noticia-mini {
      padding: 1.25rem 0;
      border-bottom: 1px solid var(--gris-medio);
      cursor: pointer;
      transition: padding-left 0.2s;
    }
    .noticia-mini:hover { padding-left: 0.5rem; }
    .noticia-mini:first-child { padding-top: 0; }
    .noticia-mini .fecha {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--rojo);
      margin-bottom: 0.3rem;
    }
    .noticia-mini h4 {
      font-family: var(--font-head);
      font-size: 0.92rem;
      font-weight: 600;
      text-transform: uppercase;
      line-height: 1.3;
      margin-bottom: 0.25rem;
    }
    .noticia-mini p { font-size: 0.82rem; color: var(--gris-oscuro); line-height: 1.5; }
    .agenda-section { margin-top: 4rem; }
    .agenda-section h3 {
      font-family: var(--font-head);
      font-size: 1.5rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }
    .agenda-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .evento-card {
      border: 1px solid var(--gris-medio);
      display: flex;
      overflow: hidden;
      transition: border-color 0.2s;
      cursor: pointer;
    }
    .evento-card:hover { border-color: var(--rojo); }
    .evento-fecha-box {
      background: var(--rojo);
      color: var(--blanco);
      padding: 1rem;
      min-width: 70px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .evento-fecha-box .dia {
      font-family: var(--font-head);
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }
    .evento-fecha-box .mes {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .evento-body { padding: 1rem; }
    .evento-body h4 {
      font-family: var(--font-head);
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.3rem;
    }
    .evento-body p { font-size: 0.8rem; color: var(--gris-oscuro); }

    /* ═══════════════════════════════════════════════
       SECCIÓN: CONTACTO
    ═══════════════════════════════════════════════ */
    #contacto {
      padding: 7rem 0 0;
      background: var(--negro);
    }
    #contacto .section-title { color: var(--blanco); }
    #contacto .section-label { color: var(--salmon); }
    .contacto-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      margin-top: 3rem;
    }
    .contacto-info-item {
      display: flex;
      gap: 1.2rem;
      margin-bottom: 2rem;
      align-items: flex-start;
    }
    .contacto-icon {
      width: 44px;
      height: 44px;
      background: var(--rojo);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.2rem;
    }
    .contacto-info-item h4 {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin-bottom: 0.25rem;
    }
    .contacto-info-item p { color: var(--blanco); font-size: 0.95rem; }
    .social-links { display: flex; gap: 0.75rem; margin-top: 2rem; }
    .social-link {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--blanco);
      transition: all 0.2s;
      cursor: pointer;
    }
    .social-link:hover { background: var(--rojo); border-color: var(--rojo); }
    .contacto-form .form-group label { color: rgba(255,255,255,0.5); }
    .contacto-form .form-group input,
    .contacto-form .form-group textarea,
    .contacto-form .form-group select {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.1);
      color: var(--blanco);
    }
    .contacto-form .form-group input:focus,
    .contacto-form .form-group textarea:focus {
      border-color: var(--rojo);
      background: rgba(255,255,255,0.08);
    }
    .contacto-form .form-group input::placeholder { color: rgba(255,255,255,0.25); }
    .contacto-form .form-group textarea::placeholder { color: rgba(255,255,255,0.25); }

    /* ═══════════════════════════════════════════════
       FOOTER
    ═══════════════════════════════════════════════ */
    footer {
      background: var(--negro);
      border-top: 3px solid var(--rojo);
      padding: 3rem 0;
      margin-top: 5rem;
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }
    .footer-brand .logo-wordmark { color: var(--blanco); font-size: 1.2rem; }
    .footer-brand .logo-slogan { color: rgba(255,255,255,0.4); }
    .footer-brand p {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.45);
      line-height: 1.7;
      margin-top: 1rem;
      max-width: 280px;
    }
    .footer-col h4 {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin-bottom: 1rem;
    }
    .footer-col ul li {
      margin-bottom: 0.5rem;
    }
    .footer-col ul li a {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.6);
      transition: color 0.2s;
    }
    .footer-col ul li a:hover { color: var(--salmon); }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-bottom p {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
    }
    .footer-bottom span { color: var(--rojo); }

    /* ═══════════════════════════════════════════════
       RESPONSIVE
    ═══════════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .equipo-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-inner { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      #hero { grid-template-columns: 1fr; }
      .hero-visual { display: none; }
      .hero-content { padding: 4rem 1.5rem; }
      .quienes-grid { grid-template-columns: 1fr; gap: 2.5rem; }
      .incidencia-grid { grid-template-columns: 1fr; }
      .donaciones-inner { grid-template-columns: 1fr; }
      .participacion-grid { grid-template-columns: 1fr; }
      .noticias-layout { grid-template-columns: 1fr; }
      .agenda-grid { grid-template-columns: 1fr; }
      .contacto-grid { grid-template-columns: 1fr; }
      .transparencia-grid { grid-template-columns: 1fr; }
      .repo-grid { grid-template-columns: 1fr; }
      .casos-grid { grid-template-columns: 1fr; }
      .linea-panel.active { grid-template-columns: 1fr; }
      .footer-inner { grid-template-columns: 1fr; }
      .aliados-grid { grid-template-columns: repeat(2, 1fr); }
      .nav-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--negro);
        flex-direction: column;
        padding: 1rem;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: flex; }
    }

    /* ═══════════════════════════════════════════════
       ANIMACIONES ENTRADA
    ═══════════════════════════════════════════════ */
    .fade-up {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .fade-up:nth-child(2) { transition-delay: 0.1s; }
    .fade-up:nth-child(3) { transition-delay: 0.2s; }
    .fade-up:nth-child(4) { transition-delay: 0.3s; }
  </style>
</head>
<body>

  <!-- ════════════════════════════════ NAVBAR ════ -->
  <nav id="nav">
    <div class="nav-inner">
      <a href="#hero" class="nav-logo logo-svg">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" stroke="#c91618" stroke-width="1.5" fill="none"/>
          <circle cx="18" cy="18" r="12" stroke="#c91618" stroke-width="1.5" fill="none"/>
          <circle cx="18" cy="18" r="7" stroke="#c91618" stroke-width="1.5" fill="none"/>
          <circle cx="18" cy="18" r="3" fill="#c91618"/>
          <line x1="18" y1="1" x2="18" y2="8" stroke="#c91618" stroke-width="1.2"/>
          <line x1="18" y1="28" x2="18" y2="35" stroke="#c91618" stroke-width="1.2"/>
          <line x1="1" y1="18" x2="8" y2="18" stroke="#c91618" stroke-width="1.2"/>
          <line x1="28" y1="18" x2="35" y2="18" stroke="#c91618" stroke-width="1.2"/>
        </svg>
        <div>
          <span class="logo-wordmark" style="color:var(--blanco)">ASODICOM</span>
          <span class="logo-slogan">Uniendo Comunidades</span>
        </div>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-menu" id="navMenu">
        <a href="#quienes">Quiénes Somos</a>
        <a href="#lineas">Líneas de Acción</a>
        <a href="#incidencia">Incidencia</a>
        <a href="#impacto">Impacto</a>
        <a href="#repositorio">Conocimiento</a>
        <a href="#noticias">Noticias</a>
        <a href="#contacto">Contacto</a>
        <a href="#donaciones" class="nav-cta">Donar</a>
      </div>
    </div>
  </nav>

  <!-- ════════════════════════════════ HERO ════ -->
  <section id="hero">
    <div class="hero-bg-pattern"></div>
    <div class="hero-red-bar"></div>
    <div class="hero-content">
      <div class="hero-eyebrow">Ecuador · Desde 2020</div>
      <h1 class="hero-title">
        Asociación<br>
        <em>de Diálogo</em>
        Comunitario
      </h1>
      <p class="hero-subtitle">
        Articulamos esfuerzos técnicos, sociales y territoriales para el fortalecimiento del tejido comunitario y el desarrollo sostenible con enfoque participativo e inclusivo.
      </p>
      <div class="hero-actions">
        <a href="#quienes" class="btn btn-primary">Conocer más</a>
        <a href="#donaciones" class="btn btn-outline">Apoyar la causa</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-circles">
        <svg viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="230" cy="230" r="220" stroke="rgba(201,22,24,0.15)" stroke-width="1"/>
          <circle cx="230" cy="230" r="180" stroke="rgba(201,22,24,0.2)" stroke-width="1"/>
          <circle cx="230" cy="230" r="140" stroke="rgba(201,22,24,0.3)" stroke-width="1.5"/>
          <circle cx="230" cy="230" r="100" stroke="rgba(201,22,24,0.4)" stroke-width="2"/>
          <circle cx="230" cy="230" r="60" stroke="rgba(201,22,24,0.7)" stroke-width="2"/>
          <circle cx="230" cy="230" r="25" fill="rgba(201,22,24,0.9)"/>
          <!-- radial lines -->
          <line x1="230" y1="10" x2="230" y2="70" stroke="rgba(201,22,24,0.5)" stroke-width="2"/>
          <line x1="230" y1="390" x2="230" y2="450" stroke="rgba(201,22,24,0.5)" stroke-width="2"/>
          <line x1="10" y1="230" x2="70" y2="230" stroke="rgba(201,22,24,0.5)" stroke-width="2"/>
          <line x1="390" y1="230" x2="450" y2="230" stroke="rgba(201,22,24,0.5)" stroke-width="2"/>
          <line x1="64" y1="64" x2="106" y2="106" stroke="rgba(201,22,24,0.3)" stroke-width="1.5"/>
          <line x1="396" y1="64" x2="354" y2="106" stroke="rgba(201,22,24,0.3)" stroke-width="1.5"/>
          <line x1="64" y1="396" x2="106" y2="354" stroke="rgba(201,22,24,0.3)" stroke-width="1.5"/>
          <line x1="396" y1="396" x2="354" y2="354" stroke="rgba(201,22,24,0.3)" stroke-width="1.5"/>
          <!-- dots on outer ring -->
          <circle cx="230" cy="50" r="4" fill="rgba(201,22,24,0.8)"/>
          <circle cx="230" cy="410" r="4" fill="rgba(201,22,24,0.8)"/>
          <circle cx="50" cy="230" r="4" fill="rgba(201,22,24,0.8)"/>
          <circle cx="410" cy="230" r="4" fill="rgba(201,22,24,0.8)"/>
          <circle cx="84" cy="84" r="3" fill="rgba(201,22,24,0.5)"/>
          <circle cx="376" cy="84" r="3" fill="rgba(201,22,24,0.5)"/>
          <circle cx="84" cy="376" r="3" fill="rgba(201,22,24,0.5)"/>
          <circle cx="376" cy="376" r="3" fill="rgba(201,22,24,0.5)"/>
          <!-- ASODICOM text ring -->
          <path id="textCircle" d="M 230,230 m -170,0 a 170,170 0 1,1 340,0 a 170,170 0 1,1 -340,0" fill="none"/>
          <text fill="rgba(255,255,255,0.15)" font-family="'Oswald', sans-serif" font-size="12" letter-spacing="18">
            <textPath href="#textCircle">ASODICOM · UNIENDO COMUNIDADES · ECUADOR · DIÁLOGO ·</textPath>
          </text>
        </svg>
        <div class="hero-stat-badge">
          <span class="num">200+</span>
          <span class="lbl">Familias beneficiadas</span>
        </div>
        <div class="hero-stat-badge">
          <span class="num">12</span>
          <span class="lbl">Proyectos activos</span>
        </div>
        <div class="hero-stat-badge">
          <span class="num">5</span>
          <span class="lbl">Provincias</span>
        </div>
      </div>
    </div>
    <div class="hero-scroll">
      <div class="hero-scroll-line"></div>
      Scroll
    </div>
  </section>

  <!-- ════════════════════════════════ QUIÉNES SOMOS ════ -->
  <section id="quienes">
    <div class="container">
      <div class="quienes-grid">
        <div class="quienes-intro fade-up">
          <span class="section-label">01 · Identidad institucional</span>
          <h2 class="section-title">Quiénes <span class="accent">Somos</span></h2>
          <div class="divider"></div>
          <p>ASODICOM surge como una iniciativa orientada a articular esfuerzos técnicos, sociales y territoriales en favor del fortalecimiento del tejido comunitario y la promoción de procesos de desarrollo sostenible.</p>
          <p>Su génesis se inscribe en un contexto de creciente demanda de actores sociales por incidir en la formulación e implementación de políticas públicas con enfoque participativo, territorial e inclusivo.</p>
          <p>Como espacio organizativo, integramos profesionales, líderes comunitarios y actores institucionales con el propósito de generar capacidades locales, fomentar la innovación social y contribuir a la reducción de brechas estructurales.</p>
          <div class="valores-grid" style="margin-top:2rem">
            <div style="margin-bottom:0.75rem">
              <span class="section-label" style="margin-bottom:0.5rem">Valores corporativos</span>
            </div>
            <div></div>
            <div class="valor-item"><span class="valor-dot"></span>Participación ciudadana</div>
            <div class="valor-item"><span class="valor-dot"></span>Inclusión social</div>
            <div class="valor-item"><span class="valor-dot"></span>Transparencia</div>
            <div class="valor-item"><span class="valor-dot"></span>Equidad territorial</div>
            <div class="valor-item"><span class="valor-dot"></span>Innovación social</div>
            <div class="valor-item"><span class="valor-dot"></span>Ética institucional</div>
            <div class="valor-item"><span class="valor-dot"></span>Sostenibilidad</div>
            <div class="valor-item"><span class="valor-dot"></span>Diálogo intercultural</div>
          </div>
        </div>
        <div class="fade-up">
          <div class="mvv-cards">
            <div class="mvv-card">
              <h3>⬡ Misión</h3>
              <p>Promover el diálogo comunitario y la participación ciudadana activa mediante procesos de articulación territorial, asistencia técnica y generación de capacidades locales, contribuyendo al desarrollo sostenible e inclusivo en el Ecuador.</p>
            </div>
            <div class="mvv-card">
              <h3>⬡ Visión</h3>
              <p>Ser reconocida al 2030 como una organización de referencia nacional en la articulación de actores comunitarios, institucionales y académicos para la construcción de políticas públicas con enfoque territorial, participativo e intercultural.</p>
            </div>
            <div class="mvv-card">
              <h3>⬡ Marco conceptual</h3>
              <p>Nuestro accionar se sustenta en el enfoque de desarrollo territorial, la innovación social, la investigación-acción participativa (IAP) y los marcos de gobernanza democrática multinivel, articulando teoría y práctica comunitaria.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ EQUIPO ════ -->
  <section id="equipo">
    <div class="container">
      <span class="section-label">Nuestro equipo</span>
      <h2 class="section-title" style="color:var(--blanco)">Capital <span class="accent">Humano</span></h2>
      <div class="divider"></div>
      <div class="equipo-grid">
        <div class="equipo-card fade-up">
          <div class="equipo-card-inner">
            <div class="equipo-avatar">DR</div>
            <h3>Dirección Ejecutiva</h3>
            <span class="rol">Liderazgo estratégico</span>
            <p>Profesional con experiencia en gestión organizacional, políticas públicas y desarrollo comunitario a escala territorial.</p>
          </div>
        </div>
        <div class="equipo-card fade-up">
          <div class="equipo-card-inner">
            <div class="equipo-avatar">IT</div>
            <h3>Investigación y Territorio</h3>
            <span class="rol">Análisis e incidencia</span>
            <p>Equipo especializado en investigación aplicada, diagnósticos territoriales y generación de evidencia para políticas públicas.</p>
          </div>
        </div>
        <div class="equipo-card fade-up">
          <div class="equipo-card-inner">
            <div class="equipo-avatar">PS</div>
            <h3>Proyectos Sociales</h3>
            <span class="rol">Gestión de programas</span>
            <p>Coordinación de proyectos comunitarios, educativos y de fortalecimiento organizacional en campo y comunidad.</p>
          </div>
        </div>
        <div class="equipo-card fade-up">
          <div class="equipo-card-inner">
            <div class="equipo-avatar">CF</div>
            <h3>Comunicación y RRSS</h3>
            <span class="rol">Visibilidad institucional</span>
            <p>Gestión de la identidad corporativa, comunicación estratégica y relaciones con medios y redes comunitarias.</p>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:2.5rem">
        <a href="#contacto" class="btn btn-primary">Únete al equipo</a>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ LÍNEAS DE ACCIÓN ════ -->
  <section id="lineas">
    <div class="container">
      <span class="section-label">02 · Programas y proyectos</span>
      <h2 class="section-title">Líneas de <span class="accent">Acción</span></h2>
      <div class="divider"></div>
      <div class="lineas-tabs" role="tablist">
        <button class="linea-tab active" onclick="showLinea(0)" role="tab">Educación</button>
        <button class="linea-tab" onclick="showLinea(1)" role="tab">Desarrollo Comunitario</button>
        <button class="linea-tab" onclick="showLinea(2)" role="tab">Políticas Públicas</button>
        <button class="linea-tab" onclick="showLinea(3)" role="tab">Innovación Social</button>
        <button class="linea-tab" onclick="showLinea(4)" role="tab">Gobernanza</button>
      </div>
      <div id="linea-0" class="linea-panel active">
        <div class="linea-panel-text">
          <h3>Educación <span style="color:var(--rojo)">Comunitaria</span></h3>
          <p>Impulsamos procesos formativos contextualizados que fortalecen las capacidades de líderes comunitarios, docentes y familias, integrando enfoques pedagógicos críticos y participativos.</p>
          <p>Desarrollamos programas de alfabetización funcional, educación para la ciudadanía y formación en derechos, articulados con la agenda de desarrollo sostenible local.</p>
          <ul class="metodologia-list">
            <li>Talleres de formación en pedagogía crítica y popular</li>
            <li>Acompañamiento a procesos de educación en primera infancia</li>
            <li>Formación de facilitadores comunitarios</li>
            <li>Materiales educativos con pertinencia cultural</li>
          </ul>
        </div>
        <div>
          <div class="proyectos-list">
            <div class="proyecto-item">
              <span class="status status-active">● En ejecución</span>
              <h4>Escuelas Comunitarias del Buen Vivir</h4>
              <p>Programa integral de apoyo educativo en 3 comunidades rurales con enfoque intercultural y de derechos.</p>
            </div>
            <div class="proyecto-item">
              <span class="status status-active">● En ejecución</span>
              <h4>Familias Educadoras</h4>
              <p>Capacitación a núcleos familiares en estimulación temprana y acompañamiento al desarrollo infantil.</p>
            </div>
            <div class="proyecto-item">
              <span class="status status-done">○ Finalizado</span>
              <h4>Formación Ciudadana Juvenil</h4>
              <p>150 jóvenes formados en participación política, derechos y liderazgo comunitario. 2022–2023.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="linea-1" class="linea-panel">
        <div class="linea-panel-text">
          <h3>Desarrollo <span style="color:var(--rojo)">Comunitario</span></h3>
          <p>Acompañamos a comunidades en la identificación participativa de sus necesidades, el diseño de soluciones locales y la gestión autónoma de sus procesos de desarrollo.</p>
          <ul class="metodologia-list">
            <li>Diagnósticos territoriales participativos</li>
            <li>Mapeos comunitarios y sistemas de información local</li>
            <li>Fortalecimiento de organizaciones de base</li>
            <li>Economía solidaria y emprendimientos comunitarios</li>
          </ul>
        </div>
        <div>
          <div class="proyectos-list">
            <div class="proyecto-item">
              <span class="status status-active">● En ejecución</span>
              <h4>Comunidades Resilientes</h4>
              <p>Gestión comunitaria del riesgo y fortalecimiento de capacidades locales ante eventos climáticos.</p>
            </div>
            <div class="proyecto-item">
              <span class="status status-done">○ Finalizado</span>
              <h4>Redes Territoriales de Cuidado</h4>
              <p>Articulación de actores locales para servicios de cuidado comunitario en 5 parroquias.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="linea-2" class="linea-panel">
        <div class="linea-panel-text">
          <h3>Políticas <span style="color:var(--rojo)">Públicas</span></h3>
          <p>Generamos insumos técnicos, análisis y propuestas para la incidencia en políticas públicas con enfoque territorial, participativo y de derechos humanos.</p>
          <ul class="metodologia-list">
            <li>Elaboración de policy briefs y documentos de posición</li>
            <li>Participación en mesas de diálogo y procesos legislativos</li>
            <li>Investigación aplicada para la toma de decisiones</li>
            <li>Formación de actores en incidencia política</li>
          </ul>
        </div>
        <div>
          <div class="proyectos-list">
            <div class="proyecto-item">
              <span class="status status-active">● En ejecución</span>
              <h4>Observatorio de Políticas Sociales</h4>
              <p>Monitoreo y análisis de políticas públicas con impacto comunitario en Pichincha.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="linea-3" class="linea-panel">
        <div class="linea-panel-text">
          <h3>Innovación <span style="color:var(--rojo)">Social</span></h3>
          <p>Promovemos el diseño e implementación de soluciones creativas a problemas sociales complejos, aprovechando la tecnología y el conocimiento colectivo comunitario.</p>
          <ul class="metodologia-list">
            <li>Laboratorios de innovación social participativa</li>
            <li>Prototipado de soluciones con enfoque territorial</li>
            <li>Tecnología apropiada para comunidades</li>
            <li>Ecosistemas locales de innovación</li>
          </ul>
        </div>
        <div>
          <div class="proyectos-list">
            <div class="proyecto-item">
              <span class="status status-active">● En ejecución</span>
              <h4>Lab Comunitario Digital</h4>
              <p>Alfabetización digital e inclusión tecnológica en comunidades periurbanas de Quito.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="linea-4" class="linea-panel">
        <div class="linea-panel-text">
          <h3>Gobernanza <span style="color:var(--rojo)">Democrática</span></h3>
          <p>Fortalecemos los mecanismos de participación ciudadana y gobernanza local para el ejercicio efectivo de derechos y la toma de decisiones colectivas informadas.</p>
          <ul class="metodologia-list">
            <li>Asambleas comunitarias y presupuestos participativos</li>
            <li>Formación de veedurías ciudadanas</li>
            <li>Mecanismos de rendición de cuentas local</li>
            <li>Diálogo intercultural e intergeneracional</li>
          </ul>
        </div>
        <div>
          <div class="proyectos-list">
            <div class="proyecto-item">
              <span class="status status-active">● En ejecución</span>
              <h4>Consejos de Participación Local</h4>
              <p>Apoyo técnico a 8 consejos barriales en el fortalecimiento de sus capacidades organizativas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ IMPACTO ════ -->
  <section id="impacto">
    <div class="impacto-bg"></div>
    <div class="container">
      <div class="impacto-header">
        <span class="section-label">04 · Resultados e impacto</span>
        <h2 class="section-title" style="color:var(--blanco)">Nuestros <span style="color:rgba(255,255,255,0.5)">Números</span></h2>
        <div class="divider" style="background:rgba(255,255,255,0.4)"></div>
      </div>
      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-num counter" data-target="200">0</span>
          <span class="stat-label">Familias beneficiadas</span>
        </div>
        <div class="stat-box">
          <span class="stat-num counter" data-target="12">0</span>
          <span class="stat-label">Proyectos ejecutados</span>
        </div>
        <div class="stat-box">
          <span class="stat-num counter" data-target="5">0</span>
          <span class="stat-label">Provincias de acción</span>
        </div>
        <div class="stat-box">
          <span class="stat-num counter" data-target="30">0</span>
          <span class="stat-label">Alianzas institucionales</span>
        </div>
      </div>
      <div class="casos-grid">
        <div class="caso-card fade-up">
          <div class="icon">🏘️</div>
          <h3>Comunidad La Esperanza</h3>
          <p>Implementación de plan de desarrollo participativo que redujo en un 40% las brechas de acceso a servicios básicos, articulando a 85 familias con los gobiernos autónomos descentralizados.</p>
        </div>
        <div class="caso-card fade-up">
          <div class="icon">📚</div>
          <h3>Programa Educativo Rural</h3>
          <p>Formación de 60 facilitadores comunitarios en metodologías de educación popular, con impacto directo en más de 300 niñas y niños de comunidades rurales de Pichincha y Cotopaxi.</p>
        </div>
        <div class="caso-card fade-up">
          <div class="icon">⚖️</div>
          <h3>Incidencia en Política Local</h3>
          <p>Participación en el diseño de 3 ordenanzas municipales con enfoque de derechos, incorporando las voces de 120 líderes comunitarios en procesos de consulta previa y participación ciudadana.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ INCIDENCIA ════ -->
  <section id="incidencia">
    <div class="container">
      <span class="section-label">03 · Incidencia y políticas públicas</span>
      <h2 class="section-title">Análisis y <span class="accent">Posicionamiento</span></h2>
      <div class="divider"></div>
      <div class="incidencia-grid" style="margin-top:3rem">
        <div>
          <p style="margin-bottom:1.5rem;font-size:0.95rem;line-height:1.8;color:var(--gris-oscuro)">Producimos documentos técnicos, análisis de política y propuestas orientadas a incidir en los espacios de toma de decisiones con evidencia y perspectiva territorial.</p>
          <div class="docs-list">
            <div class="doc-item">
              <div class="doc-icon">PDF</div>
              <div>
                <div class="doc-tipo">Policy Brief</div>
                <div class="doc-title">Participación ciudadana en GAD parroquiales</div>
                <div class="doc-date">Marzo 2025</div>
              </div>
            </div>
            <div class="doc-item">
              <div class="doc-icon">DOC</div>
              <div>
                <div class="doc-tipo">Informe técnico</div>
                <div class="doc-title">Brechas territoriales en Pichincha: diagnóstico 2024</div>
                <div class="doc-date">Enero 2025</div>
              </div>
            </div>
            <div class="doc-item">
              <div class="doc-icon">PDF</div>
              <div>
                <div class="doc-tipo">Propuesta normativa</div>
                <div class="doc-title">Ordenanza modelo para presupuestos participativos</div>
                <div class="doc-date">Nov 2024</div>
              </div>
            </div>
            <div class="doc-item">
              <div class="doc-icon">RPT</div>
              <div>
                <div class="doc-tipo">Reporte de investigación</div>
                <div class="doc-title">Innovación social en economías comunitarias</div>
                <div class="doc-date">Ago 2024</div>
              </div>
            </div>
          </div>
          <div style="margin-top:1rem"><a href="#repositorio" class="btn btn-primary" style="font-size:0.75rem">Ver todos los documentos</a></div>
        </div>
        <div>
          <h3 style="font-family:var(--font-head);font-size:1.5rem;text-transform:uppercase;margin-bottom:1rem">Redes y <span style="color:var(--rojo)">coaliciones</span></h3>
          <p style="font-size:0.95rem;line-height:1.8;color:var(--gris-oscuro);margin-bottom:1.5rem">ASODICOM participa activamente en espacios de gobernanza multinivel, articulando con organizaciones de la sociedad civil, academia, sector público y cooperación internacional.</p>
          <div class="redes-tags">
            <span class="red-tag">CONAIE</span>
            <span class="red-tag">Red de Organizaciones Sociales EC</span>
            <span class="red-tag">Mesa de Desarrollo Territorial</span>
            <span class="red-tag">Foro Social de Pichincha</span>
            <span class="red-tag">Plataforma de OSC Ecuador</span>
            <span class="red-tag">Alianza por la Educación</span>
            <span class="red-tag">Consejo Ciudadano Sectorial</span>
            <span class="red-tag">Red Iberoamericana de IAS</span>
          </div>
          <div class="redes-section">
            <h3>Presencia en <span style="color:var(--rojo)">espacios de gobernanza</span></h3>
            <ul class="metodologia-list">
              <li>Consejo Nacional de Participación Ciudadana — observadores</li>
              <li>Comités de desarrollo territorial en 5 GAD parroquiales</li>
              <li>Mesa intersectorial de primera infancia, Quito</li>
              <li>Comité de seguimiento ODS — sociedad civil Ecuador</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ TRANSPARENCIA ════ -->
  <section id="transparencia">
    <div class="container">
      <span class="section-label" style="color:var(--salmon)">05 · Rendición de cuentas</span>
      <h2 class="section-title" style="color:var(--blanco)">Transparencia <span class="accent">Institucional</span></h2>
      <div class="divider"></div>
      <div class="transparencia-grid">
        <div class="transparencia-card fade-up">
          <div class="tc-num">01</div>
          <h3>Informes de gestión</h3>
          <p>Publicamos anualmente nuestro informe de gestión con los resultados, actividades y logros del período, disponible para toda la ciudadanía.</p>
          <br><a href="#" style="color:var(--salmon);font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase">Descargar informe 2024 →</a>
        </div>
        <div class="transparencia-card fade-up">
          <div class="tc-num">02</div>
          <h3>Estados financieros</h3>
          <p>Nuestros estados financieros son auditados externamente y se publican con el detalle del uso de recursos, donaciones y fuentes de financiamiento.</p>
          <br><a href="#" style="color:var(--salmon);font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase">Ver estados 2024 →</a>
        </div>
        <div class="transparencia-card fade-up">
          <div class="tc-num">03</div>
          <h3>Aliados y cooperantes</h3>
          <p>Trabajamos con organizaciones nacionales e internacionales que comparten nuestra visión de desarrollo inclusivo y participativo.</p>
          <br><a href="#" style="color:var(--salmon);font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase">Ver alianzas →</a>
        </div>
      </div>
      <div class="aliados-section">
        <h3>Aliados y <span style="color:var(--rojo)">cooperantes</span></h3>
        <div class="aliados-grid">
          <div class="aliado-item"><span>PNUD Ecuador</span></div>
          <div class="aliado-item"><span>UNICEF</span></div>
          <div class="aliado-item"><span>Cooperación Española</span></div>
          <div class="aliado-item"><span>GIZ</span></div>
          <div class="aliado-item"><span>FLACSO Ecuador</span></div>
          <div class="aliado-item"><span>SENPLADES</span></div>
          <div class="aliado-item"><span>MIES Ecuador</span></div>
          <div class="aliado-item"><span>Municipio de Quito</span></div>
          <div class="aliado-item"><span>Prefectura Pichincha</span></div>
          <div class="aliado-item"><span>Unión Europea</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ PARTICIPACIÓN ════ -->
  <section id="participacion">
    <div class="container">
      <span class="section-label">06 · Vinculación y participación</span>
      <h2 class="section-title">Forma Parte de <span class="accent">ASODICOM</span></h2>
      <div class="divider"></div>
      <div class="participacion-grid">
        <div class="participa-card fade-up">
          <span class="card-num">01</span>
          <h3>Voluntariado</h3>
          <p>Súmate como voluntario/a y contribuye con tu tiempo y talentos a nuestras iniciativas comunitarias. Buscamos perfiles diversos para trabajo en campo, comunicación e investigación.</p>
          <div class="form-group">
            <label>Nombre completo</label>
            <input type="text" placeholder="Tu nombre" />
          </div>
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" />
          </div>
          <div class="form-group">
            <label>Área de interés</label>
            <select>
              <option>Trabajo comunitario</option>
              <option>Comunicación</option>
              <option>Investigación</option>
              <option>Educación</option>
              <option>Administración</option>
            </select>
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="handleForm(this, 'Solicitud de voluntariado enviada')">Aplicar como voluntario/a</button>
        </div>
        <div class="participa-card fade-up">
          <span class="card-num">02</span>
          <h3>Membresía</h3>
          <p>Conviértete en miembro activo de ASODICOM y participa en la dirección estratégica de la organización, accede a nuestros espacios de formación y construye comunidad.</p>
          <div class="form-group">
            <label>Nombre o institución</label>
            <input type="text" placeholder="Nombre / Organización" />
          </div>
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" />
          </div>
          <div class="form-group">
            <label>Tipo de membresía</label>
            <select>
              <option>Individual — persona natural</option>
              <option>Organizacional — persona jurídica</option>
              <option>Honoraria — colaborador especial</option>
            </select>
          </div>
          <button class="btn btn-dark" style="width:100%" onclick="handleForm(this, 'Solicitud de membresía recibida')">Solicitar membresía</button>
        </div>
        <div class="participa-card fade-up">
          <span class="card-num">03</span>
          <h3>Convocatorias abiertas</h3>
          <p>Revisá nuestras convocatorias actuales para proyectos, alianzas y oportunidades de colaboración.</p>
          <div class="convocatorias-list">
            <div class="convocatoria-item">
              <div class="fecha">Cierre: 26 Abr 2026</div>
              <h4>Asamblea Comunitaria Territorial</h4>
              <p>Invitación a líderes y lideresas a participar en nuestra asamblea ordinaria.</p>
            </div>
            <div class="convocatoria-item">
              <div class="fecha">Cierre: 15 May 2026</div>
              <h4>Consultoría en Investigación Social</h4>
              <p>Perfil: sociólogo/a con experiencia en metodologías participativas.</p>
            </div>
            <div class="convocatoria-item">
              <div class="fecha">Cierre: 30 May 2026</div>
              <h4>Alianzas para Proyectos 2026</h4>
              <p>Buscamos organizaciones aliadas para presentar proyectos a convocatorias nacionales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ DONACIONES ════ -->
  <section id="donaciones">
    <div class="donaciones-bg"></div>
    <div class="container">
      <span class="section-label">07 · Donaciones y financiamiento</span>
      <h2 class="section-title" style="color:var(--blanco)">Apoya Nuestro <span style="opacity:0.6">Trabajo</span></h2>
      <div class="divider" style="background:rgba(255,255,255,0.4)"></div>
      <div class="donaciones-inner" style="margin-top:3rem">
        <div class="donaciones-texto">
          <p>Tu contribución permite que ASODICOM continúe acompañando a comunidades vulnerables, generando conocimiento para el desarrollo y incidiendo en políticas públicas con enfoque territorial.</p>
          <p>Cada donación es registrada con plena transparencia y sus destinos son informados en nuestros reportes semestrales de rendición de cuentas.</p>
          <div class="donaciones-opciones">
            <div class="donacion-opcion selected" onclick="selectDonacion(this)">
              <h4>Donación única</h4>
              <p>Contribuye una vez con el monto que elijas. Sin compromisos adicionales.</p>
            </div>
            <div class="donacion-opcion" onclick="selectDonacion(this)">
              <h4>Donación mensual recurrente</h4>
              <p>Aporta mensualmente y multiplica tu impacto con apoyo sostenido.</p>
            </div>
            <div class="donacion-opcion" onclick="selectDonacion(this)">
              <h4>Campaña específica</h4>
              <p>Elige un proyecto o programa concreto al cual destinar tu donación.</p>
            </div>
          </div>
          <div style="margin-top:2rem">
            <button class="btn btn-outline" onclick="handleForm(this, 'Redirigiendo a plataforma de pago seguro...')">Donar ahora</button>
          </div>
        </div>
        <div>
          <div class="qr-box">
            <div class="qr-placeholder">
              <svg width="140" height="140" viewBox="0 0 100 100">
                <rect x="5" y="5" width="35" height="35" fill="none" stroke="#383837" stroke-width="4"/>
                <rect x="13" y="13" width="19" height="19" fill="#383837"/>
                <rect x="60" y="5" width="35" height="35" fill="none" stroke="#383837" stroke-width="4"/>
                <rect x="68" y="13" width="19" height="19" fill="#383837"/>
                <rect x="5" y="60" width="35" height="35" fill="none" stroke="#383837" stroke-width="4"/>
                <rect x="13" y="68" width="19" height="19" fill="#383837"/>
                <rect x="60" y="60" width="8" height="8" fill="#383837"/>
                <rect x="72" y="60" width="8" height="8" fill="#383837"/>
                <rect x="84" y="60" width="8" height="8" fill="#383837"/>
                <rect x="60" y="72" width="8" height="8" fill="#383837"/>
                <rect x="84" y="72" width="8" height="8" fill="#383837"/>
                <rect x="60" y="84" width="8" height="8" fill="#383837"/>
                <rect x="72" y="84" width="8" height="8" fill="#383837"/>
                <rect x="84" y="84" width="8" height="8" fill="#383837"/>
              </svg>
            </div>
            <h3>Escanea para donar</h3>
            <p>Transferencia directa segura<br>a la cuenta institucional de ASODICOM</p>
            <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--gris-medio)">
              <p style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.08em;color:var(--gris-oscuro)">Banco: Banco del Pacífico<br>Tipo: Cta. Corriente<br>Beneficiario: ASODICOM</p>
            </div>
          </div>
          <div style="background:rgba(0,0,0,0.2);padding:1.5rem;margin-top:1rem;border:1px solid rgba(255,255,255,0.15)">
            <h4 style="font-family:var(--font-head);font-size:0.9rem;color:var(--blanco);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem">¿A qué destino tus fondos?</h4>
            <p style="font-size:0.85rem;color:rgba(255,255,255,0.7);line-height:1.7">40% proyectos comunitarios · 30% investigación y conocimiento · 20% incidencia en política pública · 10% gestión institucional</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ REPOSITORIO ════ -->
  <section id="repositorio">
    <div class="container">
      <span class="section-label">08 · Repositorio de conocimiento</span>
      <h2 class="section-title">Centro de <span class="accent">Conocimiento</span></h2>
      <div class="divider"></div>
      <div class="repo-grid">
        <div class="repo-card fade-up">
          <div class="repo-card-header"></div>
          <div class="repo-card-body">
            <div class="repo-tipo">Publicación académica</div>
            <h3>Desarrollo territorial e innovación social en Ecuador</h3>
            <p>Análisis de experiencias de innovación social en contextos rurales y periurbanos del Ecuador con enfoque de buen vivir.</p>
          </div>
          <div class="repo-card-footer"><span>PDF · 45 pág · 2024</span><a href="#">Descargar →</a></div>
        </div>
        <div class="repo-card tipo-blog fade-up">
          <div class="repo-card-header"></div>
          <div class="repo-card-body">
            <div class="repo-tipo">Artículo de análisis</div>
            <h3>Participación ciudadana: desafíos en los GAD parroquiales</h3>
            <p>Reflexiones sobre los mecanismos de participación en los gobiernos autónomos descentralizados parroquiales y sus limitaciones estructurales.</p>
          </div>
          <div class="repo-card-footer"><span>Blog · Mar 2025</span><a href="#">Leer →</a></div>
        </div>
        <div class="repo-card tipo-video fade-up">
          <div class="repo-card-header"></div>
          <div class="repo-card-body">
            <div class="repo-tipo">Seminario web</div>
            <h3>Gobernanza comunitaria y reducción de brechas estructurales</h3>
            <p>Seminario grabado con panelistas de FLACSO, PNUD y líderes comunitarios sobre experiencias de gobernanza local en América Latina.</p>
          </div>
          <div class="repo-card-footer"><span>Video · 82 min · Feb 2025</span><a href="#">Ver →</a></div>
        </div>
        <div class="repo-card fade-up">
          <div class="repo-card-header"></div>
          <div class="repo-card-body">
            <div class="repo-tipo">Policy Brief</div>
            <h3>Hacia una ley de participación ciudadana renovada</h3>
            <p>Propuesta técnica para la reforma del marco normativo de participación ciudadana en Ecuador con perspectiva comparada.</p>
          </div>
          <div class="repo-card-footer"><span>PDF · 18 pág · Ene 2025</span><a href="#">Descargar →</a></div>
        </div>
        <div class="repo-card tipo-blog fade-up">
          <div class="repo-card-header"></div>
          <div class="repo-card-body">
            <div class="repo-tipo">Blog</div>
            <h3>Economías comunitarias: resiliencia desde los territorios</h3>
            <p>Experiencias de economía solidaria y comunitaria como estrategias de desarrollo frente a la exclusión económica estructural.</p>
          </div>
          <div class="repo-card-footer"><span>Blog · Dic 2024</span><a href="#">Leer →</a></div>
        </div>
        <div class="repo-card tipo-video fade-up">
          <div class="repo-card-header"></div>
          <div class="repo-card-body">
            <div class="repo-tipo">Taller grabado</div>
            <h3>Metodologías participativas para el diagnóstico territorial</h3>
            <p>Taller de formación para facilitadores comunitarios en técnicas de diagnóstico participativo, cartografía social y sistematización.</p>
          </div>
          <div class="repo-card-footer"><span>Video · 3 módulos · Oct 2024</span><a href="#">Ver →</a></div>
        </div>
      </div>
      <div style="text-align:center;margin-top:3rem">
        <a href="#" class="btn btn-primary">Ver repositorio completo</a>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ NOTICIAS ════ -->
  <section id="noticias">
    <div class="container">
      <span class="section-label">09 · Noticias y eventos</span>
      <h2 class="section-title">Actualidad <span class="accent">ASODICOM</span></h2>
      <div class="divider"></div>
      <div class="noticias-layout">
        <div>
          <div class="noticia-featured">
            <div class="noticia-featured-img">
              <div class="noticia-featured-img-inner">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
                  <circle cx="40" cy="40" r="25" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
                  <circle cx="40" cy="40" r="10" fill="rgba(201,22,24,0.6)"/>
                </svg>
              </div>
              <div class="overlay"></div>
              <span class="noticia-categoria">Evento institucional</span>
            </div>
            <div class="noticia-featured-body">
              <div class="noticia-fecha">14 de abril, 2026</div>
              <h2>Asamblea Comunitaria Territorial — 26 de abril de 2026</h2>
              <p>ASODICOM convoca a su asamblea comunitaria anual para rendir cuentas, elegir nuevas autoridades y trazar la hoja de ruta 2026–2027. La actividad se realizará en Quito y contará con la participación de líderes comunitarios, aliados y autoridades locales.</p>
            </div>
          </div>
        </div>
        <div class="noticias-sidebar">
          <div class="noticia-mini">
            <div class="fecha">12 Abr 2026</div>
            <h4>Nuevo proyecto de innovación social aprobado</h4>
            <p>Obtuvimos financiamiento para el Lab Comunitario Digital en tres parroquias de Quito.</p>
          </div>
          <div class="noticia-mini">
            <div class="fecha">5 Abr 2026</div>
            <h4>Participación en Congreso de Políticas Sociales</h4>
            <p>Nuestro equipo presentó los resultados del Observatorio de Políticas Sociales en Guayaquil.</p>
          </div>
          <div class="noticia-mini">
            <div class="fecha">28 Mar 2026</div>
            <h4>Alianza estratégica con FLACSO Ecuador</h4>
            <p>Firmamos convenio de colaboración académica para investigación aplicada en desarrollo territorial.</p>
          </div>
          <div class="noticia-mini">
            <div class="fecha">15 Mar 2026</div>
            <h4>Publicación: Informe Anual 2025</h4>
            <p>Disponible para descarga nuestro informe de gestión y resultados del año 2025.</p>
          </div>
        </div>
      </div>
      <div class="agenda-section">
        <h3>Agenda <span style="color:var(--rojo)">Institucional</span></h3>
        <div class="agenda-grid">
          <div class="evento-card">
            <div class="evento-fecha-box"><span class="dia">26</span><span class="mes">Abr</span></div>
            <div class="evento-body">
              <h4>Asamblea Comunitaria</h4>
              <p>Quito · 09h00 · Auditorio institucional</p>
            </div>
          </div>
          <div class="evento-card">
            <div class="evento-fecha-box"><span class="dia">10</span><span class="mes">May</span></div>
            <div class="evento-body">
              <h4>Taller: Diagnóstico Participativo</h4>
              <p>Online · 15h00 · Zoom</p>
            </div>
          </div>
          <div class="evento-card">
            <div class="evento-fecha-box"><span class="dia">22</span><span class="mes">May</span></div>
            <div class="evento-body">
              <h4>Seminario: Innovación Social</h4>
              <p>Quito · 09h00–17h00 · FLACSO</p>
            </div>
          </div>
          <div class="evento-card">
            <div class="evento-fecha-box" style="background:var(--gris-azul)"><span class="dia">5</span><span class="mes">Jun</span></div>
            <div class="evento-body">
              <h4>Foro de Políticas Públicas</h4>
              <p>Quito · 14h00 · Casa de la Cultura</p>
            </div>
          </div>
          <div class="evento-card">
            <div class="evento-fecha-box" style="background:var(--gris-azul)"><span class="dia">19</span><span class="mes">Jun</span></div>
            <div class="evento-body">
              <h4>Rendición de cuentas semestral</h4>
              <p>Quito · 10h00 · Virtual y presencial</p>
            </div>
          </div>
          <div class="evento-card">
            <div class="evento-fecha-box" style="background:var(--vino)"><span class="dia">4</span><span class="mes">Jul</span></div>
            <div class="evento-body">
              <h4>Lanzamiento: Repositorio Digital</h4>
              <p>Online · Todo el día · asodicom.org.ec</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════════════ CONTACTO ════ -->
  <section id="contacto">
    <div class="container">
      <span class="section-label" style="color:var(--salmon)">10 · Contacto</span>
      <h2 class="section-title" style="color:var(--blanco)">Hablemos <span class="accent">juntos</span></h2>
      <div class="divider"></div>
      <div class="contacto-grid">
        <div>
          <div class="contacto-info-item">
            <div class="contacto-icon">📍</div>
            <div>
              <h4>Dirección</h4>
              <p>Av. América N27-23 y Diego Méndez<br>Quito – Ecuador</p>
            </div>
          </div>
          <div class="contacto-info-item">
            <div class="contacto-icon">📞</div>
            <div>
              <h4>Teléfonos</h4>
              <p>0987 228 482<br>0998 875 144</p>
            </div>
          </div>
          <div class="contacto-info-item">
            <div class="contacto-icon">✉️</div>
            <div>
              <h4>Correo electrónico</h4>
              <p>info@asodicom.org.ec<br>contacto@asodicom.org.ec</p>
            </div>
          </div>
          <div class="contacto-info-item">
            <div class="contacto-icon">🌐</div>
            <div>
              <h4>Redes sociales</h4>
              <p>Síguenos en Facebook y otras plataformas</p>
            </div>
          </div>
          <div class="social-links">
            <a href="https://www.facebook.com/AsodicomEC/" target="_blank" class="social-link" title="Facebook">fb</a>
            <a href="#" class="social-link" title="Twitter/X">tw</a>
            <a href="#" class="social-link" title="Instagram">ig</a>
            <a href="#" class="social-link" title="YouTube">yt</a>
            <a href="#" class="social-link" title="LinkedIn">in</a>
          </div>
        </div>
        <div class="contacto-form">
          <div class="form-group">
            <label>Nombre completo</label>
            <input type="text" placeholder="Tu nombre completo" />
          </div>
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" />
          </div>
          <div class="form-group">
            <label>Motivo del contacto</label>
            <select style="background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:var(--blanco)">
              <option style="background:var(--negro)">Alianza institucional</option>
              <option style="background:var(--negro)">Voluntariado</option>
              <option style="background:var(--negro)">Donaciones</option>
              <option style="background:var(--negro)">Información general</option>
              <option style="background:var(--negro)">Prensa y medios</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mensaje</label>
            <textarea rows="5" placeholder="Escribe tu mensaje aquí..." style="background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:var(--blanco);resize:vertical"></textarea>
          </div>
          <button class="btn btn-primary" style="width:100%;font-size:0.85rem" onclick="handleForm(this, 'Mensaje enviado. Nos comunicaremos contigo pronto.')">Enviar mensaje</button>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer>
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <a href="#hero" class="logo-svg">
              <svg viewBox="0 0 36 36" fill="none" width="32" height="32">
                <circle cx="18" cy="18" r="17" stroke="#c91618" stroke-width="1.5" fill="none"/>
                <circle cx="18" cy="18" r="12" stroke="#c91618" stroke-width="1.5" fill="none"/>
                <circle cx="18" cy="18" r="7" stroke="#c91618" stroke-width="1.5" fill="none"/>
                <circle cx="18" cy="18" r="3" fill="#c91618"/>
              </svg>
              <div>
                <span class="logo-wordmark">ASODICOM</span>
                <span class="logo-slogan">Uniendo Comunidades</span>
              </div>
            </a>
            <p>Asociación de Diálogo Comunitario — Articulando esfuerzos técnicos, sociales y territoriales para el desarrollo sostenible e inclusivo en Ecuador.</p>
          </div>
          <div class="footer-col">
            <h4>Institución</h4>
            <ul>
              <li><a href="#quienes">Quiénes somos</a></li>
              <li><a href="#equipo">Equipo</a></li>
              <li><a href="#transparencia">Transparencia</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Programas</h4>
            <ul>
              <li><a href="#lineas">Líneas de acción</a></li>
              <li><a href="#incidencia">Incidencia</a></li>
              <li><a href="#impacto">Resultados</a></li>
              <li><a href="#repositorio">Conocimiento</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Participar</h4>
            <ul>
              <li><a href="#participacion">Voluntariado</a></li>
              <li><a href="#participacion">Membresía</a></li>
              <li><a href="#donaciones">Donaciones</a></li>
              <li><a href="#noticias">Noticias</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 ASODICOM — Asociación de Diálogo Comunitario · Quito, Ecuador</p>
          <p>Diseño institucional · <span>Uniendo Comunidades</span></p>
        </div>
      </div>
    </footer>
  </section>

  <!-- ════════════════════════════════ SCRIPTS ════ -->
  <script>
    // Nav scroll
    window.addEventListener('scroll', () => {
      document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
    });

    // Nav toggle mobile
    document.getElementById('navToggle').addEventListener('click', () => {
      document.getElementById('navMenu').classList.toggle('open');
    });

    // Close nav on link click (mobile)
    document.querySelectorAll('.nav-menu a').forEach(a => {
      a.addEventListener('click', () => document.getElementById('navMenu').classList.remove('open'));
    });

    // Líneas tabs
    function showLinea(idx) {
      document.querySelectorAll('.linea-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
      document.querySelectorAll('.linea-panel').forEach((p, i) => p.classList.toggle('active', i === idx));
    }

    // Donación opciones
    function selectDonacion(el) {
      document.querySelectorAll('.donacion-opcion').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
    }

    // Form feedback
    function handleForm(btn, msg) {
      const orig = btn.textContent;
      btn.textContent = '✓ ' + msg;
      btn.style.background = '#2a9d6b';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 4000);
    }

    // Intersection Observer: fade-up
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Counter animation
    function animateCounter(el) {
      const target = parseInt(el.dataset.target);
      const dur = 2000;
      const step = target / (dur / 16);
      let cur = 0;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.floor(cur) + (target >= 100 ? '+' : '');
        if (cur >= target) clearInterval(timer);
      }, 16);
    }
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));
  </script>
</body>
</html>
