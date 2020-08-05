const task = require('../models/task');
const router = require('express').Router();
const passport = require('../auth')

router.use('/', passport.mustBeAuthenticated);

router.get('/', async (req, res) => {
    const tasks = await task.find({}).lean();
    res.render('tasks/index', {tasks});
})

router.get('/update/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const thisTask = await task.findById(id).lean();

        if (thisTask === null) {
            res.redirect('/tasks')
            return
        }
        res.render('tasks/update', {task: thisTask})
    } catch (error) {
        console.log(error);
        res.redirect('/tasks')
    }
})

router.post('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const thisTask = await task.findById(id);

        if (thisTask === null) {
            res.send(false);
            return
        }
        const {body: {title, priority, completed}} = req;
        if (title) {
            thisTask.set('title', title);
        }
        if (priority && ['Low', 'Normal', 'High'].indexOf(priority) !== -1) {
            thisTask.set('priority', priority);
        }
        thisTask.set('completed', !!completed);

        thisTask.save();

        res.redirect('/tasks');
    } catch (error) {
        console.log(error);
        res.send(false);
    }

})

router.post('/', async (req, res) => {
    const taskNew = new task(req.body);
    taskNew.save();
    res.redirect('/tasks');
})

router.delete('/:id', async (req, res) => {
    try {
        const { params: { id } } = req;
        await task.findByIdAndDelete(id);
        res.send( true );
    } catch( error ) {
        console.error( error )
        res.send( false );
    }
})

module.exports = router;