import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const EJERCICIOS_LISTA = [
  { nombre: "Hip thrust", principal: "Gluteos", factor: 0.8, secundario: "Isquios", factorSec: 0.2 },
  { nombre: "Puente de gluteos", principal: "Gluteos", factor: 0.85, secundario: "Isquios", factorSec: 0.15 },
  { nombre: "Sentadilla", principal: "Cuadriceps", factor: 0.6, secundario: "Gluteos", factorSec: 0.4 },
  { nombre: "Sentadilla sumo", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
  { nombre: "Prensa", principal: "Cuadriceps", factor: 0.7, secundario: "Gluteos", factorSec: 0.3 },
  { nombre: "Prensa pies altos", principal: "Gluteos", factor: 0.6, secundario: "Isquios", factorSec: 0.4 },
  { nombre: "Peso muerto rumano", principal: "Isquios", factor: 0.6, secundario: "Gluteos", factorSec: 0.4 },
  { nombre: "Peso muerto convencional", principal: "Isquios", factor: 0.5, secundario: "Gluteos", factorSec: 0.5 },
  { nombre: "Zancadas", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
  { nombre: "Bulgarian split squat", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
  { nombre: "Step up", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
  { nombre: "Curl femoral", principal: "Isquios", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Extension de cuadriceps", principal: "Cuadriceps", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Abduccion de cadera", principal: "Gluteos", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Patada gluteo polea", principal: "Gluteos", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Pantorrillas de pie", principal: "Pantorrillas", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Pantorrillas sentado", principal: "Pantorrillas", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Press banca", principal: "Pecho", factor: 0.7, secundario: "Triceps", factorSec: 0.3 },
  { nombre: "Press inclinado", principal: "Pecho", factor: 0.6, secundario: "Hombros", factorSec: 0.4 },
  { nombre: "Press militar", principal: "Hombros", factor: 0.7, secundario: "Triceps", factorSec: 0.3 },
  { nombre: "Elevaciones laterales", principal: "Hombros", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Remo con barra", principal: "Espalda", factor: 0.8, secundario: "Biceps", factorSec: 0.2 },
  { nombre: "Remo unilateral", principal: "Espalda", factor: 0.8, secundario: "Biceps", factorSec: 0.2 },
  { nombre: "Jalon al pecho", principal: "Espalda", factor: 0.75, secundario: "Biceps", factorSec: 0.25 },
  { nombre: "Dominadas", principal: "Espalda", factor: 0.7, secundario: "Biceps", factorSec: 0.3 },
  { nombre: "Pull over", principal: "Espalda", factor: 0.9, secundario: "Pecho", factorSec: 0.1 },
  { nombre: "Jalon neutro", principal: "Espalda", factor: 0.7, secundario: "Biceps", factorSec: 0.3 },
  { nombre: "Face pull", principal: "Hombros", factor: 0.6, secundario: "Espalda", factorSec: 0.4 },
  { nombre: "Curl biceps", principal: "Biceps", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Curl martillo", principal: "Biceps", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Extension triceps polea", principal: "Triceps", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Fondos", principal: "Triceps", factor: 0.6, secundario: "Pecho", factorSec: 0.4 },
  { nombre: "Lagartijas", principal: "Pecho", factor: 0.6, secundario: "Triceps", factorSec: 0.4 },
  { nombre: "Crunch", principal: "Abdomen", factor: 1, secundario: "", factorSec: 0 },
  { nombre: "Plancha", principal: "Abdomen", factor: 1, secundario: "", factorSec: 0 },
];

const GRUPOS = ["Gluteos","Cuadriceps","Isquios","Espalda","Pecho","Hombros","Biceps","Triceps","Abdomen","Pantorrillas","Full body"];

const EJERCICIOS = {
  inferiorA: {
    "Extension corta": [
      { nombre: "Hip thrust", principal: "Gluteos", factor: 0.8, secundario: "Isquios", factorSec: 0.2 },
      { nombre: "Puente de gluteos", principal: "Gluteos", factor: 0.85, secundario: "Isquios", factorSec: 0.15 },
      { nombre: "Prensa pies altos", principal: "Gluteos", factor: 0.6, secundario: "Isquios", factorSec: 0.4 },
      { nombre: "Prensa", principal: "Cuadriceps", factor: 0.7, secundario: "Gluteos", factorSec: 0.3 },
    ],
    "Extension larga": [
      { nombre: "Sentadilla", principal: "Cuadriceps", factor: 0.6, secundario: "Gluteos", factorSec: 0.4 },
      { nombre: "Sentadilla sumo", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
      { nombre: "Bulgarian split squat", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
    ],
    "Unilateral compuesto": [
      { nombre: "Zancadas", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
      { nombre: "Step up", principal: "Gluteos", factor: 0.6, secundario: "Cuadriceps", factorSec: 0.4 },
    ],
    "Aislado": [
      { nombre: "Curl femoral", principal: "Isquios", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Extension de cuadriceps", principal: "Cuadriceps", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Abduccion de cadera", principal: "Gluteos", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Patada gluteo polea", principal: "Gluteos", factor: 1, secundario: "", factorSec: 0 },
    ],
    "Pantorrilla": [
      { nombre: "Pantorrillas de pie", principal: "Pantorrillas", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Pantorrillas sentado", principal: "Pantorrillas", factor: 1, secundario: "", factorSec: 0 },
    ],
  },
  superiorA: {
    "Empuje horizontal": [
      { nombre: "Press banca", principal: "Pecho", factor: 0.7, secundario: "Triceps", factorSec: 0.3 },
      { nombre: "Press inclinado", principal: "Pecho", factor: 0.6, secundario: "Hombros", factorSec: 0.4 },
      { nombre: "Lagartijas", principal: "Pecho", factor: 0.6, secundario: "Triceps", factorSec: 0.4 },
    ],
    "Empuje vertical": [
      { nombre: "Press militar", principal: "Hombros", factor: 0.7, secundario: "Triceps", factorSec: 0.3 },
      { nombre: "Elevaciones laterales", principal: "Hombros", factor: 1, secundario: "", factorSec: 0 },
    ],
    "Tiron horizontal": [
      { nombre: "Remo con barra", principal: "Espalda", factor: 0.8, secundario: "Biceps", factorSec: 0.2 },
      { nombre: "Remo unilateral", principal: "Espalda", factor: 0.8, secundario: "Biceps", factorSec: 0.2 },
      { nombre: "Face pull", principal: "Hombros", factor: 0.6, secundario: "Espalda", factorSec: 0.4 },
    ],
    "Tiron vertical": [
      { nombre: "Dominadas", principal: "Espalda", factor: 0.7, secundario: "Biceps", factorSec: 0.3 },
      { nombre: "Jalon al pecho", principal: "Espalda", factor: 0.75, secundario: "Biceps", factorSec: 0.25 },
      { nombre: "Jalon neutro", principal: "Espalda", factor: 0.7, secundario: "Biceps", factorSec: 0.3 },
      { nombre: "Pull over", principal: "Espalda", factor: 0.9, secundario: "Pecho", factorSec: 0.1 },
    ],
    "Aislado": [
      { nombre: "Curl biceps", principal: "Biceps", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Curl martillo", principal: "Biceps", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Extension triceps polea", principal: "Triceps", factor: 1, secundario: "", factorSec: 0 },
      { nombre: "Fondos", principal: "Triceps", factor: 0.6, secundario: "Pecho", factorSec: 0.4 },
    ],
  },
};

const PARAMS = {
  fuerza: {
    principiante: { series: 3, reps: "6-8", descanso: "3 min" },
    intermedio: { series: 4, reps: "4-6", descanso: "3-4 min" },
    avanzado: { series: 5, reps: "3-5", descanso: "4-5 min" },
  },
  hipertrofia: {
    principiante: { series: 3, reps: "10-12", descanso: "90 seg" },
    intermedio: { series: 4, reps: "8-12", descanso: "90 seg" },
    avanzado: { series: 4, reps: "6-12", descanso: "60-90 seg" },
  },
  resistencia: {
    principiante: { series: 2, reps: "15-20", descanso: "45 seg" },
    intermedio: { series: 3, reps: "15-20", descanso: "45 seg" },
    avanzado: { series: 3, reps: "20+", descanso: "30 seg" },
  },
};

const DISTRIBUCIONES = {
  2: [
    { nombre: "Dia 1 - Full Body", tipo: "fullbody" },
    { nombre: "Dia 2 - Full Body", tipo: "fullbody" },
  ],
  3: [
    { nombre: "Dia 1 - Tren Inferior", tipo: "inferior" },
    { nombre: "Dia 2 - Tren Superior", tipo: "superior" },
    { nombre: "Dia 3 - Full Body", tipo: "fullbody" },
  ],
  4: [
    { nombre: "Dia 1 - Tren Inferior A", tipo: "inferior" },
    { nombre: "Dia 2 - Tren Superior A", tipo: "superior" },
    { nombre: "Dia 3 - Tren Inferior B", tipo: "inferiorB" },
    { nombre: "Dia 4 - Tren Superior B", tipo: "superiorB" },
  ],
  5: [
    { nombre: "Dia 1 - Tren Inferior A", tipo: "inferior" },
    { nombre: "Dia 2 - Tren Superior A", tipo: "superior" },
    { nombre: "Dia 3 - Tren Inferior B", tipo: "inferiorB" },
    { nombre: "Dia 4 - Tren Superior B", tipo: "superiorB" },
    { nombre: "Dia 5 - Full Body", tipo: "fullbody" },
  ],
};

const DESCANSOS = {
  2: ["Lunes", "Jueves"],
  3: ["Lunes", "Miercoles", "Viernes"],
  4: ["Lunes", "Martes", "Jueves", "Viernes"],
  5: ["Lunes", "Martes", "Jueves", "Viernes", "Sabado"],
};

const getCategoriasPorTipo = (tipo) => {
  if (tipo === "inferior") return { ...EJERCICIOS.inferiorA };
  if (tipo === "superior") return { ...EJERCICIOS.superiorA };
  if (tipo === "inferiorB") return {
    "Extension corta": EJERCICIOS.inferiorA["Extension corta"],
    "Unilateral compuesto": EJERCICIOS.inferiorA["Unilateral compuesto"],
    "Aislado": EJERCICIOS.inferiorA["Aislado"],
    "Pantorrilla": EJERCICIOS.inferiorA["Pantorrilla"],
  };
  if (tipo === "superiorB") return {
    "Tiron horizontal": EJERCICIOS.superiorA["Tiron horizontal"],
    "Tiron vertical": EJERCICIOS.superiorA["Tiron vertical"],
    "Empuje vertical": EJERCICIOS.superiorA["Empuje vertical"],
    "Aislado": EJERCICIOS.superiorA["Aislado"],
  };
  if (tipo === "fullbody") return {
    "Extension corta": EJERCICIOS.inferiorA["Extension corta"],
    "Extension larga": EJERCICIOS.inferiorA["Extension larga"],
    "Aislado inferior": EJERCICIOS.inferiorA["Aislado"],
    "Empuje horizontal": EJERCICIOS.superiorA["Empuje horizontal"],
    "Tiron vertical": EJERCICIOS.superiorA["Tiron vertical"],
    "Aislado superior": EJERCICIOS.superiorA["Aislado"],
  };
  return {};
};

const extraVacio = { tipo: "lista", nombreCustom: "", ejercicioLista: "", principalCustom: "", secundarioCustom: "", series: "3", reps: "10", peso: "0" };

export default function CreadorRutinaScreen({ user, profile, onVolver }) {
  const [paso, setPaso] = useState(1);
  const [config, setConfig] = useState({
    objetivo: profile?.goal || "hipertrofia",
    nivel: profile?.level || "intermedio",
    dias: profile?.frequency || 3,
  });
  const [selecciones, setSelecciones] = useState({});
  const [extras, setExtras] = useState({});
  const [diaActual, setDiaActual] = useState(0);
  const [cambiando, setCambiando] = useState(null);
  const [mostrarFormExtra, setMostrarFormExtra] = useState(null);
  const [formExtra, setFormExtra] = useState({ ...extraVacio });
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [nombreRutina, setNombreRutina] = useState("");

  const distribucion = DISTRIBUCIONES[config.dias] || DISTRIBUCIONES[3];
  const params = PARAMS[config.objetivo]?.[config.nivel] || PARAMS.hipertrofia.intermedio;

  const iniciarCreacion = () => {
    const seleccionesIniciales = {};
    distribucion.forEach((dia, dIdx) => {
      seleccionesIniciales[dIdx] = {};
      const cats = getCategoriasPorTipo(dia.tipo);
      Object.entries(cats).forEach(([cat, ejercicios]) => {
        seleccionesIniciales[dIdx][cat] = ejercicios[0];
      });
    });
    setSelecciones(seleccionesIniciales);
    setExtras({});
    setDiaActual(0);
    setPaso(2);
  };

  const cambiarEjercicio = (diaIdx, categoria, ejercicio) => {
    setSelecciones(prev => ({ ...prev, [diaIdx]: { ...prev[diaIdx], [categoria]: ejercicio } }));
    setCambiando(null);
  };

  const agregarExtra = (diaIdx) => {
    let ejData;
    if (formExtra.tipo === "lista") {
      const found = EJERCICIOS_LISTA.find(e => e.nombre === formExtra.ejercicioLista);
      if (!found) return;
      ejData = { nombre: found.nombre, principal: found.principal, factor: found.factor, secundario: found.secundario, factorSec: found.factorSec, series: formExtra.series, reps: formExtra.reps, peso: formExtra.peso, esExtra: true };
    } else {
      if (!formExtra.nombreCustom || !formExtra.principalCustom) return;
      ejData = { nombre: formExtra.nombreCustom, principal: formExtra.principalCustom, factor: formExtra.secundarioCustom ? 0.7 : 1, secundario: formExtra.secundarioCustom, factorSec: formExtra.secundarioCustom ? 0.3 : 0, series: formExtra.series, reps: formExtra.reps, peso: formExtra.peso, esExtra: true };
    }
    setExtras(prev => ({ ...prev, [diaIdx]: [...(prev[diaIdx] || []), ejData] }));
    setFormExtra({ ...extraVacio });
    setMostrarFormExtra(null);
  };

  const eliminarExtra = (diaIdx, idx) => {
    setExtras(prev => {
      const arr = [...(prev[diaIdx] || [])];
      arr.splice(idx, 1);
      return { ...prev, [diaIdx]: arr };
    });
  };

  const calcularResumenGrupos = () => {
    const resumen = {};
    distribucion.forEach((_, dIdx) => {
      Object.entries(selecciones[dIdx] || {}).forEach(([, ej]) => {
        const s = params.series;
        if (ej.principal) resumen[ej.principal] = Math.round(((resumen[ej.principal] || 0) + s * ej.factor) * 10) / 10;
        if (ej.secundario) resumen[ej.secundario] = Math.round(((resumen[ej.secundario] || 0) + s * ej.factorSec) * 10) / 10;
      });
      (extras[dIdx] || []).forEach(ej => {
        const s = Number(ej.series) || 0;
        if (ej.principal) resumen[ej.principal] = Math.round(((resumen[ej.principal] || 0) + s * ej.factor) * 10) / 10;
        if (ej.secundario) resumen[ej.secundario] = Math.round(((resumen[ej.secundario] || 0) + s * ej.factorSec) * 10) / 10;
      });
    });
    return Object.entries(resumen).sort((a, b) => b[1] - a[1]);
  };

  const construirRutinas = () => {
    return distribucion.map((dia, dIdx) => {
      const ejerciciosBase = Object.entries(selecciones[dIdx] || {}).map(([cat, ej]) => ({
        nombre: ej.nombre, categoria: cat,
        series: String(params.series), reps: params.reps.split("-")[0], peso: "0",
        gruposMusculares: [
          { nombre: ej.principal, factor: ej.factor },
          ...(ej.secundario ? [{ nombre: ej.secundario, factor: ej.factorSec }] : [])
        ]
      }));
      const ejerciciosExtra = (extras[dIdx] || []).map(ej => ({
        nombre: ej.nombre, categoria: "Extra",
        series: ej.series, reps: ej.reps, peso: ej.peso,
        gruposMusculares: [
          { nombre: ej.principal, factor: ej.factor },
          ...(ej.secundario ? [{ nombre: ej.secundario, factor: ej.factorSec }] : [])
        ]
      }));
      return { nombre: dia.nombre, ejercicios: [...ejerciciosBase, ...ejerciciosExtra] };
    });
  };

  const guardarRutinas = async () => {
    if (!nombreRutina.trim()) return;
    setLoading(true);
    try {
      const rutinas = construirRutinas();
      for (const rutina of rutinas) {
        await addDoc(collection(db, "rutinas"), {
          userId: user.uid,
          nombre: `${nombreRutina} - ${rutina.nombre}`,
          ejercicios: rutina.ejercicios,
          objetivo: config.objetivo,
          nivel: config.nivel,
          creadaEn: new Date().toISOString(),
          generada: true,
        });
      }
      setGuardado(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px", border: "2px solid #fce7f3", borderRadius: "12px", fontSize: "14px", boxSizing: "border-box", marginBottom: "10px" };
  const selectStyle = { ...inputStyle, marginBottom: "16px" };

  if (guardado) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎉</div>
      <h2 style={{ color: "#ec4899", fontSize: "28px", marginBottom: "8px" }}>Rutina creada!</h2>
      <p style={{ color: "#888", marginBottom: "8px" }}>Se guardaron {distribucion.length} dias en Mis Rutinas.</p>
      <button onClick={onVolver} style={{ padding: "14px 32px", background: "#ec4899", color: "#fff", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: "800", cursor: "pointer" }}>
        Ver mis rutinas
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button onClick={paso === 1 ? onVolver : () => setPaso(paso - 1)} style={{ background: "none", border: "none", color: "#ec4899", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>← Volver</button>
        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#ec4899", margin: 0 }}>Crear mi rutina 🏋️</h2>
      </div>

      {/* PASO 1 */}
      {paso === 1 && (
        <div>
          <div style={{ background: "#fce7f3", borderRadius: "14px", padding: "14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#be185d" }}>Vamos a crear tu rutina personalizada</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Te guiaremos para elegir los mejores ejercicios segun tu objetivo y nivel</div>
          </div>

          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", marginBottom: "16px", border: "2px solid #fce7f3" }}>
            <h3 style={{ color: "#ec4899", marginBottom: "16px" }}>Tu configuracion</h3>
            <label style={{ fontSize: "13px", color: "#888", display: "block", marginBottom: "6px" }}>Objetivo</label>
            <select value={config.objetivo} onChange={(e) => setConfig({ ...config, objetivo: e.target.value })} style={selectStyle}>
              <option value="hipertrofia">Hipertrofia (ganar musculo)</option>
              <option value="fuerza">Fuerza (levantar mas peso)</option>
              <option value="resistencia">Resistencia (aguantar mas)</option>
            </select>
            <label style={{ fontSize: "13px", color: "#888", display: "block", marginBottom: "6px" }}>Nivel</label>
            <select value={config.nivel} onChange={(e) => setConfig({ ...config, nivel: e.target.value })} style={selectStyle}>
              <option value="principiante">Principiante (menos de 1 año)</option>
              <option value="intermedio">Intermedio (1-3 años)</option>
              <option value="avanzado">Avanzado (mas de 3 años)</option>
            </select>
            <label style={{ fontSize: "13px", color: "#888", display: "block", marginBottom: "6px" }}>Dias por semana</label>
            <select value={config.dias} onChange={(e) => setConfig({ ...config, dias: parseInt(e.target.value) })} style={{ ...selectStyle, marginBottom: "0" }}>
              <option value={2}>2 dias</option>
              <option value={3}>3 dias</option>
              <option value={4}>4 dias</option>
              <option value={5}>5 dias</option>
            </select>
          </div>

          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", marginBottom: "16px", border: "2px solid #fce7f3" }}>
            <h3 style={{ color: "#ec4899", marginBottom: "4px" }}>Tu semana quedaria asi</h3>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Dias de entrenamiento sugeridos</p>
            {["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"].map((dia) => {
              const idx = DESCANSOS[config.dias]?.indexOf(dia);
              const isEntrenamiento = idx !== -1;
              return (
                <div key={dia} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", background: isEntrenamiento ? "#fce7f3" : "#fdf2f8", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "700", color: isEntrenamiento ? "#ec4899" : "#888", fontSize: "14px" }}>{dia}</span>
                  <span style={{ fontSize: "13px", color: isEntrenamiento ? "#be185d" : "#aaa", fontWeight: isEntrenamiento ? "700" : "400" }}>
                    {isEntrenamiento ? distribucion[idx]?.nombre : "Descanso 😴"}
                  </span>
                </div>
              );
            })}
            <div style={{ background: "#fdf2f8", borderRadius: "12px", padding: "12px", marginTop: "12px" }}>
              <div style={{ fontSize: "13px", color: "#333", fontWeight: "700", marginBottom: "4px" }}>Parametros</div>
              <div style={{ fontSize: "13px", color: "#888" }}>Series: {params.series} · Reps: {params.reps} · Descanso: {params.descanso}</div>
            </div>
          </div>

          <button onClick={iniciarCreacion} style={{ width: "100%", padding: "16px", background: "#ec4899", color: "#fff", border: "none", borderRadius: "16px", fontSize: "18px", fontWeight: "800", cursor: "pointer" }}>
            Elegir mis ejercicios →
          </button>
        </div>
      )}

      {/* PASO 2 */}
      {paso === 2 && (
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
            {distribucion.map((dia, i) => (
              <button key={i} onClick={() => setDiaActual(i)}
                style={{ padding: "8px 14px", borderRadius: "12px", border: "2px solid #ec4899", background: diaActual === i ? "#ec4899" : "#fff", color: diaActual === i ? "#fff" : "#ec4899", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>
                Dia {i + 1}
              </button>
            ))}
          </div>

          <div style={{ background: "#fce7f3", borderRadius: "14px", padding: "12px 16px", marginBottom: "16px" }}>
            <div style={{ fontWeight: "800", color: "#be185d", fontSize: "15px" }}>{distribucion[diaActual]?.nombre}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{params.series} series · {params.reps} reps · Descanso: {params.descanso}</div>
          </div>

          {/* EJERCICIOS BASE */}
          {Object.entries(getCategoriasPorTipo(distribucion[diaActual]?.tipo)).map(([categoria, opciones]) => {
            const seleccionado = selecciones[diaActual]?.[categoria] || opciones[0];
            const estaCambiando = cambiando?.dia === diaActual && cambiando?.cat === categoria;
            return (
              <div key={categoria} style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "12px", border: "2px solid #fce7f3" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#888", fontWeight: "700", marginBottom: "2px" }}>{categoria.toUpperCase()}</div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#333" }}>{seleccionado.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#ec4899", fontWeight: "700", marginTop: "2px" }}>
                      {seleccionado.principal} {Math.round(seleccionado.factor * 100)}%
                      {seleccionado.secundario ? ` · ${seleccionado.secundario} ${Math.round(seleccionado.factorSec * 100)}%` : ""}
                    </div>
                  </div>
                  <button onClick={() => setCambiando(estaCambiando ? null : { dia: diaActual, cat: categoria })}
                    style={{ background: "#fce7f3", color: "#ec4899", border: "none", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
                    {estaCambiando ? "Cerrar" : "Cambiar"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", background: "#fdf2f8", borderRadius: "10px", padding: "10px" }}>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: "900", color: "#ec4899" }}>{params.series}</div><div style={{ fontSize: "10px", color: "#888" }}>Series</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: "900", color: "#ec4899" }}>{params.reps}</div><div style={{ fontSize: "10px", color: "#888" }}>Reps</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: "900", color: "#ec4899" }}>{params.descanso}</div><div style={{ fontSize: "10px", color: "#888" }}>Descanso</div></div>
                </div>
                {estaCambiando && (
                  <div style={{ marginTop: "12px", borderTop: "2px solid #fce7f3", paddingTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px", fontWeight: "700" }}>Elige otro ejercicio:</div>
                    {opciones.map((op, idx) => (
                      <button key={idx} onClick={() => cambiarEjercicio(diaActual, categoria, op)}
                        style={{ width: "100%", padding: "12px", marginBottom: "6px", background: seleccionado.nombre === op.nombre ? "#fce7f3" : "#fdf2f8", border: seleccionado.nombre === op.nombre ? "2px solid #ec4899" : "2px solid transparent", borderRadius: "12px", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ fontWeight: "700", color: "#333", fontSize: "14px" }}>{op.nombre}</div>
                        <div style={{ fontSize: "11px", color: "#ec4899", marginTop: "2px" }}>
                          {op.principal} {Math.round(op.factor * 100)}%
                          {op.secundario ? ` · ${op.secundario} ${Math.round(op.factorSec * 100)}%` : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* EJERCICIOS EXTRA */}
          {(extras[diaActual] || []).map((ej, idx) => (
            <div key={idx} style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "12px", border: "2px solid #ec4899" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#ec4899", fontWeight: "700", marginBottom: "2px" }}>EXTRA PERSONALIZADO</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#333" }}>{ej.nombre}</div>
                  <div style={{ fontSize: "11px", color: "#ec4899", marginTop: "2px" }}>
                    {ej.principal} {Math.round(ej.factor * 100)}%
                    {ej.secundario ? ` · ${ej.secundario} ${Math.round(ej.factorSec * 100)}%` : ""}
                  </div>
                </div>
                <button onClick={() => eliminarExtra(diaActual, idx)}
                  style={{ background: "#fff0f0", color: "#ef4444", border: "2px solid #fecaca", borderRadius: "10px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>
                  Borrar
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", background: "#fdf2f8", borderRadius: "10px", padding: "10px" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: "900", color: "#ec4899" }}>{ej.series}</div><div style={{ fontSize: "10px", color: "#888" }}>Series</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: "900", color: "#ec4899" }}>{ej.reps}</div><div style={{ fontSize: "10px", color: "#888" }}>Reps</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: "900", color: "#ec4899" }}>{ej.peso > 0 ? `${ej.peso}kg` : "Corporal"}</div><div style={{ fontSize: "10px", color: "#888" }}>Peso</div></div>
              </div>
            </div>
          ))}

          {/* FORMULARIO EXTRA */}
          {mostrarFormExtra === diaActual ? (
            <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "12px", border: "2px solid #ec4899" }}>
              <div style={{ fontWeight: "800", color: "#ec4899", marginBottom: "16px" }}>Agregar ejercicio extra</div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                <button onClick={() => setFormExtra({ ...formExtra, tipo: "lista" })}
                  style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "2px solid #ec4899", background: formExtra.tipo === "lista" ? "#ec4899" : "#fff", color: formExtra.tipo === "lista" ? "#fff" : "#ec4899", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  De la lista
                </button>
                <button onClick={() => setFormExtra({ ...formExtra, tipo: "custom" })}
                  style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "2px solid #ec4899", background: formExtra.tipo === "custom" ? "#ec4899" : "#fff", color: formExtra.tipo === "custom" ? "#fff" : "#ec4899", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  Personalizado
                </button>
              </div>

              {formExtra.tipo === "lista" ? (
                <select value={formExtra.ejercicioLista} onChange={(e) => setFormExtra({ ...formExtra, ejercicioLista: e.target.value })} style={inputStyle}>
                  <option value="">Selecciona ejercicio</option>
                  {EJERCICIOS_LISTA.map((e, i) => <option key={i} value={e.nombre}>{e.nombre}</option>)}
                </select>
              ) : (
                <>
                  <input type="text" placeholder="Nombre del ejercicio" value={formExtra.nombreCustom}
                    onChange={(e) => setFormExtra({ ...formExtra, nombreCustom: e.target.value })} style={inputStyle} />
                  <select value={formExtra.principalCustom} onChange={(e) => setFormExtra({ ...formExtra, principalCustom: e.target.value })} style={inputStyle}>
                    <option value="">Grupo principal</option>
                    {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <select value={formExtra.secundarioCustom} onChange={(e) => setFormExtra({ ...formExtra, secundarioCustom: e.target.value })} style={inputStyle}>
                    <option value="">Grupo secundario (opcional)</option>
                    {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginBottom: "4px" }}>Series</div>
                  <input type="number" value={formExtra.series} onChange={(e) => setFormExtra({ ...formExtra, series: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "2px solid #fce7f3", borderRadius: "10px", fontSize: "16px", textAlign: "center", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginBottom: "4px" }}>Reps</div>
                  <input type="number" value={formExtra.reps} onChange={(e) => setFormExtra({ ...formExtra, reps: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "2px solid #fce7f3", borderRadius: "10px", fontSize: "16px", textAlign: "center", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginBottom: "4px" }}>Peso kg</div>
                  <input type="number" value={formExtra.peso} onChange={(e) => setFormExtra({ ...formExtra, peso: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "2px solid #fce7f3", borderRadius: "10px", fontSize: "16px", textAlign: "center", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button onClick={() => { setMostrarFormExtra(null); setFormExtra({ ...extraVacio }); }}
                  style={{ padding: "12px", background: "#fce7f3", color: "#ec4899", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={() => agregarExtra(diaActual)}
                  style={{ padding: "12px", background: "#ec4899", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                  Agregar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setMostrarFormExtra(diaActual); setCambiando(null); }}
              style={{ width: "100%", padding: "14px", background: "#fdf2f8", color: "#ec4899", border: "2px dashed #ec4899", borderRadius: "16px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "12px" }}>
              + Agregar ejercicio extra
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: diaActual > 0 ? "1fr 1fr" : "1fr", gap: "10px", marginTop: "8px" }}>
            {diaActual > 0 && (
              <button onClick={() => setDiaActual(diaActual - 1)}
                style={{ padding: "14px", background: "#fce7f3", color: "#ec4899", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer" }}>
                ← Dia anterior
              </button>
            )}
            {diaActual < distribucion.length - 1 ? (
              <button onClick={() => setDiaActual(diaActual + 1)}
                style={{ padding: "14px", background: "#ec4899", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer" }}>
                Siguiente dia →
              </button>
            ) : (
              <button onClick={() => setPaso(3)}
                style={{ padding: "14px", background: "#ec4899", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "800", cursor: "pointer" }}>
                Ver resumen →
              </button>
            )}
          </div>
        </div>
      )}

      {/* PASO 3 */}
      {paso === 3 && (
        <div>
          <div style={{ background: "#fce7f3", borderRadius: "14px", padding: "14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#be185d" }}>Tu rutina esta lista</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Revisa cada dia y guardala con un nombre</div>
          </div>

          {/* RESUMEN GRUPOS */}
          {(() => {
            const sorted = calcularResumenGrupos();
            const max = sorted[0]?.[1] || 1;
            return (
              <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "16px", border: "2px solid #fce7f3" }}>
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#333", marginBottom: "4px" }}>Series semanales por grupo muscular</div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "14px" }}>Total acumulado de toda la semana</div>
                {sorted.map(([grupo, series]) => (
                  <div key={grupo} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #fce7f3" }}>
                    <span style={{ fontSize: "14px", color: "#333", fontWeight: "600" }}>{grupo}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ background: "#fce7f3", borderRadius: "10px", height: "8px", width: "80px", overflow: "hidden" }}>
                        <div style={{ background: "#ec4899", height: "100%", width: `${(series / max) * 100}%`, borderRadius: "10px" }} />
                      </div>
                      <span style={{ fontSize: "14px", color: "#ec4899", fontWeight: "900", minWidth: "60px", textAlign: "right" }}>{series} series</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "16px", border: "2px solid #ec4899" }}>
            <label style={{ fontSize: "13px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "700" }}>Nombre de tu programa</label>
            <input type="text" placeholder="Ej: Mi rutina de verano" value={nombreRutina} onChange={(e) => setNombreRutina(e.target.value)}
              style={{ width: "100%", padding: "14px", border: "2px solid #ec4899", borderRadius: "14px", fontSize: "16px", boxSizing: "border-box" }} />
          </div>

          {distribucion.map((dia, dIdx) => (
            <div key={dIdx} style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "12px", border: "2px solid #fce7f3" }}>
              <div style={{ fontWeight: "800", fontSize: "16px", color: "#ec4899", marginBottom: "12px" }}>{dia.nombre}</div>
              <div style={{ background: "#fdf2f8", borderRadius: "10px", padding: "8px 12px", marginBottom: "12px", fontSize: "12px", color: "#888" }}>
                {params.series} series · {params.reps} reps · Descanso {params.descanso}
              </div>

              {Object.entries(selecciones[dIdx] || {}).map(([cat, ej], idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fce7f3" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#333", fontWeight: "700" }}>{ej.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>{cat}</div>
                  </div>
                  <button onClick={() => { setDiaActual(dIdx); setPaso(2); }}
                    style={{ background: "#fdf2f8", color: "#ec4899", border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>
                    Editar
                  </button>
                </div>
              ))}

              {(extras[dIdx] || []).map((ej, idx) => (
                <div key={`extra-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fce7f3" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#333", fontWeight: "700" }}>{ej.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#ec4899" }}>Extra · {ej.series}s × {ej.reps}r</div>
                  </div>
                  <button onClick={() => { setDiaActual(dIdx); setPaso(2); }}
                    style={{ background: "#fdf2f8", color: "#ec4899", border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>
                    Editar
                  </button>
                </div>
              ))}
            </div>
          ))}

          <button onClick={guardarRutinas} disabled={loading || !nombreRutina.trim()}
            style={{ width: "100%", padding: "16px", background: !nombreRutina.trim() ? "#ddd" : "#ec4899", color: "#fff", border: "none", borderRadius: "16px", fontSize: "18px", fontWeight: "800", cursor: !nombreRutina.trim() ? "not-allowed" : "pointer" }}>
            {loading ? "Guardando..." : !nombreRutina.trim() ? "Pon un nombre primero" : "Guardar mi rutina 🎉"}
          </button>
        </div>
      )}
    </div>
  );
}