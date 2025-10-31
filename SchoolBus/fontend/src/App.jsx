import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Login from "./pages/LoginPage.jsx";
import Register from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/admin/DashboardPage.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import NotificationPage from "./pages/admin/NotificationPage.jsx";
import VehiclesPage from "./pages/admin/VehiclesPage.jsx";
import DriversPage from "./pages/admin/DriversPage.jsx";
import RoutesPage from "./pages/admin/RoutesPage.jsx";
import StudentsPage from "./pages/admin/StudentsPage.jsx";
import SchedulesPage from "./pages/admin/SchedulesPage.jsx";
import ParentsPage from "./pages/admin/ParentsPage.jsx";
import AccountPage from "./pages/admin/AccountPage.jsx";
import ParentDashboardPage from "./pages/parent/DashboardPage.jsx";
import ChildInfo from "./pages/parent/ChildInfoPage.jsx";
import ParentAccount from "./pages/parent/AccountPage.jsx";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Trang public */}
          <Route path="/schoolbus/register" element={<Register />} />
          <Route path="/schoolbus/login" element={<Login />} />

          {/* Layout chính cho admin */}
          
          <Route path="/admin/schoolbus" element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="notification" element={<NotificationPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="parents" element={<ParentsPage />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
          <Route path="/parent/schoolbus" element={<MainLayout />}>
            <Route path="dashboard" element={<ParentDashboardPage />} />
            <Route path="children" element={<ChildInfo />} />
            <Route path="account" element={<ParentAccount />} />
            <Route path="notifications" element={<NotificationPage />} />
          </Route>
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
