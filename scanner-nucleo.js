/* ============================================================
   SCANNER FOTO · NÚCLEO  — LE COLLEZIONI
   Lógica sin pantalla (sirve en el navegador y en pruebas):
   - Lector y escritor de Excel (.xlsx) sin librerías externas
   - Lectura de las listas de fotografía (detecta columnas por nombre)
   - Motor de búsqueda: código exacto → referencia (sin talla) → serial
   ============================================================ */
(function (root) {
  'use strict';
  const N = {};

  /* ---------- texto ---------- */
  N.norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  // Código limpio: mayúsculas, sin espacios. Deja letras, números y - / .
  N.limpiar = s => String(s == null ? '' : s).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9\-\/.]/g, '');
  N.alnum = s => N.limpiar(s).replace(/[^A-Z0-9]/g, '');

  N.ESTADOS = [
    ['pendiente', 'Pendiente'], ['localizado', 'Localizada'], ['fotografiado', 'Fotografiada'],
    ['editado', 'Editada'], ['subido', 'Subida']
  ];
  N.ORDEN = { pendiente: 0, localizado: 1, fotografiado: 2, editado: 3, subido: 4 };
  N.etiquetaEstado = k => (N.ESTADOS.find(e => e[0] === k) || [k, k])[1];
  N.yaFotografiada = p => N.ORDEN[p.estado] >= 2;

  /* ============================================================
     ZIP / XLSX — LECTURA
     ============================================================ */
  const u16 = (b, o) => b[o] | (b[o + 1] << 8);
  const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
  const dec = new TextDecoder('utf-8');

  async function inflar(datos) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador no puede abrir archivos Excel (actualízalo).');
    const ds = new DecompressionStream('deflate-raw');
    const res = new Response(new Blob([datos]).stream().pipeThrough(ds));
    return new Uint8Array(await res.arrayBuffer());
  }

  async function leerZip(bytes) {
    const b = bytes;
    let eocd = -1;
    for (let i = b.length - 22; i >= Math.max(0, b.length - 70000); i--) {
      if (u32(b, i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('El archivo no es un Excel (.xlsx) válido.');
    const total = u16(b, eocd + 10);
    let p = u32(b, eocd + 16);
    const archivos = {};
    for (let n = 0; n < total; n++) {
      if (u32(b, p) !== 0x02014b50) throw new Error('El Excel está dañado.');
      const metodo = u16(b, p + 10), tamComp = u32(b, p + 20);
      const lnNombre = u16(b, p + 28), lnExtra = u16(b, p + 30), lnCom = u16(b, p + 32);
      const local = u32(b, p + 42);
      const nombre = dec.decode(b.subarray(p + 46, p + 46 + lnNombre));
      archivos[nombre] = { metodo, tamComp, local };
      p += 46 + lnNombre + lnExtra + lnCom;
    }
    return {
      nombres: Object.keys(archivos),
      async texto(nombre) {
        const a = archivos[nombre];
        if (!a) return null;
        const ini = a.local + 30 + u16(b, a.local + 26) + u16(b, a.local + 28);
        const datos = b.subarray(ini, ini + a.tamComp);
        const crudo = a.metodo === 0 ? datos : await inflar(datos);
        return dec.decode(crudo);
      }
    };
  }

  const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  const desEscapar = s => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') { const c = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return isFinite(c) ? String.fromCodePoint(c) : m; }
    return ENT[e] != null ? ENT[e] : m;
  });
  const sinPrefijos = x => x.replace(/<(\/?)[A-Za-z0-9_]+:/g, '<$1');
  const attr = (s, n) => { const m = new RegExp('\\b' + n + '="([^"]*)"').exec(s); return m ? desEscapar(m[1]) : null; };
  const textos = s => { let out = ''; const re = /<t\b[^>]*>([\s\S]*?)<\/t>/g; let m; while ((m = re.exec(s))) out += desEscapar(m[1]); return out; };
  function colIndice(ref) { let n = 0; const m = /^[A-Z]+/.exec(ref || ''); if (!m) return -1; for (const ch of m[0]) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; }
  function numeroTexto(v) {
    if (/^-?\d+(\.\d+)?[eE][+-]?\d+$/.test(v)) { const n = Number(v); if (Number.isInteger(n) && Math.abs(n) < 1e21) return BigInt(n).toString(); return String(n); }
    if (/^-?\d+\.\d{6,}$/.test(v)) { const n = Number(v); return String(Math.round(n * 1e6) / 1e6); }
    return v;
  }

  // Devuelve [{nombre, filas:[[texto,...],...]}] con todas las hojas
  N.leerXlsx = async function (bytes) {
    const zip = await leerZip(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
    const wb = await zip.texto('xl/workbook.xml');
    if (!wb) throw new Error('El archivo no parece un Excel (.xlsx). Si es .xls viejo, guárdalo como .xlsx.');
    const rels = sinPrefijos((await zip.texto('xl/_rels/workbook.xml.rels')) || '');
    const relMap = {};
    rels.replace(/<Relationship\b([^>]*)\/?>/g, (m, a) => { relMap[attr(a, 'Id')] = attr(a, 'Target'); return m; });
    const ss = [];
    const ssXml = await zip.texto('xl/sharedStrings.xml');
    if (ssXml) sinPrefijos(ssXml).replace(/<si\b[^>]*>([\s\S]*?)<\/si>/g, (m, c) => { ss.push(textos(c.replace(/<rPh\b[\s\S]*?<\/rPh>/g, ''))); return m; });
    const hojas = [];
    const reHoja = /<sheet\b([^>]*)\/?>/g; let mh;
    const wbx = sinPrefijos(wb);
    while ((mh = reHoja.exec(wbx))) {
      const nombre = attr(mh[1], 'name') || 'Hoja';
      const rid = attr(mh[1], 'r:id') || attr(mh[1], 'id');
      let destino = relMap[rid] || '';
      if (!destino) continue;
      destino = destino.replace(/^\//, '');
      if (!destino.startsWith('xl/')) destino = 'xl/' + destino;
      const xml = await zip.texto(destino);
      if (!xml) continue;
      const filas = [];
      const x = sinPrefijos(xml);
      const reFila = /<row\b([^>]*)>([\s\S]*?)<\/row>|<row\b([^>]*)\/>/g; let mf; let filaAuto = 0;
      while ((mf = reFila.exec(x))) {
        const ra = mf[1] || mf[3] || '';
        const rNum = parseInt(attr(ra, 'r'), 10);
        const fi = isFinite(rNum) ? rNum - 1 : filaAuto;
        filaAuto = fi + 1;
        const fila = [];
        const reCelda = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g; let mc; let colAuto = 0;
        while ((mc = reCelda.exec(mf[2] || ''))) {
          const ca = mc[1], cont = mc[2] || '';
          const ref = attr(ca, 'r');
          const ci = ref ? colIndice(ref) : colAuto;
          colAuto = ci + 1;
          const t = attr(ca, 't');
          let val = '';
          if (t === 'inlineStr') val = textos(cont);
          else {
            const mv = /<v>([\s\S]*?)<\/v>/.exec(cont);
            const v = mv ? desEscapar(mv[1]) : '';
            if (t === 's') val = ss[parseInt(v, 10)] || '';
            else if (t === 'b') val = v === '1' ? 'TRUE' : 'FALSE';
            else if (t === 'str' || t === 'e') val = v;
            else val = numeroTexto(v);
          }
          if (val !== '') fila[ci] = val;
        }
        filas[fi] = fila;
      }
      for (let i = 0; i < filas.length; i++) if (!filas[i]) filas[i] = [];
      hojas.push({ nombre, filas });
    }
    return hojas;
  };

  /* ============================================================
     XLSX — ESCRITURA (para exportar el avance)
     ============================================================ */
  const TABLA_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TABLA_CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  const enc = new TextEncoder();
  const xmlEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  function letraCol(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }

  function zipGuardar(archivos) {          // [{nombre, datos:Uint8Array}] sin compresión
    const partes = [], central = []; let off = 0;
    for (const a of archivos) {
      const nom = enc.encode(a.nombre), d = a.datos, crc = crc32(d);
      const h = new Uint8Array(30 + nom.length), v = new DataView(h.buffer);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
      v.setUint32(14, crc, true); v.setUint32(18, d.length, true); v.setUint32(22, d.length, true); v.setUint16(26, nom.length, true);
      h.set(nom, 30); partes.push(h, d);
      const c = new Uint8Array(46 + nom.length), w = new DataView(c.buffer);
      w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true);
      w.setUint32(16, crc, true); w.setUint32(20, d.length, true); w.setUint32(24, d.length, true); w.setUint16(28, nom.length, true);
      w.setUint32(42, off, true); c.set(nom, 46); central.push(c);
      off += h.length + d.length;
    }
    const tamC = central.reduce((s, c) => s + c.length, 0);
    const fin = new Uint8Array(22), f = new DataView(fin.buffer);
    f.setUint32(0, 0x06054b50, true); f.setUint16(8, archivos.length, true); f.setUint16(10, archivos.length, true);
    f.setUint32(12, tamC, true); f.setUint32(16, off, true);
    const todo = [...partes, ...central, fin];
    const out = new Uint8Array(todo.reduce((s, x) => s + x.length, 0)); let p = 0;
    for (const x of todo) { out.set(x, p); p += x.length; }
    return out;
  }

  // hojas: [{nombre, filas:[[...]], anchos?:[n]}]  — fila 0 = encabezado en negrita
  N.escribirXlsx = function (hojas) {
    const arch = [];
    const put = (n, s) => arch.push({ nombre: n, datos: enc.encode(s) });
    const nombres = hojas.map((h, i) => (String(h.nombre || ('Hoja' + (i + 1))).replace(/[\\\/?*\[\]:]/g, ' ').slice(0, 31)) || ('Hoja' + (i + 1)));
    put('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>');
    put('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    put('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      nombres.map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>');
    put('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
      `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    put('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEDEDEA"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
    hojas.forEach((h, i) => {
      const filas = h.filas || [];
      const nCols = filas.reduce((m, f) => Math.max(m, f.length), 0);
      const anchos = h.anchos || Array.from({ length: nCols }, (_, c) => Math.min(60, Math.max(8, ...filas.slice(0, 300).map(f => String(f[c] == null ? '' : f[c]).length + 2))));
      const cols = nCols ? '<cols>' + anchos.map((w, c) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>' : '';
      const filasXml = filas.map((f, r) => '<row r="' + (r + 1) + '">' + f.map((v, c) => {
        if (v == null || v === '') return '';
        const ref = letraCol(c) + (r + 1), s = r === 0 ? ' s="1"' : '';
        if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
        return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
      }).join('') + '</row>').join('');
      put(`xl/worksheets/sheet${i + 1}.xml`, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' + cols + '<sheetData>' + filasXml + '</sheetData></worksheet>');
    });
    return zipGuardar(arch);
  };

  /* ============================================================
     LECTURA DE LISTAS DE FOTOGRAFÍA
     Detecta las columnas por su NOMBRE (no por posición), así
     funciona aunque cada hoja tenga columnas distintas.
     ============================================================ */
  const COLUMNAS = [
    ['ref_base', /ref(erencia)?\.?\s*base|serial\s*unific|cod(igo)?\.?\s*base|ref\.?\s*unific/],
    ['marca', /^marca/],
    ['plu', /\bplu\b|nom_?ref/],
    ['codigos', /^cod(igo)?s?\b|cod_?ref|\bean\b|barras/],
    ['serial', /^(nombre\s*)?serial\b|^estilo\b|^modelo\b/],
    ['tallas', /^talla/],
    ['descripcion', /descrip/],
    ['bodegas', /bodega|^tienda|ubicaci/],
    ['ecommerce', /e-?com+erce/],
    ['cantidad', /^cant|^unidades$/],
    ['precio', /precio|^pvp/]
  ];
  const CLAVE_ENC = ['ref_base', 'codigos', 'serial', 'descripcion', 'marca', 'tallas'];

  function claveColumna(texto) {
    const t = N.norm(texto);
    if (!t) return null;
    for (const [k, re] of COLUMNAS) if (re.test(t)) return k;
    return null;
  }

  function buscarEncabezado(filas) {
    for (let r = 0; r < Math.min(filas.length, 25); r++) {
      const f = filas[r] || [];
      const mapa = {}; const usadas = new Set();
      f.forEach((c, i) => { const k = claveColumna(c); if (k && mapa[k] == null) { mapa[k] = i; usadas.add(i); } });
      const puntos = CLAVE_ENC.filter(k => mapa[k] != null).length;
      if (puntos >= 3 && (mapa.ref_base != null || mapa.codigos != null)) return { fila: r, mapa, usadas };
    }
    return null;
  }

  N.partirLista = (v, re) => String(v == null ? '' : v).split(re || /[,;|\n]+/).map(s => s.trim()).filter(Boolean);
  N.parsearBodegas = function (v) {
    const out = {}; const re = /([^,()]+?)\s*\(\s*(\d+)\s*\)/g; let m; const s = String(v == null ? '' : v);
    while ((m = re.exec(s))) { const b = m[1].trim(); out[b] = (out[b] || 0) + parseInt(m[2], 10); }
    if (!Object.keys(out).length) N.partirLista(s).forEach(b => { out[b] = (out[b] || 0) + 1; });
    return Object.entries(out).map(([b, n]) => ({ b, n }));
  };
  N.nombreSede = b => String(b || '').replace(/_/g, ' ');
  N.esTransito = b => /^tran/i.test(String(b || ''));

  // hojas → { productos:[...], hojas:[resumen], avisos:[texto] }
  N.parsearLibro = function (hojas) {
    const porRef = new Map(); const resumen = []; const avisos = [];
    for (const h of hojas) {
      const enc = buscarEncabezado(h.filas);
      if (!enc) { resumen.push({ nombre: h.nombre, usada: false, productos: 0 }); continue; }
      const cab = h.filas[enc.fila] || [];
      const datos = h.filas.slice(enc.fila + 1);
      // Columnas extra (Estado en Vault, notas…): solo si tienen datos en 2+ filas o texto
      const extras = [];
      const nCols = Math.max(cab.length, ...datos.map(f => (f || []).length));
      for (let c = 0; c < nCols; c++) {
        if (enc.usadas.has(c)) continue;
        const vals = datos.map(f => (f || [])[c]).filter(v => v != null && String(v).trim() !== '');
        if (!vals.length) continue;
        if (vals.length < 2 && /^-?[\d.,]+$/.test(String(vals[0]).trim())) continue;   // bloque de totales
        extras.push({ c, nombre: String(cab[c] || '').trim() || 'Nota' });
      }
      let n = 0;
      datos.forEach((f, i) => {
        f = f || [];
        const g = k => enc.mapa[k] != null ? String(f[enc.mapa[k]] == null ? '' : f[enc.mapa[k]]).trim() : '';
        const codigosTxt = g('codigos'), refTxt = g('ref_base'), serial = g('serial');
        if (!codigosTxt && !refTxt && !serial) return;
        if (N.norm(refTxt) && claveColumna(refTxt) === 'ref_base') return;          // encabezado repetido
        const alertas = [];
        const codigos = [...new Set(N.partirLista(codigosTxt, /[\s,;|]+/).map(N.limpiar).filter(c => c.length >= 4))];
        let ref = N.limpiar(refTxt);
        if (!ref && codigos.length) { ref = codigos[0].length > 6 ? codigos[0].slice(0, -2) : codigos[0]; alertas.push('Sin referencia base: se tomó del código'); }
        if (!ref) ref = N.limpiar(serial);
        if (!ref) return;
        const tallasArr = N.partirLista(g('tallas'));
        codigos.forEach(c => {
          if (refTxt && !c.startsWith(ref)) alertas.push(`El código ${c} no corresponde a la referencia ${ref}`);
          if (c.length > ref.length + 4) alertas.push(`El código ${c} parece mal escrito (muy largo)`);
        });
        if (codigos.length > 1 && tallasArr.length && tallasArr.length !== codigos.length) alertas.push('Las tallas no coinciden con los códigos');
        const cantTxt = g('cantidad').replace(/[^\d.-]/g, '');
        const ecoTxt = N.norm(g('ecommerce'));
        const extra = {};
        extras.forEach(x => { const v = f[x.c]; if (v != null && String(v).trim() !== '') extra[x.nombre] = String(v).trim(); });
        const prod = {
          ref_base: ref, hoja: h.nombre, marca: g('marca') || h.nombre, serial, plu: g('plu'),
          codigos, tallas: tallasArr,
          descripcion: g('descripcion'), bodegas: N.parsearBodegas(g('bodegas')),
          cantidad: cantTxt ? Number(cantTxt) : null, precio: g('precio'),
          ecommerce: ecoTxt ? /^(si|s|x|yes|true|1)$/.test(ecoTxt) : null,
          extra, alertas, fila: enc.fila + 2 + i
        };
        n++;
        const prev = porRef.get(ref);
        if (prev) {                                                          // misma referencia dos veces: se unen
          const mapaT = new Map(prev.codigos.map((c, k) => [c, prev.tallas[k]]));
          prod.codigos.forEach((c, k) => { if (!mapaT.has(c)) mapaT.set(c, prod.tallas[k]); });
          prev.codigos = [...mapaT.keys()]; prev.tallas = [...mapaT.values()].map(t => t == null ? '' : t);
          const b = {}; [...prev.bodegas, ...prod.bodegas].forEach(x => { b[x.b] = (b[x.b] || 0) + x.n; });
          prev.bodegas = Object.entries(b).map(([k, v]) => ({ b: k, n: v }));
          if (prod.cantidad != null) prev.cantidad = (prev.cantidad || 0) + prod.cantidad;
          prev.alertas = [...new Set([...prev.alertas, ...prod.alertas, `Referencia repetida (hoja ${prod.hoja}, fila ${prod.fila})`])];
          Object.assign(prev.extra, prod.extra);
        } else porRef.set(ref, prod);
      });
      resumen.push({ nombre: h.nombre, usada: true, productos: n, columnas: Object.keys(enc.mapa), fila_encabezado: enc.fila + 1 });
    }
    const productos = [...porRef.values()];
    // serial repetido en referencias distintas
    const porSerial = new Map();
    productos.forEach(p => { const s = N.alnum(p.serial); if (s.length >= 6 && /\d/.test(s)) { if (!porSerial.has(s)) porSerial.set(s, []); porSerial.get(s).push(p); } });
    porSerial.forEach(arr => { if (arr.length > 1) arr.forEach(p => p.alertas.push(`Serial repetido en: ${arr.filter(x => x !== p).map(x => x.ref_base).join(', ')}`)); });
    productos.forEach(p => { p.alertas = [...new Set(p.alertas)]; });
    if (!productos.length) avisos.push('No encontré columnas de referencia o códigos en ninguna hoja.');
    return { productos, hojas: resumen, avisos };
  };

  /* ============================================================
     MOTOR DE BÚSQUEDA
     ============================================================ */
  N.crearIndice = function (productos) {
    const porCodigo = new Map(), porBase = new Map(), porSerial = new Map();
    const add = (m, k, v) => { if (!k) return; let a = m.get(k); if (!a) m.set(k, a = []); if (!a.some(x => (x.p || x) === (v.p || v))) a.push(v); };
    const lista = productos.filter(p => p.activo !== false);
    lista.forEach(p => {
      add(porBase, N.limpiar(p.ref_base), p);
      (p.codigos || []).forEach((c, i) => {
        const cl = N.limpiar(c);
        add(porCodigo, cl, { p, talla: (p.tallas || [])[i] || '' });
        if (cl.length > 6) add(porBase, cl.slice(0, -2), p);
      });
      const s = N.limpiar(p.serial);
      if (s.length >= 4) { add(porSerial, s, p); add(porSerial, N.alnum(s), p); }
    });
    return { porCodigo, porBase, porSerial, lista };
  };

  // → { tipo:'exacto'|'otra_talla'|'referencia'|'serial'|'ninguno', codigo, resultados:[{p,talla}] }
  N.buscar = function (ix, entrada) {
    const c0 = N.limpiar(entrada);
    const res = (tipo, arr, extra) => ({ tipo, codigo: c0, resultados: arr, ...(extra || {}) });
    if (!c0) return res('ninguno', []);
    const variantes = [c0];
    if (/^0+\d/.test(c0)) variantes.push(c0.replace(/^0+/, ''));                // EAN leído con ceros de más
    for (const c of variantes) {
      let r = ix.porCodigo.get(c); if (r) return res('exacto', r.map(x => ({ p: x.p, talla: x.talla })));
      r = ix.porBase.get(c); if (r) return res('referencia', r.map(p => ({ p, talla: '' })));
      if (c.length > 6) { r = ix.porBase.get(c.slice(0, -2)); if (r) return res('otra_talla', r.map(p => ({ p, talla: '' })), { sufijo: c.slice(-2) }); }
      r = ix.porSerial.get(c) || ix.porSerial.get(N.alnum(c)); if (r) return res('serial', r.map(p => ({ p, talla: '' })));
    }
    return res('ninguno', []);
  };

  // Búsqueda mientras escribes (parcial): números en códigos; palabras en descripción/marca/serial
  N.sugerir = function (ix, texto, max) {
    max = max || 15;
    const t = N.norm(texto); if (t.length < 2) return [];
    const c = N.limpiar(texto);
    const palabras = t.split(' ').filter(Boolean);
    const out = [];
    for (const p of ix.lista) {
      let ok = false;
      if (c.length >= 3 && (N.limpiar(p.ref_base).includes(c) || (p.codigos || []).some(x => x.includes(c)) || N.alnum(p.serial).includes(N.alnum(c)) && N.alnum(c).length >= 3)) ok = true;
      else { const hay = N.norm([p.descripcion, p.marca, p.serial, p.plu].join(' ')); ok = palabras.every(w => hay.includes(w)); }
      if (ok) { out.push(p); if (out.length >= max) break; }
    }
    return out;
  };

  /* ---------- meses ---------- */
  N.MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  N.nombreMes = m => { const t = String(m || ''); const y = t.slice(0, 4), mm = parseInt(t.slice(5, 7), 10); return mm ? `${N.MESES[mm - 1]} ${y}` : ''; };

  /* ---------- fotos del Drive: archivo ↔ referencia ----------
     Busca el serial (o la referencia/código) dentro del nombre del archivo o de su carpeta.
     Ej. "JDMQ0046001T778AV1-600F_1.jpg" → serial JDMQ0046001T778AV1-600F */
  N.emparejarArchivos = function (productos, archivos) {
    const claves = [];
    productos.forEach(p => {
      const ks = new Set();
      const s = N.alnum(p.serial); if (s.length >= 8 && /\d/.test(s) && /[A-Z]/.test(s)) ks.add(s);
      const r = N.alnum(p.ref_base); if (r.length >= 10) ks.add(r);
      (p.codigos || []).forEach(c => { const a = N.alnum(c); if (a.length >= 12) ks.add(a); });
      if (ks.size) claves.push([p, [...ks]]);
    });
    const out = [], visto = new Set();
    (archivos || []).forEach(f => {
      const nombre = N.alnum(String((f.r || '') + '/' + (f.n || '')).replace(/\.[a-z0-9]{2,5}$/i, ''));
      for (const [p, ks] of claves) if (!visto.has(p.id) && ks.some(k => nombre.includes(k))) { visto.add(p.id); out.push({ p, archivo: f.n }); }
    });
    return out;
  };

  N.fotografiadasDe = arr => arr.filter(N.yaFotografiada).length;

  if (typeof module !== 'undefined' && module.exports) module.exports = N;
  else root.FotoNucleo = N;
})(typeof window !== 'undefined' ? window : globalThis);
