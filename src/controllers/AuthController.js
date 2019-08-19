const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function generateToken(params = {}) {
    return jwt.sign(params, process.env.APP_SECRET, {
        expiresIn: 86400
    });
};

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

            return res.json({
                user,
                token: generateToken({id: user.insertId})
            });
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

            const user = userExists[0];

            if (!await bcrypt.compare(password, user.password))
                return res.status(400).json('Invalid password');

            user.password = undefined;
            
            return res.json({
                user,
                token: generateToken({id: user.id})
            });
        } catch (err) {
            return res.status(400).json(`error: Authentication failed ${err}`);
        }
    }
}

module.exports = new AuthController();