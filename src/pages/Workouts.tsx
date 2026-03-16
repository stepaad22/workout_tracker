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
      await loadWorkouts();
    } catch (err) {
      console.log(err);
      alert("Nepodařilo se smazat trénink");
    }
  }

  return (
    <div>
      <h1>Tréninky</h1>

      <div className="buttons" style={{ marginBottom: "15px" }}>
        <button onClick={() => goTo("dashboard")}>Dashboard</button>
        <button onClick={() => goTo("newWorkout")}>Přidat trénink</button>
      </div>

      {workouts.length === 0 && <p>Zatím nemáš žádné tréninky.</p>}

      {workouts.map((workout) => (
        <div className="card" key={workout.id}>
          <h3>{workout.type}</h3>
          <p>Datum: {workout.date}</p>
          <p>Počet cviků: {workout.exerciseCount || 0}</p>

          <div className="buttons">
            <button onClick={() => openWorkout(Number(workout.id))}>Detail</button>
            <button onClick={() => deleteOne(Number(workout.id))}>Smazat</button>
          </div>
        </div>
      ))}
    </div>
  );
}