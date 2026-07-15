import re

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the chat bubble render block and replace text-xs with the dynamic class
chat_bubble_old = """                <div className={`p-3.5 rounded-2xl text-xs font-body leading-relaxed shadow-3xs
                  ${msg.sender === "user"
                    ? "bg-[#5DADE2] text-white rounded-tr-none"
                    : "bg-[#F1F5F9]/80 text-[#2F3E46] border border-slate-100 rounded-tl-none"
                  }
                `}>"""

chat_bubble_new = """                <div className={`p-3.5 rounded-2xl font-body leading-relaxed shadow-3xs ${largeFont ? 'text-sm' : 'text-xs'}
                  ${msg.sender === "user"
                    ? "bg-[#5DADE2] text-white rounded-tr-none"
                    : "bg-[#F1F5F9]/80 text-[#2F3E46] border border-slate-100 rounded-tl-none"
                  }
                `}>"""

content = content.replace(chat_bubble_old.strip(), chat_bubble_new.strip())

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
