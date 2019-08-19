const db = require('../config/database');
const bcrypt = require('bcryptjs');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            const [userExists] = await db.query('select 1 from users where email = ?', [ email ]);

            if (userExists[0])
                return res.status(400).json('User alread exists');

            const hash = await bcrypt.hash(password, 10);
            const newUser = {
                name,
                email,
                password: hash
            };
            const [user] = await db.query('insert into users set ?', [newUser]);

            return res.json(user);
        } catch (err) {
            return res.status(400).json(`error: Registration failed ${err}`);
        }
    }

    async authenticate(req, res) {
        try {
            const { email, password } = req.body;

            const [userExists] = await db.query('select id, name, email, password from users where email = ?', [ email ]);

            if (!userExists[0])
                return res.status(400).json('User not found');

            if (!await bcrypt.compare(password, userExists[0].password))
                return res.status(400).json('Invalid password');

            userExists[0].password = undefined;
            
            return res.json(userExists[0]);
        } catch (err) {
            return res.status(400).json(`error: ${err}`);
        }
    }
}

module.exports = new AuthController();