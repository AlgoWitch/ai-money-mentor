def get_voice_script(nudge_text):
    # This prompt ensures the voice output is 'Human-like' and 'Indian'
    prompt = f"Convert this text into a natural, friendly Hinglish script for a voice assistant: '{nudge_text}'"
    # Call Groq...
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "system", "content": "You are a friendly Indian voice assistant."}, 
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content