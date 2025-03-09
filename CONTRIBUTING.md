# Contributing to ML Text Translator

Thank you for considering contributing to ML Text Translator! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/ml-text-translator.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.7+
- pip package manager

### Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

## Code Style

Please follow these coding standards:

- Use 4 spaces for indentation
- Follow PEP 8 guidelines for Python code
- Use meaningful variable and function names
- Add comments for complex logic
- Write docstrings for functions and classes

## Testing

Before submitting a pull request, please test your changes:

1. Ensure the application runs without errors
2. Test all affected functionality
3. Verify that your changes don't break existing features

## Adding New Languages

To add support for a new language:

1. Find an appropriate model on Hugging Face
2. Add the language pair to the `LANGUAGE_PAIRS` dictionary in `app.py`
3. Test the translation quality
4. Update the documentation

## Documentation

If you're adding new features or changing existing ones, please update the documentation:

1. Update the README.md file if necessary
2. Add comments to your code
3. Update any relevant documentation files

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update the README.md with details of changes if applicable
3. The pull request will be merged once it has been reviewed and approved

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We strive to maintain a welcoming and inclusive environment for all contributors.

## Questions?

If you have any questions or need help, please open an issue on GitHub. 