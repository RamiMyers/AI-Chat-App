from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

openai = OpenAI()
app = Flask(__name__)
CORS(app, resources={ r"/*": { "origins": "*" } })


@app.route("/send_message", methods=["POST"])
def send_message():
    user_prompt = request.json.get("message")
    system_prompt = "You are a helpful assistant."
    response = openai.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": user_prompt },
        ]
    )
    return jsonify({"content": response.choices[0].message.content}), 200


if __name__ == "__main__":
    app.run(debug=True)