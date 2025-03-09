import qrcode
from PIL import Image
import io
import base64
import os

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

def create_qr_html(url, output_file="qr_code.html"):
    """Create an HTML file with the QR code"""
    qr_code = generate_qr_code(url)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Translator QR Code</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }}
        .qr-container {{
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            text-align: center;
        }}
        .qr-code {{
            max-width: 300px;
            margin: 20px auto;
        }}
        h1 {{
            color: #3f51b5;
            margin-bottom: 10px;
        }}
        p {{
            color: #666;
            margin-bottom: 20px;
        }}
        .url {{
            font-weight: bold;
            color: #3f51b5;
            margin-top: 20px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
            display: inline-block;
        }}
    </style>
</head>
<body>
    <div class="qr-container">
        <h1>ML Translator QR Code</h1>
        <p>Scan this QR code to access the translator application</p>
        <div class="qr-code">
            <img src="data:image/png;base64,{qr_code}" alt="QR Code" style="width: 100%;">
        </div>
        <div class="url">{url}</div>
    </div>
</body>
</html>
"""
    
    with open(output_file, "w") as f:
        f.write(html_content)
    
    print(f"QR code HTML file created: {output_file}")
    print(f"The QR code points to: {url}")
    
    return output_file

if __name__ == "__main__":
    # URL for the translator application
    url = "http://localhost:5000"
    
    # Create the QR code HTML file
    output_file = create_qr_html(url)
    
    # Open the HTML file in the default browser
    os.system(f"start {output_file}") 