import React, { useState } from "react";
import API_BASE_URL from "../api";

function TaskForm({ setTasks }) {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ task, priority }),
    });
    if (response.ok) {
      const newTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, newTask.newTask]);
      setTask("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label className="block">Task:</label>
      <input type="text" value={task} onChange={(e) => setTask(e.target.value)} className="p-2 rounded w-full text-black" required />
      
      <label className="block mt-2">Priority:</label>
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="p-2 rounded w-full text-black">
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-4 hover:bg-blue-600 transition">Add Task</button>
    </form>
  );
}

export default TaskForm;