require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Birthday Colleague App'
  }
});

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

app.post('/api/generate', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Пожалуйста, введите описание сотрудника' });
    }

    const systemPrompt = "You are a professional copywriter. Generate a warm, friendly, and personalized birthday greeting from colleagues. Respond in Russian.";
    const userPrompt = `Create an original birthday greeting for an employee with this description: ${description}`;

    console.log('Отправка запроса в OpenRouter...');
    
    const chatCompletion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1', // Бесплатная модель
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Ответ получен от OpenRouter');
    
    const greeting = chatCompletion.choices[0].message.content;
    res.json({ greeting });
    
  } catch (error) {
    console.error('Ошибка при обращении к OpenRouter API:', error);
    
    let errorMessage = 'Произошла ошибка при генерации поздравления';
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data.error?.message || error.message;
      
      if (statusCode === 401) {
        errorMessage = 'Неправильный или недействительный API ключ';
      } else if (statusCode === 429) {
        errorMessage = 'Превышен лимит запросов. Попробуйте позже';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Используется OpenRouter API через OpenAI SDK`);
  console.log(`API Key: ${process.env.DEEPSEEK_API_KEY ? 'установлен' : 'НЕ УСТАНОВЛЕН!'}`);
});