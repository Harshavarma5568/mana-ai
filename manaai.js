const inputBox = document.getElementById('userInput');
const chatArea = document.getElementById('chatArea');
const toggleButton = document.getElementById('toggleMode');

const CHAT_API_KEY = MANA_API_KEY; 
const WEATHER_API_KEY = "3ffd14d6cf1813c4724afda9c7068a1a"; 
const NEWS_API_KEY = "f97ad3d36be747b1a75c610c881b4cbd"; 

const CHAT_API_URL = "https://openrouter.ai/api/v1/chat/completions";

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

async function sendMessage() {
    const userMessage = inputBox.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, 'user-message');
    inputBox.value = '';

    // Show loading while waiting for bot
    appendMessage('Thinking...', 'bot-message', true);

    try {
        let botReply = '';

        if (userMessage.toLowerCase().includes('date') || userMessage.toLowerCase().includes('time')) {
            botReply = getCurrentDateTime();
        } else if (userMessage.toLowerCase().startsWith('weather')) {
            const city = userMessage.split('weather')[1].trim();
            botReply = await getWeather(city || 'Hyderabad');
        } else if (userMessage.toLowerCase().includes('news')) {
            botReply = await getLatestNews();
        } else {
            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CHAT_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [{
                        role: "user",
                        content: userMessage
                    }]
                })
            });

            const data = await response.json();
            botReply = data.choices[0].message.content.trim();
        }

        removeLastMessage();
        appendMessage(botReply, 'bot-message');
    } catch (error) {
        removeLastMessage();
        appendMessage('Oops! Something went wrong.', 'bot-message');
        console.error('Error:', error);
    }
}

function appendMessage(message, className, isTemp = false) {
    const msg = document.createElement('div');
    msg.className = `message ${className}`;
    if (isTemp) msg.id = "tempMessage"; // so we can remove it later
    msg.textContent = message;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function removeLastMessage() {
    const tempMsg = document.getElementById('tempMessage');
    if (tempMsg) {
        chatArea.removeChild(tempMsg);
    }
}

// Date & Time
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    return `📅 Today's date is ${date} and the current time is 🕒 ${time}.`;
}

// Weather
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            return `🌤️ Weather in ${city}: ${data.weather[0].description}, Temperature: ${data.main.temp}°C`;
        } else {
            return `❌ Sorry, I couldn't fetch weather for ${city}.`;
        }
    } catch (error) {
        return `⚠️ Error fetching weather data.`;
    }
}

// News
async function getLatestNews() {
    const url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${NEWS_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
            return `📰 Latest News: ${data.articles[0].title}`;
        } else {
            return `ℹ️ No news available right now.`;
        }
    } catch (error) {
        return `⚠️ Error fetching news.`;
    }
}

// Allow sending message by pressing Enter key
inputBox.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
