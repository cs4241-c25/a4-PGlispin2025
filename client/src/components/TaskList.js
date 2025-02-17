import React, { useState, useEffect } from "react";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";
import API_BASE_URL from "../api";

function TaskList() {
  	const [tasks, setTasks] = useState([]);
	const [isAuthenticated, setIsAuthenticated] = useState(null);

  	useEffect(() => {
    	fetch(`${API_BASE_URL}/auth/check`, { credentials: "include" })
      		.then((res) => res.json())
      		.then((data) => {
				if(data.authenticated) {
					setIsAuthenticated(true);
				} else{
					setIsAuthenticated(false);
				}
      		})
			.catch((err) => console.error("Error checking auth: ", err));
  	}, []);

	useEffect(() => {
		if(isAuthenticated) {
			fetch(`${API_BASE_URL}/tasks`, { credentials: "include" })
				.then((res) => {
					if(!res.ok){
						throw new Error("Unauthorized");
					}
					return res.json();
				})
				.then((data) => {
					setTasks(Array.isArray(data) ? data : []);
				})
				.catch((err) => console.error("Error fetching tasks: ", err));
		}
	}, [isAuthenticated]);

	if(isAuthenticated === null){
		return <div>Loading...</div>
	}

  	return (
    	<div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg mt-6">
      		<TaskForm setTasks={setTasks} />
      		<h2 className="text-2xl font-semibold mt-4">To Do:</h2>
      		<ul className="space-y-2 mt-2">
        		{tasks.map((task) => (
          			<TaskItem key={task._id} task={task} setTasks={setTasks} />
        		))}
      		</ul>
    	</div>
  	);
}

export default TaskList;