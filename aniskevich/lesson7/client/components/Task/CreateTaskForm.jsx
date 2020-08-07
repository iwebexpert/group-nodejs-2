import React from 'react'
import { Field, reduxForm } from 'redux-form'

import Input from 'common/Input'

import style from './Task.module.scss'

const CreateTaskForm = props => {
    return (
        <>
        <span>{props.error && <strong>{props.error}</strong>}</span> 
        <form onSubmit={props.handleSubmit} className={style.form}>
            <Field
                name='title'
                component={Input}
                type='text'
                label='Enter task title'
            />
            <button type='submit'>+</button>
        </form> 
        </>
    )
}

export default reduxForm({form: 'createTask'})(CreateTaskForm)