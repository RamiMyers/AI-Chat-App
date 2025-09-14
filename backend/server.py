from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "gpt-4.1-nano"

openai = OpenAI()
system_prompt = "You are a helpful assistant."
messages = [{ "role": "system", "content": system_prompt }]

app = Flask(__name__)
CORS(app, resources={ r"/*": { "origins": "*" } })


@app.route("/send_message", methods=["POST"])
def send_message():
    user_prompt = request.json.get("message")

    messages.append({ "role": "user", "content": user_prompt })

    def generate():
        assistant_message = ""
        with openai.chat.completions.create(model=MODEL, messages=messages, stream=True) as stream:
            for event in stream:
                token = event.choices[0].delta.content or ""
                assistant_message += token or ""
                yield token.encode("utf-8")
            messages.append({ "role": "assistant", "content": assistant_message })
    
    return generate(), { "Content-Type": "text/plain" }


if __name__ == "__main__":
    app.run(debug=True)