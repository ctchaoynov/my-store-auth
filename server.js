require('dotenv').config();

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Importer Fastify
const fastify = require('fastify')({ logger: true });

// Route de test
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Fonction pour démarrer le serveur
const start = async () => {
  try {
    // Spécifier l'adresse et le port
    await fastify.listen({ port: 3060, host: '0.0.0.0' });
    fastify.log.info(`serveur lancé sur l'adresse ${fastify.server.address().address} et le port ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.get('/users', async (request, reply) => {
    const { rows } = await pool.query('SELECT * FROM admin_users');
    return rows;
  });

  
fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    console.log(request.body);
    try {
      const { rows } = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
      const user = rows[0];
    
      if (user && await bcrypt.compare(password, user.password_hash)) {
        return reply.send({ success: true });
      } else {
        return reply.send({ success: false, message: 'Invalid username or password', body: request.body, user: user, compare : await bcrypt.compare(password, user.password_hash) });
      }
    } catch (error) {
      reply.status(500).send('Server error');
    }
  });

start();
