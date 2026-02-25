require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDatabase, runMigrations } = require('./config/db');
const { uploadDir } = require('./middleware/upload');
const alumniRoutes = require('./routes/alumni');
const adminRoutes  = require('./routes/admin');
const statsRoutes  = require('./routes/stats');

const app = express();
const PORT      = process.env.PORT      || 5000;
const BASE_PATH = process.env.BASE_PATH || '';

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

const uploadsPath = BASE_PATH ? `${BASE_PATH}/uploads` : '/uploads';
app.use(uploadsPath, express.static(uploadDir));

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// ── API Router ────────────────────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get('/test', (req, res) => res.json({ message: 'Backend is working!' }));
apiRouter.use('/',      alumniRoutes);
apiRouter.use('/',      adminRoutes);
apiRouter.use('/stats', statsRoutes);

if (BASE_PATH) {
  app.use(`${BASE_PATH}/api`, apiRouter);
  console.log('API routes mounted at: ' + BASE_PATH + '/api');
}
app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: 'No matching route', path: req.originalUrl }));

// ── Start after DB connects ───────────────────────────────────────────────────
connectDatabase()
  .then(runMigrations)
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
      console.log('Test API: http://localhost:' + PORT + '/api/test');
      console.log('Uploads: ' + uploadDir);
    });
  });
