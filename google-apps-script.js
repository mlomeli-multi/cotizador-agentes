// =============================================
// COTIZADOR AGENTES — Google Apps Script Backend
// =============================================
// Pegar este código en: Extensiones → Apps Script dentro del Google Sheet
// Luego Implementar → Nueva implementación → App web → Cualquier persona

function doGet(e) {
  return handleRequest(e);
}

// Nota de despliegue:
// - Ejecutar como: tu cuenta
// - Quién tiene acceso: Cualquier persona
// Si no, el frontend público no podrá leer usuarios ni cotizaciones.

// Si el Apps Script NO está ligado directamente al Google Sheet,
// pega aquí el ID del archivo para abrirlo de forma explícita.
// Ejemplo:
// const SPREADSHEET_ID = '1AbCdEf...';
const SPREADSHEET_ID = '1EzBWkmi9PqjgnZ_C1iDlzRWnqTJvhsuL4Z5s3LMgYiE';

function doPost(e) {
  return handleRequest(e);
}

function getDb() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheetOrError(sheetName) {
  const db = getDb();
  if (!db) return { ok: false, error: 'No se pudo abrir el Google Sheet configurado' };

  const sheet = db.getSheetByName(sheetName);
  if (!sheet) return { ok: false, error: `Hoja ${sheetName} no encontrada` };

  return { ok: true, sheet };
}

function handleRequest(e) {
  try {
    const params = e.parameter || {};
    let data = {};

    // Intentar leer payload de form data (URLSearchParams)
    if (params.payload) {
      data = JSON.parse(params.payload);
    }
    // Fallback: leer body directo (POST JSON)
    else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (pe) {
        // Si el body es form-encoded, parsear manualmente
        var pairs = e.postData.contents.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var kv = pairs[i].split('=');
          if (kv[0] === 'payload') {
            data = JSON.parse(decodeURIComponent(kv[1]));
            break;
          }
        }
      }
    }
    const action = params.action || data.action;

    let result;
    switch (action) {
      case 'getUsuarios':
        result = getUsuarios();
        break;
      case 'login':
        result = login(data.nombre, data.pin);
        break;
      case 'crearUsuario':
        result = crearUsuario(data);
        break;
      case 'editarUsuario':
        result = editarUsuario(data);
        break;
      case 'eliminarUsuario':
        result = eliminarUsuario(data.nombre);
        break;
      case 'guardarCotizacion':
        result = guardarCotizacion(data);
        break;
      case 'getCotizaciones':
        result = getCotizaciones(params.usuario || data.usuario, params.todas === 'true' || data.todas === true);
        break;
      default:
        result = { ok: false, error: 'Acción no válida' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== USUARIOS =====

function getUsuarios() {
  const lookup = getSheetOrError('Usuarios');
  if (!lookup.ok) return lookup;
  const sheet = lookup.sheet;

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { ok: true, usuarios: [] };

  const usuarios = [];
  for (let i = 1; i < data.length; i++) {
    usuarios.push({
      nombre: data[i][0],
      pin: String(data[i][1]),
      rol: data[i][2] || 'usuario',
      activo: data[i][3] !== false && data[i][3] !== 'FALSE' && data[i][3] !== 'No'
    });
  }
  return { ok: true, usuarios };
}

function login(nombre, pin) {
  if (!nombre || !pin) return { ok: false, error: 'Nombre y PIN requeridos' };

  const res = getUsuarios();
  if (!res.ok) return res;

  const user = res.usuarios.find(u =>
    u.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
    && u.pin === String(pin)
    && u.activo
  );

  if (!user) return { ok: false, error: 'Usuario o PIN incorrecto' };
  return { ok: true, usuario: { nombre: user.nombre, rol: user.rol } };
}

function crearUsuario(data) {
  const lookup = getSheetOrError('Usuarios');
  if (!lookup.ok) return lookup;
  const sheet = lookup.sheet;

  // Verificar si ya existe
  const existentes = sheet.getDataRange().getValues();
  for (let i = 1; i < existentes.length; i++) {
    if (existentes[i][0].toString().toLowerCase().trim() === data.nombre.toLowerCase().trim()) {
      return { ok: false, error: 'El usuario ya existe' };
    }
  }

  // Agregar headers si es la primera vez
  if (existentes.length === 0 || !existentes[0][0]) {
    sheet.getRange(1, 1, 1, 4).setValues([['Nombre', 'PIN', 'Rol', 'Activo']]);
  }

  sheet.appendRow([data.nombre, String(data.pin), data.rol || 'usuario', true]);
  return { ok: true };
}

function editarUsuario(data) {
  const lookup = getSheetOrError('Usuarios');
  if (!lookup.ok) return lookup;
  const sheet = lookup.sheet;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().toLowerCase().trim() === data.nombreOriginal.toLowerCase().trim()) {
      if (data.nombre) sheet.getRange(i + 1, 1).setValue(data.nombre);
      if (data.pin) sheet.getRange(i + 1, 2).setValue(String(data.pin));
      if (data.rol) sheet.getRange(i + 1, 3).setValue(data.rol);
      if (data.activo !== undefined) sheet.getRange(i + 1, 4).setValue(data.activo);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Usuario no encontrado' };
}

function eliminarUsuario(nombre) {
  const lookup = getSheetOrError('Usuarios');
  if (!lookup.ok) return lookup;
  const sheet = lookup.sheet;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().toLowerCase().trim() === nombre.toLowerCase().trim()) {
      sheet.getRange(i + 1, 4).setValue(false);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Usuario no encontrado' };
}

// ===== COTIZACIONES =====

function guardarCotizacion(data) {
  const lookup = getSheetOrError('Cotizaciones');
  if (!lookup.ok) return lookup;
  const sheet = lookup.sheet;

  // Headers si es primera vez
  const existentes = sheet.getDataRange().getValues();
  if (existentes.length === 0 || !existentes[0][0]) {
    sheet.getRange(1, 1, 1, 9).setValues([[
      'Timestamp', 'Usuario', 'Fecha', 'Aeropuerto', 'Destino',
      'Unidad', 'Proveedor', 'Tarifa', 'Detalles'
    ]]);
  }

  const now = new Date();
  const fecha = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  sheet.appendRow([
    fecha,
    data.usuario || 'Desconocido',
    fecha,
    data.aeropuerto || '',
    data.destino || '',
    data.unidad || '',
    data.proveedor || '',
    data.tarifa || '',
    data.detalles || ''
  ]);

  return { ok: true };
}

function getCotizaciones(usuario, todas) {
  const lookup = getSheetOrError('Cotizaciones');
  if (!lookup.ok) return lookup;
  const sheet = lookup.sheet;

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { ok: true, cotizaciones: [] };

  const cotizaciones = [];
  for (let i = 1; i < data.length; i++) {
    const row = {
      timestamp: data[i][0],
      usuario: data[i][1],
      fecha: data[i][2],
      aeropuerto: data[i][3],
      destino: data[i][4],
      unidad: data[i][5],
      proveedor: data[i][6],
      tarifa: data[i][7],
      detalles: data[i][8]
    };
    if (todas || !usuario || row.usuario.toLowerCase().trim() === usuario.toLowerCase().trim()) {
      cotizaciones.push(row);
    }
  }

  // Más recientes primero
  cotizaciones.reverse();
  return { ok: true, cotizaciones };
}
