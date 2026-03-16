import { useAuth } from "../context/AuthContext";

export default function Menu({ goTo }: any) {
  const auth = useAuth();

  return (
    <div className="nav">
      <div className="nav-left">
        <button onClick={() => goTo("landing")}>Gym Tracker</button>

        {auth.isLogged && (
          <>
            <button onClick={() => goTo("dashboard")}>Dashboard</button>
            <button onClick={() => goTo("workouts")}>Tréninky</button>
            <button onClick={() => goTo("stats")}>Statistiky</button>
            <button onClick={() => goTo("settings")}>Nastavení</button>
          </>
        )}
      </div>

      <div className="nav-right">
        {!auth.isLogged && (
          <>
            <button onClick={() => goTo("login")}>Login</button>
            <button onClick={() => goTo("register")}>Registrace</button>
          </>
        )}

        {auth.isLogged && (
          <>
            <span>{auth.user?.username}</span>
            <button onClick={auth.logout}>Odhlásit se</button>
          </>
        )}
      </div>
    </div>
  );
}