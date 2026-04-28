import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import CreadorRutinaScreen from "./CreadorRutinaScreen";
const EJERCICIOS_BASE = [
  { nombre: "Hip thrust", principal: "Gluteos", factorPrincipal: 0.8, secundario: "Isquios", factorSecundario: 0.2 },
  { nombre: "Puente de gluteos", principal: "Gluteos", factorPrincipal: 0.85, secundario: "Isquios", factorSecundario: 0.15 },
  { nombre: "Sentadilla", principal: "Cuadriceps", factorPrincipal: 0.6, secundario: "Gluteos", factorSecundario: 0.4 },
  { nombre: "Sentadilla sumo", principal: "Gluteos", factorPrincipal: 0.6, secundario: "Cuadriceps", factorSecundario: 0.4 },
  { nombre: "Prensa", principal: "Cuadriceps", factorPrincipal: 0.7, secundario: "Gluteos", factorSecundario: 0.3 },
  { nombre: "Prensa pies altos", principal: "Gluteos", factorPrincipal: 0.6, secundario: "Isquios", factorSecundario: 0.4 },
  { nombre: "Peso muerto rumano", principal: "Isquios", factorPrincipal: 0.6, secundario: "Gluteos", factorSecundario: 0.4 },
  { nombre: "Peso muerto convencional", principal: "Isquios", factorPrincipal: 0.5, secundario: "Gluteos", factorSecundario: 0.5 },
  { nombre: "Zancadas", principal: "Gluteos", factorPrincipal: 0.6, secundario: "Cuadriceps", factorSecundario: 0.4 },
  { nombre: "Bulgarian split squat", principal: "Gluteos", factorPrincipal: 0.6, secundario: "Cuadriceps", factorSecundario: 0.4 },
  { nombre: "Step up", principal: "Gluteos", factorPrincipal: 0.6, secundario: "Cuadriceps", factorSecundario: 0.4 },
  { nombre: "Curl femoral", principal: "Isquios", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Extension de cuadriceps", principal: "Cuadriceps", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Abduccion de cadera", principal: "Gluteos", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Patada gluteo polea", principal: "Gluteos", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Pantorrillas de pie", principal: "Pantorrillas", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Pantorrillas sentado", principal: "Pantorrillas", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Press banca", principal: "Pecho", factorPrincipal: 0.7, secundario: "Triceps", factorSecundario: 0.3 },
  { nombre: "Press inclinado", principal: "Pecho", factorPrincipal: 0.6, secundario: "Hombros", factorSecundario: 0.4 },
  { nombre: "Press militar", principal: "Hombros", factorPrincipal: 0.7, secundario: "Triceps", factorSecundario: 0.3 },
  { nombre: "Elevaciones laterales", principal: "Hombros", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Remo con barra", principal: "Espalda", factorPrincipal: 0.8, secundario: "Biceps", factorSecundario: 0.2 },
  { nombre: "Remo unilateral", principal: "Espalda", factorPrincipal: 0.8, secundario: "Biceps", factorSecundario: 0.2 },
  { nombre: "Jalon al pecho", principal: "Espalda", factorPrincipal: 0.75, secundario: "Biceps", factorSecundario: 0.25 },
  { nombre: "Dominadas", principal: "Espalda", factorPrincipal: 0.7, secundario: "Biceps", factorSecundario: 0.3 },
  { nombre: "Pull over", principal: "Espalda", factorPrincipal: 0.9, secundario: "Pecho", factorSecundario: 0.1 },
  { nombre: "Dominada prono", principal: "Espalda", factorPrincipal: 0.8, secundario: "Biceps", factorSecundario: 0.2 },
  { nombre: "Dominada supino", principal: "Espalda", factorPrincipal: 0.6, secundario: "Biceps", factorSecundario: 0.4 },
  { nombre: "Dominada neutra", principal: "Espalda", factorPrincipal: 0.7, secundario: "Biceps", factorSecundario: 0.3 },
  { nombre: "Jalon prono", principal: "Espalda", factorPrincipal: 0.8, secundario: "Biceps", factorSecundario: 0.2 },
  { nombre: "Jalon supino", principal: "Espalda", factorPrincipal: 0.65, secundario: "Biceps", factorSecundario: 0.35 },
  { nombre: "Jalon neutro", principal: "Espalda", factorPrincipal: 0.7, secundario: "Biceps", factorSecundario: 0.3 },
  { nombre: "Face pull", principal: "Hombros", factorPrincipal: 0.6, secundario: "Espalda", factorSecundario: 0.4 },
  { nombre: "Curl biceps", principal: "Biceps", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Curl martillo", principal: "Biceps", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Extension triceps polea", principal: "Triceps", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Fondos", principal: "Triceps", factorPrincipal: 0.6, secundario: "Pecho", factorSecundario: 0.4 },
  { nombre: "Lagartijas", principal: "Pecho", factorPrincipal: 0.6, secundario: "Triceps", factorSecundario: 0.4 },
  { nombre: "Crunch", principal: "Abdomen", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Plancha", principal: "Abdomen", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
  { nombre: "Otro", principal: "", factorPrincipal: 1, secundario: "", factorSecundario: 0 },
];

const GRUPOS = ["Gluteos","Cuadriceps","Isquios","Espalda","Pecho","Hombros","Biceps","Triceps","Abdomen","Pantorrillas","Full body"];

const RUTINAS_SUGERIDAS = {
  Menstrual: [{ nombre: "Movilidad y estiramientos", ejercicios: [{ nombre: "Yoga suave 20min", peso: "0", series: "1", reps: "1", gruposMusculares: [{nombre:"Full body",factor:1}] }, { nombre: "Movilidad de cadera", peso: "0", series: "2", reps: "10", gruposMusculares: [{nombre:"Gluteos",factor:1}] }] }],
  Folicular: [
    { nombre: "Fuerza tren inferior", ejercicios: [{ nombre: "Sentadilla", peso: "60", series: "4", reps: "8", gruposMusculares: [{nombre:"Cuadriceps",factor:0.6},{nombre:"Gluteos",factor:0.4}] }, { nombre: "Peso muerto", peso: "70", series: "4", reps: "6", gruposMusculares: [{nombre:"Isquios",factor:0.6},{nombre:"Gluteos",factor:0.4}] }, { nombre: "Prensa", peso: "100", series: "3", reps: "10", gruposMusculares: [{nombre:"Cuadriceps",factor:0.7},{nombre:"Gluteos",factor:0.3}] }] },
    { nombre: "Fuerza tren superior", ejercicios: [{ nombre: "Press banca", peso: "50", series: "4", reps: "8", gruposMusculares: [{nombre:"Pecho",factor:0.7},{nombre:"Triceps",factor:0.3}] }, { nombre: "Remo con barra", peso: "50", series: "4", reps: "8", gruposMusculares: [{nombre:"Espalda",factor:0.8},{nombre:"Biceps",factor:0.2}] }] },
  ],
  Ovulatoria: [{ nombre: "Potencia y explosividad", ejercicios: [{ nombre: "Sentadilla con salto", peso: "0", series: "3", reps: "6", gruposMusculares: [{nombre:"Gluteos",factor:1}] }, { nombre: "Box jump", peso: "0", series: "3", reps: "8", gruposMusculares: [{nombre:"Gluteos",factor:1}] }] }],
  Lutea: [{ nombre: "Tecnica y control", ejercicios: [{ nombre: "Sentadilla pause", peso: "50", series: "3", reps: "8", gruposMusculares: [{nombre:"Cuadriceps",factor:0.6},{nombre:"Gluteos",factor:0.4}] }, { nombre: "Peso muerto rumano", peso: "50", series: "3", reps: "10", gruposMusculares: [{nombre:"Isquios",factor:0.6},{nombre:"Gluteos",factor:0.4}] }] }],
};

const ejercicioVacio = { ejercicioBase: "", nombre: "", comentario: "", peso: "", series: "", reps: "", grupoPrincipal: "", grupoSecundario: "", gruposMusculares: [] };

export default function RutinasScreen({ user, currentPhase }) {
  const [tab, setTab] = useState("mis");
  const [misRutinas, setMisRutinas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevaRutina, setNuevaRutina] = useState({ nombre: "", ejercicios: [{ ...ejercicioVacio }] });
  const [loading, setLoading] = useState(false);
  const [mostrarCreador, setMostrarCreador] = useState(false);
  const phaseName = currentPhase?.name || "Folicular";
  const rutinasDelDia = RUTINAS_SUGERIDAS[phaseName] || RUTINAS_SUGERIDAS.Folicular;

  useEffect(() => { cargarMisRutinas(); }, []);

  const cargarMisRutinas = async () => {
    const q = query(collection(db, "rutinas"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    setMisRutinas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const contarSeriesPorGrupo = (ejercicios = []) => {
    const resumen = {};
    ejercicios.forEach(ej => {
      const series = Number(ej.series) || 0;
      if (Array.isArray(ej.gruposMusculares)) {
        ej.gruposMusculares.forEach(g => {
          resumen[g.nombre] = Math.round(((resumen[g.nombre] || 0) + series * Number(g.factor || 1)) * 10) / 10;
        });
      }
    });
    return resumen;
  };

  const seleccionarEjercicioBase = (i, nombreSeleccionado) => {
    const seleccionado = EJERCICIOS_BASE.find(x => x.nombre === nombreSeleccionado);
    if (!seleccionado) return;
    const updated = [...nuevaRutina.ejercicios];
    updated[i] = {
      ...updated[i],
      ejercicioBase: seleccionado.nombre,
      nombre: seleccionado.nombre === "Otro" ? "" : seleccionado.nombre,
      grupoPrincipal: "",
      grupoSecundario: "",
      gruposMusculares: seleccionado.nombre === "Otro" ? [] : [
        { nombre: seleccionado.principal, factor: seleccionado.factorPrincipal },
        ...(seleccionado.secundario ? [{ nombre: seleccionado.secundario, factor: seleccionado.factorSecundario }] : [])
      ]
    };
    setNuevaRutina({ ...nuevaRutina, ejercicios: updated });
  };

  const actualizarCampo = (i, campo, valor) => {
    const updated = [...nuevaRutina.ejercicios];
    updated[i] = { ...updated[i], [campo]: valor };
    setNuevaRutina({ ...nuevaRutina, ejercicios: updated });
  };

  const actualizarGrupo = (i, tipo, valor) => {
    const updated = [...nuevaRutina.ejercicios];
    const ej = { ...updated[i], [tipo]: valor };
    const principal = tipo === "grupoPrincipal" ? valor : ej.grupoPrincipal;
    const secundario = tipo === "grupoSecundario" ? valor : ej.grupoSecundario;
    ej.gruposMusculares = [
      ...(principal ? [{ nombre: principal, factor: secundario ? 0.7 : 1 }] : []),
      ...(secundario ? [{ nombre: secundario, factor: 0.3 }] : [])
    ];
    updated[i] = ej;
    setNuevaRutina({ ...nuevaRutina, ejercicios: updated });
  };

  const agregarEjercicio = () => {
    setNuevaRutina({ ...nuevaRutina, ejercicios: [...nuevaRutina.ejercicios, { ...ejercicioVacio }] });
  };

  const guardarRutina = async () => {
    if (!nuevaRutina.nombre) return;
    setLoading(true);
    const ejerciciosLimpios = nuevaRutina.ejercicios
      .filter(e => e.nombre && e.nombre.trim() !== "")
      .map(e => ({
        nombre: e.nombre,
        ejercicioBase: e.ejercicioBase || "Otro",
        peso: e.peso || "",
        series: e.series || "",
        reps: e.reps || "",
        comentario: e.comentario || "",
        gruposMusculares: e.gruposMusculares || [],
      }));
    if (editando) {
      await updateDoc(doc(db, "rutinas", editando), { nombre: nuevaRutina.nombre, ejercicios: ejerciciosLimpios });
      setEditando(null);
    } else {
      await addDoc(collection(db, "rutinas"), { userId: user.uid, nombre: nuevaRutina.nombre, ejercicios: ejerciciosLimpios, creadaEn: new Date().toISOString() });
    }
    setNuevaRutina({ nombre: "", ejercicios: [{ ...ejercicioVacio }] });
    setShowForm(false);
    await cargarMisRutinas();
    setLoading(false);
  };

  const eliminarRutina = async (id) => {
    if (!window.confirm("Segura que quieres borrar esta rutina?")) return;
    await deleteDoc(doc(db, "rutinas", id));
    await cargarMisRutinas();
  };

  const abrirEditar = (rutina) => {
    setEditando(rutina.id);
    setNuevaRutina({
      nombre: rutina.nombre,
      ejercicios: rutina.ejercicios.map(e => ({
        ejercicioBase: e.ejercicioBase || e.nombre || "",
        nombre: e.nombre || "",
        comentario: e.comentario || "",
        peso: e.peso || "",
        series: e.series || "",
        reps: e.reps || "",
        grupoPrincipal: "",
        grupoSecundario: "",
        gruposMusculares: e.gruposMusculares || [],
      }))
    });
    setShowForm(true);
  };

  const ResumenSeries = ({ ejercicios }) => {
    const resumen = contarSeriesPorGrupo(ejercicios);
    if (Object.keys(resumen).length === 0) return null;
    return (
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"14px"}}>
        {Object.entries(resumen).map(([grupo, series]) => (
          <div key={grupo} style={{background:"#fce7f3",color:"#be185d",padding:"6px 10px",borderRadius:"999px",fontSize:"12px",fontWeight:"800"}}>
            {grupo}: {series} series
          </div>
        ))}
      </div>
    );
  };

  const FilaEjercicio = ({ ej, j, total }) => (
    <div style={{display:"grid",gridTemplateColumns:"2fr 0.7fr 0.7fr 0.7fr",gap:"6px",padding:"8px 0",borderBottom: j < total - 1 ? "1px solid #fce7f3" : "none",alignItems:"center"}}>
      <div style={{fontSize:"13px",color:"#333",display:"flex",alignItems:"center",gap:"6px",minWidth:0}}>
        <div style={{width:"20px",height:"20px",background:"#fce7f3",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"700",color:"#ec4899",flexShrink:0}}>{j+1}</div>
        <div style={{minWidth:0}}>
          <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ej.nombre}</div>
          <div style={{fontSize:"10px",color:"#be185d",fontWeight:"700"}}>
            {Array.isArray(ej.gruposMusculares) && ej.gruposMusculares.length > 0
              ? ej.gruposMusculares.map(g => `${g.nombre} ${Math.round(g.factor*100)}%`).join(" · ")
              : "Sin grupo"}
          </div>
        </div>
      </div>
      <div style={{fontSize:"13px",fontWeight:"700",color:"#333",textAlign:"center"}}>{ej.peso || "-"}kg</div>
      <div style={{fontSize:"13px",fontWeight:"700",color:"#333",textAlign:"center"}}>{ej.series || "-"}</div>
      <div style={{fontSize:"13px",fontWeight:"700",color:"#333",textAlign:"center"}}>{ej.reps || "-"}</div>
    </div>
  );

  const CabeceraTabla = () => (
    <div style={{display:"grid",gridTemplateColumns:"2fr 0.7fr 0.7fr 0.7fr",gap:"6px",marginBottom:"6px",paddingBottom:"6px",borderBottom:"2px solid #fce7f3"}}>
      <div style={{fontSize:"11px",color:"#888",fontWeight:"700"}}>Ejercicio</div>
      <div style={{fontSize:"11px",color:"#888",fontWeight:"700",textAlign:"center"}}>Peso</div>
      <div style={{fontSize:"11px",color:"#888",fontWeight:"700",textAlign:"center"}}>Series</div>
      <div style={{fontSize:"11px",color:"#888",fontWeight:"700",textAlign:"center"}}>Reps</div>
    </div>
  );

  const inputStyle = {padding:"10px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"14px",boxSizing:"border-box",width:"100%",minWidth:0};
  const inputNumStyle = {...inputStyle,textAlign:"center"};

  if (mostrarCreador) return <CreadorRutinaScreen user={user} profile={{goal: "hipertrofia", level: "intermedio", frequency: 3}} onVolver={() => { setMostrarCreador(false); cargarMisRutinas(); }} />;

return (
    <div>
      <h2 style={{fontSize:"28px",fontWeight:"900",color:"#ec4899",marginBottom:"8px"}}>Rutinas 💪</h2>

      <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
        <button onClick={() => setTab("mis")} style={{flex:1,padding:"12px",borderRadius:"14px",border:"2px solid #ec4899",background: tab==="mis"?"#ec4899":"#fff",color: tab==="mis"?"#fff":"#ec4899",fontWeight:"700",cursor:"pointer"}}>Mis rutinas</button>
        <button onClick={() => setTab("sugeridas")} style={{flex:1,padding:"12px",borderRadius:"14px",border:"2px solid #ec4899",background: tab==="sugeridas"?"#ec4899":"#fff",color: tab==="sugeridas"?"#fff":"#ec4899",fontWeight:"700",cursor:"pointer"}}>Sugeridas</button>
      </div>

      {tab === "mis" && (
        <div>
          {!showForm && (
  <div>
    <button onClick={() => setMostrarCreador(true)}
      style={{width:"100%",padding:"14px",background:"#fdf2f8",color:"#ec4899",border:"2px solid #ec4899",borderRadius:"16px",fontSize:"15px",fontWeight:"800",cursor:"pointer",marginBottom:"12px"}}>
      ✨ Crear rutina guiada
    </button>
    <button onClick={() => { setShowForm(true); setEditando(null); setNuevaRutina({ nombre: "", ejercicios: [{ ...ejercicioVacio }] }); }}
      style={{width:"100%",padding:"14px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"16px",fontSize:"16px",fontWeight:"800",cursor:"pointer",marginBottom:"20px"}}>
      + Agregar rutina manual
    </button>
  </div>
)}

          {showForm && (
            <div style={{background:"#fff",borderRadius:"20px",padding:"24px",marginBottom:"20px",border:"2px solid #ec4899"}}>
              <h3 style={{color:"#ec4899",marginBottom:"16px"}}>{editando ? "Editar rutina" : "Nueva rutina"}</h3>

              <input type="text" placeholder="Nombre de la rutina" value={nuevaRutina.nombre}
                onChange={(e) => setNuevaRutina({...nuevaRutina, nombre: e.target.value})}
                style={{width:"100%",padding:"14px",border:"2px solid #ec4899",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box",marginBottom:"20px"}}
              />

              <div style={{fontSize:"13px",fontWeight:"700",color:"#888",marginBottom:"12px"}}>EJERCICIOS</div>

              {nuevaRutina.ejercicios.map((ej, i) => (
                <div key={i} style={{background:"#fdf2f8",borderRadius:"14px",padding:"14px",marginBottom:"12px"}}>

                  {/* SELECTOR DE EJERCICIO */}
                  <select value={ej.ejercicioBase} onChange={(e) => seleccionarEjercicioBase(i, e.target.value)}
                    style={{...inputStyle, marginBottom:"10px"}}>
                    <option value="">Selecciona ejercicio</option>
                    {EJERCICIOS_BASE.map((ejBase, idx) => (
                      <option key={idx} value={ejBase.nombre}>{ejBase.nombre}</option>
                    ))}
                  </select>

                  {/* CAMPOS EXTRA SOLO PARA "OTRO" */}
                  {ej.ejercicioBase === "Otro" && (
                    <div style={{marginBottom:"10px"}}>
                      <input type="text" placeholder="Nombre del ejercicio" value={ej.nombre}
                        onChange={(e) => actualizarCampo(i, "nombre", e.target.value)}
                        style={{...inputStyle, marginBottom:"8px"}}
                      />
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                        <select value={ej.grupoPrincipal} onChange={(e) => actualizarGrupo(i, "grupoPrincipal", e.target.value)} style={inputStyle}>
                          <option value="">Grupo principal</option>
                          {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select value={ej.grupoSecundario} onChange={(e) => actualizarGrupo(i, "grupoSecundario", e.target.value)} style={inputStyle}>
                          <option value="">Grupo secundario (opcional)</option>
                          {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* GRUPOS ASIGNADOS AUTOMATICAMENTE */}
                  {ej.ejercicioBase && ej.ejercicioBase !== "Otro" && ej.gruposMusculares.length > 0 && (
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>
                      {ej.gruposMusculares.map((g, gi) => (
                        <div key={gi} style={{background:"#ec4899",color:"#fff",padding:"4px 10px",borderRadius:"999px",fontSize:"11px",fontWeight:"700"}}>
                          {g.nombre} {Math.round(g.factor*100)}%
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COMENTARIO */}
                  <input type="text" placeholder="Comentario opcional" value={ej.comentario || ""}
                    onChange={(e) => actualizarCampo(i, "comentario", e.target.value)}
                    style={{...inputStyle, marginBottom:"10px"}}
                  />

                  {/* PESO SERIES REPS */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                    <div>
                      <div style={{fontSize:"11px",color:"#888",textAlign:"center",marginBottom:"4px"}}>Peso kg</div>
                      <input type="number" placeholder="0" value={ej.peso} onChange={(e) => actualizarCampo(i, "peso", e.target.value)} style={inputNumStyle} />
                    </div>
                    <div>
                      <div style={{fontSize:"11px",color:"#888",textAlign:"center",marginBottom:"4px"}}>Series</div>
                      <input type="number" placeholder="3" value={ej.series} onChange={(e) => actualizarCampo(i, "series", e.target.value)} style={inputNumStyle} />
                    </div>
                    <div>
                      <div style={{fontSize:"11px",color:"#888",textAlign:"center",marginBottom:"4px"}}>Reps</div>
                      <input type="number" placeholder="10" value={ej.reps} onChange={(e) => actualizarCampo(i, "reps", e.target.value)} style={inputNumStyle} />
                    </div>
                  </div>

                </div>
              ))}

              <button onClick={agregarEjercicio} style={{width:"100%",padding:"10px",background:"#fce7f3",color:"#ec4899",border:"none",borderRadius:"12px",fontWeight:"700",cursor:"pointer",marginBottom:"16px"}}>
                + Agregar ejercicio
              </button>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <button onClick={() => { setShowForm(false); setEditando(null); }} style={{padding:"12px",background:"#fce7f3",color:"#ec4899",border:"none",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>Cancelar</button>
                <button onClick={guardarRutina} disabled={loading} style={{padding:"12px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>{loading ? "Guardando..." : "Guardar"}</button>
              </div>
            </div>
          )}

          {misRutinas.length === 0 && !showForm && (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:"50px",marginBottom:"12px"}}>📋</div>
              <div style={{fontSize:"18px",fontWeight:"800",color:"#ec4899",marginBottom:"8px"}}>Sin rutinas aun</div>
              <div style={{fontSize:"14px",color:"#888"}}>Agrega tu primera rutina con ejercicios, pesos y repeticiones</div>
            </div>
          )}

          {misRutinas.map((rutina) => (
            <div key={rutina.id} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                <div style={{fontWeight:"800",fontSize:"18px",color:"#333"}}>{rutina.nombre}</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={() => abrirEditar(rutina)} style={{background:"#fdf2f8",color:"#ec4899",border:"2px solid #fce7f3",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"700"}}>Editar</button>
                  <button onClick={() => eliminarRutina(rutina.id)} style={{background:"#fff0f0",color:"#ef4444",border:"2px solid #fecaca",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"700"}}>Borrar</button>
                </div>
              </div>
              <ResumenSeries ejercicios={rutina.ejercicios} />
              <CabeceraTabla />
              {rutina.ejercicios.map((ej, j) => <FilaEjercicio key={j} ej={ej} j={j} total={rutina.ejercicios.length} />)}
            </div>
          ))}
        </div>
      )}

      {tab === "sugeridas" && (
        <div>
          <div style={{background:"#fce7f3",borderRadius:"14px",padding:"14px",marginBottom:"20px"}}>
            <div style={{fontSize:"13px",fontWeight:"700",color:"#be185d"}}>Recomendadas para tu fase {phaseName}</div>
            <div style={{fontSize:"12px",color:"#888",marginTop:"4px"}}>Basadas en tu ciclo hormonal actual</div>
          </div>
          {rutinasDelDia.map((rutina, i) => (
            <div key={i} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
              <div style={{fontWeight:"800",fontSize:"18px",color:"#333",marginBottom:"12px"}}>{rutina.nombre}</div>
              <ResumenSeries ejercicios={rutina.ejercicios} />
              <CabeceraTabla />
              {rutina.ejercicios.map((ej, j) => <FilaEjercicio key={j} ej={ej} j={j} total={rutina.ejercicios.length} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}