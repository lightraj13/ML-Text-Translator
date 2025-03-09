from flask import Flask, render_template, request, jsonify, send_from_directory
import torch
from transformers import MarianMTModel, MarianTokenizer, M2M100ForConditionalGeneration, M2M100Tokenizer
import qrcode
from PIL import Image
import os
import io
import base64
import socket
import threading
import time

app = Flask(__name__)

# Use a smaller, faster model for better performance
# Available language pairs with improved models
LANGUAGE_PAIRS = {
    # English to other languages
    'en-fr': ('English to French', 'Helsinki-NLP/opus-mt-en-fr', 'en', 'fr'),
    'en-es': ('English to Spanish', 'Helsinki-NLP/opus-mt-en-es', 'en', 'es'),
    'en-de': ('English to German', 'Helsinki-NLP/opus-mt-en-de', 'en', 'de'),
    'en-hi': ('English to Hindi', 'Helsinki-NLP/opus-mt-en-hi', 'en', 'hi'),
    
    # Other languages to English
    'fr-en': ('French to English', 'Helsinki-NLP/opus-mt-fr-en', 'fr', 'en'),
    'es-en': ('Spanish to English', 'Helsinki-NLP/opus-mt-es-en', 'es', 'en'),
    'de-en': ('German to English', 'Helsinki-NLP/opus-mt-de-en', 'de', 'en'),
    'hi-en': ('Hindi to English', 'Helsinki-NLP/opus-mt-hi-en', 'hi', 'en'),
    
    # Additional language pairs
    'fr-es': ('French to Spanish', 'Helsinki-NLP/opus-mt-fr-es', 'fr', 'es'),
    'es-fr': ('Spanish to French', 'Helsinki-NLP/opus-mt-es-fr', 'es', 'fr'),
    'fr-de': ('French to German', 'Helsinki-NLP/opus-mt-fr-de', 'fr', 'de'),
    'de-fr': ('German to French', 'Helsinki-NLP/opus-mt-de-fr', 'de', 'fr'),
}

# Cache for loaded models
loaded_models = {}

# Background model loading
model_loading_lock = threading.Lock()
preloaded_models = set()

def preload_common_models():
    """Preload the most commonly used models in the background"""
    common_models = [
        'Helsinki-NLP/opus-mt-en-fr',
        'Helsinki-NLP/opus-mt-fr-en',
        'Helsinki-NLP/opus-mt-en-es',
        'Helsinki-NLP/opus-mt-es-en',
    ]
    
    for model_name in common_models:
        if model_name not in loaded_models and model_name not in preloaded_models:
            with model_loading_lock:
                preloaded_models.add(model_name)
            
            print(f"Preloading model in background: {model_name}")
            try:
                tokenizer = MarianTokenizer.from_pretrained(model_name)
                model = MarianMTModel.from_pretrained(model_name)
                
                with model_loading_lock:
                    loaded_models[model_name] = (tokenizer, model)
                    if model_name in preloaded_models:
                        preloaded_models.remove(model_name)
                
                print(f"Successfully preloaded model: {model_name}")
            except Exception as e:
                print(f"Error preloading model {model_name}: {str(e)}")
                with model_loading_lock:
                    if model_name in preloaded_models:
                        preloaded_models.remove(model_name)

def start_preloading():
    """Start preloading models in a background thread"""
    thread = threading.Thread(target=preload_common_models)
    thread.daemon = True
    thread.start()

def load_model(model_name):
    """Load translation model and tokenizer"""
    with model_loading_lock:
        if model_name in loaded_models:
            return loaded_models[model_name]
    
    print(f"Loading model: {model_name}")
    if 'm2m100' in model_name:
        tokenizer = M2M100Tokenizer.from_pretrained(model_name)
        model = M2M100ForConditionalGeneration.from_pretrained(model_name)
    else:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
    
    # Enable model optimization
    if torch.cuda.is_available():
        model = model.to('cuda')
    else:
        # Use half precision for CPU to speed up inference
        model = model.half()
    
    with model_loading_lock:
        loaded_models[model_name] = (tokenizer, model)
    
    return loaded_models[model_name]

def translate_text(text, model_name, source_lang=None, target_lang=None):
    """Translate text using the specified model"""
    # Limit input length for faster translation
    max_input_length = 500
    if len(text) > max_input_length:
        text = text[:max_input_length]
    
    tokenizer, model = load_model(model_name)
    
    # Handle different model types
    if 'm2m100' in model_name:
        # For M2M100 models, we need to set the source and target languages
        tokenizer.src_lang = source_lang
        encoded = tokenizer(text, return_tensors="pt", padding=True)
        
        # Move to GPU if available
        if torch.cuda.is_available():
            encoded = {k: v.to('cuda') for k, v in encoded.items()}
        
        with torch.no_grad():
            generated_tokens = model.generate(
                **encoded, 
                forced_bos_token_id=tokenizer.get_lang_id(target_lang),
                max_length=128,
                num_beams=2,  # Reduce beam size for faster generation
                length_penalty=0.6
            )
        
        result = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
    else:
        # For MarianMT models
        batch = tokenizer([text], return_tensors="pt", padding=True)
        
        # Move to GPU if available
        if torch.cuda.is_available():
            batch = {k: v.to('cuda') for k, v in batch.items()}
        
        with torch.no_grad():
            translated = model.generate(
                **batch, 
                max_length=128,
                num_beams=2,  # Reduce beam size for faster generation
                length_penalty=0.6
            )
        
        result = tokenizer.batch_decode(translated, skip_special_tokens=True)
    
    return result[0]

def generate_qr_code(url):
    """Generate QR code for the given URL"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert PIL image to base64 string
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str

def get_local_ip():
    """Get local IP address"""
    try:
        # Create a socket connection to an external server
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

@app.route('/')
def index():
    """Render the main page"""
    # Start preloading models in the background
    if not preloaded_models and len(loaded_models) == 0:
        start_preloading()
    
    # Get the server's IP address for the QR code
    host = get_local_ip()
    port = 5000
    url = f"http://{host}:{port}"
    
    # Generate QR code for the website URL
    qr_code = generate_qr_code(url)
    return render_template('index.html', language_pairs=LANGUAGE_PAIRS, qr_code=qr_code)

@app.route('/translate', methods=['POST'])
def translate():
    """Handle translation requests"""
    start_time = time.time()
    
    data = request.get_json()
    text = data.get('text', '')
    lang_pair = data.get('lang_pair', 'en-fr')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    if lang_pair not in LANGUAGE_PAIRS:
        return jsonify({'error': 'Invalid language pair'}), 400
    
    model_name = LANGUAGE_PAIRS[lang_pair][1]
    source_lang = LANGUAGE_PAIRS[lang_pair][2]
    target_lang = LANGUAGE_PAIRS[lang_pair][3]
    
    try:
        translated_text = translate_text(text, model_name, source_lang, target_lang)
        
        # Calculate translation time
        translation_time = time.time() - start_time
        print(f"Translation completed in {translation_time:.2f} seconds")
        
        return jsonify({
            'translated_text': translated_text,
            'translation_time': f"{translation_time:.2f}"
        })
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

@app.route('/languages')
def get_languages():
    """Return available language pairs"""
    language_info = {}
    for code, details in LANGUAGE_PAIRS.items():
        language_info[code] = {
            'name': details[0],
            'source': details[2],
            'target': details[3]
        }
    return jsonify(language_info)

@app.route('/model_status')
def model_status():
    """Return the status of loaded models"""
    status = {
        'loaded_models': list(loaded_models.keys()),
        'preloading_models': list(preloaded_models),
        'gpu_available': torch.cuda.is_available()
    }
    return jsonify(status)

if __name__ == '__main__':
    # Create necessary directories if they don't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    if not os.path.exists('static'):
        os.makedirs('static')
    
    # Get local IP address
    host = get_local_ip()
    print(f"Starting server at http://{host}:5000")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True) 