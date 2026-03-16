export default function LandingPage({ goTo }: any) {
  return (
    <div>
      <h1>Gym Tracker</h1>

      <p>
        Tohle je aplikace na zapisování tréninků, cviků a základních statistik.
      </p>

      <div className="card">
        <h2>Co umí</h2>
        <ul>
          <li>ukládání tréninků</li>
          <li>přidávání cviků</li>
          <li>zobrazení statistik</li>
        </ul>
      </div>

      <div className="buttons">
        <button onClick={() => goTo("login")}>Přihlášení</button>
        <button onClick={() => goTo("register")}>Registrace</button>
      </div>
    </div>
  );
}