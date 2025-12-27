# 01-OVERVIEW.md - n8n REST API Overview

**Версия API:** v1
**Дата документации:** 2025-12-25
**Источник:** Официальная документация n8n через Context7

---

## 📋 Содержание

1. [Введение](#введение)
2. [Что такое n8n REST API](#что-такое-n8n-rest-api)
3. [Возможности API](#возможности-api)
4. [Архитектура API](#архитектура-api)
5. [Base URLs](#base-urls)
6. [Версионирование](#версионирование)
7. [Форматы данных](#форматы-данных)
8. [Основные концепции](#основные-концепции)
9. [Начало работы](#начало-работы)
10. [Ограничения](#ограничения)

---

## Введение

n8n REST API предоставляет программный доступ к функциям n8n automation platform. API позволяет создавать, управлять и мониторить workflows, executions, credentials и tags через HTTP запросы, обеспечивая интеграцию n8n в ваши системы и процессы.

---

## Что такое n8n REST API

### Определение

n8n REST API - это RESTful HTTP API, который позволяет программно выполнять многие из тех же задач, что и в графическом интерфейсе (GUI) n8n. API следует принципам REST архитектуры и использует стандартные HTTP методы для взаимодействия с ресурсами.

### Основные принципы REST

**n8n REST API следует стандартным REST принципам:**

1. **Resource-Based** - Все операции выполняются над ресурсами (workflows, executions, credentials, tags)
2. **HTTP Methods** - Стандартные HTTP методы определяют действия:
   - `GET` - Получить ресурс(ы)
   - `POST` - Создать новый ресурс
   - `PUT` - Полностью обновить ресурс
   - `PATCH` - Частично обновить ресурс
   - `DELETE` - Удалить ресурс

3. **Stateless** - Каждый запрос содержит всю необходимую информацию для обработки
4. **JSON Format** - Все данные передаются в формате JSON
5. **HTTP Status Codes** - Стандартные коды ответов указывают на результат операции

---

## Возможности API

n8n REST API предоставляет следующие категории функциональности:

### 1. Workflows Management (Управление рабочими процессами)

**Основные операции:**
- ✅ Создание новых workflows программно
- ✅ Получение списка workflows с фильтрацией
- ✅ Получение детальной информации о workflow
- ✅ Обновление существующих workflows (полное и частичное)
- ✅ Удаление workflows
- ✅ Активация и деактивация workflows
- ✅ Клонирование и экспорт workflows

**Подробнее:** [10-WORKFLOWS-API.md](./10-WORKFLOWS-API.md)

### 2. Executions Monitoring (Мониторинг выполнений)

**Основные операции:**
- ✅ Просмотр истории выполнений workflows
- ✅ Получение детальной информации о execution
- ✅ Фильтрация executions по статусу, workflow, дате
- ✅ Повторное выполнение (retry) failed executions
- ✅ Удаление executions из истории

**Подробнее:** [20-EXECUTIONS-API.md](./20-EXECUTIONS-API.md)

### 3. Credentials Management (Управление учетными данными)

**Основные операции:**
- ✅ Создание credentials для внешних сервисов
- ✅ Получение списка credentials
- ✅ Обновление существующих credentials
- ✅ Удаление credentials
- ✅ Управление доступом к credentials

**Подробнее:** [30-CREDENTIALS-API.md](./30-CREDENTIALS-API.md)

**Примечание:** Credentials API описан согласно официальной документации, но не реализован в MCP сервере n8n-workflow-builder.

### 4. Tags Organization (Организация через теги)

**Основные операции:**
- ✅ Создание tags для классификации workflows
- ✅ Получение списка tags
- ✅ Обновление tags
- ✅ Удаление tags
- ✅ Назначение tags workflows

**Подробнее:** [40-TAGS-API.md](./40-TAGS-API.md)

---

## Архитектура API

### RESTful Структура

n8n REST API построен на основе RESTful архитектуры:

```
/api/v1/
├── workflows/          # Управление workflows
│   ├── GET /workflows
│   ├── POST /workflows
│   ├── GET /workflows/{id}
│   ├── PUT /workflows/{id}
│   ├── PATCH /workflows/{id}
│   ├── DELETE /workflows/{id}
│   ├── PUT /workflows/{id}/activate
│   └── PUT /workflows/{id}/deactivate
│
├── executions/         # Мониторинг executions
│   ├── GET /executions
│   ├── GET /executions/{id}
│   ├── DELETE /executions/{id}
│   └── POST /executions/{id}/retry
│
├── credentials/        # Управление credentials
│   ├── GET /credentials
│   ├── POST /credentials
│   ├── GET /credentials/{id}
│   ├── PUT /credentials/{id}
│   ├── DELETE /credentials/{id}
│   └── GET /credentials/schema/{typeName}
│
└── tags/              # Организация через tags
    ├── GET /tags
    ├── POST /tags
    ├── GET /tags/{id}
    ├── PUT /tags/{id}
    └── DELETE /tags/{id}
```

### Компоненты Архитектуры

**1. HTTP Layer**
- Стандартные HTTP методы (GET, POST, PUT, PATCH, DELETE)
- HTTP заголовки для аутентификации и content negotiation
- HTTP status codes для индикации результата

**2. Authentication Layer**
- API key authentication через header `X-N8N-API-KEY`
- Безопасная передача credentials через HTTPS

**3. Data Layer**
- JSON формат для всех запросов и ответов
- Валидация входных данных
- Трансформация данных между форматами

**4. Business Logic Layer**
- Обработка workflows, executions, credentials, tags
- Валидация бизнес-правил
- Управление состоянием ресурсов

---

## Base URLs

### n8n Cloud

Для n8n Cloud instances используйте следующий формат:

```
https://{instance}.app.n8n.cloud/api/v1
```

**Где:**
- `{instance}` - название вашего n8n Cloud instance

**Примеры:**
```
https://my-company.app.n8n.cloud/api/v1
https://production-n8n.app.n8n.cloud/api/v1
```

### Self-Hosted

Для self-hosted n8n installations используйте:

```
{url}/api/v1
```

**Где:**
- `{url}` - URL вашего self-hosted n8n сервера

**Примеры:**
```
https://n8n.example.com/api/v1
http://localhost:5678/api/v1
https://automation.company.com/api/v1
```

### Полные URL примеры

**Cloud Instance:**
```bash
# Список workflows
GET https://my-company.app.n8n.cloud/api/v1/workflows

# Создать workflow
POST https://my-company.app.n8n.cloud/api/v1/workflows

# Получить execution
GET https://my-company.app.n8n.cloud/api/v1/executions/123
```

**Self-Hosted:**
```bash
# Список workflows
GET https://n8n.example.com/api/v1/workflows

# Создать tag
POST https://n8n.example.com/api/v1/tags

# Активировать workflow
PUT https://n8n.example.com/api/v1/workflows/456/activate
```

---

## Версионирование

### Текущая версия: v1

n8n REST API использует версионирование в URL path:

```
/api/v1/{resource}
```

**Стабильность:**
- API v1 является стабильной версией
- Обратная совместимость поддерживается в рамках одной major version
- Изменения, ломающие совместимость, будут введены в новой major version (v2)

**Best Practices:**
- Всегда указывайте версию API в запросах
- Мониторьте официальные changelog для изменений API
- Тестируйте интеграции при обновлении n8n

---

## Форматы данных

### Request Format

**Content-Type:** `application/json`

Все POST, PUT, PATCH запросы должны отправлять данные в JSON формате:

```http
POST /api/v1/workflows HTTP/1.1
Host: n8n.example.com
Content-Type: application/json
X-N8N-API-KEY: your_api_key_here

{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...}
}
```

### Response Format

**Content-Type:** `application/json`

Все ответы возвращаются в JSON формате:

```json
{
  "id": "123",
  "name": "My Workflow",
  "active": true,
  "createdAt": "2025-12-25T10:00:00.000Z",
  "updatedAt": "2025-12-25T10:00:00.000Z"
}
```

### Common Response Structures

**Single Resource Response:**
```json
{
  "id": "123",
  "name": "Resource Name",
  ...other fields
}
```

**List Response (with pagination):**
```json
{
  "data": [
    {
      "id": "123",
      "name": "Item 1"
    },
    {
      "id": "456",
      "name": "Item 2"
    }
  ],
  "nextCursor": "cursor_token_here"
}
```

**Error Response:**
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Основные концепции

### 1. Resources (Ресурсы)

n8n API работает со следующими основными ресурсами:

**Workflow**
- Определение automation workflow
- Содержит nodes (узлы) и connections (связи)
- Может быть активным или неактивным

**Execution**
- Запись о выполнении workflow
- Содержит результаты, ошибки, timing информацию
- Может иметь статусы: success, error, waiting

**Credential**
- Учетные данные для аутентификации с внешними сервисами
- Безопасно зашифрованы в n8n
- Используются nodes в workflows

**Tag**
- Метка для организации workflows
- Помогает категоризировать и фильтровать workflows

### 2. HTTP Methods Семантика

**GET** - Получить ресурс(ы)
- Безопасный (не изменяет данные)
- Идемпотентный (повторные запросы дают тот же результат)
- Поддерживает фильтрацию через query parameters

**POST** - Создать новый ресурс
- Не идемпотентный (каждый запрос создает новый ресурс)
- Возвращает созданный ресурс с ID

**PUT** - Полностью заменить ресурс
- Идемпотентный
- Требует полное представление ресурса

**PATCH** - Частично обновить ресурс
- Может быть идемпотентным
- Обновляет только указанные поля

**DELETE** - Удалить ресурс
- Идемпотентный
- Обычно возвращает 204 No Content

### 3. Status Codes

n8n API использует стандартные HTTP status codes:

**2xx Success:**
- `200 OK` - Успешный GET, PUT, PATCH
- `201 Created` - Успешный POST
- `204 No Content` - Успешный DELETE

**4xx Client Errors:**
- `400 Bad Request` - Неверные данные запроса
- `401 Unauthorized` - Отсутствует или неверный API key
- `404 Not Found` - Ресурс не найден
- `409 Conflict` - Конфликт (например, дубликат)

**5xx Server Errors:**
- `500 Internal Server Error` - Внутренняя ошибка сервера

### 4. Pagination

Для endpoints, возвращающих списки, используется cursor-based pagination:

**Request:**
```bash
GET /api/v1/workflows?limit=100&cursor=cursor_token
```

**Response:**
```json
{
  "data": [...],
  "nextCursor": "next_cursor_token"
}
```

**Подробнее:** [03-PAGINATION.md](./03-PAGINATION.md)

### 5. Authentication

Все API запросы требуют аутентификации через API key:

```http
GET /api/v1/workflows HTTP/1.1
Host: n8n.example.com
X-N8N-API-KEY: your_api_key_here
Accept: application/json
```

**Подробнее:** [02-AUTHENTICATION.md](./02-AUTHENTICATION.md)

---

## Начало работы

### Шаг 1: Получить API Key

**n8n Cloud:**
1. Войдите в свой n8n Cloud instance
2. Перейдите в Settings → API
3. Создайте новый API key
4. Сохраните key в безопасном месте

**Self-Hosted:**
1. Войдите в свой n8n instance
2. Перейдите в Settings → API
3. Создайте новый API key
4. Сохраните key в безопасном месте

### Шаг 2: Первый API запрос

**Тест подключения - получить список workflows:**

```bash
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

**Ожидаемый результат:**
```json
{
  "data": [
    {
      "id": "123",
      "name": "My First Workflow",
      "active": true,
      "createdAt": "2025-12-20T10:00:00.000Z",
      "updatedAt": "2025-12-20T10:00:00.000Z"
    }
  ]
}
```

### Шаг 3: Создать простой workflow

```bash
curl -X POST \
  'https://your-instance.app.n8n.cloud/api/v1/workflows' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "API Test Workflow",
    "nodes": [
      {
        "name": "Start",
        "type": "n8n-nodes-base.start",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {}
      }
    ],
    "connections": {},
    "active": false,
    "settings": {}
  }'
```

### Шаг 4: Изучить документацию endpoints

- [Workflows API](./10-WORKFLOWS-API.md) - Полное управление workflows
- [Executions API](./20-EXECUTIONS-API.md) - Мониторинг выполнений
- [Credentials API](./30-CREDENTIALS-API.md) - Управление credentials
- [Tags API](./40-TAGS-API.md) - Организация workflows

---

## Ограничения

### Rate Limiting

**n8n Cloud:**
- Rate limiting применяется для защиты инфраструктуры
- Конкретные лимиты зависят от вашего плана
- При превышении лимита возвращается `429 Too Many Requests`

**Self-Hosted:**
- Rate limiting можно настроить через environment variables
- По умолчанию лимиты отсутствуют

### Размер данных

**Request Body Size:**
- Максимальный размер request body зависит от конфигурации сервера
- Рекомендуется держать workflows в разумных размерах

**Response Size:**
- Большие workflows могут возвращать значительные объемы данных
- Используйте pagination для списков

### Concurrent Operations

**Workflow Execution:**
- Количество одновременных executions ограничено настройками instance
- Cloud plans имеют различные лимиты по concurrency

### Deprecated Features

**Следите за changelog для:**
- Устаревших endpoints
- Изменений в структуре данных
- Новых версий API

---

## Дополнительные ресурсы

### Официальная документация

- [n8n REST API Documentation](https://docs.n8n.io/api/)
- [n8n REST API Reference](https://docs.n8n.io/api/api-reference/)

### Полезные ссылки

- **Основы REST APIs:**
  - [KnowledgeOwl's guide to working with APIs](https://support.knowledgeowl.com/help/working-with-apis)
  - [IBM Cloud - What is an API](https://www.ibm.com/cloud/learn/api)
  - [IBM Cloud - What is a REST API?](https://www.ibm.com/cloud/learn/rest-apis)
  - [MDN - An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

### Community & Support

- [n8n Community Forum](https://community.n8n.io/)
- [n8n GitHub Repository](https://github.com/n8n-io/n8n)
- [n8n Documentation](https://docs.n8n.io/)

---

## Примеры использования

### JavaScript/Node.js пример

```javascript
const axios = require('axios');

const N8N_API_KEY = 'your_api_key_here';
const N8N_HOST = 'https://your-instance.app.n8n.cloud';

async function listWorkflows() {
  try {
    const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log('Workflows:', response.data.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

listWorkflows();
```

### Python пример

```python
import requests

N8N_API_KEY = 'your_api_key_here'
N8N_HOST = 'https://your-instance.app.n8n.cloud'

def list_workflows():
    try:
        response = requests.get(
            f'{N8N_HOST}/api/v1/workflows',
            headers={
                'X-N8N-API-KEY': N8N_API_KEY,
                'Accept': 'application/json'
            }
        )
        response.raise_for_status()

        print('Workflows:', response.json()['data'])
        return response.json()
    except requests.exceptions.RequestException as error:
        print('Error:', error)
        raise

list_workflows()
```

---

## Следующие шаги

1. **Настройте аутентификацию:** Прочитайте [02-AUTHENTICATION.md](./02-AUTHENTICATION.md)
2. **Изучите пагинацию:** Прочитайте [03-PAGINATION.md](./03-PAGINATION.md)
3. **Начните с Workflows API:** Прочитайте [10-WORKFLOWS-API.md](./10-WORKFLOWS-API.md)
4. **Изучите примеры:** Прочитайте [90-EXAMPLES.md](./90-EXAMPLES.md)

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Подготовлено:** James (Dev Agent) с использованием Context7 MCP Server

**Источники:**
- [n8n REST API Documentation](https://docs.n8n.io/api/)
- [n8n API Reference](https://docs.n8n.io/api/api-reference/)
