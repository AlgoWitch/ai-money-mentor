from deep_translator import GoogleTranslator

def translate_to_hindi(text):
    try:
        translated = GoogleTranslator(source='auto', target='hi').translate(text)
        return translated
    except Exception as e:
        return text # Fallback to English if internet fails