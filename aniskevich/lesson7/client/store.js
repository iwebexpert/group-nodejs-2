import { createStore, combineReducers, applyMiddleware } from 'redux'
import { reducer as formReducer } from 'redux-form'
import thunk from 'redux-thunk'

import taskReducer from 'reducers/taskReducer'

const reducers =  combineReducers({
    tasks: taskReducer,
    form: formReducer,
})

export const store = createStore(reducers, applyMiddleware(thunk))