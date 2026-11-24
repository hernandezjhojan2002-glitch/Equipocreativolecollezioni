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
  // El 0 de adelante no cambia la referencia: "0788058925026" = "788058925026" (etiquetas, cajas y Excel lo escriben distinto)
  N.sinCeros = s => { const t = String(s == null ? '' : s).replace(/^0+/, ''); return t || String(s == null ? '' : s); };
  N.clave = s => N.sinCeros(N.alnum(s));            // para cruzar la misma referencia entre Excel

  /* ---------- pasos de la foto (los mismos del Excel de digital) ----------
     Sin foto → (Localizada: ya la ubicaron en tienda) → Foto tomada → Foto descargada
     → En el drive → Subida en página.  "Localizada" solo existe en la app. */
  N.ESTADOS = [
    ['pendiente', 'Sin foto'], ['localizado', 'Localizada'], ['fotografiado', 'Foto tomada'],
    ['descargada', 'Foto descargada'], ['drive', 'En el drive'], ['subido', 'Subida en página']
  ];
  N.CORTO = { pendiente: 'Sin foto', localizado: 'Localizada', fotografiado: 'Tomada', descargada: 'Descargada', drive: 'En drive', subido: 'En página' };
  // 'editado' es el nombre viejo de 'descargada' (datos guardados en el teléfono antes de la v4)
  N.ORDEN = { pendiente: 0, localizado: 1, fotografiado: 2, descargada: 3, editado: 3, drive: 4, subido: 5 };
  N.normEstado = e => e === 'editado' ? 'descargada' : (e || 'pendiente');
  N.etiquetaEstado = k => (N.ESTADOS.find(e => e[0] === N.normEstado(k)) || [k, k])[1];
  N.etiquetaCorta = k => N.CORTO[N.normEstado(k)] || k;
  N.yaFotografiada = p => N.ORDEN[p.estado] >= 2;          // ya tiene foto (tomada o más)
  N.enDrive = p => N.ORDEN[p.estado] >= 4;                 // el trabajo de fotografía ya terminó

  // Texto de la lista desplegable del Excel → paso de la app
  N.estadoDeTexto = function (v) {
    const t = N.norm(v).replace(/[.:;]+$/, '').trim();
    if (!t || t.length > 40) return null;
    if (/^(no tienen? foto|sin foto|falta(n)? foto|pendiente)/.test(t)) return 'pendiente';
    if (/^(foto tomada|fotos tomadas|tomada|fotografiad)/.test(t)) return 'fotografiado';
    if (/^(foto descargada|fotos descargadas|descargad)/.test(t)) return 'descargada';
    if (/^((foto )?en (el )?drive|drive|subid[oa]s? al drive)/.test(t)) return 'drive';
    if (/^(subid[oa]s? (en|a) (la )?pagina|en (la )?pagina|publicad|subid[oa]s?$)/.test(t)) return 'subido';
    return null;
  };
  // Conteo por paso: { total, pendiente, localizado, fotografiado, descargada, drive, subido, sin_foto, con_foto, en_drive }
  N.contarEstados = function (arr, campo) {
    const c = { total: 0, pendiente: 0, localizado: 0, fotografiado: 0, descargada: 0, drive: 0, subido: 0 };
    (arr || []).forEach(p => { const e = N.normEstado(p[campo || 'estado']); c.total++; c[e] = (c[e] || 0) + 1; });
    c.sin_foto = c.pendiente + c.localizado;
    c.con_foto = c.fotografiado + c.descargada + c.drive + c.subido;
    c.en_drive = c.drive + c.subido;
    return c;
  };

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
  // CSV / TSV / tabla HTML (algunos sistemas exportan ".xls" que en realidad es texto o HTML)
  function decodificarTexto(b) {
    if (b[0] === 0xFF && b[1] === 0xFE) return new TextDecoder('utf-16le').decode(b.subarray(2));
    if (b[0] === 0xFE && b[1] === 0xFF) return new TextDecoder('utf-16be').decode(b.subarray(2));
    try { return new TextDecoder('utf-8', { fatal: true }).decode(b).replace(/^\uFEFF/, ''); } catch (e) { return new TextDecoder('windows-1252').decode(b); }
  }
  N.leerCsv = function (txt) {
    const linea1 = (txt.split(/\r?\n/).find(l => l.trim()) || '');
    const sep = [';', '\t', ',', '|'].map(c => [c, linea1.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
    const filas = []; let fila = [], campo = '', comillas = false;
    for (let i = 0; i < txt.length; i++) {
      const ch = txt[i];
      if (comillas) { if (ch === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else comillas = false; } else campo += ch; continue; }
      if (ch === '"' && campo === '') comillas = true;
      else if (ch === sep) { fila.push(campo); campo = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && txt[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = ''; }
      else campo += ch;
    }
    if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
    return filas.map(f => f.map(v => v.trim() === '' ? null : v.trim()));
  };
  function leerHtml(txt) {
    const ent = t => t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).trim();
    const tablas = txt.match(/<table[\s\S]*?<\/table>/gi) || [];
    return tablas.map((t, i) => ({ nombre: 'Hoja' + (i + 1), filas: (t.match(/<tr[\s\S]*?<\/tr>/gi) || []).map(tr => (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(td => { const v = ent(td); return v === '' ? null : v; })) }));
  }
  N.leerXlsx = async function (bytes) {
    const b0 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (!(b0[0] === 0x50 && b0[1] === 0x4B)) {                                    // no es .xlsx (zip)
      if (b0[0] === 0xD0 && b0[1] === 0xCF && b0[2] === 0x11 && b0[3] === 0xE0) throw new Error('Es un Excel viejo (.xls). Ábrelo y guárdalo como .xlsx, o súbelo a Drive como Hoja de Google y conecta ese link.');
      const txt = decodificarTexto(b0);
      if (/^\s*</.test(txt) && /<table/i.test(txt)) { const hs = leerHtml(txt); if (hs.length) return hs; }
      if (/[\x00-\x08]/.test(txt.slice(0, 2000))) throw new Error('No reconozco ese archivo. Súbelo como Excel (.xlsx), CSV o Hoja de Google.');
      return [{ nombre: 'Hoja1', filas: N.leerCsv(txt) }];
    }
    const zip = await leerZip(b0);
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
  // Nombres de columna conocidos: Excel de digital (Ref base, Códigos…), los del sistema (cod_ref, nom_ref,
  // serial, saldo, Ini_Bod, Nom_Linea…) y otros comunes (SKU, EAN, Referencia, Tienda…)
  const COLUMNAS = [
    ['ref_base', /ref(erencia)?\.?\s*base|serial\s*unific|cod(igo)?\.?\s*base|ref\.?\s*unific|^ref(erencia)?\.?$|^ref(erencia)?\.?\s*(del?\s*)?(producto|articulo|item)$|^sku$|^style$|^estilo\s*color|^reference$|^ref\.?\s*no\.?$|^style\s*(no|code|number)|^item\s*(no|code|number)|^article\s*(no|number)/],
    ['marca', /^marca|^brand|nom_?linea|^l[ií]nea$|^proveedor$/],
    ['plu', /\bplu\b/],
    ['codigos', /^cod(igo)?s?\b|cod_?ref|\bean\b|\bupc\b|barras|barcode|^gtin/],
    ['serial', /^(nombre\s*)?serial\b|^estilo\b|^modelo\b/],
    ['tallas', /^talla|desc_?talla|^size$/],
    ['descripcion', /descrip|^nom_?ref|^nombre( del)?( producto| articulo)?$|^producto$|^detalle|^articulo$|^product( name)?$|^item name$|^name$|^title$/],
    ['bodegas', /bodega|^tienda|ubicaci|^b$|ini_?bod|^almac[eé]n|^sede$|^punto de venta|^store|^shop$|^location|^warehouse/],
    ['ecommerce', /e-?com+erce/],
    ['cantidad', /^cant|^unidades$|^saldo|^stock$|^existencia|^qty|^inventario$|^quantity|^units?$/],
    ['precio', /precio|^pvp|^val_?ref$|^price|^retail/]
  ];
  const CLAVE_ENC = ['ref_base', 'codigos', 'serial', 'descripcion', 'marca', 'tallas'];
  // Columnas que no se muestran en la tarjeta (costos, fechas, totales del sistema…)
  const NO_EXTRA = /cost|^fec|fecha|% ?desc|descuento|^cod_?(tip|imp)|^anos?$|^im$|^si$|prec_?total|^v\.? ?invt|valor|^total|^%|porcentaje|avance/;
  const ETIQUETA_EXTRA = [[/nom_?grup|^grupo|^categor/, 'Grupo'], [/^sexo|^genero/, 'Sexo'], [/^color/, 'Color']];

  function claveColumna(texto) {
    const t = N.norm(texto);
    if (!t) return null;
    for (const [k, re] of COLUMNAS) if (re.test(t)) return k;
    return null;
  }
  // Celda como texto limpio: 192489788161202.0 → 192489788161202 · 1.92489788161202E+14 → 192489788161202
  N.celda = function (v) {
    if (v == null) return '';
    let t = String(v).trim();
    if (/^-?\d+\.0+$/.test(t)) t = t.replace(/\.0+$/, '');
    else if (/^-?\d(\.\d+)?e\+?\d+$/i.test(t)) { const n = Number(t); if (Number.isSafeInteger(n)) t = String(n); }
    return t;
  };
  const esNum = v => /^-?[\d.,$ ]+$/.test(v) && /\d/.test(v);
  const pareceCodigo = v => /^[A-Za-z0-9][A-Za-z0-9\-\/.]{4,24}$/.test(v) && /\d/.test(v);
  const pareceTexto = v => v.length >= 10 && /\s/.test(v) && /[A-Za-zÁÉÍÓÚÑáéíóúñ]{3,}/.test(v);

  // Fila de encabezado: la que más nombres conocidos tenga (en las primeras 30), con una columna que identifique
  // (referencia, códigos o serial) y al menos 3 columnas reconocidas.
  function buscarEncabezado(filas) {
    let mejor = null;
    for (let r = 0; r < Math.min(filas.length, 30); r++) {
      const cands = {};
      (filas[r] || []).forEach((c, i) => { const k = claveColumna(c); if (k) (cands[k] = cands[k] || []).push(i); });
      const ks = Object.keys(cands);
      if (!(cands.ref_base || cands.codigos || cands.serial) || ks.length < 3) continue;
      const puntos = ks.length + CLAVE_ENC.filter(k => cands[k]).length;
      if (!mejor || puntos > mejor.puntos) mejor = { fila: r, cands, puntos };
    }
    return mejor;
  }
  // Si dos columnas son del mismo tipo (Talla y desc_talla, Bodega e Ini_Bod…), se escoge por lo que traen
  function resolverColumnas(enc, datos) {
    const valores = c => datos.slice(0, 400).map(f => N.celda((f || [])[c])).filter(Boolean);
    const puntaje = {
      bodegas: vs => vs.filter(v => !esNum(v)).length,                         // nombres de tienda, no números
      tallas: vs => vs.filter(v => !esNum(v)).length * 2 + vs.length,            // "S, M, L" antes que "2"
      codigos: vs => vs.filter(v => /^\d{8,16}$/.test(N.limpiar(v))).length,
      descripcion: vs => vs.reduce((s, v) => s + Math.min(v.length, 60), 0)
    };
    const mapa = {}, usadas = new Set();
    for (const [k, cols] of Object.entries(enc.cands)) {
      let c = cols[0];
      if (cols.length > 1) { const p = puntaje[k] || (vs => vs.length); c = cols.slice().sort((x, y) => p(valores(y)) - p(valores(x)) || x - y)[0]; }
      mapa[k] = c; cols.forEach(x => usadas.add(x));
    }
    return { fila: enc.fila, mapa, usadas };
  }
  // Sin encabezados reconocibles: se mira lo que hay en cada columna (códigos, descripciones)
  function porContenido(filas) {
    const muestra = filas.slice(0, 300), nCols = muestra.reduce((m, f) => Math.max(m, (f || []).length), 0), st = [];
    for (let c = 0; c < nCols; c++) {
      const vs = muestra.map(f => N.celda((f || [])[c])).filter(Boolean);
      if (vs.length < 5) continue;
      st.push({ c, n: vs.length, codigo: vs.filter(pareceCodigo).length / vs.length, largo: vs.filter(v => /^\d{11,16}$/.test(v)).length / vs.length,
                texto: vs.filter(pareceTexto).length / vs.length, unicos: new Set(vs).size / vs.length });
    }
    const ids = st.filter(x => x.codigo >= 0.7 && x.unicos >= 0.3).sort((a, b) => b.unicos - a.unicos || b.n - a.n);
    const desc = st.filter(x => x.texto >= 0.6).sort((a, b) => b.n - a.n)[0];
    if (!ids.length || !desc) return null;
    const mapa = {}, usadas = new Set([desc.c]);
    const cod = ids.find(x => x.largo >= 0.8), otro = ids.find(x => x !== cod && x.largo < 0.8);
    if (cod) { mapa.codigos = cod.c; usadas.add(cod.c); }
    if (otro) { mapa[cod ? 'serial' : 'ref_base'] = otro.c; usadas.add(otro.c); }
    mapa.descripcion = desc.c;
    const idc = (cod || otro).c; let fila = -1;                                  // ¿hay una fila de títulos arriba?
    for (let r = 0; r < Math.min(muestra.length, 30); r++) { const v = N.celda((muestra[r] || [])[idc]); if (v) { if (!pareceCodigo(v)) fila = r; break; } }
    return { fila, mapa, usadas, contenido: true };
  }

  N.letraColumna = c => { let t = ''; c++; while (c > 0) { const m = (c - 1) % 26; t = String.fromCharCode(65 + m) + t; c = Math.floor((c - 1) / 26); } return t; };
  N.partirLista = (v, re) => String(v == null ? '' : v).split(re || /[,;|\n]+/).map(s => s.trim()).filter(Boolean);
  N.parsearBodegas = function (v) {
    const out = {}; const re = /([^,()]+?)\s*\(\s*(\d+)\s*\)/g; let m; const s = String(v == null ? '' : v);
    while ((m = re.exec(s))) { const b = m[1].trim(); out[b] = (out[b] || 0) + parseInt(m[2], 10); }
    if (!Object.keys(out).length) N.partirLista(s).forEach(b => { out[b] = (out[b] || 0) + 1; });
    return Object.entries(out).map(([b, n]) => ({ b, n }));
  };
  N.nombreSede = b => String(b || '').replace(/_/g, ' ');
  // "109", "CALLE_109", "Calle 109" → la misma tienda
  N.sedeCanon = b => { const t = String(b == null ? '' : b).trim().replace(/^(\d+)\.0+$/, '$1'); return /^(calle[\s_]*)?109$/i.test(t) ? 'Calle_109' : t; };
  // Sin columna de marca, la marca es el nombre de la hoja: "HACKETT" → "Hackett" (siglas como "H&B" se quedan)
  N.marcaDeHoja = n => { const t = String(n || '').trim(); return /^[A-ZÁÉÍÓÚÑ ]{4,}$/.test(t) ? t.toLowerCase().replace(/(^|\s)\S/g, x => x.toUpperCase()) : t; };
  N.esTransito = b => /^tran/i.test(String(b || ''));

  // hojas → { productos:[...], hojas:[resumen], avisos:[texto] }
  // op.nombre: nombre de la colección (sirve de marca cuando la hoja se llama "Hoja1")
  N.parsearLibro = function (hojas, op) {
    op = op || {};
    const porRef = new Map(), porCodigo = new Map(), porSerialG = new Map(), firmas = new Map(), conRefBase = new WeakSet(); const resumen = []; const avisos = [];
    hojas.forEach((h, hn) => { h._n = hn; });
    // 1) encabezados reconocibles; 2) si ninguna hoja los tiene, se lee por lo que hay en las columnas
    let encs = hojas.map(h => { const e = buscarEncabezado(h.filas); return e ? resolverColumnas(e, h.filas.slice(e.fila + 1)) : null; });
    if (!encs.some(Boolean)) encs = hojas.map(h => porContenido(h.filas));
    hojas.forEach((h, hi) => {
      const enc = encs[hi];
      if (!enc) { resumen.push({ nombre: h.nombre, usada: false, productos: 0 }); return; }
      const cab = h.filas[enc.fila] || [];
      const datos = h.filas.slice(enc.fila + 1);
      const valoresCol = c => datos.map(f => N.celda((f || [])[c])).filter(Boolean);
      // Una columna "REF" que en realidad trae la descripción ("CAMISA SPORT HARMONT & BLAINE BLANCO…")
      if (enc.mapa.ref_base != null) {
        const vs = valoresCol(enc.mapa.ref_base);
        if (vs.length && vs.filter(pareceTexto).length >= 0.6 * vs.length) {
          if (enc.mapa.descripcion == null) enc.mapa.descripcion = enc.mapa.ref_base;
          delete enc.mapa.ref_base;
        }
      }
      const nCols = Math.max(cab.length, ...datos.slice(0, 2000).map(f => (f || []).length));
      // Códigos de barras en una columna sin título (ej. la primera columna vacía arriba)
      if (enc.mapa.codigos == null) for (let c = 0; c < nCols; c++) {
        if (enc.usadas.has(c) || claveColumna(cab[c])) continue;
        const vs = valoresCol(c);
        if (vs.length >= 5 && vs.filter(v => /^\d{11,16}$/.test(v)).length >= 0.8 * vs.length) { enc.mapa.codigos = c; enc.usadas.add(c); break; }
      }
      if (enc.mapa.ref_base == null && enc.mapa.codigos == null && enc.mapa.serial == null) { resumen.push({ nombre: h.nombre, usada: false, productos: 0 }); return; }
      // Columna del proceso de la foto (lista desplegable: no tiene foto, foto tomada, en el drive…).
      // Se reconoce por sus VALORES: muchas veces no tiene título o está corrida de columna.
      let colEstado = -1, mejor = 0;
      for (let c = 0; c < nCols; c++) {
        if (enc.usadas.has(c)) continue;
        const vals = datos.map(f => (f || [])[c]).filter(v => v != null && String(v).trim() !== '');
        const ok = vals.filter(v => N.estadoDeTexto(v)).length;
        if (ok && ok >= vals.length * 0.6 && ok > mejor) { mejor = ok; colEstado = c; }
      }
      if (colEstado < 0) {            // columna titulada "Estado de la foto"/"Proceso" aunque todavía esté vacía
        cab.forEach((t, c) => { if (colEstado < 0 && !enc.usadas.has(c) && /^(estado( de (la )?foto)?|proceso|foto)$/.test(N.norm(t))) {
          const vals = datos.map(f => (f || [])[c]).filter(v => v != null && String(v).trim() !== '');
          if (vals.every(v => N.estadoDeTexto(v))) colEstado = c;
        } });
      }
      // Columnas extra (Estado en Vault, notas, grupo…): con texto; sin costos, fechas ni totales
      const idCols = ['ref_base', 'codigos', 'serial'].map(k => enc.mapa[k]).filter(c => c != null);
      const nFilas = datos.filter(f => idCols.some(c => (f || [])[c] != null && String(f[c]).trim() !== '')).length;
      const extras = [];
      for (let c = 0; c < nCols; c++) {
        if (enc.usadas.has(c) || c === colEstado) continue;
        const vals = valoresCol(c);
        if (!vals.length) continue;
        const tit = N.norm(cab[c]);
        if (tit && (NO_EXTRA.test(tit) || N.estadoDeTexto(cab[c]))) continue;            // costos, fechas, resúmenes
        if (vals.filter(esNum).length >= 0.8 * vals.length) continue;                    // números sueltos (totales, códigos internos)
        const filasCon = datos.map((f, i) => ((f || [])[c] != null && String(f[c]).trim() !== '') ? i : -1).filter(i => i >= 0);
        if (nFilas >= 10 && filasCon.length <= 3 && filasCon.every(i => i < 5)) continue;  // resumen al lado de la tabla
        const et = ETIQUETA_EXTRA.find(([re]) => re.test(tit));
        extras.push({ c, nombre: et ? et[1] : (String(cab[c] || '').trim() || 'Nota') });
      }
      const generica = /^(hoja|sheet|tabelle|feuille|foglio|planilha|plan)\s*\d*$/i.test(String(h.nombre || '').trim());
      const refEsBase = enc.mapa.ref_base != null && /ref(erencia)?\.?\s*base/.test(N.norm(cab[enc.mapa.ref_base]));
      let n = 0;
      datos.forEach((f, i) => {
        f = f || [];
        const g = k => enc.mapa[k] != null ? N.celda(f[enc.mapa[k]]) : '';
        const codigosTxt = g('codigos'), refTxt = g('ref_base'), serial = g('serial');
        if (!codigosTxt && !refTxt && !serial) return;
        if (N.norm(refTxt) && claveColumna(refTxt) === 'ref_base') return;          // encabezado repetido
        if (N.norm(serial) && claveColumna(serial) === 'serial') return;
        if (enc.contenido && !pareceCodigo(refTxt || serial || codigosTxt.split(/[\s,;|]+/)[0] || '')) return;   // títulos o totales
        const alertas = [];
        const codigos = [...new Set(N.partirLista(codigosTxt, /[\s,;|]+/).map(N.celda).map(N.limpiar).filter(c => c.length >= 4))];
        let ref = N.limpiar(refTxt);
        if (!ref && codigos.length) { ref = codigos[0].length > 6 ? codigos[0].slice(0, -2) : codigos[0]; }
        if (!ref) ref = N.limpiar(serial);
        if (!ref) return;
        const tallasArr = N.partirLista(g('tallas'));
        if (refEsBase) codigos.forEach(c => {                   // solo donde la Ref base es el inicio del código (Excel de digital)
          if (!N.sinCeros(c).startsWith(N.sinCeros(ref))) alertas.push(`El código ${c} no corresponde a la referencia ${ref}`);
          if (c.length > ref.length + 4) alertas.push(`El código ${c} parece mal escrito (muy largo)`);
        });
        if (codigos.length > 1 && tallasArr.length && tallasArr.length !== codigos.length) alertas.push('Las tallas no coinciden con los códigos');
        const cantTxt = g('cantidad').replace(/[^\d.-]/g, '');
        const ecoTxt = N.norm(g('ecommerce'));
        const extra = {};
        extras.forEach(x => { const v = N.celda(f[x.c]); if (v) extra[x.nombre] = v; });
        const estadoExcel = colEstado >= 0 ? N.estadoDeTexto(f[colEstado]) : null;
        const desc = g('descripcion');
        // Una fila por talla (listas del sistema): la talla escrita en la descripción ("… T-M") manda sobre un código de talla ("2")
        let tallasFin = tallasArr;
        if (codigos.length <= 1) { const mt = /\bT-\s?(\d{1,2}(?:[.,]5)?|X{0,3}[SML]|XX?L|U(?:NICA)?)\b/i.exec(desc); if (mt && (!tallasFin.length || /^\d$/.test(tallasFin[0]))) tallasFin = [mt[1].toUpperCase()]; }
        const cantN = cantTxt && isFinite(Number(cantTxt)) ? Number(cantTxt) : null;
        const bodTxt = g('bodegas'); const bods = N.parsearBodegas(bodTxt).map(x => ({ b: N.sedeCanon(x.b), n: x.n }));
        if (bods.length === 1 && !/\(\s*\d+\s*\)/.test(bodTxt) && cantN > 0) bods[0].n = cantN;   // una sola tienda: sus unidades
        const prod = {
          estado_excel: estadoExcel, hoja_n: h._n,
          ref_base: ref, hoja: h.nombre, marca: g('marca') || (generica ? (op.nombre || h.nombre) : N.marcaDeHoja(h.nombre)), serial, plu: g('plu'),
          codigos, tallas: tallasFin,
          descripcion: desc, bodegas: bods,
          cantidad: cantN, precio: g('precio'),
          ecommerce: ecoTxt ? /^(si|s|x|yes|true|1)$/.test(ecoTxt) : null,
          extra, alertas, fila: enc.fila + 2 + i
        };
        n++;
        // La misma referencia (o el mismo código de barras) en otra fila u otra hoja: se unen
        // sin columna de referencia: el mismo serial es el mismo producto (mismo estilo y color, aunque venga de otra importación)
        const kSerial = enc.mapa.ref_base == null && N.alnum(serial).length >= 4 ? h._n + ':' + N.alnum(serial) : '';
        const prev = porRef.get(ref) || prod.codigos.map(c => porCodigo.get(c)).find(Boolean) || (kSerial && porSerialG.get(kSerial));
        if (prev) {
          const nuevoCod = prod.codigos.some(c => !prev.codigos.includes(c)), mismaHoja = prev.hoja === prod.hoja;
          const fs = firmas.get(prev) || new Set(), firma = prod.hoja + '|' + prod.codigos.join(',') + '|' + prod.bodegas.map(x => x.b).join(',');
          const repetida = mismaHoja && fs.has(firma);           // la misma fila otra vez (no otra talla ni otra tienda)
          fs.add(firma); firmas.set(prev, fs);
          const mapaT = new Map(prev.codigos.map((c, k) => [c, prev.tallas[k]]));
          prod.codigos.forEach((c, k) => { if (!mapaT.has(c)) mapaT.set(c, prod.tallas[k]); });
          prev.codigos = [...mapaT.keys()]; prev.tallas = [...mapaT.values()].map(t => t == null ? '' : t);
          if (!prev.codigos.length && prod.tallas.length) prev.tallas = [...new Set([...prev.tallas, ...prod.tallas])];
          if (nuevoCod || (mismaHoja && !repetida)) {          // la misma fila en otra hoja no suma dos veces
            const bb = {}; [...prev.bodegas, ...prod.bodegas].forEach(x => { bb[x.b] = (bb[x.b] || 0) + x.n; });
            prev.bodegas = Object.entries(bb).map(([k, v]) => ({ b: k, n: v }));
            if (prod.cantidad != null) prev.cantidad = (prev.cantidad || 0) + prod.cantidad;
          }
          if ((N.ORDEN[prod.estado_excel] ?? -1) > (N.ORDEN[prev.estado_excel] ?? -1)) prev.estado_excel = prod.estado_excel;
          if (!prev.descripcion && prod.descripcion) prev.descripcion = prod.descripcion;
          if (!prev.serial && prod.serial) prev.serial = prod.serial;
          // repetida de verdad (mismo código o sin códigos), no una talla más de la misma referencia
          if (repetida) prev.alertas = [...new Set([...prev.alertas, ...prod.alertas, `Referencia repetida (hoja ${prod.hoja}, fila ${prod.fila})`])];
          Object.keys(prod.extra).forEach(k => { if (prev.extra[k] == null) prev.extra[k] = prod.extra[k]; });
          prev.codigos.forEach(c => porCodigo.set(c, prev));
          if (kSerial && !porSerialG.has(kSerial)) porSerialG.set(kSerial, prev);
        } else { porRef.set(ref, prod); prod.codigos.forEach(c => { if (!porCodigo.has(c)) porCodigo.set(c, prod); }); if (kSerial) porSerialG.set(kSerial, prod);
                 firmas.set(prod, new Set([prod.hoja + '|' + prod.codigos.join(',') + '|' + prod.bodegas.map(x => x.b).join(',')])); if (refEsBase) conRefBase.add(prod); }
      });
      resumen.push({ nombre: h.nombre, usada: true, productos: n, columnas: Object.keys(enc.mapa), fila_encabezado: enc.fila + 1, por_contenido: !!enc.contenido,
                     columna_estado: colEstado >= 0 ? N.letraColumna(colEstado) : null });
    });
    const productos = [...porRef.values()];
    // Cuántas hay en cada paso según el Excel, por hoja
    resumen.forEach(r => { if (r.usada) {
      const ps = productos.filter(p => p.hoja === r.nombre);
      r.estados = N.contarEstados(ps.filter(p => p.estado_excel), 'estado_excel');
      r.sin_dato = ps.filter(p => !p.estado_excel).length;
    } });
    // serial repetido en referencias distintas
    const porSerial = new Map();
    productos.forEach(p => { const s = N.alnum(p.serial); if (conRefBase.has(p) && s.length >= 6 && /\d/.test(s)) { if (!porSerial.has(s)) porSerial.set(s, []); porSerial.get(s).push(p); } });
    porSerial.forEach(arr => { if (arr.length > 1) arr.forEach(p => p.alertas.push(`Serial repetido en: ${arr.filter(x => x !== p).map(x => x.ref_base).join(', ')}`)); });
    productos.forEach(p => { p.alertas = [...new Set(p.alertas)]; });
    if (!productos.length) avisos.push('No encontré columnas de referencia o códigos en ninguna hoja.');
    return { productos, hojas: resumen, avisos };
  };

  /* ============================================================
     MOTOR DE BÚSQUEDA
     ============================================================ */
  N.crearIndice = function (productos) {
    const porCodigo = new Map(), porBase = new Map(), porSerial = new Map(), porSerialAlnum = new Map();
    const add = (m, k, v) => { if (!k) return; let a = m.get(k); if (!a) m.set(k, a = []); if (!a.some(x => (x.p || x) === (v.p || v))) a.push(v); };
    const lista = productos.filter(p => p.activo !== false);
    lista.forEach(p => {
      const rb = N.limpiar(p.ref_base);
      add(porBase, rb, p); add(porBase, N.sinCeros(rb), p);
      (p.codigos || []).forEach((c, i) => {
        const cl = N.limpiar(c), c0 = N.sinCeros(cl), x = { p, talla: (p.tallas || [])[i] || '' };
        add(porCodigo, cl, x); if (c0 !== cl) add(porCodigo, c0, x);
        if (cl.length > 6) { add(porBase, cl.slice(0, -2), p); add(porBase, N.sinCeros(cl.slice(0, -2)), p); }
      });
      const s = N.limpiar(p.serial);
      if (s.length >= 4) { add(porSerial, s, p); add(porSerialAlnum, N.alnum(s), p); }
    });
    return { porCodigo, porBase, porSerial, porSerialAlnum, lista };
  };

  // → { tipo:'exacto'|'otra_talla'|'referencia'|'serial'|'ninguno', codigo, resultados:[{p,talla}] }
  // Nunca adivina: solo coincidencias EXACTAS del código leído. La única regla extra es la del
  // negocio (misma referencia, otra talla = mismo código sin los 2 dígitos finales de talla).
  // "manual" (lo que alguien escribe en Buscar) además acepta el serial sin guiones ni espacios.
  N.buscar = function (ix, entrada, manual) {
    const c = N.limpiar(entrada);
    const res = (tipo, arr, extra) => ({ tipo, codigo: c, resultados: arr, ...(extra || {}) });
    if (!c) return res('ninguno', []);
    const dos = (m, k) => m.get(k) || (N.sinCeros(k) !== k ? m.get(N.sinCeros(k)) : null);   // con y sin el 0 de adelante
    let r = dos(ix.porCodigo, c); if (r) return res('exacto', r.map(x => ({ p: x.p, talla: x.talla })));
    r = dos(ix.porBase, c); if (r) return res('referencia', r.map(p => ({ p, talla: '' })));
    if (c.length > 6) { r = dos(ix.porBase, c.slice(0, -2)); if (r) return res('otra_talla', r.map(p => ({ p, talla: '' })), { sufijo: c.slice(-2) }); }
    r = ix.porSerial.get(c); if (r) return res('serial', r.map(p => ({ p, talla: '' })));
    if (manual && ix.porSerialAlnum) { r = ix.porSerialAlnum.get(N.alnum(c)); if (r) return res('serial', r.map(p => ({ p, talla: '' }))); }
    return res('ninguno', []);
  };

  // Búsqueda mientras escribes (parcial): números en códigos; palabras en descripción/marca/serial
  N.sugerir = function (ix, texto, max) {
    max = max || 15;
    const t = N.norm(texto); if (t.length < 2) return [];
    let c = N.limpiar(texto); if (N.sinCeros(c).length >= 3) c = N.sinCeros(c);      // "0788…" encuentra "788…"
    const palabras = t.split(' ').filter(Boolean);
    const out = [];
    for (const p of ix.lista) {
      let ok = false;
      if (c.length >= 3 && (N.limpiar(p.ref_base).includes(c) || (p.codigos || []).some(x => N.limpiar(x).includes(c)) || N.alnum(p.serial).includes(N.alnum(c)) && N.alnum(c).length >= 3)) ok = true;
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
