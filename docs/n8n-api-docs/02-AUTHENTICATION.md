# 02-AUTHENTICATION.md - n8n REST API Authentication

**Версия API:** v1
**Дата документации:** 2025-12-25
**Источник:** Официальная документация n8n через Context7

---

## 📋 Содержание

1. [Введение](#введение)
2. [Метод аутентификации](#метод-аутентификации)
3. [Создание API ключа](#создание-api-ключа)
4. [Использование API ключа](#использование-api-ключа)
5. [Примеры запросов](#примеры-запросов)
6. [Безопасность](#безопасность)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Введение

Все запросы к n8n REST API требуют аутентификации. n8n использует **API key authentication** через HTTP header для обеспечения безопасного доступа к вашим workflows, executions, credentials и другим ресурсам.

**Важно:** API ключи предоставляют полный доступ к вашему n8n instance. Храните их в безопасности и никогда не делитесь ими публично.

---

## Метод аутентификации

### API Key Authentication

n8n REST API использует **API key authentication** с использованием HTTP header:

```http
X-N8N-API-KEY: your_api_key_here
```

**Характеристики:**
- ✅ Простая в использовании
- ✅ Безопасная при использовании HTTPS
- ✅ Поддерживается всеми HTTP клиентами
- ✅ Не требует OAuth flow
- ✅ Ideal для server-to-server интеграций

**Формат:**
```http
X-N8N-API-KEY: <your-api-key>
```

**Где:**
- `<your-api-key>` - ваш уникальный API ключ, сгенерированный в n8n

---

## Создание API ключа

### n8n Cloud

**Шаг 1:** Войдите в ваш n8n Cloud instance
```
https://your-instance.app.n8n.cloud
```

**Шаг 2:** Перейдите в Settings
- Кликните на иконку пользователя в правом верхнем углу
- Выберите **Settings**

**Шаг 3:** Найдите раздел API
- В меню Settings найдите раздел **API**
- Кликните на **API**

**Шаг 4:** Создайте новый API ключ
- Кликните на кнопку **Create API Key**
- (Опционально) Введите описание для ключа (например, "Production Integration", "CI/CD Pipeline")
- Кликните **Create**

**Шаг 5:** Скопируйте и сохраните ключ
- API ключ отобразится **только один раз**
- Скопируйте ключ и сохраните в безопасном месте
- После закрытия окна ключ больше не будет доступен для просмотра

**⚠️ Важно:** Вы не сможете просмотреть ключ снова после создания. Если потеряете ключ, создайте новый и удалите старый.

### Self-Hosted n8n

**Шаг 1:** Войдите в ваш self-hosted n8n instance
```
https://n8n.example.com
```
или
```
http://localhost:5678
```

**Шаг 2-5:** Повторите те же шаги, что и для n8n Cloud

**Дополнительные настройки (Self-Hosted):**

Вы можете отключить Public API через environment variable:
```bash
export N8N_PUBLIC_API_DISABLED=true
```

Отключить API Playground (Swagger UI):
```bash
export N8N_PUBLIC_API_SWAGGERUI_DISABLED=true
```

---

## Использование API ключа

### HTTP Header

API ключ передается через HTTP header `X-N8N-API-KEY` в каждом запросе:

```http
GET /api/v1/workflows HTTP/1.1
Host: your-instance.app.n8n.cloud
X-N8N-API-KEY: your_api_key_here
Accept: application/json
```

### Обязательные Headers

Каждый API запрос должен включать:

1. **X-N8N-API-KEY** (Required) - Ваш API ключ
```http
X-N8N-API-KEY: your_api_key_here
```

2. **Accept** (Required) - Указывает желаемый формат ответа
```http
Accept: application/json
```

3. **Content-Type** (Required для POST/PUT/PATCH) - Указывает формат тела запроса
```http
Content-Type: application/json
```

### Полный пример headers

**GET Request:**
```http
GET /api/v1/workflows HTTP/1.1
Host: your-instance.app.n8n.cloud
X-N8N-API-KEY: n8n_api_1234567890abcdef
Accept: application/json
```

**POST Request:**
```http
POST /api/v1/workflows HTTP/1.1
Host: your-instance.app.n8n.cloud
X-N8N-API-KEY: n8n_api_1234567890abcdef
Content-Type: application/json
Accept: application/json

{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...}
}
```

---

## Примеры запросов

### cURL

**n8n Cloud:**
```bash
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows?active=true' \
  -H 'accept: application/json' \
  -H 'X-N8N-API-KEY: your_api_key_here'
```

**Self-Hosted:**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/workflows?active=true' \
  -H 'accept: application/json' \
  -H 'X-N8N-API-KEY: your_api_key_here'
```

**С localhost:**
```bash
curl -X GET \
  'http://localhost:5678/api/v1/workflows' \
  -H 'accept: application/json' \
  -H 'X-N8N-API-KEY: your_api_key_here'
```

### JavaScript / Node.js

**Используя axios:**
```javascript
const axios = require('axios');

const N8N_API_KEY = 'your_api_key_here';
const N8N_HOST = 'https://your-instance.app.n8n.cloud';

async function getWorkflows() {
  try {
    const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log('Workflows:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Check your API key.');
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

getWorkflows();
```

**Используя fetch (Node.js 18+):**
```javascript
const N8N_API_KEY = 'your_api_key_here';
const N8N_HOST = 'https://your-instance.app.n8n.cloud';

async function getWorkflows() {
  try {
    const response = await fetch(`${N8N_HOST}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Check your API key.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Workflows:', data);
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

getWorkflows();
```

**Создание reusable API client:**
```javascript
const axios = require('axios');

class N8NApiClient {
  constructor(apiKey, host) {
    this.apiKey = apiKey;
    this.host = host;
    this.client = axios.create({
      baseURL: `${host}/api/v1`,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async getWorkflows(options = {}) {
    const response = await this.client.get('/workflows', { params: options });
    return response.data;
  }

  async createWorkflow(workflowData) {
    const response = await this.client.post('/workflows', workflowData);
    return response.data;
  }

  async getExecutions(options = {}) {
    const response = await this.client.get('/executions', { params: options });
    return response.data;
  }

  async getTags(options = {}) {
    const response = await this.client.get('/tags', { params: options });
    return response.data;
  }
}

// Использование
const client = new N8NApiClient(
  'your_api_key_here',
  'https://your-instance.app.n8n.cloud'
);

// Получить workflows
const workflows = await client.getWorkflows({ active: true });

// Создать workflow
const newWorkflow = await client.createWorkflow({
  name: 'Test Workflow',
  nodes: [...],
  connections: {...}
});
```

### Python

**Используя requests:**
```python
import requests

N8N_API_KEY = 'your_api_key_here'
N8N_HOST = 'https://your-instance.app.n8n.cloud'

def get_workflows():
    try:
        response = requests.get(
            f'{N8N_HOST}/api/v1/workflows',
            headers={
                'X-N8N-API-KEY': N8N_API_KEY,
                'Accept': 'application/json'
            }
        )
        response.raise_for_status()

        print('Workflows:', response.json())
        return response.json()
    except requests.exceptions.HTTPError as error:
        if error.response.status_code == 401:
            print('Authentication failed. Check your API key.')
        else:
            print(f'HTTP error: {error}')
        raise
    except requests.exceptions.RequestException as error:
        print(f'Error: {error}')
        raise

get_workflows()
```

**Создание Python API client:**
```python
import requests
from typing import Dict, List, Optional

class N8NApiClient:
    def __init__(self, api_key: str, host: str):
        self.api_key = api_key
        self.host = host
        self.base_url = f'{host}/api/v1'
        self.session = requests.Session()
        self.session.headers.update({
            'X-N8N-API-KEY': api_key,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })

    def get_workflows(self, params: Optional[Dict] = None) -> Dict:
        response = self.session.get(f'{self.base_url}/workflows', params=params)
        response.raise_for_status()
        return response.json()

    def create_workflow(self, workflow_data: Dict) -> Dict:
        response = self.session.post(f'{self.base_url}/workflows', json=workflow_data)
        response.raise_for_status()
        return response.json()

    def get_executions(self, params: Optional[Dict] = None) -> Dict:
        response = self.session.get(f'{self.base_url}/executions', params=params)
        response.raise_for_status()
        return response.json()

    def get_tags(self, params: Optional[Dict] = None) -> Dict:
        response = self.session.get(f'{self.base_url}/tags', params=params)
        response.raise_for_status()
        return response.json()

# Использование
client = N8NApiClient(
    'your_api_key_here',
    'https://your-instance.app.n8n.cloud'
)

# Получить workflows
workflows = client.get_workflows({'active': True})

# Создать workflow
new_workflow = client.create_workflow({
    'name': 'Test Workflow',
    'nodes': [...],
    'connections': {...}
})
```

### PHP

```php
<?php

$n8nApiKey = 'your_api_key_here';
$n8nHost = 'https://your-instance.app.n8n.cloud';

function getWorkflows($apiKey, $host) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, "$host/api/v1/workflows");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-N8N-API-KEY: ' . $apiKey,
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode === 401) {
        throw new Exception('Authentication failed. Check your API key.');
    }

    curl_close($ch);

    return json_decode($response, true);
}

try {
    $workflows = getWorkflows($n8nApiKey, $n8nHost);
    print_r($workflows);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>
```

---

## Безопасность

### Лучшие практики безопасности

#### 1. Хранение API ключей

**❌ НИКОГДА не делайте:**
```javascript
// НЕ храните в коде
const API_KEY = 'n8n_api_1234567890abcdef';

// НЕ коммитьте в git
git add config.js  // содержит API ключ
```

**✅ ВСЕГДА делайте:**
```javascript
// Используйте environment variables
const API_KEY = process.env.N8N_API_KEY;

// Используйте .env файлы (добавьте .env в .gitignore)
require('dotenv').config();
const API_KEY = process.env.N8N_API_KEY;

// Используйте secret management системы
// - AWS Secrets Manager
// - Azure Key Vault
// - HashiCorp Vault
// - Google Secret Manager
```

**Пример .env файла:**
```bash
# .env
N8N_API_KEY=your_api_key_here
N8N_HOST=https://your-instance.app.n8n.cloud
```

**Пример .gitignore:**
```
# .gitignore
.env
.env.local
.env.*.local
config.json
secrets.json
```

#### 2. HTTPS обязателен

**❌ НИКОГДА:**
```bash
# НЕ используйте HTTP для production
curl http://n8n.example.com/api/v1/workflows \
  -H 'X-N8N-API-KEY: your_key'
```

**✅ ВСЕГДА:**
```bash
# ВСЕГДА используйте HTTPS
curl https://n8n.example.com/api/v1/workflows \
  -H 'X-N8N-API-KEY: your_key'
```

**Почему HTTPS важен:**
- API ключи передаются в открытом виде в headers
- HTTP трафик может быть перехвачен
- HTTPS шифрует весь трафик между клиентом и сервером

#### 3. Ротация ключей

**Регулярно меняйте API ключи:**
```
Рекомендуемый график:
- Production: каждые 90 дней
- Staging: каждые 180 дней
- Development: по необходимости
```

**Процесс ротации:**
1. Создайте новый API ключ в n8n
2. Обновите все системы с новым ключом
3. Протестируйте работоспособность
4. Удалите старый ключ

#### 4. Минимальные права доступа

**Best Practice:**
- Создавайте отдельные API ключи для разных целей
- Используйте описательные имена для ключей
- Удаляйте неиспользуемые ключи

**Примеры:**
```
Production Workflows API Key - для production интеграций
CI/CD Pipeline Key - только для автоматизации
Development Testing Key - для разработки
```

#### 5. Мониторинг и логирование

**Мониторьте:**
- Неудачные попытки аутентификации (401 errors)
- Необычную активность API
- Использование API ключей

**НЕ логируйте:**
```javascript
// ❌ НЕ логируйте API ключи
console.log('API Key:', apiKey);
logger.debug(`Request with key: ${apiKey}`);

// ✅ Логируйте только метаданные
console.log('API request made');
logger.debug('Authentication successful');
```

### Защита от утечек

**Если API ключ скомпрометирован:**

1. **Немедленно** удалите скомпрометированный ключ в n8n Settings
2. Создайте новый API ключ
3. Обновите все системы с новым ключом
4. Проверьте логи на подозрительную активность
5. Измените другие credentials если необходимо

---

## Troubleshooting

### 401 Unauthorized

**Проблема:** Получаете `401 Unauthorized` ответ

**Причины и решения:**

1. **Неверный API ключ**
   ```bash
   # Проверьте правильность ключа
   echo $N8N_API_KEY  # Должен быть без пробелов и лишних символов
   ```

2. **API ключ не в header**
   ```bash
   # Убедитесь что header указан
   curl -X GET 'https://n8n.example.com/api/v1/workflows' \
     -H 'X-N8N-API-KEY: your_key'  # Header присутствует
   ```

3. **Опечатка в названии header**
   ```bash
   # ❌ Неправильно
   -H 'X-N8N-APIKEY: your_key'     # Отсутствует дефис
   -H 'N8N-API-KEY: your_key'       # Отсутствует X-

   # ✅ Правильно
   -H 'X-N8N-API-KEY: your_key'
   ```

4. **API ключ удален**
   - Проверьте что ключ все еще существует в n8n Settings
   - Создайте новый ключ если старый удален

### 403 Forbidden

**Проблема:** Получаете `403 Forbidden` ответ

**Причины:**
- Public API отключен (`N8N_PUBLIC_API_DISABLED=true`)
- Недостаточно прав у API ключа

**Решение:**
```bash
# Self-hosted: проверьте environment variables
echo $N8N_PUBLIC_API_DISABLED  # Должно быть пусто или false
```

### Connection Issues

**Проблема:** Не можете подключиться к API

**Решения:**

1. **Проверьте URL:**
   ```bash
   # Cloud
   https://your-instance.app.n8n.cloud/api/v1

   # Self-hosted
   https://n8n.example.com/api/v1

   # Localhost
   http://localhost:5678/api/v1
   ```

2. **Проверьте доступность:**
   ```bash
   # Проверьте что сервер доступен
   curl https://n8n.example.com/api/v1/workflows \
     -H 'X-N8N-API-KEY: your_key' \
     -v  # Verbose mode для деталей
   ```

3. **Проверьте HTTPS certificate (self-hosted):**
   ```bash
   # Игнорировать SSL ошибки для тестирования (НЕ для production!)
   curl -k https://n8n.example.com/api/v1/workflows \
     -H 'X-N8N-API-KEY: your_key'
   ```

---

## Best Practices

### 1. Централизованная конфигурация

```javascript
// config.js
module.exports = {
  n8n: {
    apiKey: process.env.N8N_API_KEY,
    host: process.env.N8N_HOST || 'https://your-instance.app.n8n.cloud',
    apiVersion: 'v1'
  }
};

// app.js
const config = require('./config');
const apiClient = new N8NApiClient(config.n8n.apiKey, config.n8n.host);
```

### 2. Error Handling

```javascript
async function makeApiRequest(url, options) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY,
        'Accept': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      // Специфичная обработка ошибок
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error.message);
    throw error;
  }
}
```

### 3. Retry Logic

```javascript
async function apiRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await makeApiRequest(url, options);
    } catch (error) {
      // Не retry на 401/403 (проблемы с аутентификацией)
      if (error.message.includes('401') || error.message.includes('403')) {
        throw error;
      }

      // Последняя попытка - throw error
      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 4. Testing

```javascript
// Используйте mock API ключ для тестов
if (process.env.NODE_ENV === 'test') {
  process.env.N8N_API_KEY = 'test_api_key_mock';
  process.env.N8N_HOST = 'http://localhost:5678';
}

// test.js
describe('N8N API Client', () => {
  it('should authenticate with valid API key', async () => {
    const client = new N8NApiClient(
      'test_key',
      'http://localhost:5678'
    );

    // Mock HTTP request
    // Verify X-N8N-API-KEY header is set
  });
});
```

---

## Дополнительные ресурсы

### Официальная документация
- [n8n API Authentication](https://docs.n8n.io/api/authentication/)
- [n8n API Reference](https://docs.n8n.io/api/api-reference/)

### Связанные документы
- [01-OVERVIEW.md](./01-OVERVIEW.md) - Обзор n8n REST API
- [03-PAGINATION.md](./03-PAGINATION.md) - Пагинация результатов
- [10-WORKFLOWS-API.md](./10-WORKFLOWS-API.md) - Workflows API endpoints

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Подготовлено:** James (Dev Agent) с использованием Context7 MCP Server

**Источники:**
- [n8n API Authentication Documentation](https://docs.n8n.io/api/authentication/)
