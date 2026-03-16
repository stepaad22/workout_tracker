const API_URL = "https://skibi.junglediff.cz/workout_tracker/api";

async function parseResponse(res: Response) {
  const text = await res.text();
  console.log("RAW RESPONSE:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(text);
  }

  if (!res.ok) {
    throw new Error(data.message || "Chyba");
  }

  return data;
}

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth.php?action=register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  return parseResponse(res);
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth.php?action=login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse(res);
}

export async function getWorkouts() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=list`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return parseResponse(res);
}

export async function getWorkoutDetail(id: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=detail&id=${id}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return parseResponse(res);
}

export async function createWorkout(date: string, type: string, note: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ date, type, note }),
  });

  return parseResponse(res);
}

export async function updateWorkout(id: number, date: string, type: string, note: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=update&id=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ date, type, note }),
  });

  return parseResponse(res);
}

export async function addExerciseToWorkout(
  workoutId: number,
  name: string,
  sets: number,
  reps: number,
  weight: number
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=add-exercise&workout_id=${workoutId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ name, sets, reps, weight }),
  });

  return parseResponse(res);
}

export async function removeWorkout(id: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=delete&id=${id}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return parseResponse(res);
}

export async function removeExercise(exerciseId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/workouts.php?action=delete-exercise&exercise_id=${exerciseId}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return parseResponse(res);
}