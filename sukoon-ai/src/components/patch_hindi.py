import re

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_tts = """
                    const utterance = new SpeechSynthesisUtterance(finalReply);
                    utterance.lang = 'ur-PK';
"""

new_tts = """
                    const utterance = new SpeechSynthesisUtterance(finalReply);
                    // Use language_code from Gemma if provided, fallback to ur-PK
                    utterance.lang = endData.complete.language_code || 'ur-PK';
"""

content = content.replace(old_tts.strip(), new_tts.strip())

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
