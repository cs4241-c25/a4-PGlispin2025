import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import TaskList from "./components/TaskList";

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/tasks" element={<TaskList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;