import React from "react";
import API_BASE_URL from "../api";

function Navbar() {
  const logout = async () => {
    await fetch(`${API_BASE_URL}/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  return (
    <nav className="w-full flex justify-between p-4 bg-gray-800 shadow">
      <h1 className="text-2xl font-bold text-blue-400">To-Do List</h1>
      <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Logout</button>
    </nav>
  );
}

export default Navbar;