import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import RutinasScreen from "./RutinasScreen";
import SesionScreen from "./SesionScreen";
import ProgresoScreen from "./ProgresoScreen";

export default function DashboardScreen({ user }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("inicio");
  const [cycleDate, setCycleDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [goal, setGoal] = useState("fuerza");
  const [level, setLevel] = useState("intermedio");
  const [frequency, setFrequency] = useState(3);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [sesionesEstaSemana, setSesionesEstaSemana] = useState(0);
  const [resumenSemana, setResumenSemana] = useState({});
  const [sesiones, setSesiones] = useState([]);
  const [planSemanal, setPlanSemanal] = useState({});

  const EJERCICIOS_BASE_MAP = {
    "Hip thrust": [{nombre:"Gluteos",factor:0.8},{nombre:"Isquios",factor:0.2}],
    "Puente de gluteos": [{nombre:"Gluteos",factor:0.85},{nombre:"Isquios",factor:0.15}],
    "Sentadilla": [{nombre:"Cuadriceps",factor:0.6},{nombre:"Gluteos",factor:0.4}],
    "Sentadilla sumo": [{nombre:"Gluteos",factor:0.6},{nombre:"Cuadriceps",factor:0.4}],
    "Prensa": [{nombre:"Cuadriceps",factor:0.7},{nombre:"Gluteos",factor:0.3}],
    "Prensa pies altos": [{nombre:"Gluteos",factor:0.6},{nombre:"Isquios",factor:0.4}],
    "Peso muerto rumano": [{nombre:"Isquios",factor:0.6},{nombre:"Gluteos",factor:0.4}],
    "Peso muerto convencional": [{nombre:"Isquios",factor:0.5},{nombre:"Gluteos",factor:0.5}],
    "Zancadas": [{nombre:"Gluteos",factor:0.6},{nombre:"Cuadriceps",factor:0.4}],
    "Bulgarian split squat": [{nombre:"Gluteos",factor:0.6},{nombre:"Cuadriceps",factor:0.4}],
    "Step up": [{nombre:"Gluteos",factor:0.6},{nombre:"Cuadriceps",factor:0.4}],
    "Curl femoral": [{nombre:"Isquios",factor:1}],
    "Extension de cuadriceps": [{nombre:"Cuadriceps",factor:1}],
    "Abduccion de cadera": [{nombre:"Gluteos",factor:1}],
    "Patada gluteo polea": [{nombre:"Gluteos",factor:1}],
    "Pantorrillas de pie": [{nombre:"Pantorrillas",factor:1}],
    "Pantorrillas sentado": [{nombre:"Pantorrillas",factor:1}],
    "Press banca": [{nombre:"Pecho",factor:0.7},{nombre:"Triceps",factor:0.3}],
    "Press inclinado": [{nombre:"Pecho",factor:0.6},{nombre:"Hombros",factor:0.4}],
    "Press militar": [{nombre:"Hombros",factor:0.7},{nombre:"Triceps",factor:0.3}],
    "Elevaciones laterales": [{nombre:"Hombros",factor:1}],
    "Remo con barra": [{nombre:"Espalda",factor:0.8},{nombre:"Biceps",factor:0.2}],
    "Remo unilateral": [{nombre:"Espalda",factor:0.8},{nombre:"Biceps",factor:0.2}],
    "Jalon al pecho": [{nombre:"Espalda",factor:0.75},{nombre:"Biceps",factor:0.25}],
    "Dominadas": [{nombre:"Espalda",factor:0.7},{nombre:"Biceps",factor:0.3}],
    "Pull over": [{nombre:"Espalda",factor:0.9},{nombre:"Pecho",factor:0.1}],
    "Curl biceps": [{nombre:"Biceps",factor:1}],
    "Curl martillo": [{nombre:"Biceps",factor:1}],
    "Extension triceps polea": [{nombre:"Triceps",factor:1}],
    "Fondos": [{nombre:"Triceps",factor:0.6},{nombre:"Pecho",factor:0.4}],
    "Lagartijas": [{nombre:"Pecho",factor:0.6},{nombre:"Triceps",factor:0.4}],
    "Crunch": [{nombre:"Abdomen",factor:1}],
    "Plancha": [{nombre:"Abdomen",factor:1}],
  };

  const rangosSeries = {
    hipertrofia: {
      principiante: {Gluteos:{min:8,max:14},Cuadriceps:{min:6,max:12},Isquios:{min:6,max:12},Espalda:{min:8,max:14},Pecho:{min:6,max:12},Hombros:{min:6,max:12},Biceps:{min:4,max:8},Triceps:{min:4,max:8},Abdomen:{min:4,max:10},Pantorrillas:{min:4,max:10}},
      intermedio: {Gluteos:{min:10,max:18},Cuadriceps:{min:8,max:16},Isquios:{min:8,max:16},Espalda:{min:10,max:18},Pecho:{min:8,max:16},Hombros:{min:8,max:16},Biceps:{min:6,max:12},Triceps:{min:6,max:12},Abdomen:{min:6,max:12},Pantorrillas:{min:6,max:12}},
      avanzado: {Gluteos:{min:12,max:22},Cuadriceps:{min:10,max:20},Isquios:{min:10,max:20},Espalda:{min:12,max:22},Pecho:{min:10,max:20},Hombros:{min:10,max:18},Biceps:{min:8,max:16},Triceps:{min:8,max:16},Abdomen:{min:8,max:16},Pantorrillas:{min:8,max:16}},
    },
    fuerza: {
      principiante: {Gluteos:{min:4,max:8},Cuadriceps:{min:4,max:8},Isquios:{min:4,max:8},Espalda:{min:4,max:8},Pecho:{min:4,max:8},Hombros:{min:3,max:6},Biceps:{min:2,max:5},Triceps:{min:2,max:5},Abdomen:{min:3,max:6},Pantorrillas:{min:3,max:6}},
      intermedio: {Gluteos:{min:6,max:10},Cuadriceps:{min:6,max:10},Isquios:{min:6,max:10},Espalda:{min:6,max:10},Pecho:{min:6,max:10},Hombros:{min:4,max:8},Biceps:{min:3,max:6},Triceps:{min:3,max:6},Abdomen:{min:4,max:8},Pantorrillas:{min:4,max:8}},
      avanzado: {Gluteos:{min:8,max:14},Cuadriceps:{min:8,max:14},Isquios:{min:8,max:14},Espalda:{min:8,max:14},Pecho:{min:8,max:14},Hombros:{min:6,max:10},Biceps:{min:4,max:8},Triceps:{min:4,max:8},Abdomen:{min:6,max:10},Pantorrillas:{min:6,max:10}},
    },
    resistencia: {
      principiante: {Gluteos:{min:10,max:16},Cuadriceps:{min:10,max:16},Isquios:{min:8,max:14},Espalda:{min:8,max:14},Pecho:{min:8,max:14},Hombros:{min:8,max:14},Biceps:{min:6,max:12},Triceps:{min:6,max:12},Abdomen:{min:8,max:16},Pantorrillas:{min:8,max:16}},
      intermedio: {Gluteos:{min:12,max:20},Cuadriceps:{min:12,max:20},Isquios:{min:10,max:18},Espalda:{min:10,max:18},Pecho:{min:10,max:18},Hombros:{min:10,max:18},Biceps:{min:8,max:14},Triceps:{min:8,max:14},Abdomen:{min:10,max:20},Pantorrillas:{min:10,max:20}},
      avanzado: {Gluteos:{min:15,max:25},Cuadriceps:{min:15,max:25},Isquios:{min:12,max:22},Espalda:{min:12,max:22},Pecho:{min:12,max:22},Hombros:{min:12,max:22},Biceps:{min:10,max:18},Triceps:{min:10,max:18},Abdomen:{min:12,max:24},Pantorrillas:{min:12,max:24}},
    },
  };

  useEffect(() => {
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        if (data.cycleStart) setCycleDate(data.cycleStart);
        if (data.cycleLength) setCycleLength(data.cycleLength);
        if (data.goal) setGoal(data.goal);
        if (data.level) setLevel(data.level);
        if (data.frequency) setFrequency(data.frequency);
        if (data.name) setName(data.name);
      }
    };

    const cargarSesiones = async () => {
      const q = query(collection(db, "sesiones"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSesiones(data);
    };

    loadProfile();
    cargarSesiones();
    cargarSesionesEstaSemana();
  }, [user]);

  const cargarSesionesEstaSemana = async () => {
    const q = query(collection(db, "sesiones"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const todasSesiones = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);

    const diasEntrenados = new Set();
    const gruposResumen = {};

    todasSesiones.forEach(s => {
      const fecha = new Date(s.fecha);
      if (fecha >= lunes && fecha <= domingo) {
        const diaKey = fecha.toISOString().split("T")[0];
        diasEntrenados.add(diaKey);

        const arr = s.ejercicios
          ? s.ejercicios
          : s.registros
          ? Object.entries(s.registros).map(([nombre, vals]) => ({ nombre, ...vals, gruposMusculares: [] }))
          : [];

        arr.forEach(ej => {
          const series = Number(ej.series || 0);
          if (series === 0) return;
          let grupos = [];
          if (Array.isArray(ej.gruposMusculares) && ej.gruposMusculares.length > 0) {
            grupos = ej.gruposMusculares;
          } else if (EJERCICIOS_BASE_MAP[ej.nombre]) {
            grupos = EJERCICIOS_BASE_MAP[ej.nombre];
          }
          if (grupos.length > 0) {
            grupos.forEach(g => {
              gruposResumen[g.nombre] = Math.round(((gruposResumen[g.nombre] || 0) + series * g.factor) * 10) / 10;
            });
          }
        });
      }
    });

    setSesionesEstaSemana(diasEntrenados.size);
    setResumenSemana(gruposResumen);

    const qRutinas = query(collection(db, "rutinas"), where("userId", "==", user.uid), where("generada", "==", true));
    const snapRutinas = await getDocs(qRutinas);
    const rutinasGeneradas = snapRutinas.docs.map(d => ({ id: d.id, ...d.data() }));

    const plan = {};
    rutinasGeneradas.forEach(rutina => {
      (rutina.ejercicios || []).forEach(ej => {
        const series = Number(ej.series || 0);
        if (series === 0) return;
        if (Array.isArray(ej.gruposMusculares) && ej.gruposMusculares.length > 0) {
          ej.gruposMusculares.forEach(g => {
            plan[g.nombre] = Math.round(((plan[g.nombre] || 0) + series * g.factor) * 10) / 10;
          });
        }
      });
    });

    setPlanSemanal(plan);
  };

  const getPhase = () => {
    if (!cycleDate) return null;
    const today = new Date();
    const start = new Date(cycleDate);
    const day = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    const d = ((day - 1) % cycleLength) + 1;
    if (d <= 5) return { name: "Menstrual", color: "#ec4899", intensity: 40, rec: "Recuperacion activa, movilidad y estiramientos", emoji: "🌸", insight: "Tu cuerpo pide descanso. Movilidad y recuperacion son tu mejor entrenamiento ahora." };
    if (d <= 13) return { name: "Folicular", color: "#db2777", intensity: 85, rec: "Fuerza maxima, aumenta cargas progresivamente", emoji: "⚡", insight: "Tu mejor fase para ganar fuerza y musculo. Aprovecha para subir cargas y bate tus marcas." };
    if (d <= 16) return { name: "Ovulatoria", color: "#be185d", intensity: 100, rec: "Pico de potencia, entrena al maximo", emoji: "🔥", insight: "Pico hormonal maximo. Hoy es tu dia para intentar nuevos maximos y entrenar al 100%." };
    const lutDay = d - 16;
    const totalLut = cycleLength - 16;
    const isDeload = lutDay > totalLut - 5;
    return {
      name: "Lutea", color: "#9d174d",
      intensity: isDeload ? 50 : 65,
      rec: isDeload ? "Semana de descarga, reduce volumen 40%" : "Tecnica y control, pesos moderados",
      emoji: "🌙",
      insight: isDeload ? "Semana de descarga. Reduce el volumen un 40% para que tu cuerpo se recupere y vuelva mas fuerte." : "Enfocate en la tecnica y el control. Tu sistema nervioso agradecera la precision sobre la intensidad.",
      isDeload
    };
  };

  const evaluarSeries = (grupo, series) => {
    const obj = (goal || "hipertrofia").toLowerCase();
    const niv = (level || "intermedio").toLowerCase();
    const rango = rangosSeries?.[obj]?.[niv]?.[grupo];
    if (!rango) return { estado: "Sin rango", color: "#888" };
    if (series < rango.min) return { estado: "Bajo", color: "#f59e0b" };
    if (series > rango.max) return { estado: "Alto", color: "#ef4444" };
    return { estado: "Optimo", color: "#10b981" };
  };

  const saveProfile = async () => {
    const nuevoPerfil = { name, email: user.email, cycleStart: cycleDate, cycleLength, goal, level, frequency, streak: profile?.streak || 0 };
    await setDoc(doc(db, "users", user.uid), nuevoPerfil);
    setProfile(nuevoPerfil);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const phase = getPhase();
  const frecuenciaObjetivo = frequency || profile?.frequency || 3;

  const tabs = [
    { id: "inicio", label: "Inicio", emoji: "🏠" },
    { id: "perfil", label: "Perfil", emoji: "👤" },
    { id: "rutinas", label: "Rutinas", emoji: "💪" },
    { id: "sesion", label: "Sesion", emoji: "📝" },
    { id: "progreso", label: "Progreso", emoji: "📊" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#fdf2f8"}}>

      <div style={{background:"#fff",padding:"16px 24px",boxShadow:"0 2px 20px rgba(236,72,153,0.1)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",background:"linear-gradient(135deg,#ec4899,#db2777)",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:"900",fontSize:"16px"}}>CF</span>
          </div>
          <div>
            <div style={{fontWeight:"900",fontSize:"18px",color:"#ec4899"}}>CicloFit</div>
            <div style={{fontSize:"11px",color:"#888"}}>Hola, {name || user.email} 👋</div>
          </div>
        </div>
        <button onClick={() => signOut(auth)} style={{padding:"8px 16px",background:"#fce7f3",color:"#ec4899",border:"none",borderRadius:"10px",cursor:"pointer",fontWeight:"700"}}>
          Salir
        </button>
      </div>

      <div style={{padding:"24px",maxWidth:"600px",margin:"0 auto",paddingBottom:"100px"}}>

        {activeTab === "inicio" && (
          <div>

            {/* SALUDO DINAMICO */}
            {(() => {
              const hora = new Date().getHours();
              const saludo = hora < 12 ? "Buenos dias" : hora < 19 ? "Buenas tardes" : "Buenas noches";
              const emoji = hora < 12 ? "🌅" : hora < 19 ? "☀️" : "🌙";
              return (
                <div style={{marginBottom:"16px"}}>
                  <div style={{fontSize:"24px",fontWeight:"900",color:"#333"}}>{emoji} {saludo}, {name || "campeona"}!</div>
                  <div style={{fontSize:"14px",color:"#888",marginTop:"4px"}}>
                    {new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}
                  </div>
                </div>
              );
            })()}

            {/* MINI CALENDARIO SEMANAL */}
            {(() => {
              const hoy = new Date();
              const lunes = new Date(hoy);
              lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
              const dias = ["L","M","M","J","V","S","D"];
              return (
                <div style={{background:"#fff",borderRadius:"20px",padding:"16px 20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
                  <div style={{fontSize:"12px",fontWeight:"700",color:"#888",marginBottom:"10px"}}>ESTA SEMANA</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    {dias.map((d, i) => {
                      const fecha = new Date(lunes);
                      fecha.setDate(lunes.getDate() + i);
                      const esHoy = fecha.getDate()===hoy.getDate() && fecha.getMonth()===hoy.getMonth() && fecha.getFullYear()===hoy.getFullYear();
                      const fechaKey = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
                      const diaEntrenado = sesiones.some(s => s.fecha?.split("T")[0] === fechaKey);
                      return (
                        <div key={i} style={{textAlign:"center",flex:1}}>
                          <div style={{fontSize:"11px",color:esHoy?"#ec4899":"#888",fontWeight:esHoy?"800":"400",marginBottom:"6px"}}>{d}</div>
                          <div style={{width:"32px",height:"32px",borderRadius:"50%",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",background:esHoy?"#ec4899":diaEntrenado?"#fce7f3":"#fdf2f8",border:esHoy?"none":diaEntrenado?"2px solid #ec4899":"2px solid transparent"}}>
                            {diaEntrenado ? <span style={{fontSize:"14px"}}>✓</span> : <span style={{fontSize:"11px",fontWeight:"700",color:esHoy?"#fff":"#888"}}>{fecha.getDate()}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* DIAS ESTA SEMANA + REINA */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
              <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3"}}>
                <div style={{fontSize:"12px",color:"#888",marginBottom:"8px",fontWeight:"700"}}>DIAS ENTRENADOS</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:"36px",fontWeight:"900",color:"#ec4899",lineHeight:1}}>
                    {sesionesEstaSemana}<span style={{fontSize:"18px",color:"#ccc"}}>/{frecuenciaObjetivo}</span>
                  </div>
                  <div style={{fontSize:"28px"}}>
                    {sesionesEstaSemana >= frecuenciaObjetivo ? "❤️‍🔥" : sesionesEstaSemana > 0 ? "🔥" : "😴"}
                  </div>
                </div>
                <div style={{display:"flex",gap:"4px",marginTop:"10px"}}>
                  {Array.from({length: frecuenciaObjetivo}).map((_, i) => (
                    <div key={i} style={{flex:1,height:"6px",borderRadius:"3px",background: i < sesionesEstaSemana ? "#ec4899" : "#fce7f3"}} />
                  ))}
                </div>
                {sesionesEstaSemana >= frecuenciaObjetivo && <div style={{fontSize:"11px",color:"#10b981",fontWeight:"700",marginTop:"6px"}}>Meta cumplida 🏆</div>}
                {sesionesEstaSemana < frecuenciaObjetivo && sesionesEstaSemana > 0 && <div style={{fontSize:"11px",color:"#888",marginTop:"6px"}}>Te faltan {frecuenciaObjetivo - sesionesEstaSemana} dia(s)</div>}
              </div>

              <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3"}}>
                <div style={{fontSize:"12px",color:"#888",marginBottom:"8px",fontWeight:"700"}}>REINA DE LA SEMANA</div>
                {Object.keys(resumenSemana).length > 0 ? (() => {
                  const top = Object.entries(resumenSemana).sort((a,b) => b[1]-a[1])[0];
                  return (<><div style={{fontSize:"28px",marginBottom:"4px"}}>👑</div><div style={{fontSize:"16px",fontWeight:"900",color:"#ec4899"}}>{top[0]}</div><div style={{fontSize:"12px",color:"#888"}}>{top[1]} series esta semana</div></>);
                })() : (<><div style={{fontSize:"28px",marginBottom:"4px"}}>💤</div><div style={{fontSize:"13px",color:"#888"}}>Aun sin datos esta semana</div></>)}
              </div>
            </div>

            {/* BOTON ENTRENA HOY */}
            <button onClick={() => setActiveTab("sesion")}
              style={{width:"100%",padding:"18px",background:"linear-gradient(135deg,#ec4899,#be185d)",color:"#fff",border:"none",borderRadius:"20px",fontSize:"18px",fontWeight:"900",cursor:"pointer",marginBottom:"16px",boxShadow:"0 8px 24px rgba(236,72,153,0.3)"}}>
              💪 Entrena hoy
            </button>

            {/* INSIGHT DEL CICLO */}
            {phase ? (
              <div style={{background:`linear-gradient(135deg,${phase.color}20,${phase.color}05)`,border:`2px solid ${phase.color}`,borderRadius:"20px",padding:"20px",marginBottom:"16px"}}>
                <div style={{fontSize:"12px",color:phase.color,fontWeight:"700",marginBottom:"6px"}}>INSIGHT DEL CICLO</div>
                <div style={{fontSize:"22px",fontWeight:"900",color:phase.color,marginBottom:"8px"}}>{phase.emoji} Fase {phase.name}</div>
                <div style={{background:"rgba(255,255,255,0.6)",borderRadius:"12px",padding:"12px",marginBottom:"12px",fontStyle:"italic",fontSize:"14px",color:"#555",lineHeight:"1.5"}}>
                  "{phase.insight}"
                </div>
                <div style={{fontSize:"14px",color:"#555",marginBottom:"16px"}}>{phase.rec}</div>
                {phase.isDeload && (
                  <div style={{background:"#fef3c7",border:"2px solid #f59e0b",borderRadius:"12px",padding:"12px",marginBottom:"12px"}}>
                    <div style={{fontWeight:"800",color:"#d97706"}}>Semana de descarga</div>
                    <div style={{fontSize:"13px",color:"#92400e"}}>Reduce volumen e intensidad. Tu cuerpo lo necesita.</div>
                  </div>
                )}
                <div style={{background:"rgba(255,255,255,0.7)",borderRadius:"14px",padding:"14px",textAlign:"center"}}>
                  <div style={{fontSize:"36px",fontWeight:"900",color:phase.color}}>{phase.intensity}%</div>
                  <div style={{fontSize:"13px",color:"#666"}}>intensidad recomendada hoy</div>
                </div>
              </div>
            ) : (
              <div style={{background:"#fff",border:"2px dashed #ec4899",borderRadius:"20px",padding:"40px",textAlign:"center",marginBottom:"16px"}}>
                <div style={{fontSize:"40px",marginBottom:"12px"}}>🌸</div>
                <div style={{fontSize:"18px",fontWeight:"800",color:"#ec4899",marginBottom:"8px"}}>Configura tu ciclo</div>
                <div style={{fontSize:"14px",color:"#888",marginBottom:"16px"}}>Ve a tu perfil para ingresar la fecha de tu ultimo periodo</div>
                <button onClick={() => setActiveTab("perfil")} style={{padding:"12px 24px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>
                  Ir a Perfil
                </button>
              </div>
            )}

            {/* RECORDATORIO INTELIGENTE */}
            {(() => {
              const hoy = new Date();
              const diasRestantes = frecuenciaObjetivo - sesionesEstaSemana;
              const diaSemana = hoy.getDay();
              const diasHastaFinSemana = diaSemana === 0 ? 0 : 7 - diaSemana;
              if (sesionesEstaSemana >= frecuenciaObjetivo) return (
                <div style={{background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",border:"2px solid #10b981",borderRadius:"16px",padding:"16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{fontSize:"28px"}}>🏆</div>
                  <div><div style={{fontWeight:"800",color:"#065f46",fontSize:"15px"}}>Meta semanal completada!</div><div style={{fontSize:"13px",color:"#047857"}}>Increible semana. Disfruta tu descanso.</div></div>
                </div>
              );
              if (diasRestantes > 0 && diasHastaFinSemana <= diasRestantes) return (
                <div style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)",border:"2px solid #f59e0b",borderRadius:"16px",padding:"16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{fontSize:"28px"}}>⚡</div>
                  <div><div style={{fontWeight:"800",color:"#92400e",fontSize:"15px"}}>Quedan pocos dias!</div><div style={{fontSize:"13px",color:"#b45309"}}>Necesitas {diasRestantes} sesion(es) mas para tu meta.</div></div>
                </div>
              );
              if (sesionesEstaSemana === 0) return (
                <div style={{background:"#fdf2f8",border:"2px solid #fce7f3",borderRadius:"16px",padding:"16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{fontSize:"28px"}}>🌸</div>
                  <div><div style={{fontWeight:"800",color:"#ec4899",fontSize:"15px"}}>Empieza la semana fuerte!</div><div style={{fontSize:"13px",color:"#888"}}>Tu meta es {frecuenciaObjetivo} dias esta semana.</div></div>
                </div>
              );
              return (
                <div style={{background:"#fdf2f8",border:"2px solid #fce7f3",borderRadius:"16px",padding:"16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{fontSize:"28px"}}>💪</div>
                  <div><div style={{fontWeight:"800",color:"#ec4899",fontSize:"15px"}}>Vas muy bien!</div><div style={{fontSize:"13px",color:"#888"}}>Te faltan {diasRestantes} dia(s) para tu meta semanal.</div></div>
                </div>
              );
            })()}

            {/* PLAN VS REALIDAD */}
            {(Object.keys(resumenSemana).length > 0 || Object.keys(planSemanal).length > 0) && (
              <div style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:"#333",marginBottom:"4px"}}>VOLUMEN SEMANAL POR GRUPO</div>
                <div style={{fontSize:"12px",color:"#888",marginBottom:"14px"}}>{goal} · {level} · semana actual</div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"8px",marginBottom:"8px",paddingBottom:"8px",borderBottom:"2px solid #fce7f3"}}>
                  <div style={{fontSize:"11px",color:"#888",fontWeight:"700"}}>Grupo</div>
                  <div style={{fontSize:"11px",color:"#888",fontWeight:"700",textAlign:"center"}}>Plan</div>
                  <div style={{fontSize:"11px",color:"#888",fontWeight:"700",textAlign:"center"}}>Llevas</div>
                </div>
                {(() => {
                  const todosGrupos = new Set([...Object.keys(planSemanal), ...Object.keys(resumenSemana)]);
                  return Array.from(todosGrupos).sort().map(grupo => {
                    const plan = planSemanal[grupo] || 0;
                    const llevas = resumenSemana[grupo] || 0;
                    const ev = evaluarSeries(grupo, llevas);
                    const porcentaje = plan > 0 ? Math.min((llevas / plan) * 100, 100) : 0;
                    return (
                      <div key={grupo} style={{marginBottom:"12px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"8px",alignItems:"center",marginBottom:"4px"}}>
                          <span style={{fontSize:"13px",color:"#333",fontWeight:"600"}}>{grupo}</span>
                          <span style={{fontSize:"13px",color:"#888",textAlign:"center"}}>{plan > 0 ? `${plan}s` : "-"}</span>
                          <div style={{textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
                            <span style={{fontSize:"13px",color:"#ec4899",fontWeight:"900"}}>{llevas}s</span>
                            {llevas > 0 && <span style={{background:ev.color,color:"#fff",padding:"2px 6px",borderRadius:"20px",fontSize:"10px",fontWeight:"700"}}>{ev.estado}</span>}
                          </div>
                        </div>
                        {plan > 0 && (
                          <div style={{background:"#fce7f3",borderRadius:"6px",height:"6px",overflow:"hidden"}}>
                            <div style={{background: llevas >= plan ? "#10b981" : "#ec4899",height:"100%",width:`${porcentaje}%`,borderRadius:"6px"}} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
                {Object.keys(planSemanal).length === 0 && (
                  <div style={{fontSize:"13px",color:"#888",textAlign:"center",padding:"8px 0"}}>
                    Crea una rutina guiada para ver tu plan semanal
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {activeTab === "perfil" && (
          <div>
            <h2 style={{fontSize:"28px",fontWeight:"900",color:"#ec4899",marginBottom:"20px"}}>Tu Perfil</h2>
            <div style={{background:"#fff",borderRadius:"20px",padding:"24px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
              <h3 style={{color:"#ec4899",marginBottom:"16px"}}>Tu nombre</h3>
              <input type="text" placeholder="Como te llamas?" value={name} onChange={(e) => setName(e.target.value)}
                style={{width:"100%",padding:"14px",border:"2px solid #ec4899",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box"}} />
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"24px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
              <h3 style={{color:"#ec4899",marginBottom:"16px"}}>Ciclo Menstrual</h3>
              <label style={{fontSize:"13px",color:"#888",display:"block",marginBottom:"6px"}}>Fecha de inicio de tu ultimo periodo</label>
              <input
  type="date"
  value={cycleDate}
  onChange={(e) => setCycleDate(e.target.value)}
  style={{
    width:"100%",
    maxWidth:"100%",
    minWidth:0,
    padding:"10px 14px",
    border:"2px solid #ec4899",
    borderRadius:"14px",
    fontSize:"16px",
    boxSizing:"border-box",
    marginBottom:"16px",
    marginTop:"6px",
    WebkitAppearance:"none",
    appearance:"none",
    backgroundColor:"#fff"
  }}
/>
              <label style={{fontSize:"13px",color:"#888",display:"block",marginBottom:"6px"}}>Duracion del ciclo (dias)</label>
              <input type="number" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value))}
                style={{width:"100%",padding:"14px",border:"2px solid #ec4899",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box",textAlign:"center"}} />
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"24px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
              <h3 style={{color:"#ec4899",marginBottom:"16px"}}>Entrenamiento</h3>
              <label style={{fontSize:"13px",color:"#888",display:"block",marginBottom:"6px"}}>Objetivo</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}
                style={{width:"100%",padding:"14px",border:"2px solid #fce7f3",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box",marginBottom:"16px"}}>
                <option value="fuerza">Fuerza</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="resistencia">Resistencia</option>
              </select>
              <label style={{fontSize:"13px",color:"#888",display:"block",marginBottom:"6px"}}>Nivel</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                style={{width:"100%",padding:"14px",border:"2px solid #fce7f3",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box",marginBottom:"16px"}}>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
              <label style={{fontSize:"13px",color:"#888",display:"block",marginBottom:"6px"}}>Dias de entrenamiento por semana</label>
              <select value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))}
                style={{width:"100%",padding:"14px",border:"2px solid #fce7f3",borderRadius:"14px",fontSize:"16px",boxSizing:"border-box"}}>
                <option value={2}>2 dias</option>
                <option value={3}>3 dias</option>
                <option value={4}>4 dias</option>
                <option value={5}>5 dias</option>
              </select>
            </div>
            <button onClick={saveProfile} style={{width:"100%",padding:"16px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"16px",fontSize:"18px",fontWeight:"800",cursor:"pointer"}}>
              {saved ? "Guardado! ✅" : "Guardar perfil"}
            </button>
          </div>
        )}

        {activeTab === "rutinas" && <RutinasScreen user={user} currentPhase={phase} />}
        {activeTab === "sesion" && <SesionScreen user={user} currentPhase={phase} onSesionGuardada={cargarSesionesEstaSemana} />}
        {activeTab === "progreso" && <ProgresoScreen user={user} profile={profile} />}

      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"2px solid #fce7f3",display:"flex",justifyContent:"space-around",padding:"8px 0",zIndex:50}}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",padding:"8px 12px",background:"none",border:"none",cursor:"pointer",color: activeTab===tab.id?"#ec4899":"#888"}}>
            <span style={{fontSize:"22px"}}>{tab.emoji}</span>
            <span style={{fontSize:"11px",fontWeight: activeTab===tab.id?"800":"400"}}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}