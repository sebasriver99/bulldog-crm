const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahojqvstnhwtiqndwiut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFob2pxdnN0bmh3dGlxbmR3aXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxNzA2NjUsImV4cCI6MjA0NTc0NjY2NX0.qx5hH23U7c2-6CXSPcsB_VqsF0k5dwANrGKIVxUqEE0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    let data = req.body || {};
    
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = { raw: data };
      }
    }

    let phone = data?.contact?.phone || data?.phone || data?.numero || data?.from || 'unknown';
    let message = data?.message || data?.mensaje || data?.text || data?.body || JSON.stringify(data).substring(0, 100);

    phone = String(phone).replace(/\D/g, '').slice(-10) || 'unknown';
    message = String(message).substring(0, 500);

    const { error } = await supabase
      .from('bulldog_mensajes_zernio')
      .insert([{
        phone,
        mensaje: message,
        plataforma: 'whatsapp',
        tipo: 'entrada',
        timestamp: new Date().toISOString(),
        raw_data: data
      }]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error:', err);
    return res.status(200).json({ ok: true });
  }
}

module.exports = handler;
