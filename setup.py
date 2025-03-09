import subprocess
import sys
import os

def check_python_version():
    """Check if Python version is 3.7 or higher"""
    if sys.version_info < (3, 7):
        print("Error: Python 3.7 or higher is required.")
        sys.exit(1)

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Dependencies installed successfully.")
    except subprocess.CalledProcessError:
        print("Error: Failed to install dependencies.")
        sys.exit(1)

def create_directories():
    """Create necessary directories if they don't exist"""
    if not os.path.exists("templates"):
        os.makedirs("templates")
        print("Created templates directory.")

def main():
    """Main setup function"""
    print("Setting up ML Translator application...")
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_dependencies()
    
    # Create necessary directories
    create_directories()
    
    print("\nSetup completed successfully!")
    print("\nTo run the application, use the following command:")
    print("python app.py")
    print("\nThen open your web browser and navigate to: http://127.0.0.1:5000/")

if __name__ == "__main__":
    main() 