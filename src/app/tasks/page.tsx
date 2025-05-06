import React from 'react'


interface Task {
    id: number,
    title: string,
    completed: boolean,
}
async function TaskPage() {

    const response = await fetch("http://localhost:3000/api/tasks", {
        cache: "no-store",
        method: "GET", 
    }) 
    const tasks = await response.json()
    console.log("tasks",tasks)
  return (
    <div>
      task page
      {tasks.map((task: Task) => (
        <div key={task.id}>
          <h1>{task.title}</h1>
          <p>{task.completed ? "Completed" : "Not Completed"}</p>
        </div> 
      ))}
    </div>
  )
}

export default TaskPage
