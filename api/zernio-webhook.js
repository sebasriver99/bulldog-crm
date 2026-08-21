const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahojqvstnhwtiqndwiut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFob2pxdnN0bmh3dGlxbmR3aXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxNzA2NjUsImV4cCI6MjA0NTc0NjY2NX0.qx5hH23U7c2-6CXSPcsB_VqsF0k5dwANrGKIVxUqEE0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req, res) {
  console.log('Webhook recibido:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    
    // Extraer datos de CUALQUIER formato
    let phone = data?.contact?.phone || data?.phone || data?.numero || 'unknown';
    let message = data?.message || data?.mensaje || data?.text || JSON.stringify(data);
    let direction = data?.direction || data?.tipo || 'incoming';
    
    console.log('Parsed:', { phone, message, direction });

    // Guardar en Supabase
    const { error } = await supabase
      .from('bulldog_mensajes_zernio')
      .insert([{
        phone: String(phone),
        mensaje: String(message).substring(0, 500),
        plataforma: 'whatsapp',
        tipo: direction === 'incoming' || direction === 'entrada' ? 'entrada' : 'salida',
        timestamp: new Date().toISOString(),
        raw_data: data
      }]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Mensaje guardado exitosamente');
    return res.status(200).json({ ok: true, message: 'Guardado' });
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
