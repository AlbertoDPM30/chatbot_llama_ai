from flask import Flask, jsonify, render_template, request
import os
import requests
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

llama_api_key = os.getenv('LLAMA_API_KEY')
llama_api_endpoint = os.getenv('LLAMA_API_ENDPOINT')
llama_api_model = os.getenv('LLAMA_API_MODEL')


@app.route('/')
def index():
    return render_template('chat.html')


@app.route('/chat', methods=['POST'])
def chat():
    user_data = request.get_json()
    user_message = user_data.get("message")

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {llama_api_key}"
        }

        payload = {
            "model": llama_api_model,
            "messages": [
                {"role": "system",
                    "content": "Eres un especialista en astronomia. Responde a las preguntas de los usuarios con informacion precisa y breve."},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.2,
            "max_tokens": 300,
            "top_p": 0.7,
            "frequency_penalty": 0.5,

            "presence_penalty": 0.5,
            "stop": ["\n\n", "User:", "Assistant:"],
            "lenght_penalty": 0.5
        }

        response = requests.post(
            llama_api_endpoint,
            headers=headers,
            json=payload,
        )

        response.raise_for_status()

        llama_response = response.json()
        assistant_reply = llama_response.get('choices', [{}])[0].get(
            'message', {}).get('content', 'No hay respuesta disponible')

        return jsonify({'reply': assistant_reply})

    except requests.exceptions.RequestException as e:
        print(f"Error de comunicacion con la API: {e}")
        return jsonify({'error': 'Error en la comunicacion con la API'}), 500

    except KeyError as e:
        print(f"Error en la estructura de la respuesta: {e}")
        return jsonify({'error': 'Error en la respuesta de la API'}), 500


if __name__ == '__main__':
    app.run(debug=True)
