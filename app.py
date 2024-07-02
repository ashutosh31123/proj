from flask import Flask, render_template, request, jsonify
from twilio.rest import Client
import os
import openai
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

app = Flask(__name__, template_folder='APP1', static_folder='static')

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate_text', methods=['POST'])
def generate_text():
    data = request.json
    context = data.get('context')
    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=f"Generate a message based on the context: {context}",
        max_tokens=100
    )
    generated_text = response.choices[0].text.strip()
    return jsonify({'generated_text': generated_text})

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    contacts = data.get('contacts')
    message = data.get('message')
    channel = data.get('channel')
    if channel == 'whatsapp':
        send_whatsapp_message(contacts, message)
    elif channel == 'sms':
        send_sms_message(contacts, message)
    elif channel == 'email':
        send_email_message(contacts, message)
    return jsonify({'status': 'success'})

def send_whatsapp_message(contacts, message):
    for contact in contacts:
        client.messages.create(
            body=message,
            from_='whatsapp:' + TWILIO_PHONE_NUMBER,
            to='whatsapp:' + contact['phone']
        )

def send_sms_message(contacts, message):
    for contact in contacts:
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=contact['phone']
        )

def send_email_message(contacts, message):
    for contact in contacts:
        send_email(contact['email'], "AI Generated Message", message)

def send_email(to, subject, body):
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.example.com', 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)
