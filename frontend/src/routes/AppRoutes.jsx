import { Navigate, Route, Routes } from "react-router-dom";

import StudentLayout from "../layouts/StudentLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Courses from "../pages/Courses/Courses";
import CourseDetail from "../pages/CourseDetail/CourseDetail";
import Lesson from "../pages/Lesson/Lesson";

import Laboratory from "../pages/Laboratory/Laboratory";
import Simulator from "../pages/Simulator/Simulator";
import Exercises from "../pages/Exercises/Exercises";
import Challenges from "../pages/Challenges/Challenges";
import Progress from "../pages/Progress/Progress";
import Profile from "../pages/Profile/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================================================
          PÁGINA PÚBLICA
      ================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* ==================================================
          AUTENTICAÇÃO
      ================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/cadastro"
        element={<Register />}
      />

      {/* ==================================================
          ÁREA DO ESTUDANTE
      ================================================== */}

      <Route
        path="/app"
        element={<StudentLayout />}
      >
        {/* Redirecionamento /app → /app/dashboard */}
        <Route
          index
          element={
            <Navigate
              to="/app/dashboard"
              replace
            />
          }
        />

        {/* ==================================================
            DASHBOARD
        ================================================== */}

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        {/* ==================================================
            CURSOS
        ================================================== */}

        {/* Lista geral de cursos */}
        <Route
          path="cursos"
          element={<Courses />}
        />

        {/* Página específica do curso */}
        <Route
          path="curso/:courseId"
          element={<CourseDetail />}
        />

        {/* ==================================================
            AULAS
        ================================================== */}

        <Route
          path="aula/:courseId/:lessonId"
          element={<Lesson />}
        />

        {/* ==================================================
            ATALHOS DOS MÓDULOS
        ================================================== */}

        <Route
          path="cursos/circuitos-1"
          element={<Courses />}
        />

        <Route
          path="cursos/circuitos-2"
          element={<Courses />}
        />

        <Route
          path="cursos/eletronica"
          element={<Courses />}
        />

        <Route
          path="cursos/comandos-eletricos"
          element={<Courses />}
        />

        <Route
          path="cursos/automacao"
          element={<Courses />}
        />

        <Route
          path="cursos/eletrotecnica"
          element={<Courses />}
        />

        {/* ==================================================
            LABORATÓRIO
        ================================================== */}

        <Route
          path="laboratorio"
          element={<Laboratory />}
        />

        {/* ==================================================
            SIMULADOR
        ================================================== */}

        <Route
          path="simulador"
          element={<Simulator />}
        />

        {/* ==================================================
            EXERCÍCIOS
        ================================================== */}

        <Route
          path="exercicios"
          element={<Exercises />}
        />

        {/* ==================================================
            DESAFIOS
        ================================================== */}

        <Route
          path="desafios"
          element={<Challenges />}
        />

        {/* ==================================================
            PROGRESSO
        ================================================== */}

        <Route
          path="progresso"
          element={<Progress />}
        />

        {/* ==================================================
            PERFIL
        ================================================== */}

        <Route
          path="perfil"
          element={<Profile />}
        />

        {/* ==================================================
            CERTIFICADOS
        ================================================== */}

        <Route
          path="certificados"
          element={<Progress />}
        />

        {/* ==================================================
            RECURSOS
        ================================================== */}

        <Route
          path="biblioteca"
          element={<Courses />}
        />

        <Route
          path="forum"
          element={<Courses />}
        />

        <Route
          path="suporte"
          element={<Courses />}
        />
      </Route>

      {/* ==================================================
          ROTA NÃO ENCONTRADA
      ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}