import React, { useState } from "react";
import API_BASE_URL from "../api";

function TaskItem({ task, setTasks }) {
	const [isEditing, setIsEditing] = useState(false);
	const [newTask, setNewTask] = useState(task.task);
	const [newPriority, setNewPriority] = useState(task.priority);
	
	const handleEdit = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/tasks`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ _id: task._id, newTask, newPriority}),
			});

			if(!response.ok){
				throw new Error("Failed to update task");
			}

			const updatedTask = await response.json();
			setTasks((prevTasks) => prevTasks.map((t) => (t._id === task._id ? updatedTask.updatedTask : t))
		);

		setIsEditing(false);
		} catch(error) {
			console.error("Error updating task: ", error);
		}
	};

  	const handleDelete = async () => {
    	try {
			const response = await fetch(`${API_BASE_URL}/tasks`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ _id: task._id })
			  });
	
			if(!response.ok){
				throw new Error("Failed to delete task");
			}
	
			setTasks((prev) => prev.filter((t) => t._id !== task._id));
		} catch(error) {
			console.error("Error deleting task: ", error);
		}
  	};

  	return (
    	<li className="bg-gray-700 p-3 rounded flex justify-between items-center shadow">
			{isEditing ? (
				<div className="flex flex-col w-full">
					<input
						type="text"
						className="p-2 rounded text-black mb-2"
						value={newTask}
						onChange={(e) => setNewTask(e.target.value)} 
					/>
					<select
						className="p-2 rounded text-black mb-2"
						value={newPriority}
						onChange={(e) => setNewPriority(e.target.value)}
					>
						<option value="High">High</option>
						<option value="Medium">Medium</option>
						<option value="Low">Low</option>
					</select>
					<button onClick={handleEdit} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
						Save
					</button>
				</div>
			) : (
				<div className="flex justify-between w-full">
					<div>
						<span className="font-semibold text-lg">{task.task}</span>
						<span className="text-sm text-gray-300 ml-2">({task.priority})</span>
					</div>
					<div className="flex space-x-2">
						<button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition">✏️</button>
						<button onClick={handleDelete} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition m1-2">❌</button>
					</div>
				</div>
			)}
    	</li>
  	);
}

export default TaskItem;