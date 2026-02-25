export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt' });
  }

  // Comprobamos que la API key existe en el entorno
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Falta la variable ANTHROPIC_API_KEY en el entorno de Vercel');
    return res.status(500).json({
      error: 'Configuración incompleta del servidor (faltan credenciales de IA)',
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // o el modelo que tengas disponible
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    // Leemos primero el texto bruto para poder loguearlo si falla
    const raw = await response.text();

    if (!response.ok) {
      console.error('❌ Error al llamar a Anthropic:', response.status, raw);
      return res.status(500).json({
        error: 'Error al llamar a la IA',
        detalle: raw,
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error('❌ Error parseando la respuesta de Anthropic:', e, raw);
      return res.status(500).json({
        error: 'Error procesando la respuesta de la IA',
      });
    }

    // Devolvemos la respuesta completa tal como la espera tu frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error inesperado en /api/generate:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al conectar con la IA',
    });
  }
}
