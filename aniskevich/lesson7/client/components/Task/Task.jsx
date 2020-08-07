import style from './Task.module.scss'

import React from 'react'
import { Link } from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'

import Input from 'common/Input'

const Task = props => {
    const editMode = props.location.search !== '' ? true : false

    const { task, updateTask } = props
    return (
        <>
            {!editMode 
                ? <TaskView task={task} />
                : <UpdateTaskForm initialValues={task} onSubmit={updateTask}/>
            }
            <Link to='/'>Back</Link>
        </>
    )
}

const TaskView = props => {
    const { task } = props
    return (
        <div><h4>{task.title}</h4></div>
    )
}

const Form = props => {
    return (
        <form onSubmit={props.handleSubmit} className={style.updateForm}>
            <Field 
                name='title'
                component={Input}
                type='text'
                label='Title'
            />
            <span>{props.error && <strong>{props.error}</strong>}</span>
            <button type='submit'>Submit</button>
        </form>
    )
}

const UpdateTaskForm = reduxForm({form: 'updateTask'})(Form)

export default Task