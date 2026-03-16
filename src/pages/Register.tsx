import { useState } from "react";
import { registerUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage({ goTo }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const auth = useAuth();

  if (auth.isLogged) {
    return (
      <div className="card small-card">
        <h1>Už jsi přihlášený</h1>
        <button onClick={() => goTo("dashboard")}>Jít na dashboard</button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      const data = await registerUser(username, email, password);

      if (!data.user || !data.token) {
        setMsg("Backend neposlal správná data");
        return;
      }

      auth.saveLogin(data.token, data.user);
      goTo("dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setMsg(err.message);
      } else {
        setMsg("Nastala chyba");
      }
    }
  }

  return (
    <div className="card small-card">
      <h1>Registrace</h1>

      <form onSubmit={handleSubmit}>
        <label>Uživatelské jméno</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Heslo</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {msg && <p className="error">{msg}</p>}

        <button type="submit">Zaregistrovat se</button>
      </form>

      <p>
        Už účet máš?{" "}
        <button className="link-button" onClick={() => goTo("login")}>
          Přihlášení
        </button>
      </p>
    </div>
  );
}