const Task = require('../../models/task');
const router = require('express').Router();

router.use('/', require('../../middlewares/checkAuth'));

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({}).lean();
        res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        res.status(200).send(false);
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const thisTask = await Task.findById(id).lean();

        if (thisTask === null) {
            res.status(200).send(false)
            return
        }
        res.status(200).json(thisTask);
    } catch (error) {
        console.log(error);
        res.status(200).send(false);
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) { return res.status(200).send(false) }

        const {body: {title, priority, completed}} = req;
        if (title) {
            task.set('title', title);
        }
        if (priority && ['Low', 'Normal', 'High'].indexOf(priority) !== -1) {
            task.set('priority', priority);
        }
        if (completed) {
            task.set('completed', completed === 'on');
        }
        task.save();
        res.status(200).send(true);

    } catch (error) {
        console.log(error);
        res.status(200).send(false);
    }

})

router.post('/', async (req, res) => {
    try {
        const taskNew = new Task(req.body);
        taskNew.save();
        res.status(200).json(JSON.parse(JSON.stringify(taskNew)));
    } catch (error) {
        console.log(error);
        res.status(200).send(false);
    }
})

router.delete('/:id', async (req, res) => {
    const { params: { id } } = req;
    try {
        await Task.findByIdAndDelete(id);
        res.status(200).send( true );
    } catch( error ) {
        console.error( error )
        res.status(400).send( false );
    }
})

module.exports = router;