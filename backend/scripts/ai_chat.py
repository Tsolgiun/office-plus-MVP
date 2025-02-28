import os
import sys
from http import HTTPStatus
from dashscope import Application

def generate_response(message):
    """Generate a response to a single message using DashScope API"""
    try:
        api_key = os.getenv("DASHSCOPE_API_KEY", "sk-8da8842dcb5f4c0bb6421fe2fd76e6d0")
        app_id = 'c8159539b1194623b52be93606c4727d'
        
        print(f"Sending message: {message}", file=sys.stderr)
        
        response = Application.call(
            api_key=api_key,
            app_id=app_id,
            prompt=message
        )
        
        if response.status_code != HTTPStatus.OK:
            print(f"Error: {response.status_code} - {response.message}", file=sys.stderr)
            return "I'm sorry, I'm having trouble connecting right now. How else can I help you?"
        
        print(f"Response received", file=sys.stderr)
        return response.output.text
    except Exception as e:
        print(f"Exception: {str(e)}", file=sys.stderr)
        return "I'm here to help with your office space needs. What would you like to know?"

if __name__ == '__main__':
    # Get message from command line argument
    if len(sys.argv) > 1:
        message = sys.argv[1]
        print(f"Processing message: {message}", file=sys.stderr)
        response = generate_response(message)
        # Print the response to stdout so Node.js can capture it
        print(response)
    else:
        print("No message provided")
