import { useEffect, useState } from "react";
import { getWorkouts } from "../api";
import type { Workout } from "../types";

export default function DashboardPage({ goTo }: any) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const workoutsData = await getWorkouts();
      setWorkouts(workoutsData);

      if (workoutsData.length > 0) {
        setLastWorkout(workoutsData[0]);
      } else {
        setLastWorkout(null);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="grid">
        <div className="card">
          <h3>Poslední trénink</h3>
          {lastWorkout ? (
            <>
              <p>Datum: {lastWorkout.date}</p>
              <p>Typ: {lastWorkout.type}</p>
            </>
          ) : (
            <p>Žádný trénink</p>
          )}
        </div>

        <div className="card">
          <h3>Počet tréninků</h3>
          <p>{workouts.length}</p>
        </div>
      </div>

      <div className="buttons">
        <button onClick={() => goTo("newWorkout")}>Přidat trénink</button>
        <button onClick={() => goTo("workouts")}>Moje tréninky</button>
      </div>
    </div>
  );
}