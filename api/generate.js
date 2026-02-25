try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',  // <-- modelo correcto
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error llamando a Claude:', response.status, data);
    return res.status(response.status).json({
      error: 'Error al conectar con la IA',
      detail: data
    });
  }

  return res.status(200).json(data);
} catch (error) {
  console.error('Error llamando a Claude:', error);
  res.status(500).json({ error: 'Error al conectar con la IA' });
}

