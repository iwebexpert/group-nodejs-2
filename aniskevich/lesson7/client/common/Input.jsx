import React from 'react'
import classNames from 'classnames/bind'

import style from './Form.module.scss'

const classes = classNames.bind(style)

const Input = ({input, label, type, meta: { touched, error }}) => {
    const className = classes({
        input: true,
        error: touched && error,
    })

    return (
        <>
            <input {...input} placeholder={label} type={type} className={className}/>
            {touched && error && <div><span>{error}</span></div>}
        </>
    )
}

export default Input