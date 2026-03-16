import { useState } from "react";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ goTo }: any) {
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
      const data = await loginUser(email, password);

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
      <h1>Přihlášení</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Přihlásit se</button>
      </form>

      <p>
        Nemáš účet?{" "}
        <button className="link-button" onClick={() => goTo("register")}>
          Registrace
        </button>
      </p>
    </div>
  );
}