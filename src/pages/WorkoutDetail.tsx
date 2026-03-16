import { useEffect, useState } from "react";
import {
  addExerciseToWorkout,
  getWorkoutDetail,
  removeExercise,
  updateWorkout,
} from "../api";
import type { Workout } from "../types";

export default function WorkoutDetailPage({ id, goTo }: any) {
  const [workout, setWorkout] = useState<Workout | null>(null);

  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState("push");
  const [editNote, setEditNote] = useState("");

  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  async function loadWorkout() {
    try {
      const data = await getWorkoutDetail(id);
      setWorkout(data);
      setEditDate(data.date || "");
      setEditType(data.type || "push");
      setEditNote(data.note || "");
    } catch (err) {
      console.log(err);
      alert("Nepodařilo se načíst detail");
    }
  }

  async function handleSaveWorkout(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateWorkout(id, editDate, editType, editNote);
      await loadWorkout();
      alert("Trénink upraven");
    } catch (err) {
      console.log(err);
      alert("Nepodařilo se upravit trénink");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    try {
      await addExerciseToWorkout(id, name, sets, reps, weight);
      setName("");
      setSets(3);
      setReps(10);
      setWeight(0);
      await loadWorkout();
    } catch (err) {
      console.log(err);
      alert("Nepodařilo se přidat cvik");
    }
  }

  async function handleDeleteExercise(exerciseId: number) {
    try {
      await removeExercise(exerciseId);
      await loadWorkout();
    } catch (err) {
      console.log(err);
      alert("Nepodařilo se smazat cvik");
    }
  }

  if (!workout) {
    return <p>Načítání...</p>;
  }

  return (
    <div>
      <h1>Detail tréninku</h1>

      <div className="buttons" style={{ marginBottom: "15px" }}>
        <button onClick={() => goTo("dashboard")}>Dashboard</button>
        <button onClick={() => goTo("workouts")}>Zpět na tréninky</button>
      </div>

      <div className="card">
        <h2>Upravit trénink</h2>

        <form onSubmit={handleSaveWorkout}>
          <label>Datum</label>
          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />

          <label>Typ tréninku</label>
          <select value={editType} onChange={(e) => setEditType(e.target.value)}>
            <option value="push">push</option>
            <option value="pull">pull</option>
            <option value="legs">legs</option>
            <option value="full body">full body</option>
          </select>

          <label>Poznámka</label>
          <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} />

          <button type="submit">Uložit změny</button>
        </form>
      </div>

      <div className="card">
        <h2>Cviky</h2>

        {workout.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((item: any) => (
            <div key={item.id} className="exercise-box">
              <div>
                <p><b>{item.name}</b></p>
                <p>
                  Série: {item.sets}, opakování: {item.reps}, váha: {item.weight} kg
                </p>
              </div>
              <button onClick={() => handleDeleteExercise(item.id)}>Smazat</button>
            </div>
          ))
        ) : (
          <p>Zatím tu nejsou žádné cviky</p>
        )}
      </div>

      <div className="card">
        <h2>Přidat cvik</h2>

        <form onSubmit={handleAdd}>
          <label>Název cviku</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Série</label>
          <input type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} />

          <label>Opakování</label>
          <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} />

          <label>Váha</label>
          <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />

          <button type="submit">Přidat cvik</button>
        </form>
      </div>
    </div>
  );
}