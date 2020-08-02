

const updateRecord = async (id) => {
    let response = await fetch('http://localhost:4000/tasks', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id: id})
    })
    let data = await response.json()
    if(data.status === 'ok') {
        window.location = 'http://localhost:4000/tasks'
    }
}

const deleteRecord = async (id) => {
    let response = await fetch('http://localhost:4000/tasks', {
        method: 'DELETE',
        headers: {
            'Content-type' : 'application/json',
        },
        body: JSON.stringify({_id: id})
    })
    let data = await response.json()
    if(data.status === 'ok') {
        window.location = 'http://localhost:4000/tasks'
    }
}