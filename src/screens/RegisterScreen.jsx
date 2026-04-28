import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function RegisterScreen({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !name) return setError("Completa todos los campos");
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        cycleStart: null,
        cycleLength: 28,
        goal: "fuerza",
        level: "intermedio",
        createdAt: new Date(),
        streak: 0,
      });
    } catch (e) {
      setError("Error al crear cuenta. Intenta con otro correo.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#fdf2f8",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px", padding: "50px",
        width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(236,72,153,0.15)"
      }}>
        <h1 style={{ fontSize: "42px", fontWeight: "900", color: "#ec4899", textAlign: "center", margin: "0 0 8px" }}>
          CicloFit
        </h1>
        <p style={{ textAlign: "center", color: "#888", letterSpacing: "2px", textTransform: "uppercase", fontSize: "12px", marginBottom: "40px" }}>
          Crea tu cuenta
        </p>

        {error && (
          <div style={{ background: "#fce7f3", color: "#be185d", padding: "12px", borderRadius: "12px", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <span
            onClick={() => onNavigate("login")}
            style={{ color: "#ec4899", cursor: "pointer", textDecoration: "underline" }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "16px", border: "2px solid #ec4899",
  borderRadius: "16px", fontSize: "16px", marginBottom: "16px",
  boxSizing: "border-box", outline: "none"
};

const buttonStyle = {
  width: "100%", padding: "16px", background: "#ec4899",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "18px", fontWeight: "800", cursor: "pointer"
};