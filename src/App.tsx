import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminSettings from "./pages/AdminSettings";
import ManagerReports from "./pages/ManagerReports";
import ReportLayout from "./components/layout/ReportLayout";
import TasksFill from "./pages/team/TasksFill";
import AchievementsFill from "./pages/team/AchievementsFill";
import ChallengesFill from "./pages/team/ChallengesFill";
import TasksView from "./pages/team/TasksView";
import AchievementsView from "./pages/team/AchievementsView";
import ChallengesView from "./pages/team/ChallengesView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/reports" element={<ManagerReports />} />
          
          {/* Team Fill Routes */}
          <Route path="/team/:teamId/fill" element={<ReportLayout mode="fill" />}>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<TasksFill />} />
            <Route path="achievements" element={<AchievementsFill />} />
            <Route path="challenges" element={<ChallengesFill />} />
          </Route>
          
          {/* Team View Routes */}
          <Route path="/team/:teamId/view" element={<ReportLayout mode="view" />}>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<TasksView />} />
            <Route path="achievements" element={<AchievementsView />} />
            <Route path="challenges" element={<ChallengesView />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
