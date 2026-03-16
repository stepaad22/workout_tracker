import { useEffect, useState } from "react";
import { getWorkouts, removeWorkout } from "../api";
import type { Workout } from "../types";

export default function WorkoutsPage({ goTo, openWorkout }: any) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    try {
      const data = await getWorkouts();
      console.log("WORKOUTS:", data);
      setWorkouts(data);
    } catch (err) {
      console.log(err);
      alert("Nepodařilo se načíst tréninky");
    }
  }

  async function deleteOne(id: number) {
    const ok = window.confirm("Opravdu chceš smazat trénink?");
    if (!ok) return;

    try {
      await removeWorkout(id);
      alert("Trénink smazán");
      await loadWorkouts();
    } catch (err: any) {
      console.log(err);
      alert(err.message || "Nepodařilo se smazat trénink");
    }
  }

  return (
    <div>
      <h1>Tréninky</h1>

      <div className="buttons" style={{ marginBottom: "15px" }}>
        <button type="button" onClick={() => goTo("dashboard")}>Dashboard</button>
        <button type="button" onClick={() => goTo("newWorkout")}>Přidat trénink</button>
      </div>

      {workouts.length === 0 && <p>Zatím nemáš žádné tréninky.</p>}

      {workouts.map((workout) => (
        <div className="card" key={workout.id}>
          <h3>{workout.type}</h3>
          <p>Datum: {workout.date}</p>
          <p>Počet cviků: {workout.exerciseCount || 0}</p>
          <p>Poznámka: {workout.note ? workout.note : "-"}</p>

          <div className="buttons">
            <button type="button" onClick={() => openWorkout(Number(workout.id))}>
              Detail
            </button>
            <button type="button" onClick={() => deleteOne(Number(workout.id))}>
              Smazat
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}