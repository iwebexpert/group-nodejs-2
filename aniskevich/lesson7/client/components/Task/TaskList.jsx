import React from 'react'

import CreateTaskForm from './CreateTaskForm'
import TaskLine from './TaskLine'

const TaskList = props => {
    const { tasks, createTask, deleteTask } = props

    return (
        <>
            <CreateTaskForm onSubmit={createTask}/>
            {tasks.map(task => <TaskLine task={task} key={task._id} deleteTask={deleteTask}/>)}
        </>
    )
}

export default TaskList