import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import WorkoutsPage from "./pages/Workouts";
import NewWorkoutPage from "./pages/NewWorkout";
import WorkoutDetailPage from "./pages/WorkoutDetail";

function AppInside() {
  const auth = useAuth();

  const [page, setPage] = useState("login");
  const [selectedWorkout, setSelectedWorkout] = useState<number | null>(null);

  useEffect(() => {
    if (!auth.loading) {
      if (auth.isLogged) {
        setPage("dashboard");
      } else {
        setPage("login");
      }
    }
  }, [auth.loading, auth.isLogged]);

  function goTo(newPage: string) {
    const privatePages = ["dashboard", "workouts", "newWorkout", "workoutDetail"];

    if (privatePages.includes(newPage) && !auth.isLogged) {
      setPage("login");
      return;
    }

    if ((newPage === "login" || newPage === "register") && auth.isLogged) {
      setPage("dashboard");
      return;
    }

    setPage(newPage);
  }

  if (auth.loading) {
    return (
      <div className="container">
        <p>Načítání...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {page === "login" && !auth.isLogged && <LoginPage goTo={goTo} />}
      {page === "register" && !auth.isLogged && <RegisterPage goTo={goTo} />}
      {page === "dashboard" && auth.isLogged && <DashboardPage goTo={goTo} />}

      {page === "workouts" && auth.isLogged && (
        <WorkoutsPage
          goTo={goTo}
          openWorkout={(id: number) => {
            console.log("OPEN WORKOUT:", id);
            setSelectedWorkout(id);
            setPage("workoutDetail");
          }}
        />
      )}

      {page === "newWorkout" && auth.isLogged && <NewWorkoutPage goTo={goTo} />}

      {page === "workoutDetail" && auth.isLogged && selectedWorkout !== null && (
        <WorkoutDetailPage id={selectedWorkout} goTo={goTo} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInside />
    </AuthProvider>
  );
}