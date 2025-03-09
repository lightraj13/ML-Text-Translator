// ML Translator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const translateBtn = document.getElementById('translate-btn');
    const sourceText = document.getElementById('source-text');
    const translatedText = document.getElementById('translated-text');
    const langPair = document.getElementById('lang-pair');
    const loading = document.getElementById('loading');
    const swapBtn = document.getElementById('swap-btn');
    const autoDetectBtn = document.getElementById('auto-detect');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const speakBtn = document.getElementById('speak-btn');
    const performanceStats = document.getElementById('performance-stats');
    
    // Translation stats
    let translationStats = {
        totalTranslations: 0,
        totalTime: 0,
        averageTime: 0,
        fastestTime: Infinity,
        slowestTime: 0,
        lastTime: 0
    };
    
    // Language information
    let languageInfo = {};
    
    // Check model status on page load
    checkModelStatus();
    
    // Periodically check model status
    setInterval(checkModelStatus, 10000);
    
    // Fetch available languages
    fetch('/languages')
        .then(response => response.json())
        .then(data => {
            languageInfo = data;
            console.log('Language info loaded:', languageInfo);
        })
        .catch(error => {
            console.error('Error loading language info:', error);
        });
    
    // Function to check model status
    function checkModelStatus() {
        fetch('/model_status')
            .then(response => response.json())
            .then(data => {
                console.log('Model status:', data);
                
                // Update UI based on model status
                if (data.loaded_models.length > 0) {
                    const loadingText = document.querySelector('#loading p');
                    if (loadingText) {
                        loadingText.textContent = `Translating... Models are preloaded for faster translation.`;
                    }
                    
                    // Update performance stats
                    updatePerformanceStats(data);
                }
                
                // Show GPU status
                if (data.gpu_available) {
                    showNotification('GPU acceleration is enabled for faster translations', 'success', 3000);
                }
            })
            .catch(error => {
                console.error('Error checking model status:', error);
            });
    }
    
    // Function to update performance stats display
    function updatePerformanceStats(modelData) {
        if (!performanceStats) return;
        
        let statsHtml = `
            <div class="performance-card">
                <h5>Translation Speed</h5>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Average Time:</span>
                        <span class="stat-value">${translationStats.averageTime.toFixed(2)}s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Fastest Time:</span>
                        <span class="stat-value">${translationStats.fastestTime === Infinity ? 'N/A' : translationStats.fastestTime.toFixed(2) + 's'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Slowest Time:</span>
                        <span class="stat-value">${translationStats.slowestTime.toFixed(2)}s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Last Translation:</span>
                        <span class="stat-value">${translationStats.lastTime.toFixed(2)}s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Translations:</span>
                        <span class="stat-value">${translationStats.totalTranslations}</span>
                    </div>
                </div>
            </div>
            <div class="performance-card mt-3">
                <h5>System Status</h5>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">GPU Acceleration:</span>
                        <span class="stat-value ${modelData.gpu_available ? 'text-success' : 'text-warning'}">${modelData.gpu_available ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Loaded Models:</span>
                        <span class="stat-value">${modelData.loaded_models.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Preloading Models:</span>
                        <span class="stat-value">${modelData.preloading_models.length}</span>
                    </div>
                </div>
                <div class="model-list mt-2">
                    <small class="text-muted">Loaded models: ${modelData.loaded_models.join(', ') || 'None'}</small>
                </div>
            </div>
        `;
        
        performanceStats.innerHTML = statsHtml;
    }
    
    // Function to swap languages
    swapBtn.addEventListener('click', function() {
        const currentPair = langPair.value;
        const [source, target] = currentPair.split('-');
        const newPair = `${target}-${source}`;
        
        // Find the new pair in the dropdown
        for (let i = 0; i < langPair.options.length; i++) {
            if (langPair.options[i].value === newPair) {
                langPair.selectedIndex = i;
                break;
            }
        }
        
        // Swap text content if there's already a translation
        if (translatedText.value) {
            const temp = sourceText.value;
            sourceText.value = translatedText.value;
            translatedText.value = '';
        }
        
        // Add animation effect
        swapBtn.classList.add('swap-animation');
        setTimeout(() => {
            swapBtn.classList.remove('swap-animation');
        }, 500);
    });
    
    // Function to translate text
    translateBtn.addEventListener('click', function() {
        translateText();
    });
    
    // Also translate when pressing Enter in the source text area
    sourceText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            translateText();
        }
    });
    
    // Clear button functionality
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            sourceText.value = '';
            translatedText.value = '';
            sourceText.focus();
        });
    }
    
    // Copy button functionality
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (translatedText.value) {
                navigator.clipboard.writeText(translatedText.value)
                    .then(() => {
                        // Show success message
                        const originalText = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
                        setTimeout(() => {
                            copyBtn.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            }
        });
    }
    
    // Text-to-speech functionality
    if (speakBtn) {
        speakBtn.addEventListener('click', function() {
            const textToSpeak = translatedText.value;
            if (textToSpeak && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                
                // Try to set language based on the target language
                const currentPair = langPair.value;
                const targetLang = currentPair.split('-')[1];
                
                // Map language codes to BCP 47 language tags
                const langMap = {
                    'en': 'en-US',
                    'fr': 'fr-FR',
                    'es': 'es-ES',
                    'de': 'de-DE',
                    'hi': 'hi-IN'
                };
                
                if (langMap[targetLang]) {
                    utterance.lang = langMap[targetLang];
                }
                
                // Get available voices
                const voices = window.speechSynthesis.getVoices();
                
                // Try to find a voice for the target language
                if (voices.length > 0) {
                    const targetVoices = voices.filter(voice => voice.lang.startsWith(targetLang));
                    if (targetVoices.length > 0) {
                        utterance.voice = targetVoices[0];
                    }
                }
                
                window.speechSynthesis.speak(utterance);
                
                // Show speaking indicator
                const originalText = speakBtn.innerHTML;
                speakBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i> Speaking...';
                
                utterance.onend = function() {
                    speakBtn.innerHTML = originalText;
                };
            }
        });
    }
    
    // Main translation function
    function translateText() {
        const text = sourceText.value.trim();
        if (!text) {
            showNotification('Please enter some text to translate', 'warning');
            return;
        }
        
        // Show loading indicator
        loading.style.display = 'block';
        translateBtn.disabled = true;
        
        // Get current language pair
        const currentLangPair = langPair.value;
        
        // Start translation timer
        const startTime = performance.now();
        
        // Send translation request
        fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                lang_pair: currentLangPair
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification('Error: ' + data.error, 'error');
            } else {
                // Calculate client-side translation time
                const endTime = performance.now();
                const clientTime = ((endTime - startTime) / 1000).toFixed(2);
                
                // Get server-side translation time if available
                const timeValue = parseFloat(data.translation_time || clientTime);
                
                // Update translation stats
                translationStats.totalTranslations++;
                translationStats.totalTime += timeValue;
                translationStats.averageTime = translationStats.totalTime / translationStats.totalTranslations;
                translationStats.lastTime = timeValue;
                
                // Update fastest/slowest times
                if (timeValue < translationStats.fastestTime) {
                    translationStats.fastestTime = timeValue;
                }
                if (timeValue > translationStats.slowestTime) {
                    translationStats.slowestTime = timeValue;
                }
                
                // Display the translated text
                translatedText.value = data.translated_text;
                
                // Show success notification with translation time
                const langPairInfo = langPair.options[langPair.selectedIndex].text;
                const timeInfo = data.translation_time || clientTime;
                showNotification(`Translation completed in ${timeInfo}s (${langPairInfo})`, 'success');
                
                // Update performance stats
                checkModelStatus();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred during translation', 'error');
        })
        .finally(() => {
            // Hide loading indicator
            loading.style.display = 'none';
            translateBtn.disabled = false;
        });
    }
    
    // Show notification function
    function showNotification(message, type = 'info', duration = 5000) {
        // Check if notification container exists, create if not
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="close-btn">&times;</button>
            </div>
        `;
        
        // Style the notification
        notification.style.backgroundColor = type === 'error' ? '#f87171' : 
                                            type === 'warning' ? '#fbbf24' : 
                                            type === 'success' ? '#34d399' : '#60a5fa';
        notification.style.color = '#fff';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '8px';
        notification.style.marginBottom = '10px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#fff';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = '10px';
        
        closeBtn.addEventListener('click', function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(50px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after specified duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(50px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    // Character counter
    if (sourceText) {
        const createCounter = () => {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.position = 'absolute';
            counter.style.bottom = '10px';
            counter.style.right = '10px';
            counter.style.fontSize = '0.8rem';
            counter.style.color = '#64748b';
            return counter;
        };
        
        const sourceCounter = createCounter();
        sourceText.parentNode.style.position = 'relative';
        sourceText.parentNode.appendChild(sourceCounter);
        
        sourceText.addEventListener('input', function() {
            const count = this.value.length;
            const maxLength = 500; // Match the server-side limit
            sourceCounter.textContent = `${count}/${maxLength} characters`;
            
            // Change color if approaching limit
            if (count > maxLength * 0.8) {
                sourceCounter.style.color = '#ef4444';
            } else {
                sourceCounter.style.color = '#64748b';
            }
            
            // Warn if exceeding limit
            if (count > maxLength) {
                showNotification(`Text exceeds the ${maxLength} character limit. It will be truncated during translation.`, 'warning', 3000);
            }
        });
        
        // Initial count
        sourceCounter.textContent = `0/500 characters`;
    }
    
    // Language pair change event
    langPair.addEventListener('change', function() {
        // Clear the translated text when language pair changes
        translatedText.value = '';
    });
}); 