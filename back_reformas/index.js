require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/solicitudes', (req, res) => {
  console.log('Datos recibidos de n8n:', req.body);

  res.json({
    ok: true,
    mensaje: 'Datos recibidos'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend funcionando en http://localhost:${PORT}`);
});