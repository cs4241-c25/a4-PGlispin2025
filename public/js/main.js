// FRONT-END (CLIENT) JAVASCRIPT HERE

const updateTasks = async function(){
    const response = await fetch("/tasks")

    if(response.status === 401){
        document.getElementById("authSection").style.display = "block";
        document.getElementById("taskSection").style.display = "none";
        return;
    }

    const tasks = await response.json()
    document.getElementById("authSection").style.display = "none";
    document.getElementById("taskSection").style.display = "block";

    const taskList = document.querySelector("#taskList")
    taskList.innerHTML = ""

    tasks.forEach((task) => {
        const li = document.createElement("li")
        li.className = "bg-gray-700 p-3 rounded flex justify-between items-center shadow"
        li.innerHTML = `<div>
                            <span class="font-semibold text-lg">${task.task}</span> 
                            <span class="text-sm text-gray-300 ml-2">(${task.priority})</span>
                            <span class="text-sm text-gray-400 ml-2">Due: ${task.deadline}</span>
                        </div>
                        <div>
                            <button onclick="editTask('${task._id}', '${task.task}', '${task.priority}')" 
                                class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition">Edit</button>
                            <button onclick="deleteTask('${task._id}')" 
                                class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition ml-2">Delete</button>
                        </div>`;
        taskList.appendChild(li)
    })
}

const login = async function() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if(response.ok){
        updateTasks();
    } else{
        alert("Login failed. Check your username and password.");
    }
}

const register = async function() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if(response.ok) {
        alert("Registration successful. You can now log in.");
    } else {
        alert("Registration failed. Username may already be taken.");
    }
}

const logout = async function() {
    await fetch("/logout", {
        method: "POST" 
    });
    document.getElementById("authSection").style.display = "block";
    document.getElementById("taskSection").style.display = "none";
}

const submitTask = async function( event ) {
    event.preventDefault()

    const taskInput = document.querySelector("#task").value
    const priorityInput = document.querySelector("#priority").value

    if(!taskInput.trim()) {
        alert("Please enter a task!")
        return;
    }
    const taskData = {task: taskInput, priority: priorityInput}

    await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(taskData),
    })
    document.querySelector("#task").value = ""
    updateTasks()
}

const editTask = async function( taskId, oldTask, oldPriority ) {
    const newTask = prompt("Edit task name: ", oldTask)
    if(newTask === null || newTask.trim() === "") return
    const newPriority = prompt("Edit priority (High, Medium, Low):", oldPriority)
    if(!["High", "Medium", "Low"].includes(newPriority)) {
        alert("Invalid priority! Please enter High, Medium, or Low.")
        return
    }

    await fetch("/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: taskId, newTask, newPriority }),
    }).then(() => updateTasks()) 

    updateTasks();
}

const deleteTask = async function( taskId ) {
    await fetch("/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({_id: taskId})
    })

    updateTasks()
}

window.onload = function() {
    document.querySelector("#todoForm").onsubmit = async function(event){
        event.preventDefault();

        const taskInput = document.querySelector("#task").value;
        const priorityInput = document.querySelector("#priority").value;

        if(!taskInput.trim()){
            alert("Please enter a task!");
            return;
        }

        await fetch("/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task: taskInput, priority: priorityInput })
        });

        document.querySelector("#task").value = "";
        updateTasks();
    }

    updateTasks()
}
