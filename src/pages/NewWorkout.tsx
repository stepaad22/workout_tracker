import { useState } from "react";
import { createWorkout } from "../api";

export default function NewWorkoutPage({ goTo }: any) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("push");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await createWorkout(date, type, note);
      console.log("CREATED:", data);
      alert("Trénink byl vytvořen");
      goTo("workouts");
    } catch (err: any) {
      console.log(err);
      alert(err.message || "Nepodařilo se vytvořit trénink");
    }
  }

  return (
    <div className="card small-card">
      <h1>Přidat trénink</h1>

      <div className="buttons" style={{ marginBottom: "15px" }}>
        <button type="button" onClick={() => goTo("dashboard")}>Dashboard</button>
        <button type="button" onClick={() => goTo("workouts")}>Moje tréninky</button>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Datum</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Typ tréninku</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="push">push</option>
          <option value="pull">pull</option>
          <option value="legs">legs</option>
          <option value="full body">full body</option>
        </select>

        <label>Poznámka</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />

        <button type="submit">Uložit</button>
      </form>
    </div>
  );
}