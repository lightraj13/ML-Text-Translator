# ML Text Translator

A fast, efficient machine learning-powered text translator web application with support for multiple languages.

![ML Text Translator](screenshots/translator.png)

## Features

- **Multiple Language Support**: Translate between English, French, Spanish, German, and Hindi
- **Fast Translation**: Optimized for speed with model preloading and efficient inference
- **Modern UI**: Clean, responsive dark-themed interface
- **Text-to-Speech**: Listen to translations with built-in speech synthesis
- **Performance Monitoring**: Track translation speed and performance metrics
- **Mobile Access**: Scan QR code to access from mobile devices

## Technologies Used

- **Backend**: Python, Flask
- **ML Models**: Hugging Face Transformers, MarianMT models
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Other**: QR Code generation, WebSpeech API

## Getting Started

### Prerequisites

- Python 3.7+
- pip package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ml-text-translator.git
   cd ml-text-translator
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

```
ml-text-translator/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── static/                # Static assets
│   ├── css/               # CSS stylesheets
│   │   └── style.css      # Main stylesheet
│   └── js/                # JavaScript files
│       └── translator.js  # Main JavaScript functionality
├── templates/             # HTML templates
│   └── index.html         # Main application page
├── screenshots/           # Project screenshots
└── README.md              # Project documentation
```

## Performance Optimizations

The translator has been optimized for speed in several ways:

1. **Model Preloading**: Common translation models are loaded in the background
2. **Half-Precision Inference**: Using FP16 for faster computation
3. **Optimized Beam Search**: Smaller beam size for faster generation
4. **GPU Acceleration**: Automatic GPU utilization when available
5. **Efficient Caching**: Models are cached to avoid reloading

## Usage

1. Select the source and target languages from the dropdown
2. Enter the text you want to translate in the left text area
3. Click the "Translate" button or press Ctrl+Enter
4. The translated text will appear in the right text area
5. Use the "Copy" button to copy the translation to clipboard
6. Use the "Speak" button to hear the translation spoken aloud

## Mobile Access

The application generates a QR code that points to your local network address. Scan this code with your mobile device to access the translator from your phone or tablet (both devices must be on the same network).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Hugging Face Transformers](https://huggingface.co/transformers/) for the translation models
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Bootstrap](https://getbootstrap.com/) for the UI components
- [QRCode](https://github.com/lincolnloop/python-qrcode) for QR code generation 