import { Navigate, Route, Routes } from "react-router-dom";
import { useAppData } from "./state/AppDataContext";
import { APP_NAME, PRODUCER } from "./appInfo";
import { SetupWizard } from "./features/setupWizard/SetupWizard";
import { ChildHome } from "./features/child/ChildHome";
import { TaskListReadonly } from "./features/child/TaskListReadonly";
import { Battle } from "./features/child/Battle";
import { HeroShop } from "./features/child/HeroShop";
import { Quiz } from "./features/child/Quiz";
import { PrizeRedeem } from "./features/child/PrizeRedeem";
import { MyRecords } from "./features/child/MyRecords";
import { PinGate } from "./features/parent/PinGate";
import { ParentLayout } from "./features/parent/ParentLayout";
import { ParentHome } from "./features/parent/ParentHome";
import { TaskManager } from "./features/parent/TaskManager";
import { MonsterManager } from "./features/parent/MonsterManager";
import { HeroManager } from "./features/parent/HeroManager";
import { QuizManager } from "./features/parent/QuizManager";
import { PrizeManager } from "./features/parent/PrizeManager";
import { ChildManager } from "./features/parent/ChildManager";
import { StatsPage } from "./features/parent/StatsPage";
import { SettingsPage } from "./features/parent/SettingsPage";
import { AboutPage } from "./features/parent/AboutPage";

function SplashScreen() {
  return (
    <div className="app-shell" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72 }}>🍊</div>
        <h1>{APP_NAME}</h1>
        <p className="text-muted" style={{ marginTop: 24 }}>
          製作人 {PRODUCER}
        </p>
      </div>
    </div>
  );
}

function App() {
  const { loading, settings } = useAppData();

  if (loading) {
    return <SplashScreen />;
  }

  if (settings && !settings.setupCompleted) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="*" element={<SetupWizard />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<ChildHome />} />
        <Route path="/child/tasks" element={<TaskListReadonly />} />
        <Route path="/child/battle" element={<Battle />} />
        <Route path="/child/quiz" element={<Quiz />} />
        <Route path="/child/heroes" element={<HeroShop />} />
        <Route path="/child/prizes" element={<PrizeRedeem />} />
        <Route path="/child/records" element={<MyRecords />} />

        <Route path="/parent" element={<PinGate />}>
          <Route element={<ParentLayout />}>
            <Route index element={<ParentHome />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="monsters" element={<MonsterManager />} />
            <Route path="heroes" element={<HeroManager />} />
            <Route path="quiz" element={<QuizManager />} />
            <Route path="prizes" element={<PrizeManager />} />
            <Route path="children" element={<ChildManager />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
