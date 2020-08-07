import React, { PureComponent } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import TaskList from './TaskList'
import Task from 'components/Task/Task'
import { getTasks, createTask, deleteTask, updateTask } from 'reducers/taskReducer'

class TaskContainer extends PureComponent {
    componentDidMount() {
        this.props.getTasks()
    }

   createTask = data => {
        this.props.createTask(data)
    }

    deleteTask = id => {
        this.props.deleteTask(id)
    }

    updateTask = data => {
        this.props.updateTask(data)
    }

    render() {
        const { tasks } = this.props

        return (
            <>
                <Route path='/' exact render={props => <TaskList {...props} tasks={tasks} createTask={this.createTask} deleteTask={this.deleteTask} />} />
                <Route path='/:id' render={props => <Task {...props} task={tasks.filter(task => task._id === location.pathname.slice(1))[0]} updateTask={this.updateTask}/>} />
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {...state.tasks}
}

export default connect(mapStateToProps, {getTasks, createTask, deleteTask, updateTask})(TaskContainer)