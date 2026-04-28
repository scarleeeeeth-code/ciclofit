import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function LoginScreen({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return setError("Completa los campos");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError("Correo o contrasena incorrectos");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#fdf2f8",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:"24px",padding:"50px",width:"100%",maxWidth:"420px",boxShadow:"0 20px 60px rgba(236,72,153,0.15)"}}>
        <h1 style={{fontSize:"42px",fontWeight:"900",color:"#ec4899",textAlign:"center",margin:"0 0 8px"}}>
          CicloFit
        </h1>
        <p style={{textAlign:"center",color:"#888",letterSpacing:"2px",textTransform:"uppercase",fontSize:"12px",marginBottom:"40px"}}>
          Optimizacion hormonal
        </p>
        {error && (
          <div style={{background:"#fce7f3",color:"#be185d",padding:"12px",borderRadius:"12px",marginBottom:"20px",fontSize:"14px"}}>
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Correo electronico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{width:"100%",padding:"16px",border:"2px solid #ec4899",borderRadius:"16px",fontSize:"16px",marginBottom:"16px",boxSizing:"border-box",outline:"none"}}
        />
        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{width:"100%",padding:"16px",border:"2px solid #ec4899",borderRadius:"16px",fontSize:"16px",marginBottom:"16px",boxSizing:"border-box",outline:"none"}}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:"100%",padding:"16px",background:"#ec4899",color:"#fff",border:"none",borderRadius:"16px",fontSize:"18px",fontWeight:"800",cursor:"pointer"}}
        >
          {loading ? "Entrando..." : "Iniciar sesion"}
        </button>
        <p style={{textAlign:"center",marginTop:"20px"}}>
          <span
            onClick={() => onNavigate("register")}
            style={{color:"#ec4899",cursor:"pointer",textDecoration:"underline"}}
          >
            No tienes cuenta? Registrate
          </span>
        </p>
      </div>
    </div>
  );
}