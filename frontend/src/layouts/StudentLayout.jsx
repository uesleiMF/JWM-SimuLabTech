import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

import "./StudentLayout.css";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleOpenSidebar = () => {
      setSidebarOpen(true);
    };

    window.addEventListener("jwm:open-sidebar", handleOpenSidebar);

    return () => {
      window.removeEventListener("jwm:open-sidebar", handleOpenSidebar);
    };
  }, []);

  return (
    <div className="student-layout">
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="student-main">
        <Header />

        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}