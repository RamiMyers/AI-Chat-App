import { useState, useEffect, useRef } from 'react'

/*** Credit to How to Web Dev on YouTube for the UI design ***/

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const addMessage = (msg, isUser) => {
    setMessages((prev) => [
      ...prev,
      {content: msg, isUser, id: Date.now() + Math.random()}
    ])
  } 

  const sendMessage = async () => {
    const message = inputValue.trim()
    if (!message) return

    addMessage(message, true)   // user message
    setInputValue("")
    setIsLoading(true)

    try {
      const url = "http://127.0.0.1:5000/send_message"
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      }

      const response = await fetch(url, options)

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")

      let botReply = ""
      addMessage("", false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        botReply += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1].content = botReply
          return updated
        })
      }
    } catch (err) {
      addMessage(`❌ Error: ${err.message || "Something went wrong."}`, false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gradient-to-br from-sky-900 via-slate-950 to-emerald-900">
      <h1 className="text-6xl sm:text-7xl font-light bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-clip-text text-transparent h-20">AI Chat App</h1>

      <div className="px-4 py-2 text-sm bg-green-500/20 border border-green-500/30 text-green-300 rounded-full">🟢 AI Ready</div>

      <div className="p-6 w-full max-w-2xl bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-lg shadow-2xl border border-gray-600 rounded-3xl">
        <div className="h-80 overflow-y-auto border-b border-gray-600 mb-6 p-4 bg-gradient-to-b from-gray-900/50 to-gray-800/50 rounded-2xl">
          {messages.length === 0 &&
            <div className="text-gray-400 text-center mt-20">
              👋 Start the conversation by typing a message below.
            </div>
          }

          {messages.map((msg) => (
              <div 
              key={msg.id}
              className={`p-3 m-2 rounded-2xl max-w-xs text-wrap ${msg.isUser ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white ml-auto text-right" : "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white"}`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))
          }

          <div ref={messagesEndRef}></div>
        </div> 
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:shadow-lg focus:shadow-sky-400/80 focus:ring-sky-500 transition duration-400 disabled:opacity-50 disabled:cursor-not-all"></input>
          <button
          onClick={sendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="px-6 py-3 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-2xl hover:opacity-80 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
            {isLoading ?
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                Sending...
              </div>
              :
              <span>Send</span>
            }
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
