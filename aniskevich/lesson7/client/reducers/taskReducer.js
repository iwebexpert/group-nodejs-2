import { stopAsyncValidation, reset } from 'redux-form'

import { taskAPI } from 'api/taskAPI'

const SET_TASKS = 'SET_TASKS'
const IS_LOADING_TOGGLE = 'IS_LOADING_TOGGLE'
const SET_TASK = 'SET_TASK'
const REMOVE_TASK = 'REMOVE_TASK'
const UPDATE_TASK = 'UPDATE_TASK'

const initialState = {
    tasks: [],
    isLoading: false,
}

const taskReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_TASKS:
            return {...state, tasks: action.payload}
        case SET_TASK:
            return {...state, tasks: [...state.tasks, action.payload]}
        case REMOVE_TASK:
            return {...state, tasks: state.tasks.filter(task => task._id !== action.payload)}
        case UPDATE_TASK:
            return {...state, tasks: state.tasks.filter(task => task._id !== action.payload._id).concat([action.payload])}
        case IS_LOADING_TOGGLE: 
            return {...state, isLoading: action.payload}
        default: return state
    }
}

const setTasks = payload => ({type: SET_TASKS, payload})
const setIsLoading = payload => ({type: IS_LOADING_TOGGLE, payload})
const setTask = payload => ({type: SET_TASK, payload})
const removeTask = payload => ({type: REMOVE_TASK, payload})
const update = payload => ({type:UPDATE_TASK, payload})

export const getTasks = () => dispatch => {
    dispatch(setIsLoading(true))
    taskAPI.getTasks().then(response => response.json()).then(data => {
        dispatch(setTasks(data))
        dispatch(setIsLoading(false))
    })
}

export const createTask = data => dispatch => {
    dispatch(setIsLoading(true))
    return taskAPI.createTask(data).then(response => response.json()).then(data => {
        if (!data.success) {
            dispatch(stopAsyncValidation('createTask', {_error: data.error}))
        } else {
            dispatch(setTask(data.task))
            dispatch(reset('createTask'))
            dispatch(setIsLoading(false))
        }
    })
}

export const deleteTask = id => dispatch => {
    dispatch(setIsLoading(true))
    return taskAPI.deleteTask(id).then(response => response.json()).then(data => {
        if (!data.success) {
           console.log(data.error)
        } else {
            dispatch(removeTask(data.id))
            dispatch(setIsLoading(false))
        }
    })
}

export const updateTask = data => dispatch => {
    dispatch(setIsLoading(true))
    return taskAPI.updateTask(data).then(response => response.json()).then(data => {
        if (!data.success) {
            dispatch(stopAsyncValidation('updateTask', {_error: data.error}))
        } else {
            dispatch(update(data.task))
            dispatch(setIsLoading(false))
        }
    })
}

export default taskReducer