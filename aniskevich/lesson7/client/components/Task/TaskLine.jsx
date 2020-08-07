import style from './Task.module.scss'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const TaskLine = props => {
    const [options, toggleOptions] = useState(false)

    const deleteTask = event => {
        props.deleteTask(event.target.value)
    }

    const { _id, title } = props.task
    return (
        <div className={style.task}>
            <div className={style.title}>{title}</div>
            {options && <div className={style.options}>
                <Link to={`/${_id}`}><button className={style.viewbutton}></button></Link>
                <Link to={`/${_id}?update`}><button className={style.updbutton}></button></Link>
                <button onClick={deleteTask} value={_id} className={style.rembutton}></button>
            </div>}
            <button onClick={() => toggleOptions(!options)} className={style.optbutton}></button>
        </div>
    )
}

export default TaskLine