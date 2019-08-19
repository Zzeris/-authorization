const router = require('express').Router();
const authMiddleware = require('./middlewares/auth');
const AuthController = require('./controllers/AuthController');
const ProjectController = require('./controllers/ProjectController');

router.post('/register', AuthController.register);
router.post('/authenticate', AuthController.authenticate);

router.get('/projects', authMiddleware, ProjectController.index);

module.exports = router;