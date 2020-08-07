const API_URL = 'http://localhost:3000/tasks/'

export const taskAPI = {
    getTasks() {
        return fetch(API_URL)
    },
    createTask(data) {
        return fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
    },
    deleteTask(id) {
        return fetch(API_URL + id, {
            method: 'DELETE',
        })
    },
    updateTask(data) {
        return fetch(API_URL + data._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
    },
}