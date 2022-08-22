var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  const model = req.body;
  if (model != null) {
    try {
      const client = await dbConfig.connect();
      if (model.username && model.email && model.password) {

        // check if user exists
        const result = await client.query(`
        SELECT * FROM public.users WHERE username = '${model.username}' or email = '${model.email.toLowerCase()}';
        `);
        const results = (result) ? result.rows : null;
        if (results?.length > 0) {
          res.status(409).json({message: 'Username or email are taken, please provide unique values.'})
          return
        }

        const hash = await bcrypt.hash(model.password, 10);
        if (hash) {
          const result = await client.query(`
          INSERT INTO public.users
          (username, "password", email, create_date)
          VALUES('${model.username}', '${hash}', '${model.email.toLowerCase()}', '${new Date().toISOString()}');
          `);
          const results = (result) ? result.rows : null;
          res.status(201).json({message: "User created successfully.", model: results});
        } else res.status(500).json({message: "Error while hashing password.", model: null});
      } else res.status(400).json({message: "Invalid data, please fill in all required fields.", model: null});
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).json({message: "Unknown error", model: null});
    }
  }
})

router.post('/login', async (req, res) => {
  const model = req.body;
  if (model != null) {
    try {
      const client = await dbConfig.connect();
      if (model.email && model.password) {
        const hashQuery = await client.query(`SELECT password FROM public.users WHERE email = '${model.email.toLowerCase()}'`)
        const hash = hashQuery?.rows[0]?.password;
        if (hash) {
          const validPass = bcrypt.compare(model.password, hash);
          if (validPass) {
            await client.query(`
              UPDATE public.users SET last_login = '${new Date().toISOString()}' WHERE email = '${model.email.toLowerCase()}';
            `);
            const result = await client.query(`
              SELECT id, username, email, create_date FROM public.users WHERE email = '${model.email.toLowerCase()}';
            `);
            const user = (result) ? result.rows.find(user => user.email === model.email.toLowerCase()) : null;
            const token = jwt.sign(
              {
                id: user.id, 
                username: user.username,
                email: user.email,
              },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );

            res.status(200).json({message: "Logged-in successfully.", model: token});
          } else res.status(400).json({message: 'Invalid password.'})
        } else res.status(400).json({message: 'Error validating password.'})
      } else res.status(400).json({message: "Invalid data, please fill in all required fields.", model: null});
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).json({message: "Unknown error", model: null});
    }
  }
})

module.exports = router;
