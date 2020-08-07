import style from './App.module.scss'

import React from 'react'
import { Switch } from 'react-router-dom'

import TaskContainer from 'components/Task/TaskContainer'

const App = () => {
    return (
        <div className={style.container}>
            <Switch>
                <TaskContainer />
            </Switch>
        </div>
    )
}

export default App