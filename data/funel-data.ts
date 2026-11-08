export type Movement = {
  id: string; fecha: string | null; dnCelular: string | null; servicio: string | null;
  operacion: string | null; iccid: string | null; rfc: string | null; folio: string | null;
  canal: string | null; modalidad: string | null; codificado: string | null; notas: string | null;
};
export type DailySnapshot = { meta: { fecha?: string; cac?: string; ejecutivo?: string }; values: Record<string, string | null> };
export const SOURCE_FILE = "FunelPerLuis.xlsx";
export const SOURCE_SHEETS = ["INICIO", "Base_Datos_Movimientos", "Config_Catalogos", "Hoja1", "Hoja2"] as const;
export const MOVEMENTS: Movement[] = [
  {
    "id": "OPE--001",
    "fecha": "2026-10-31",
    "dnCelular": "9511880844",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474543623F",
    "rfc": null,
    "folio": null,
    "canal": "Telemarketing / Outbound",
    "modalidad": "Prepago",
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-000",
    "fecha": "2026-10-31",
    "dnCelular": "9513330567",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474543607F",
    "rfc": null,
    "folio": null,
    "canal": "CAP / Tienda",
    "modalidad": "Postpago Puro",
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-001",
    "fecha": "2026-10-31",
    "dnCelular": "9513322241",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474543599F",
    "rfc": null,
    "folio": null,
    "canal": "CAP / Tienda",
    "modalidad": "Postpago Control",
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-002",
    "fecha": "2026-10-31",
    "dnCelular": "9511618692",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474543672F",
    "rfc": null,
    "folio": null,
    "canal": "Call Center / FO",
    "modalidad": "Postpago Puro",
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-003",
    "fecha": "2026-10-31",
    "dnCelular": "9511752912",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474543664F",
    "rfc": null,
    "folio": null,
    "canal": "CAP / Tienda",
    "modalidad": "Prepago",
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-004",
    "fecha": "2026-10-31",
    "dnCelular": "9515103332",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474543896F",
    "rfc": null,
    "folio": null,
    "canal": "Canal Digital / Web",
    "modalidad": "Postpago Puro",
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-005",
    "fecha": "2026-10-31",
    "dnCelular": "9514750358",
    "servicio": "TELEMARKETIN",
    "operacion": "MIG-POSAGO",
    "iccid": "8952031000474543920F",
    "rfc": null,
    "folio": null,
    "canal": "CAP / Tienda",
    "modalidad": "Postpago Puro",
    "codificado": "SI",
    "notas": "SATATUS DE LA LINEA DESACTIVADA"
  },
  {
    "id": "OPE-006",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9541288180",
    "servicio": "SIM",
    "operacion": "REPOSION",
    "iccid": "NA",
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-007",
    "fecha": "2026-11-06 00:00:00",
    "dnCelular": "9511559627",
    "servicio": "VENTAS",
    "operacion": "VENTA-UNIVERSAL",
    "iccid": "8952031000474543961F",
    "rfc": "OIPS8306142H1",
    "folio": "9718037587",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-008",
    "fecha": "2026-11-06 00:00:00",
    "dnCelular": "9512441441",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": "PORT261030",
    "folio": "9718251674",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-009",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "3141431753",
    "servicio": "VENTAS",
    "operacion": "REPOSICION",
    "iccid": "8952031000474543938F",
    "rfc": "PORT140102",
    "folio": "9718764289",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-010",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9515891865",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8952031000474540000",
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": "consulta-posible candidato porta pos"
  },
  {
    "id": "OPE-011",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9518352942",
    "servicio": "TELEMARKETIN",
    "operacion": "MIG-POSAGO",
    "iccid": "8.95203100047464e+18",
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-012",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9512463806",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": null,
    "folio": "9721810611",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-013",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9512031497",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": null,
    "folio": "9721837241",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-014",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9512979134",
    "servicio": "SIM",
    "operacion": "CAMBIO SIM-ESIM",
    "iccid": null,
    "rfc": null,
    "folio": "9722127750",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-015",
    "fecha": "2026-03-11 00:00:00",
    "dnCelular": "9321041601",
    "servicio": "VENTAS",
    "operacion": "VENTA POSPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": null,
    "folio": "9722015823",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-016",
    "fecha": "2026-04-11 00:00:00",
    "dnCelular": "9514981041",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": null,
    "folio": "9723832764",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-017",
    "fecha": "2026-04-11 00:00:00",
    "dnCelular": "9511643987",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": null,
    "folio": "9724050615",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-018",
    "fecha": "2026-04-11 00:00:00",
    "dnCelular": "9514751925",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": null,
    "rfc": null,
    "folio": "9724195083",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-019",
    "fecha": "2026-04-11 00:00:00",
    "dnCelular": "9518599914",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": "8.95203100047454e+18",
    "rfc": null,
    "folio": "9724752212",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-020",
    "fecha": "2026-04-11 00:00:00",
    "dnCelular": "6646114124",
    "servicio": "SIM",
    "operacion": "CAMBIO SIM-ESIM",
    "iccid": null,
    "rfc": null,
    "folio": "9724890940",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-021",
    "fecha": "2026-04-11 00:00:00",
    "dnCelular": "9511983597",
    "servicio": "TELEMARKETIN",
    "operacion": "PREPAGO",
    "iccid": null,
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-022",
    "fecha": "2026-05-11 00:00:00",
    "dnCelular": "9821028315",
    "servicio": "VENTAS",
    "operacion": "VENTA PREPAGO",
    "iccid": "8952031000474545396F",
    "rfc": null,
    "folio": "9727002827",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-023",
    "fecha": "2026-05-11 00:00:00",
    "dnCelular": "9516466640",
    "servicio": "TELEMARKETIN",
    "operacion": null,
    "iccid": "8952031000474545446F",
    "rfc": null,
    "folio": "9727002827",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-024",
    "fecha": "2026-05-11 00:00:00",
    "dnCelular": "9513321290",
    "servicio": "TELEMARKETIN",
    "operacion": null,
    "iccid": "8952031000474545438F",
    "rfc": null,
    "folio": "9727060764",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-025",
    "fecha": null,
    "dnCelular": null,
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": "727608476",
    "canal": null,
    "modalidad": null,
    "codificado": null,
    "notas": null
  },
  {
    "id": "OPE-026",
    "fecha": "2026-06-11 00:00:00",
    "dnCelular": "9513290160",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-027",
    "fecha": "2026-06-11 00:00:00",
    "dnCelular": "9511826325",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-028",
    "fecha": "2026-06-11 00:00:00",
    "dnCelular": "9511309110",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-029",
    "fecha": "2026-06-11 00:00:00",
    "dnCelular": "9516360807",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": null,
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-030",
    "fecha": "2026-06-11 00:00:00",
    "dnCelular": "9511309110",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": "9730707617",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-031",
    "fecha": "2026-06-11 00:00:00",
    "dnCelular": "9518007438",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": "9730462896",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-032",
    "fecha": null,
    "dnCelular": "9513296039",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": "9730519141",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-033",
    "fecha": null,
    "dnCelular": "9513808856",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": null,
    "folio": "9730790253",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  },
  {
    "id": "OPE-034",
    "fecha": null,
    "dnCelular": "9514209485",
    "servicio": null,
    "operacion": null,
    "iccid": null,
    "rfc": "HECA8210149KA",
    "folio": "9730998324",
    "canal": null,
    "modalidad": null,
    "codificado": "SI",
    "notas": null
  }
];
export const CATALOGS: Record<string, string[]> = {
  "Área / Macroservicio": [
    "VENTAS",
    "TELEMARKETIN",
    "SIM",
    "Gestión Financiera",
    "ATENCION"
  ],
  "Modalidad": [
    "Postpago Puro",
    "Postpago Control",
    "Prepago"
  ],
  "Estatus Ónix": [
    "Finalizado",
    "Esperando / En Proceso",
    "Cancelado",
    "Suspendido"
  ],
  "VENTAS": [
    "VENTA POSPAGO",
    "VENTA PREPAGO",
    "TERMINAL",
    "TERM-POS",
    "TERM-PRE",
    "REPOSICION",
    "MIGRACION",
    "ADICCION",
    "RENOVACION",
    "SIM-UNIVERSAL",
    "ESIM"
  ],
  "TELEMARKETIN": [
    "PREPAGO",
    "POSPAGO",
    "MIG-POSAGO"
  ],
  "SIM": [
    "CAMBIO SIM-ESIM",
    "PORTABILIDAD",
    "REPOSION",
    "DANO/0.00"
  ],
  "Gestión Financiera": [
    "Devolución de Equipo (NOM-184)",
    "Reembolso de Depósito",
    "Cobro Renta Anticipada",
    "Liquidación Financiamiento"
  ],
  "Canales General": [
    "Telemarketing / Outbound",
    "CAP / Tienda",
    "Canal Digital / Web",
    "Call Center / FO",
    "Back Office"
  ],
  "CODIFICADO": []
};
export const DAILY_SNAPSHOTS: Record<string, DailySnapshot> = {
  "Hoja1": {
    "meta": {
      "fecha": "2026-11-06 00:00:00",
      "cac": "CAC OAXACA",
      "ejecutivo": "EDUARDO LUIS CRUZ"
    },
    "values": {
      "2026-11-06 00:00:00": null,
      "CAC OAXACA": null,
      "EDUARDO LUIS CRUZ": null,
      "ATENCION GENERAL NO CUENTA TLMK": "4",
      "TLMK $60": "1",
      "TLMK $90": "0",
      "TLMK $100": "5",
      "MIGRACIONES TLMK": "0",
      "JUMP": "0",
      "TRAFICO TOTAL TLMK": "0",
      "PRO ILIMITADO": "0",
      "PRO 30.": "0",
      "PRO 20": "0",
      "PRO 18": "0",
      "PRO 16": "0",
      "SOHO": "0",
      "PRE PLAN": "0",
      "RENOVACION": "0",
      "PAYJOY": "0",
      "PREPAGO": "0",
      "MSI": "0",
      "RENO TLMK": "0",
      "POSPAGO TOTAL": "0",
      "TERMINALES": "0",
      "PREPAGO TOTAL": "0",
      "SEGUROS": "0",
      "NBA": "0",
      "COTIZACIONES PAYJOY": "0",
      "COTIZACIONES PLATA": "0",
      "TOTAL ATENCIONES": "4",
      "CONVERSION POS": "0",
      "CONVERSION TEMM": "0",
      "CONVERSION PAYJOY": "#DIV/0!",
      "CONVERSION PRE": "0",
      "CONVERSION TMLK": "0",
      "REFERIDOS": "0",
      "CLIENTES GESTIONADOS": null,
      "CITADOS": "0",
      "EFECTIVIDAD": null
    }
  },
  "Hoja2": {
    "meta": {
      "fecha": "30/05/25",
      "cac": "CAC OAXACA",
      "ejecutivo": "PATRICIA ZARATE"
    },
    "values": {
      "30/05/25": null,
      "CAC OAXACA": null,
      "PATRICIA ZARATE": null,
      "TIPO DE FLUJO": null,
      "ATENCION GENERAL NO CUENTA TLMK": null,
      "TLMK $60": null,
      "TLMK $90": null,
      "TLMK $100": null,
      "MIGRACIONES TLMK": null,
      "JUMP": null,
      "TRAFICO TOTAL TLMK": null,
      "PLAN ILIMTADO": null,
      "GIGAMOVE 22": null,
      "GIGAMOVE 16": null,
      "GIGAMOVE 12": null,
      "SOHO": null,
      "RENOVACION": null,
      "PAYJOY": null,
      "PREPAGO": null,
      "MSI": null,
      "RENO TLMK": null,
      "POSPAGO TOTAL": null,
      "TERMINALES": null,
      "PREPAGO TOTAL": null,
      "1": null,
      "2": null,
      "0": null,
      "20": null
    }
  }
};
export const START_LINKS = [
  "REGISTRO VENTAS",
  "REGISTRAR TURNO",
  "IR A ONIX",
  "IR A CONOCE+",
  "IR A PAYJOY",
  "IR A WHATSAPP",
  "IR A 2DA LINEA",
  "BUZON DE ENTRADA"
];
export const BILLING_CYCLES = [
  {
    "emision": "CICLOS FACTURAS",
    "limite": null
  },
  {
    "emision": "EMISION",
    "limite": "LIMT PAGO"
  },
  {
    "emision": "DIA 2",
    "limite": "DIA 17"
  },
  {
    "emision": "DIA 5",
    "limite": "DIA 20"
  },
  {
    "emision": "DIA 1O",
    "limite": "DIA 25"
  },
  {
    "emision": "DIA 15",
    "limite": "DIA 30"
  },
  {
    "emision": "DIA 17",
    "limite": "DIA 12"
  },
  {
    "emision": "DIA 2O",
    "limite": "DIA 4"
  },
  {
    "emision": "DIA 24",
    "limite": "DIA 8"
  },
  {
    "emision": "DIA 28",
    "limite": "DIA 12"
  }
];
export const START_COMMENTS = [
  {
    "nombre": "SIM-UNIVERSAL",
    "activo": false
  },
  {
    "nombre": "REPOSICION-SIM",
    "activo": false
  },
  {
    "nombre": "PORTA-TLMK",
    "activo": false
  },
  {
    "nombre": "MIGRAC-TLMK",
    "activo": false
  },
  {
    "nombre": "COD-MIGRA-TLMK",
    "activo": false
  },
  {
    "nombre": "CHECK-2DA LINEA",
    "activo": false
  }
];
export const uniqueValues = (field: keyof Movement, items: Movement[] = MOVEMENTS) => Array.from(new Set(items.map((item) => item[field]).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "es"));
export const getFreshMetrics = (items: Movement[]) => ({ total: items.length, codificados: items.filter((item) => item.codificado === "SI").length, conDn: items.filter((item) => Boolean(item.dnCelular)).length, telemarketing: items.filter((item) => item.servicio === "TELEMARKETIN").length, ventas: items.filter((item) => item.servicio === "VENTAS").length, sim: items.filter((item) => item.servicio === "SIM").length });
