import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#fdf2f8",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <h2 style={{color:"#ec4899",fontSize:"32px"}}>Cargando...</h2>
    </div>
  );

  if (user) return <DashboardScreen user={user} />;

  if (screen === "login") return <LoginScreen onNavigate={setScreen} />;
  if (screen === "register") return <RegisterScreen onNavigate={setScreen} />;
}