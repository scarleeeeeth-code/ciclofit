import { useState, useEffect } from "react";
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
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
  "Dominada prono": [{nombre:"Espalda",factor:0.8},{nombre:"Biceps",factor:0.2}],
  "Dominada supino": [{nombre:"Espalda",factor:0.6},{nombre:"Biceps",factor:0.4}],
  "Dominada neutra": [{nombre:"Espalda",factor:0.7},{nombre:"Biceps",factor:0.3}],
  "Jalon prono": [{nombre:"Espalda",factor:0.8},{nombre:"Biceps",factor:0.2}],
  "Jalon supino": [{nombre:"Espalda",factor:0.65},{nombre:"Biceps",factor:0.35}],
  "Jalon neutro": [{nombre:"Espalda",factor:0.7},{nombre:"Biceps",factor:0.3}],
  "Face pull": [{nombre:"Hombros",factor:0.6},{nombre:"Espalda",factor:0.4}],
  "Curl biceps": [{nombre:"Biceps",factor:1}],
  "Curl martillo": [{nombre:"Biceps",factor:1}],
  "Extension triceps polea": [{nombre:"Triceps",factor:1}],
  "Fondos": [{nombre:"Triceps",factor:0.6},{nombre:"Pecho",factor:0.4}],
  "Lagartijas": [{nombre:"Pecho",factor:0.6},{nombre:"Triceps",factor:0.4}],
  "Crunch": [{nombre:"Abdomen",factor:1}],
  "Plancha": [{nombre:"Abdomen",factor:1}],
};
export default function ProgresoScreen({ user, profile }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("calendario");
  const [editando, setEditando] = useState(null);
  const [editData, setEditData] = useState({});
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  useEffect(() => { cargarSesiones(); }, []);

  const cargarSesiones = async () => {
    const q = query(collection(db, "sesiones"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setSesiones(data);
    setLoading(false);
  };

  const borrarSesion = async (id) => {
    if (!window.confirm("Segura que quieres borrar esta sesion?")) return;
    await deleteDoc(doc(db, "sesiones", id));
    await cargarSesiones();
  };

  const abrirEditar = (sesion) => {
    setEditando(sesion.id);
    const registrosNormalizados = {};
    if (sesion.ejercicios) {
      sesion.ejercicios.forEach(ej => {
        registrosNormalizados[ej.nombre] = { series: ej.series || "", reps: ej.reps || "", peso: ej.peso || "" };
      });
    } else if (sesion.registros) {
      Object.entries(sesion.registros).forEach(([nombre, vals]) => {
        registrosNormalizados[nombre] = { series: vals.series || "", reps: vals.reps || "", peso: vals.peso || "" };
      });
    }
    setEditData({ feeling: sesion.feeling, nota: sesion.nota || "", registros: registrosNormalizados });
  };

  const guardarEdicion = async () => {
    await updateDoc(doc(db, "sesiones", editando), {
      feeling: editData.feeling,
      nota: editData.nota,
      registros: editData.registros
    });
    setEditando(null);
    await cargarSesiones();
  };

  const phaseColor = (fase) => {
    if (fase === "Menstrual") return "#ec4899";
    if (fase === "Folicular") return "#db2777";
    if (fase === "Ovulatoria") return "#be185d";
    return "#9d174d";
  };

  const feelingColor = (n) => {
    if (n >= 4) return "#10b981";
    if (n >= 3) return "#f59e0b";
    return "#ec4899";
  };

  const feeingEmoji = (n) => {
    if (n >= 4.5) return "🔥";
    if (n >= 3.5) return "💪";
    if (n >= 2.5) return "😊";
    if (n >= 1.5) return "😐";
    return "😔";
  };

  const getFeelingByPhase = () => {
    const fases = {};
    sesiones.forEach(s => {
      if (!s.fase || !s.feeling) return;
      if (!fases[s.fase]) fases[s.fase] = { total: 0, count: 0 };
      fases[s.fase].total += s.feeling;
      fases[s.fase].count += 1;
    });
    return Object.entries(fases).map(([fase, data]) => ({
      fase, promedio: (data.total / data.count).toFixed(1), count: data.count
    })).sort((a, b) => b.promedio - a.promedio);
  };

  const getEjercicioProgreso = () => {
    const ejercicios = {};
    sesiones.forEach(s => {
      const arr = s.ejercicios
        ? s.ejercicios
        : s.registros
        ? Object.entries(s.registros).map(([nombre, vals]) => ({ nombre, ...vals }))
        : [];
      arr.forEach(ej => {
        if (!ej.peso || ej.peso === "" || ej.peso === "0") return;
        if (!ejercicios[ej.nombre]) ejercicios[ej.nombre] = [];
        ejercicios[ej.nombre].push({ peso: parseFloat(ej.peso), reps: parseInt(ej.reps) || 0, fecha: s.fecha, fase: s.fase });
      });
    });
    return ejercicios;
  };

const getResumenSemanaActual = () => {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  lunes.setHours(0, 0, 0, 0);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const resumenGrupos = {};

  sesiones.forEach((s) => {
    const fechaSesion = new Date(s.fecha);
    if (fechaSesion < lunes || fechaSesion > domingo) return;

    const arr = s.ejercicios
      ? s.ejercicios
      : s.registros
      ? Object.entries(s.registros).map(([nombre, vals]) => ({ nombre, ...vals, gruposMusculares: [] }))
      : [];

    arr.forEach((ej) => {
      const series = Number(ej.series || 0);
      if (series === 0) return;

      let grupos = [];

      if (Array.isArray(ej.gruposMusculares) && ej.gruposMusculares.length > 0) {
        grupos = ej.gruposMusculares;
      } else if (EJERCICIOS_BASE_MAP[ej.nombre]) {
        grupos = EJERCICIOS_BASE_MAP[ej.nombre];
      }

      if (grupos.length > 0) {
        grupos.forEach((g) => {
          resumenGrupos[g.nombre] = Math.round(((resumenGrupos[g.nombre] || 0) + series * Number(g.factor || 1)) * 10) / 10;
        });
      }
    });
  });

  const inicioSemana = lunes.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  const finSemana = domingo.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  return { resumenGrupos, inicioSemana, finSemana };
};

  const objetivoUsuario = (profile?.goal || "hipertrofia").toLowerCase();
  const nivelUsuario = (profile?.level || "intermedio").toLowerCase();

  const rangosSeries = {
    hipertrofia: {
      principiante: { Gluteos:{min:8,max:14}, Cuadriceps:{min:6,max:12}, Isquios:{min:6,max:12}, Espalda:{min:8,max:14}, Pecho:{min:6,max:12}, Hombros:{min:6,max:12}, Biceps:{min:4,max:8}, Triceps:{min:4,max:8}, Abdomen:{min:4,max:10}, Pantorrillas:{min:4,max:10} },
      intermedio: { Gluteos:{min:10,max:18}, Cuadriceps:{min:8,max:16}, Isquios:{min:8,max:16}, Espalda:{min:10,max:18}, Pecho:{min:8,max:16}, Hombros:{min:8,max:16}, Biceps:{min:6,max:12}, Triceps:{min:6,max:12}, Abdomen:{min:6,max:12}, Pantorrillas:{min:6,max:12} },
      avanzado: { Gluteos:{min:12,max:22}, Cuadriceps:{min:10,max:20}, Isquios:{min:10,max:20}, Espalda:{min:12,max:22}, Pecho:{min:10,max:20}, Hombros:{min:10,max:18}, Biceps:{min:8,max:16}, Triceps:{min:8,max:16}, Abdomen:{min:8,max:16}, Pantorrillas:{min:8,max:16} },
    },
    fuerza: {
      principiante: { Gluteos:{min:4,max:8}, Cuadriceps:{min:4,max:8}, Isquios:{min:4,max:8}, Espalda:{min:4,max:8}, Pecho:{min:4,max:8}, Hombros:{min:3,max:6}, Biceps:{min:2,max:5}, Triceps:{min:2,max:5}, Abdomen:{min:3,max:6}, Pantorrillas:{min:3,max:6} },
      intermedio: { Gluteos:{min:6,max:10}, Cuadriceps:{min:6,max:10}, Isquios:{min:6,max:10}, Espalda:{min:6,max:10}, Pecho:{min:6,max:10}, Hombros:{min:4,max:8}, Biceps:{min:3,max:6}, Triceps:{min:3,max:6}, Abdomen:{min:4,max:8}, Pantorrillas:{min:4,max:8} },
      avanzado: { Gluteos:{min:8,max:14}, Cuadriceps:{min:8,max:14}, Isquios:{min:8,max:14}, Espalda:{min:8,max:14}, Pecho:{min:8,max:14}, Hombros:{min:6,max:10}, Biceps:{min:4,max:8}, Triceps:{min:4,max:8}, Abdomen:{min:6,max:10}, Pantorrillas:{min:6,max:10} },
    },
    resistencia: {
      principiante: { Gluteos:{min:10,max:16}, Cuadriceps:{min:10,max:16}, Isquios:{min:8,max:14}, Espalda:{min:8,max:14}, Pecho:{min:8,max:14}, Hombros:{min:8,max:14}, Biceps:{min:6,max:12}, Triceps:{min:6,max:12}, Abdomen:{min:8,max:16}, Pantorrillas:{min:8,max:16} },
      intermedio: { Gluteos:{min:12,max:20}, Cuadriceps:{min:12,max:20}, Isquios:{min:10,max:18}, Espalda:{min:10,max:18}, Pecho:{min:10,max:18}, Hombros:{min:10,max:18}, Biceps:{min:8,max:14}, Triceps:{min:8,max:14}, Abdomen:{min:10,max:20}, Pantorrillas:{min:10,max:20} },
      avanzado: { Gluteos:{min:15,max:25}, Cuadriceps:{min:15,max:25}, Isquios:{min:12,max:22}, Espalda:{min:12,max:22}, Pecho:{min:12,max:22}, Hombros:{min:12,max:22}, Biceps:{min:10,max:18}, Triceps:{min:10,max:18}, Abdomen:{min:12,max:24}, Pantorrillas:{min:12,max:24} },
    },
  };

  const evaluarSeries = (grupo, series) => {
    const rango = rangosSeries?.[objetivoUsuario]?.[nivelUsuario]?.[grupo];
    if (!rango) return { estado: "Sin rango", color: "#888" };
    if (series < rango.min) return { estado: "Bajo", color: "#f59e0b" };
    if (series > rango.max) return { estado: "Alto", color: "#ef4444" };
    return { estado: "Optimo", color: "#10b981" };
  };

  const getDiasDelMes = () => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    return { primerDia, diasEnMes };
  };

  const getSesionDelDia = (dia) => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    return sesiones.filter(s => {
      const fecha = new Date(s.fecha);
      return fecha.getFullYear() === year && fecha.getMonth() === month && fecha.getDate() === dia;
    });
  };

  const { primerDia, diasEnMes } = getDiasDelMes();
  const porFase = getFeelingByPhase();
  const porEjercicio = getEjercicioProgreso();
  const resumenSemana = getResumenSemanaActual();

  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const diasSemana = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];

  const EjerciciosFila = ({ s }) => {
    const arr = s.ejercicios
      ? s.ejercicios
      : s.registros
      ? Object.entries(s.registros).map(([nombre, vals]) => ({ nombre, ...vals }))
      : [];
    return arr.map((ej, idx) => (
      <div key={idx} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:"8px",padding:"8px 0",borderBottom:"1px solid #fce7f3",alignItems:"center"}}>
        <div style={{fontSize:"13px",color:"#333",fontWeight:"600"}}>{ej.nombre}</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:"14px",fontWeight:"800",color:"#ec4899"}}>{ej.series}</div><div style={{fontSize:"10px",color:"#888"}}>series</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:"14px",fontWeight:"800",color:"#ec4899"}}>{ej.reps}</div><div style={{fontSize:"10px",color:"#888"}}>reps</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:"14px",fontWeight:"800",color:"#ec4899"}}>{ej.peso}kg</div><div style={{fontSize:"10px",color:"#888"}}>peso</div></div>
      </div>
    ));
  };

  if (loading) return (
    <div style={{textAlign:"center",padding:"60px"}}>
      <div style={{fontSize:"32px"}}>⏳</div>
      <p style={{color:"#888"}}>Cargando...</p>
    </div>
  );

  if (sesiones.length === 0) return (
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:"60px",marginBottom:"16px"}}>📊</div>
      <h2 style={{color:"#ec4899",fontSize:"24px",marginBottom:"8px"}}>Sin datos aun</h2>
      <p style={{color:"#888"}}>Registra tu primera sesion para ver tu progreso</p>
    </div>
  );

  return (
    <div>
      <h2 style={{fontSize:"28px",fontWeight:"900",color:"#ec4899",marginBottom:"8px"}}>Tu Progreso 📊</h2>
      <p style={{color:"#888",marginBottom:"20px",fontSize:"14px"}}>{sesiones.length} sesiones registradas</p>

      <div style={{display:"flex",gap:"6px",marginBottom:"24px",flexWrap:"wrap"}}>
        {["calendario","resumen","fases","ejercicios","historial"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{flex:1,padding:"10px 4px",borderRadius:"12px",border:"2px solid #ec4899",background: tab===t?"#ec4899":"#fff",color: tab===t?"#fff":"#ec4899",fontWeight:"700",cursor:"pointer",fontSize:"11px",textTransform:"capitalize",minWidth:"60px"}}>
            {t}
          </button>
        ))}
      </div>

      {/* CALENDARIO */}
      {tab === "calendario" && (
        <div>
          <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3",marginBottom:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth()-1, 1))}
                style={{background:"#fce7f3",border:"none",borderRadius:"10px",padding:"8px 14px",cursor:"pointer",color:"#ec4899",fontWeight:"700",fontSize:"16px"}}>‹</button>
              <div style={{fontWeight:"800",fontSize:"18px",color:"#333"}}>{meses[mesActual.getMonth()]} {mesActual.getFullYear()}</div>
              <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth()+1, 1))}
                style={{background:"#fce7f3",border:"none",borderRadius:"10px",padding:"8px 14px",cursor:"pointer",color:"#ec4899",fontWeight:"700",fontSize:"16px"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"8px"}}>
              {diasSemana.map(d => <div key={d} style={{textAlign:"center",fontSize:"11px",fontWeight:"700",color:"#888",padding:"4px"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px"}}>
              {Array.from({length: primerDia}).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({length: diasEnMes}).map((_, i) => {
                const dia = i + 1;
                const sesionesDelDia = getSesionDelDia(dia);
                const tieneSesion = sesionesDelDia.length > 0;
                const fase = tieneSesion ? sesionesDelDia[0].fase : null;
                const isHoy = new Date().getDate()===dia && new Date().getMonth()===mesActual.getMonth() && new Date().getFullYear()===mesActual.getFullYear();
                const isSelected = diaSeleccionado === dia;
                return (
                  <button key={dia} onClick={() => setDiaSeleccionado(isSelected ? null : dia)}
                    style={{aspectRatio:"1",padding:"4px",borderRadius:"10px",border: isHoy?"2px solid #ec4899":isSelected?"2px solid #be185d":"2px solid transparent",background: tieneSesion?phaseColor(fase):isHoy?"#fce7f3":"#fdf2f8",color: tieneSesion?"#fff":isHoy?"#ec4899":"#333",fontWeight: isHoy||tieneSesion?"800":"400",cursor:"pointer",fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {dia}
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",gap:"12px",marginTop:"16px",flexWrap:"wrap"}}>
              {["Menstrual","Folicular","Ovulatoria","Lutea"].map(f => (
                <div key={f} style={{display:"flex",alignItems:"center",gap:"4px"}}>
                  <div style={{width:"12px",height:"12px",borderRadius:"4px",background:phaseColor(f)}}></div>
                  <span style={{fontSize:"11px",color:"#888"}}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {diaSeleccionado && getSesionDelDia(diaSeleccionado).length > 0 && getSesionDelDia(diaSeleccionado).map((s, i) => (
            <div key={i} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"12px",border:`2px solid ${phaseColor(s.fase)}40`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                <div style={{fontWeight:"800",fontSize:"16px",color:"#333"}}>{s.rutinaNombre}</div>
                <span style={{background:phaseColor(s.fase),color:"#fff",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>{s.fase}</span>
              </div>
              <div style={{fontSize:"13px",color:"#888",marginBottom:"12px"}}>
                {new Date(s.fecha).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}
              </div>
              <EjerciciosFila s={s} />
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"12px"}}>
                <div style={{fontSize:"13px",color:"#666"}}>Intensidad: {s.intensidad}%</div>
                <div style={{fontSize:"16px",fontWeight:"800",color:feelingColor(s.feeling)}}>{feeingEmoji(s.feeling)} {s.feeling}/5</div>
              </div>
              {s.nota && <div style={{background:"#fdf2f8",borderRadius:"10px",padding:"10px",marginTop:"10px",fontSize:"13px",color:"#666",fontStyle:"italic"}}>"{s.nota}"</div>}
            </div>
          ))}

          {diaSeleccionado && getSesionDelDia(diaSeleccionado).length === 0 && (
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",textAlign:"center",border:"2px dashed #fce7f3"}}>
              <div style={{fontSize:"30px",marginBottom:"8px"}}>😴</div>
              <div style={{color:"#888",fontSize:"14px"}}>Sin sesion registrada este dia</div>
            </div>
          )}
        </div>
      )}

      {/* RESUMEN */}
      {tab === "resumen" && (
        <div>
          <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3",marginBottom:"16px"}}>
            <div style={{fontWeight:"800",fontSize:"17px",color:"#333",marginBottom:"4px"}}>Series por grupo muscular</div>
            <div style={{fontSize:"12px",color:"#888",marginBottom:"16px"}}>Semana del {resumenSemana.inicioSemana} al {resumenSemana.finSemana}</div>
            {Object.keys(resumenSemana.resumenGrupos).length === 0 ? (
              <div style={{fontSize:"14px",color:"#888"}}>Sin sesiones esta semana.</div>
            ) : Object.entries(resumenSemana.resumenGrupos).map(([grupo, series]) => {
              const ev = evaluarSeries(grupo, series);
              return (
                <div key={grupo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #fce7f3"}}>
                  <span style={{fontSize:"14px",color:"#333",fontWeight:"700"}}>{grupo}</span>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <span style={{fontSize:"14px",color:"#ec4899",fontWeight:"900"}}>{series} series</span>
                    <span style={{background:ev.color,color:"#fff",padding:"3px 8px",borderRadius:"20px",fontSize:"11px",fontWeight:"700"}}>{ev.estado}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3",textAlign:"center"}}>
              <div style={{fontSize:"36px",fontWeight:"900",color:"#ec4899"}}>{sesiones.length}</div>
              <div style={{fontSize:"13px",color:"#888"}}>Sesiones totales</div>
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3",textAlign:"center"}}>
              <div style={{fontSize:"36px",fontWeight:"900",color:"#ec4899"}}>
                {(sesiones.reduce((a,s) => a + (s.feeling||0), 0) / sesiones.length).toFixed(1)}
              </div>
              <div style={{fontSize:"13px",color:"#888"}}>Bienestar promedio</div>
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3",textAlign:"center"}}>
              <div style={{fontSize:"36px",fontWeight:"900",color:"#ec4899"}}>{Object.keys(porEjercicio).length}</div>
              <div style={{fontSize:"13px",color:"#888"}}>Ejercicios trackeados</div>
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3",textAlign:"center"}}>
              <div style={{fontSize:"22px",fontWeight:"900",color:"#ec4899"}}>{porFase.length > 0 ? porFase[0].fase : "-"}</div>
              <div style={{fontSize:"13px",color:"#888"}}>Mejor fase</div>
            </div>
          </div>

          {porFase.length > 0 && (
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"2px solid #fce7f3"}}>
              <div style={{fontWeight:"800",fontSize:"17px",color:"#333",marginBottom:"16px"}}>Como te sientes por fase</div>
              {porFase.map((f, i) => (
                <div key={i} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={{fontWeight:"700",color:phaseColor(f.fase)}}>{f.fase}</span>
                    <span style={{fontWeight:"800",color:feelingColor(f.promedio)}}>{feeingEmoji(f.promedio)} {f.promedio}/5</span>
                  </div>
                  <div style={{background:"#fce7f3",borderRadius:"10px",height:"10px",overflow:"hidden"}}>
                    <div style={{background:phaseColor(f.fase),height:"100%",width:`${(f.promedio/5)*100}%`,borderRadius:"10px"}}></div>
                  </div>
                  <div style={{fontSize:"12px",color:"#888",marginTop:"2px"}}>{f.count} sesion(es)</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FASES */}
      {tab === "fases" && (
        <div>
          <div style={{background:"#fce7f3",borderRadius:"14px",padding:"14px",marginBottom:"20px"}}>
            <div style={{fontSize:"13px",fontWeight:"700",color:"#be185d"}}>En que fase entrenas mejor?</div>
            <div style={{fontSize:"12px",color:"#888",marginTop:"4px"}}>Basado en tu evaluacion despues de cada sesion</div>
          </div>
          {porFase.map((f, i) => (
            <div key={i} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"12px",border:`2px solid ${phaseColor(f.fase)}30`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:"800",fontSize:"18px",color:phaseColor(f.fase)}}>{i===0?"🥇":i===1?"🥈":"🥉"} {f.fase}</div>
                  <div style={{fontSize:"13px",color:"#888",marginTop:"4px"}}>{f.count} sesion(es)</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"36px",fontWeight:"900",color:feelingColor(f.promedio)}}>{f.promedio}</div>
                  <div style={{fontSize:"11px",color:"#888"}}>promedio</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EJERCICIOS */}
      {tab === "ejercicios" && (
        <div>
          {Object.entries(porEjercicio).map(([ej, registros], i) => {
            const ultimo = registros[0];
            const maximo = Math.max(...registros.map(r => r.peso));
            return (
              <div key={i} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"16px",border:"2px solid #fce7f3"}}>
                <div style={{fontWeight:"800",fontSize:"17px",color:"#333",marginBottom:"12px"}}>{ej}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                  <div style={{textAlign:"center",background:"#fdf2f8",borderRadius:"12px",padding:"12px"}}>
                    <div style={{fontSize:"22px",fontWeight:"900",color:"#ec4899"}}>{ultimo.peso}kg</div>
                    <div style={{fontSize:"11px",color:"#888"}}>Ultimo peso</div>
                  </div>
                  <div style={{textAlign:"center",background:"#fdf2f8",borderRadius:"12px",padding:"12px"}}>
                    <div style={{fontSize:"22px",fontWeight:"900",color:"#ec4899"}}>{maximo}kg</div>
                    <div style={{fontSize:"11px",color:"#888"}}>Maximo</div>
                  </div>
                  <div style={{textAlign:"center",background:"#fdf2f8",borderRadius:"12px",padding:"12px"}}>
                    <div style={{fontSize:"22px",fontWeight:"900",color:"#ec4899"}}>{registros.length}</div>
                    <div style={{fontSize:"11px",color:"#888"}}>Sesiones</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HISTORIAL */}
      {tab === "historial" && (
        <div>
          {sesiones.map((s, i) => (
            <div key={i} style={{background:"#fff",borderRadius:"20px",padding:"20px",marginBottom:"12px",border:"2px solid #fce7f3"}}>
              {editando === s.id ? (
                <div>
                  <div style={{fontWeight:"800",fontSize:"16px",color:"#ec4899",marginBottom:"16px"}}>Editando sesion</div>
                  {editData.registros && Object.entries(editData.registros).map(([ej, vals]) => (
                    <div key={ej} style={{marginBottom:"12px",background:"#fdf2f8",borderRadius:"14px",padding:"14px"}}>
                      <div style={{fontWeight:"700",color:"#333",marginBottom:"8px"}}>{ej}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:"11px",color:"#888",marginBottom:"4px"}}>Series</div>
                          <input type="number" value={vals.series || ""}
                            onChange={(e) => setEditData({...editData, registros: {...editData.registros, [ej]: {...vals, series: e.target.value}}})}
                            style={{width:"100%",padding:"8px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"14px",textAlign:"center",boxSizing:"border-box"}}
                          />
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:"11px",color:"#888",marginBottom:"4px"}}>Reps</div>
                          <input type="number" value={vals.reps || ""}
                            onChange={(e) => setEditData({...editData, registros: {...editData.registros, [ej]: {...vals, reps: e.target.value}}})}
                            style={{width:"100%",padding:"8px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"14px",textAlign:"center",boxSizing:"border-box"}}
                          />
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:"11px",color:"#888",marginBottom:"4px"}}>Peso kg</div>
                          <input type="number" value={vals.peso || ""}
                            onChange={(e) => setEditData({...editData, registros: {...editData.registros, [ej]: {...vals, peso: e.target.value}}})}
                            style={{width:"100%",padding:"8px",border:"2px solid #fce7f3",borderRadius:"10px",fontSize:"14px",textAlign:"center",boxSizing:"border-box"}}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{marginBottom:"12px"}}>
                    <div style={{fontWeight:"700",color:"#333",marginBottom:"8px"}}>Como te sentiste:</div>
                    <div style={{display:"flex",gap:"8px"}}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setEditData({...editData, feeling: n})}
                          style={{flex:1,padding:"10px",borderRadius:"10px",border: editData.feeling===n?"3px solid #ec4899":"2px solid #fce7f3",background: editData.feeling===n?"#fce7f3":"#fff",fontWeight:"900",color: editData.feeling===n?"#ec4899":"#888",cursor:"pointer"}}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea placeholder="Notas..." value={editData.nota}
                    onChange={(e) => setEditData({...editData, nota: e.target.value})}
                    style={{width:"100%",padding:"12px",border:"2px solid #fce7f3",borderRadius:"12px",fontSize:"14px",boxSizing:"border-box",minHeight:"70px",resize:"none",marginBottom:"12px"}}
                  />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                    <button onClick={() => setEditando(null)} style={{padding:"12px",background:"#fce7f3",color:"#ec4899",border:"none",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>Cancelar</button>
                    <button onClick={guardarEdicion} style={{padding:"12px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>Guardar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                    <div style={{fontWeight:"800",fontSize:"16px",color:"#333"}}>{s.rutinaNombre}</div>
                    <span style={{background:phaseColor(s.fase),color:"#fff",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>{s.fase}</span>
                  </div>
                  <div style={{fontSize:"13px",color:"#888",marginBottom:"12px"}}>
                    {new Date(s.fecha).toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})}
                  </div>
                  <EjerciciosFila s={s} />
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"12px 0"}}>
                    <div style={{fontSize:"13px",color:"#666"}}>Intensidad: {s.intensidad}%</div>
                    <div style={{fontSize:"16px",fontWeight:"800",color:feelingColor(s.feeling)}}>{feeingEmoji(s.feeling)} {s.feeling}/5</div>
                  </div>
                  {s.nota && <div style={{background:"#fdf2f8",borderRadius:"10px",padding:"10px",marginBottom:"12px",fontSize:"13px",color:"#666",fontStyle:"italic"}}>"{s.nota}"</div>}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                    <button onClick={() => abrirEditar(s)} style={{padding:"10px",background:"#fdf2f8",color:"#ec4899",border:"2px solid #fce7f3",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>Editar</button>
                    <button onClick={() => borrarSesion(s.id)} style={{padding:"10px",background:"#fff0f0",color:"#ef4444",border:"2px solid #fecaca",borderRadius:"12px",fontWeight:"700",cursor:"pointer"}}>Borrar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}