import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const RUTINAS_SUGERIDAS = {
  Menstrual: [
    { nombre: "Movilidad y estiramientos", ejercicios: [{ nombre: "Yoga suave 20min", peso: "0", series: "1", reps: "1", grupoMuscular: "Full body" }, { nombre: "Movilidad de cadera", peso: "0", series: "2", reps: "10", grupoMuscular: "Gluteos" }, { nombre: "Estiramientos de columna", peso: "0", series: "2", reps: "10", grupoMuscular: "Espalda" }] },
    { nombre: "Caminata activa", ejercicios: [{ nombre: "Caminata 30min", peso: "0", series: "1", reps: "1", grupoMuscular: "Full body" }, { nombre: "Movilidad de tobillos", peso: "0", series: "2", reps: "15", grupoMuscular: "Pantorrillas" }] },
  ],
  Folicular: [
    { nombre: "Fuerza tren inferior", ejercicios: [{ nombre: "Sentadilla", peso: "60", series: "4", reps: "8", grupoMuscular: "Cuadriceps" }, { nombre: "Peso muerto", peso: "70", series: "4", reps: "6", grupoMuscular: "Isquios" }, { nombre: "Prensa", peso: "100", series: "3", reps: "10", grupoMuscular: "Cuadriceps" }, { nombre: "Zancadas", peso: "20", series: "3", reps: "10", grupoMuscular: "Gluteos" }] },
    { nombre: "Fuerza tren superior", ejercicios: [{ nombre: "Press banca", peso: "50", series: "4", reps: "8", grupoMuscular: "Pecho" }, { nombre: "Remo con barra", peso: "50", series: "4", reps: "8", grupoMuscular: "Espalda" }, { nombre: "Press militar", peso: "30", series: "3", reps: "10", grupoMuscular: "Hombros" }] },
  ],
  Ovulatoria: [
    { nombre: "Potencia y explosividad", ejercicios: [{ nombre: "Sentadilla con salto", peso: "0", series: "3", reps: "6", grupoMuscular: "Gluteos" }, { nombre: "Box jump", peso: "0", series: "3", reps: "8", grupoMuscular: "Gluteos" }, { nombre: "Sprint 20m", peso: "0", series: "6", reps: "1", grupoMuscular: "Full body" }] },
    { nombre: "PR day - Maximos", ejercicios: [{ nombre: "Sentadilla heavy", peso: "80", series: "3", reps: "3", grupoMuscular: "Cuadriceps" }, { nombre: "Peso muerto heavy", peso: "90", series: "3", reps: "3", grupoMuscular: "Isquios" }] },
  ],
  Lutea: [
    { nombre: "Tecnica y control", ejercicios: [{ nombre: "Sentadilla pause", peso: "50", series: "3", reps: "8", grupoMuscular: "Cuadriceps" }, { nombre: "Peso muerto rumano", peso: "50", series: "3", reps: "10", grupoMuscular: "Isquios" }, { nombre: "Core estabilidad", peso: "0", series: "3", reps: "15", grupoMuscular: "Abdomen" }] },
    { nombre: "Hipertrofia moderada", ejercicios: [{ nombre: "Sentadilla", peso: "50", series: "3", reps: "12", grupoMuscular: "Cuadriceps" }, { nombre: "Press banca", peso: "40", series: "3", reps: "12", grupoMuscular: "Pecho" }, { nombre: "Curl biceps", peso: "12", series: "3", reps: "15", grupoMuscular: "Biceps" }] },
  ],
};

const calcRec = (pesoBase, repsBase, seriesBase, intensidad) => {
  const factor = intensidad / 100;
  const peso = parseFloat(pesoBase) || 0;
  const reps = parseInt(repsBase) || 10;
  const series = parseInt(seriesBase) || 3;
  let seriesRec = series;
  if (intensidad >= 90) seriesRec = series + 1;
  else if (intensidad <= 50) seriesRec = Math.max(1, series - 1);
  return {
    series: seriesRec,
    reps: Math.max(3, Math.round(reps * factor)),
    peso: peso > 0 ? Math.round(peso * factor * 2) / 2 : 0,
  };
};

export default function SesionScreen({ user, currentPhase, onSesionGuardada }) {
  const [paso, setPaso] = useState(1);
  const [tipoRutina, setTipoRutina] = useState(null);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [misRutinas, setMisRutinas] = useState([]);
  const [registros, setRegistros] = useState({});
  const [feeling, setFeeling] = useState(0);
  const [nota, setNota] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [loading, setLoading] = useState(false);
  const hoyStr = new Date().toISOString().split("T")[0];
  const [fechaSesion, setFechaSesion] = useState(hoyStr);

  const phaseName = currentPhase?.name || "Folicular";
  const intensity = currentPhase?.intensity || 85;
  const phaseColor = currentPhase?.color || "#ec4899";
  const rutinasDelDia = RUTINAS_SUGERIDAS[phaseName] || RUTINAS_SUGERIDAS.Folicular;

  useEffect(() => { cargarMisRutinas(); }, []);

  const cargarMisRutinas = async () => {
    const q = query(collection(db, "rutinas"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    setMisRutinas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const seleccionarRutina = (rutina) => {
    setRutinaSeleccionada(rutina);
    const regs = {};
    rutina.ejercicios.forEach((ej, index) => {
      const rec = calcRec(ej.peso, ej.reps, ej.series, intensity);
      regs[index] = {
        nombre: ej.nombre,
        grupoMuscular: ej.grupoMuscular || "Sin grupo",
        gruposMusculares: ej.gruposMusculares || [],
        series: String(rec.series),
        reps: String(rec.reps),
        peso: String(rec.peso),
        pesoBase: ej.peso || "0",
        repsBase: ej.reps || "10",
        seriesBase: ej.series || "3",
      };
    });
    setRegistros(regs);
    setPaso(3);
  };

  const guardarSesion = async () => {
    setLoading(true);
    try {
      const ejercicios = Object.values(registros).map(ej => ({
        nombre: ej.nombre,
        grupoMuscular: ej.grupoMuscular || "Sin grupo",
        gruposMusculares: ej.gruposMusculares || [],
        series: ej.series,
        reps: ej.reps,
        peso: ej.peso,
      }));

      const seriesPorGrupo = {};
      ejercicios.forEach(ej => {
        if (Array.isArray(ej.gruposMusculares) && ej.gruposMusculares.length > 0) {
          ej.gruposMusculares.forEach(g => {
            seriesPorGrupo[g.nombre] = Math.round(((seriesPorGrupo[g.nombre] || 0) + Number(ej.series) * g.factor) * 10) / 10;
          });
        } else {
          seriesPorGrupo[ej.grupoMuscular] = (seriesPorGrupo[ej.grupoMuscular] || 0) + Number(ej.series);
        }
      });

      await addDoc(collection(db, "sesiones"), {
        userId: user.uid,
        rutinaNombre: rutinaSeleccionada.nombre,
        fase: phaseName,
        intensidad: intensity,
        ejercicios,
        seriesPorGrupo,
        feeling,
        nota,
        fecha: new Date(fechaSesion + "T12:00:00").toISOString(),
      });

      // RACHA CORREGIDA
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const lastSession = userData?.lastSession ? new Date(userData.lastSession) : null;
      let streak = userData?.streak || 0;

      if (lastSession) {
        const last = new Date(lastSession);
        last.setHours(0, 0, 0, 0);
        const diff = Math.floor((hoy - last) / (1000 * 60 * 60 * 24));
        if (diff === 0) {
          // Ya entrenaste hoy, racha no cambia
        } else if (diff === 1) {
          streak += 1;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }

      await updateDoc(userRef, {
        streak,
        lastSession: new Date().toISOString(),
      });
if (onSesionGuardada) onSesionGuardada();
      setGuardado(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (guardado) return (
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:"60px",marginBottom:"16px"}}>🎉</div>
      <h2 style={{color:"#ec4899",fontSize:"28px",marginBottom:"8px"}}>Sesion registrada!</h2>
      <p style={{color:"#888",marginBottom:"24px"}}>Sigue asi, vas increible!</p>
      <button onClick={() => { setPaso(1); setRutinaSeleccionada(null); setFeeling(0); setNota(""); setGuardado(false); }}
        style={{padding:"14px 32px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"16px",fontSize:"16px",fontWeight:"800",cursor:"pointer"}}>
        Nueva sesion
      </button>
    </div>
  );

  return (
    <div>
      <h2 style={{fontSize:"28px",fontWeight:"900",color:"#ec4899",marginBottom:"4px"}}>Registrar Sesion 📝</h2>

      <div style={{background:`${phaseColor}20`,border:`2px solid ${phaseColor}`,borderRadius:"12px",padding:"10px 14px",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:"700",color:phaseColor}}>Fase {phaseName}</span>
        <span style={{fontWeight:"900",color:phaseColor,fontSize:"18px"}}>{intensity}% intensidad</span>
      </div>

      {paso === 1 && (
        <div>
          <p style={{fontWeight:"700",color:"#333",marginBottom:"16px",fontSize:"16px"}}>Que rutina haces hoy?</p>
          <div style={{display:"grid",gap:"12px"}}>
            <button onClick={() => { setTipoRutina("propia"); setPaso(2); }}
              style={{padding:"24px",background:"#fff",border:"2px solid #ec4899",borderRadius:"20px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>📋 Mis rutinas</div>
              <div style={{fontSize:"13px",color:"#888"}}>Con ajuste personalizado segun tu fase actual</div>
            </button>
            <button onClick={() => { setTipoRutina("sugerida"); setPaso(2); }}
              style={{padding:"24px",background:"#fff",border:"2px solid #fce7f3",borderRadius:"20px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>⚡ Rutinas sugeridas</div>
              <div style={{fontSize:"13px",color:"#888"}}>Recomendadas para tu fase {phaseName}</div>
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div>
          <button onClick={() => setPaso(1)} style={{background:"none",border:"none",color:"#ec4899",fontWeight:"700",cursor:"pointer",marginBottom:"16px",fontSize:"14px"}}>← Volver</button>
          <p style={{fontWeight:"700",color:"#333",marginBottom:"16px"}}>Elige tu rutina:</p>
          {tipoRutina === "propia" && misRutinas.length === 0 && (
            <div style={{textAlign:"center",padding:"40px",background:"#fff",borderRadius:"20px",border:"2px dashed #ec4899"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>📋</div>
              <div style={{fontWeight:"800",color:"#ec4899",marginBottom:"8px"}}>Sin rutinas guardadas</div>
              <div style={{fontSize:"14px",color:"#888"}}>Ve a Rutinas y crea tu primera rutina</div>
            </div>
          )}
          {(tipoRutina === "propia" ? misRutinas : rutinasDelDia).map((rutina, i) => (
            <button key={i} onClick={() => seleccionarRutina(rutina)}
              style={{width:"100%",padding:"20px",background:"#fff",border:"2px solid #fce7f3",borderRadius:"20px",cursor:"pointer",textAlign:"left",marginBottom:"12px"}}>
              <div style={{fontWeight:"800",fontSize:"17px",color:"#333",marginBottom:"8px"}}>{rutina.nombre}</div>
              <div style={{fontSize:"13px",color:"#888",marginBottom:"8px"}}>{rutina.ejercicios.length} ejercicios</div>
              {tipoRutina === "propia" && (
                <div style={{background:"#fce7f3",borderRadius:"10px",padding:"8px 12px",fontSize:"12px",color:"#be185d",fontWeight:"600"}}>
                  La app calculara tu carga para el {intensity}% de intensidad
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {paso === 3 && rutinaSeleccionada && (
        <div>
          <button onClick={() => setPaso(2)} style={{background:"none",border:"none",color:"#ec4899",fontWeight:"700",cursor:"pointer",marginBottom:"16px",fontSize:"14px"}}>← Volver</button>
          <h3 style={{color:"#333",marginBottom:"4px",fontSize:"20px"}}>{rutinaSeleccionada.nombre}</h3>
          <p style={{color:"#888",fontSize:"13px",marginBottom:"20px"}}>Compara tus valores base con el ajuste sugerido para hoy</p>

          {rutinaSeleccionada.ejercicios.map((ej, i) => {
            const vals = registros[i] || { nombre: ej.nombre, series: "", reps: "", peso: "", seriesBase: ej.series||"3", repsBase: ej.reps||"10", pesoBase: ej.peso||"0" };
            const rec = calcRec(ej.peso, ej.reps, ej.series, intensity);
            return (
              <div key={i} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
                <div style={{fontWeight:"800",fontSize:"16px",color:"#333",marginBottom:"4px"}}>{i+1}. {ej.nombre}</div>
                <div style={{fontSize:"12px",color:"#be185d",fontWeight:"700",marginBottom:"14px"}}>
                  {Array.isArray(ej.gruposMusculares) && ej.gruposMusculares.length > 0
                    ? ej.gruposMusculares.map(g => `${g.nombre} ${Math.round(g.factor*100)}%`).join(" · ")
                    : ej.grupoMuscular || "Sin grupo"}
                </div>

                <div style={{background:`${phaseColor}15`,border:`2px solid ${phaseColor}30`,borderRadius:"14px",padding:"12px",marginBottom:"14px"}}>
                  <div style={{fontSize:"12px",fontWeight:"700",color:phaseColor,marginBottom:"8px"}}>AJUSTE SUGERIDO ({phaseName.toUpperCase()} - {intensity}%)</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",textAlign:"center"}}>
                    <div><div style={{fontSize:"22px",fontWeight:"900",color:phaseColor}}>{rec.series}</div><div style={{fontSize:"11px",color:"#888"}}>Series</div></div>
                    <div><div style={{fontSize:"22px",fontWeight:"900",color:phaseColor}}>{rec.reps}</div><div style={{fontSize:"11px",color:"#888"}}>Reps</div></div>
                    <div><div style={{fontSize:"22px",fontWeight:"900",color:phaseColor}}>{rec.peso > 0 ? `${rec.peso}kg` : "Corporal"}</div><div style={{fontSize:"11px",color:"#888"}}>Peso</div></div>
                  </div>
                </div>

                <div style={{background:"#fdf2f8",border:"2px solid #fce7f3",borderRadius:"14px",padding:"12px",marginBottom:"14px"}}>
                  <div style={{fontSize:"12px",fontWeight:"700",color:"#be185d",marginBottom:"8px"}}>TUS VALORES BASE</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",textAlign:"center"}}>
                    <div><div style={{fontSize:"20px",fontWeight:"900",color:"#ec4899"}}>{vals.seriesBase}</div><div style={{fontSize:"11px",color:"#888"}}>Series</div></div>
                    <div><div style={{fontSize:"20px",fontWeight:"900",color:"#ec4899"}}>{vals.repsBase}</div><div style={{fontSize:"11px",color:"#888"}}>Reps</div></div>
                    <div><div style={{fontSize:"20px",fontWeight:"900",color:"#ec4899"}}>{Number(vals.pesoBase) > 0 ? `${vals.pesoBase}kg` : "Corporal"}</div><div style={{fontSize:"11px",color:"#888"}}>Peso</div></div>
                  </div>
                </div>

                <div style={{fontSize:"12px",fontWeight:"700",color:"#888",marginBottom:"8px"}}>LO QUE HICISTE HOY</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                  <div>
                    <div style={{fontSize:"11px",color:"#888",textAlign:"center",marginBottom:"4px"}}>Series</div>
                    <input type="number" value={vals.series} onChange={(e) => setRegistros({...registros,[i]:{...vals,series:e.target.value}})}
                      style={{width:"100%",padding:"10px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"16px",textAlign:"center",boxSizing:"border-box",fontWeight:"700"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:"#888",textAlign:"center",marginBottom:"4px"}}>Reps</div>
                    <input type="number" value={vals.reps} onChange={(e) => setRegistros({...registros,[i]:{...vals,reps:e.target.value}})}
                      style={{width:"100%",padding:"10px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"16px",textAlign:"center",boxSizing:"border-box",fontWeight:"700"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:"#888",textAlign:"center",marginBottom:"4px"}}>Peso kg</div>
                    <input type="number" value={vals.peso} onChange={(e) => setRegistros({...registros,[i]:{...vals,peso:e.target.value}})}
                      style={{width:"100%",padding:"10px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"16px",textAlign:"center",boxSizing:"border-box",fontWeight:"700"}}/>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
            <div style={{fontWeight:"800",fontSize:"17px",color:"#333",marginBottom:"12px"}}>Fecha de la sesion 📅</div>
            <input type="date" value={fechaSesion} onChange={(e) => setFechaSesion(e.target.value)}
              style={{width:"100%",padding:"12px",border:"2px solid #fce7f3",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box",fontWeight:"700",color:"#333",marginBottom:"0"}}/>
          </div>

          <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
            <div style={{fontWeight:"800",fontSize:"17px",color:"#333",marginBottom:"16px"}}>Como te sentiste hoy? 😊</div>
            <div style={{display:"flex",justifyContent:"space-around",marginBottom:"8px"}}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setFeeling(n)}
                  style={{width:"52px",height:"52px",borderRadius:"50%",border: feeling===n?"3px solid #ec4899":"2px solid #fce7f3",background: feeling===n?"#fce7f3":"#fff",fontSize:"20px",cursor:"pointer",fontWeight:"900",color: feeling===n?"#ec4899":"#888"}}>
                  {n}
                </button>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#888",padding:"0 8px",marginBottom:"16px"}}>
              <span>Muy mal</span><span>Excelente</span>
            </div>
            <textarea placeholder="Notas opcionales..." value={nota} onChange={(e) => setNota(e.target.value)}
              style={{width:"100%",padding:"12px",border:"2px solid #fce7f3",borderRadius:"14px",fontSize:"14px",boxSizing:"border-box",minHeight:"80px",resize:"none"}}/>
          </div>

          <button onClick={guardarSesion} disabled={loading || feeling === 0}
            style={{width:"100%",padding:"16px",background: feeling===0?"#ddd":"#ec4899",color:"#fff",border:"none",borderRadius:"16px",fontSize:"18px",fontWeight:"800",cursor: feeling===0?"not-allowed":"pointer"}}>
            {loading ? "Guardando..." : feeling===0 ? "Evalua tu sesion primero" : "Guardar sesion 🎉"}
          </button>
        </div>
      )}
    </div>
  );
}