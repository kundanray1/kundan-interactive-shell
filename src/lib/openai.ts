export async function getAIResponse(question: string, context: unknown) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return 'OpenAI API key not configured.';
  }

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}`,
      }),
    });

    const data = await res.json();
    // "output_text" is returned by the new Responses API
    return data.output_text?.trim() || 'No response from AI.';
  } catch (err) {
    console.error(err);
    return 'Failed to fetch AI response.';
  }
}
