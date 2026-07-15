import re

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the mood-tracker div, or just append the new tabs before the final closing div.
# We can find the last `    </div>\n  );\n}`

settings_tab = """
      {/* ------------------ TAB 5: SETTINGS ------------------ */}
      {activeModule === "settings" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-extrabold text-[#5DADE2] tracking-wider bg-[#5DADE2]/10 px-2 py-0.5 rounded-full">
                Preferences
              </span>
              <h3 className="font-display font-bold text-base text-[#2F3E46]">App Settings</h3>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-[#2F3E46]">Faith-Informed Framing</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Use Islamic terminology and concepts for coping.</p>
                </div>
                <button 
                  onClick={() => setUseFaithFraming(!useFaithFraming)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${useFaithFraming ? 'bg-[#5DADE2]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${useFaithFraming ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-[#2F3E46]">Large Text</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Increase readability in chat.</p>
                </div>
                <button 
                  onClick={() => setLargeFont(!largeFont)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${largeFont ? 'bg-[#5DADE2]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${largeFont ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <button 
                   onClick={() => {
                     fetch('http://localhost:3000/api/clear', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({sessionId: 'mobile-user-123'}) })
                       .then(() => {
                         setMessages([]);
                         onTriggerToast("Session cleared securely.", "success");
                       });
                   }}
                   className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors"
                 >
                   Clear Session Data
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
"""

insights_tab = """
      {/* ------------------ TAB 6: INSIGHTS ------------------ */}
      {activeModule === "insights" && (
        <AnalyticsDashboard />
      )}
"""

# We will replace the final `    </div>\n  );\n}` with our new tabs + the final closing tags
content = content.replace('    </div>\n  );\n}', settings_tab + '\n' + insights_tab + '\n    </div>\n  );\n}')

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
