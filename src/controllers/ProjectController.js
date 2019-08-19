class ProjectController {
    index(req, res) {
        return res.send({ ok: true, userId: req.userId })
    }
}

module.exports = new ProjectController();