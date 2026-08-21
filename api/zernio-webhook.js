// Función Netlify para recibir webhooks de Zernio
// Guardar este archivo en: netlify/functions/zernio-webhook.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ahojqvstnhwtiqndwiut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFob2pxdnN0bmh3dGlxbmR3aXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxNzA2NjUsImV4cCI6MjA0NTc0NjY2NX0.qx5hH23U7c2-6CXSPcsB_VqsF0k5dwANrGKIVxUqEE0';

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Parsear el body
    const data = JSON.parse(event.body);

    console.log('Webhook de Zernio recibido:', data);

    // Estructura esperada del webhook de Zernio
    const {
      contact,
      message,
      platform,
      timestamp,
      direction // 'incoming' o 'outgoing'
    } = data;

    if (!contact || !message) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Faltan datos requeridos' }) 
      };
    }

    // Guardar en Supabase
    const { data: saved, error } = await supabase
      .from('bulldog_mensajes_zernio')
      .insert([
        {
          phone: contact.phone || contact,
          mensaje: message,
          plataforma: platform || 'whatsapp',
          tipo: direction === 'incoming' ? 'entrada' : 'salida',
          timestamp: timestamp || new Date().toISOString(),
          raw_data: data
        }
      ]);

    if (error) {
      console.error('Error guardando en Supabase:', error);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: error.message }) 
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        ok: true, 
        message: 'Mensaje guardado',
        saved 
      })
    };

  } catch (error) {
    console.error('Error en webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
