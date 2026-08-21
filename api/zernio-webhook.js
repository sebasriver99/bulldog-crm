const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahojqvstnhwtiqndwiut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFob2pxdnN0bmh3dGlxbmR3aXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxNzA2NjUsImV4cCI6MjA0NTc0NjY2NX0.qx5hH23U7c2-6CXSPcsB_VqsF0k5dwANrGKIVxUqEE0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const data = req.body;
    const { contact, message, platform, timestamp, direction } = data;

    if (!contact || !message) {
      res.status(400).json({ error: 'Faltan datos' });
      return;
    }

    const { error } = await supabase
      .from('bulldog_mensajes_zernio')
      .insert([{
        phone: contact.phone || contact,
        mensaje: message,
        plataforma: platform || 'whatsapp',
        tipo: direction === 'incoming' ? 'entrada' : 'salida',
        timestamp: timestamp || new Date().toISOString(),
        raw_data: data
      }]);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ ok: true, message: 'Guardado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
