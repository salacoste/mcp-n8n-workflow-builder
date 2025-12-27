# Workflows API - Полная документация

**Раздел:** Управление рабочими процессами (Workflows)
**Базовый путь:** `/api/v1/workflows`
**Дата:** 2025-12-25

---

## 📋 Содержание

1. [Общая информация](#общая-информация)
2. [GET /api/v1/workflows](#get-apiv1workflows) - Получить список workflows
3. [GET /api/v1/workflows/{id}](#get-apiv1workflowsid) - Получить конкретный workflow
4. [POST /api/v1/workflows](#post-apiv1workflows) - Создать новый workflow
5. [PUT /api/v1/workflows/{id}](#put-apiv1workflowsid) - Обновить workflow полностью
6. [PATCH /api/v1/workflows/{id}](#patch-apiv1workflowsid) - Обновить workflow частично
7. [DELETE /api/v1/workflows/{id}](#delete-apiv1workflowsid) - Удалить workflow
8. [PUT /api/v1/workflows/{id}/activate](#put-apiv1workflowsidactivate) - Активировать workflow
9. [PUT /api/v1/workflows/{id}/deactivate](#put-apiv1workflowsiddeactivate) - Деактивировать workflow
10. [Структура Workflow Object](#структура-workflow-object)
11. [Примеры использования](#примеры-использования)

---

## Общая информация

### Что такое Workflow?

Workflow (рабочий процесс) в n8n - это автоматизированная последовательность действий, состоящая из узлов (nodes) и связей (connections) между ними.

### Основные компоненты Workflow:

- **nodes** - Узлы workflow (triggers, actions, data processing)
- **connections** - Связи между узлами, определяющие поток данных
- **settings** - Настройки workflow (выполнение, обработка ошибок и т.д.)
- **active** - Статус активации (активный workflow выполняется по триггерам)
- **tags** - Теги для организации и категоризации

---

## GET /api/v1/workflows

### Описание
Получить список всех workflows в n8n инстансе с возможностью фильтрации.

### HTTP Метод
```
GET
```

### Endpoint
```
/api/v1/workflows
```

### Параметры

#### Path Parameters
*Нет path параметров*

#### Query Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `active` | boolean | Нет | Фильтр по статусу активации. `true` - только активные, `false` - только неактивные, не указан - все |
| `tags` | string | Нет | Comma-separated список ID тегов для фильтрации |
| `limit` | integer | Нет | Максимальное количество результатов (для пагинации) |
| `offset` | integer | Нет | Сдвиг для пагинации |

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Accept` | string | Да | Тип контента ответа, должен быть `application/json` |

### Примеры запросов

#### Пример 1: Получить все workflows (curl)
```bash
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример 2: Получить только активные workflows (curl)
```bash
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows?active=true' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример 3: JavaScript/Node.js с axios
```javascript
const axios = require('axios');

const getWorkflows = async () => {
  try {
    const response = await axios.get(
      'https://your-instance.app.n8n.cloud/api/v1/workflows',
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        },
        params: {
          active: true  // Только активные
        }
      }
    );

    console.log('Workflows:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

getWorkflows();
```

### Ответы

#### Success Response (200 OK)

**Описание:** Успешно получен список workflows

**Структура ответа:**
```typescript
{
  data: Array<{
    id: string;              // Уникальный ID workflow
    name: string;            // Название workflow
    active: boolean;         // Активен ли workflow
    createdAt: string;       // ISO 8601 дата создания
    updatedAt: string;       // ISO 8601 дата последнего обновления
    nodes?: number;          // Количество узлов (опционально)
    tags?: Array<string>;    // Массив ID тегов (опционально)
  }>
}
```

**Пример ответа:**
```json
{
  "data": [
    {
      "id": "123",
      "name": "Weekly Report Automation",
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "nodes": 5,
      "tags": ["456", "789"]
    },
    {
      "id": "124",
      "name": "Data Sync Job",
      "active": false,
      "createdAt": "2025-01-05T12:00:00.000Z",
      "updatedAt": "2025-01-10T15:45:00.000Z",
      "nodes": 3,
      "tags": []
    }
  ]
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "hint": "Invalid or missing API key"
}
```

**500 Internal Server Error**
```json
{
  "code": 500,
  "message": "Internal Server Error"
}
```

### Примечания
- ⚡ **Performance**: Этот endpoint возвращает упрощенные метаданные workflows для производительности
- 📊 **Pagination**: Рекомендуется использовать `limit` и `offset` для больших списков
- 🏷️ **Tags**: Фильтрация по тегам помогает организовать workflows

---

## GET /api/v1/workflows/{id}

### Описание
Получить полную информацию о конкретном workflow, включая все узлы, связи и настройки.

### HTTP Метод
```
GET
```

### Endpoint
```
/api/v1/workflows/{id}
```

### Параметры

#### Path Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | Уникальный идентификатор workflow |

#### Query Parameters
*Нет query параметров*

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Accept` | string | Да | Должен быть `application/json` |

### Примеры запросов

#### Пример 1: curl
```bash
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows/123' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример 2: JavaScript/Node.js
```javascript
const getWorkflow = async (workflowId) => {
  try {
    const response = await axios.get(
      `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflowId}`,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Workflow:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Workflow not found');
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
};

getWorkflow('123');
```

### Ответы

#### Success Response (200 OK)

**Описание:** Успешно получена полная информация о workflow

**Структура ответа:** См. [Структура Workflow Object](#структура-workflow-object)

**Пример ответа:**
```json
{
  "data": {
    "id": "123",
    "name": "Weekly Report Automation",
    "active": true,
    "nodes": [
      {
        "parameters": {
          "triggerTimes": {
            "item": [
              {
                "mode": "everyWeek",
                "hour": 9,
                "weekday": 1
              }
            ]
          }
        },
        "name": "Cron",
        "type": "n8n-nodes-base.cron",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "url": "https://api.example.com/data",
          "authentication": "headerAuth",
          "options": {}
        },
        "name": "HTTP Request",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 1,
        "position": [450, 300],
        "credentials": {
          "httpHeaderAuth": {
            "id": "1",
            "name": "My API Key"
          }
        }
      }
    ],
    "connections": {
      "Cron": {
        "main": [
          [
            {
              "node": "HTTP Request",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {},
    "staticData": null,
    "tags": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "code": 404,
  "message": "Workflow not found",
  "hint": "Workflow with ID '123' does not exist"
}
```

**401 Unauthorized**
```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

### Примечания
- 📦 **Full Object**: Возвращает полную структуру workflow с всеми узлами и связями
- 🔐 **Credentials**: Credential данные возвращаются с ID и именем, но без секретных данных
- 📐 **Positions**: Позиции узлов включены для визуального отображения

---

## POST /api/v1/workflows

### Описание
Создать новый workflow в n8n.

### HTTP Метод
```
POST
```

### Endpoint
```
/api/v1/workflows
```

### Параметры

#### Path Parameters
*Нет path параметров*

#### Query Parameters
*Нет query параметров*

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Content-Type` | string | Да | Должен быть `application/json` |
| `Accept` | string | Да | Должен быть `application/json` |

#### Request Body

**Обязательные поля:**
- `name` (string) - Название workflow

**Опциональные поля:**
- `nodes` (array) - Массив узлов workflow (по умолчанию: `[]`)
- `connections` (object) - Связи между узлами (по умолчанию: `{}`)
- `active` (boolean) - Активировать сразу после создания (по умолчанию: `false`)
- `settings` (object) - Настройки workflow (по умолчанию: `{}`)
- `staticData` (object) - Статические данные workflow (по умолчанию: `null`)
- `tags` (array) - Массив ID тегов (по умолчанию: `[]`)

### Примеры запросов

#### Пример 1: Создать простой workflow (curl)
```bash
curl -X POST \
  'https://your-instance.app.n8n.cloud/api/v1/workflows' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "My New Workflow",
    "nodes": [],
    "connections": {},
    "active": false,
    "settings": {},
    "staticData": null,
    "tags": []
  }'
```

#### Пример 2: Создать workflow с узлами (JavaScript)
```javascript
const createWorkflow = async () => {
  const workflowData = {
    name: "Automated Data Sync",
    nodes: [
      {
        name: "Start",
        type: "n8n-nodes-base.start",
        typeVersion: 1,
        position: [250, 300],
        parameters: {}
      },
      {
        name: "HTTP Request",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          url: "https://api.example.com/data",
          authentication: "none",
          options: {}
        }
      }
    ],
    connections: {
      "Start": {
        "main": [
          [
            {
              "node": "HTTP Request",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    active: false,
    settings: {},
    staticData: null,
    tags: []
  };

  try {
    const response = await axios.post(
      'https://your-instance.app.n8n.cloud/api/v1/workflows',
      workflowData,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Created workflow:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error.response?.data || error.message);
  }
};

createWorkflow();
```

### Ответы

#### Success Response (201 Created)

**Описание:** Workflow успешно создан

**Структура ответа:** Полный workflow object (см. [Структура Workflow Object](#структура-workflow-object))

**Пример ответа:**
```json
{
  "data": {
    "id": "125",
    "name": "My New Workflow",
    "active": false,
    "nodes": [],
    "connections": {},
    "settings": {},
    "staticData": null,
    "tags": [],
    "createdAt": "2025-01-20T14:30:00.000Z",
    "updatedAt": "2025-01-20T14:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "code": 400,
  "message": "Bad Request",
  "hint": "Field 'name' is required"
}
```

**401 Unauthorized**
```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

**422 Unprocessable Entity**
```json
{
  "code": 422,
  "message": "Validation Error",
  "hint": "Invalid node type: 'invalid-node-type'"
}
```

### Примечания
- 🆕 **New ID**: Созданный workflow получает уникальный ID автоматически
- 🚫 **Inactive by Default**: По умолчанию workflow создается неактивным
- ✅ **Validation**: n8n валидирует структуру узлов и связей перед созданием
- 🏷️ **Tags**: Теги должны существовать перед присвоением

---

## PUT /api/v1/workflows/{id}

### Описание
Полностью обновить существующий workflow (заменить все поля).

### HTTP Метод
```
PUT
```

### Endpoint
```
/api/v1/workflows/{id}
```

### Параметры

#### Path Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | ID workflow для обновления |

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Content-Type` | string | Да | Должен быть `application/json` |
| `Accept` | string | Да | Должен быть `application/json` |

#### Request Body

**Все поля обязательны для PUT:**
- `name` (string) - Название workflow
- `nodes` (array) - Массив узлов
- `connections` (object) - Связи между узлами
- `settings` (object) - Настройки
- `active` (boolean) - Статус активации
- `staticData` (object | null) - Статические данные
- `tags` (array) - Теги

### Примеры запросов

#### Пример: curl
```bash
curl -X PUT \
  'https://your-instance.app.n8n.cloud/api/v1/workflows/123' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Updated Workflow Name",
    "nodes": [...],
    "connections": {...},
    "active": true,
    "settings": {},
    "staticData": null,
    "tags": []
  }'
```

### Ответы

#### Success Response (200 OK)

**Описание:** Workflow успешно обновлен

**Структура ответа:** Полный обновленный workflow object

### Примечания
- ⚠️ **Full Replacement**: PUT заменяет ВСЕ поля workflow
- 💡 **Prefer PATCH**: Для частичного обновления используйте PATCH
- 🔄 **Active Status**: Можно изменить статус активации

---

## PATCH /api/v1/workflows/{id}

### Описание
Частично обновить существующий workflow (обновить только указанные поля).

### HTTP Метод
```
PATCH
```

### Endpoint
```
/api/v1/workflows/{id}
```

### Параметры

#### Path Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | ID workflow для обновления |

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Content-Type` | string | Да | Должен быть `application/json` |
| `Accept` | string | Да | Должен быть `application/json` |

#### Request Body

**Все поля опциональны (обновляются только указанные):**
- `name` (string) - Новое название
- `nodes` (array) - Новые узлы
- `connections` (object) - Новые связи
- `active` (boolean) - Новый статус активации
- `settings` (object) - Новые настройки
- `staticData` (object | null) - Новые статические данные
- `tags` (array) - Новые теги

### Примеры запросов

#### Пример 1: Обновить только название (curl)
```bash
curl -X PATCH \
  'https://your-instance.app.n8n.cloud/api/v1/workflows/123' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "New Workflow Name"
  }'
```

#### Пример 2: Активировать workflow (JavaScript)
```javascript
const activateWorkflow = async (workflowId) => {
  try {
    const response = await axios.patch(
      `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflowId}`,
      {
        active: true,
        settings: {},
        staticData: null,
        tags: []
      },
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Workflow activated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

activateWorkflow('123');
```

### Ответы

#### Success Response (200 OK)

**Описание:** Workflow успешно обновлен

**Структура ответа:** Полный обновленный workflow object

**Пример ответа:**
```json
{
  "data": {
    "id": "123",
    "name": "New Workflow Name",
    "active": true,
    "nodes": [...],
    "connections": {...},
    "settings": {},
    "staticData": null,
    "tags": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-20T15:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "code": 404,
  "message": "Workflow not found"
}
```

### Примечания
- 💡 **Partial Update**: Обновляются только указанные поля
- 🎯 **Recommended**: PATCH рекомендуется для большинства обновлений
- 🔄 **Publish**: Используйте для публикации workflow (`active: true`)

---

## DELETE /api/v1/workflows/{id}

### Описание
Удалить workflow навсегда. **Это действие необратимо!**

### HTTP Метод
```
DELETE
```

### Endpoint
```
/api/v1/workflows/{id}
```

### Параметры

#### Path Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | ID workflow для удаления |

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |

### Примеры запросов

#### Пример 1: curl
```bash
curl -X DELETE \
  'https://your-instance.app.n8n.cloud/api/v1/workflows/123' \
  -H 'X-N8N-API-KEY: your_api_key_here'
```

#### Пример 2: JavaScript
```javascript
const deleteWorkflow = async (workflowId) => {
  try {
    await axios.delete(
      `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflowId}`,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here'
        }
      }
    );

    console.log('Workflow deleted successfully');
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Workflow not found');
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
};

deleteWorkflow('123');
```

### Ответы

#### Success Response (204 No Content)

**Описание:** Workflow успешно удален

**Тело ответа:** Пустое

#### Error Responses

**404 Not Found**
```json
{
  "code": 404,
  "message": "Workflow not found"
}
```

**401 Unauthorized**
```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

### Примечания
- ⚠️ **Permanent**: Удаление необратимо!
- 🗑️ **Executions**: История выполнений также удаляется
- 🛑 **Active Workflows**: Активный workflow будет деактивирован и удален

---

## PUT /api/v1/workflows/{id}/activate

### Описание
Активировать workflow для автоматического выполнения по триггерам.

### HTTP Метод
```
PUT
```

### Endpoint
```
/api/v1/workflows/{id}/activate
```

### Параметры

#### Path Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | ID workflow для активации |

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Accept` | string | Да | Должен быть `application/json` |

### Примеры запросов

#### Пример 1: curl
```bash
curl -X PUT \
  'https://your-instance.app.n8n.cloud/api/v1/workflows/123/activate' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример 2: JavaScript
```javascript
const activateWorkflow = async (workflowId) => {
  try {
    const response = await axios.put(
      `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflowId}/activate`,
      {},
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Workflow activated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

activateWorkflow('123');
```

### Ответы

#### Success Response (200 OK)

**Описание:** Workflow успешно активирован

**Пример ответа:**
```json
{
  "data": {
    "id": "123",
    "active": true
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "code": 400,
  "message": "Cannot activate workflow",
  "hint": "Workflow must have a valid trigger node"
}
```

**404 Not Found**
```json
{
  "code": 404,
  "message": "Workflow not found"
}
```

### Примечания
- 🎯 **Triggers Required**: Workflow должен иметь хотя бы один валидный trigger узел
- ✅ **Valid Triggers**: `scheduleTrigger`, `webhook`, или специфичные для сервиса triggers
- ❌ **Manual Trigger**: `manualTrigger` НЕ является валидным для API v1.82.3
- 🔄 **Auto-Addition**: Наш MCP сервер автоматически добавляет валидный trigger если отсутствует

---

## PUT /api/v1/workflows/{id}/deactivate

### Описание
Деактивировать workflow, остановив автоматическое выполнение.

### HTTP Метод
```
PUT
```

### Endpoint
```
/api/v1/workflows/{id}/deactivate
```

### Параметры

#### Path Parameters

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Да | ID workflow для деактивации |

#### Request Headers

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Да | API ключ для аутентификации |
| `Accept` | string | Да | Должен быть `application/json` |

### Примеры запросов

#### Пример 1: curl
```bash
curl -X PUT \
  'https://your-instance.app.n8n.cloud/api/v1/workflows/123/deactivate' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример 2: JavaScript
```javascript
const deactivateWorkflow = async (workflowId) => {
  try {
    const response = await axios.put(
      `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflowId}/deactivate`,
      {},
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Workflow deactivated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

deactivateWorkflow('123');
```

### Ответы

#### Success Response (200 OK)

**Описание:** Workflow успешно деактивирован

**Пример ответа:**
```json
{
  "data": {
    "id": "123",
    "active": false
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "code": 404,
  "message": "Workflow not found"
}
```

### Примечания
- 🛑 **Stops Execution**: Workflow немедленно перестает выполняться по триггерам
- 💾 **Preserves Data**: Деактивация не удаляет workflow или его данные
- 🔄 **Reversible**: Можно снова активировать в любой момент

---

## Структура Workflow Object

### Полная структура Workflow

```typescript
interface Workflow {
  // Основные поля
  id: string;                    // Уникальный ID
  name: string;                  // Название workflow
  active: boolean;               // Активен ли workflow

  // Узлы workflow
  nodes: Array<{
    name: string;                // Название узла
    type: string;                // Тип узла (например, "n8n-nodes-base.httpRequest")
    typeVersion: number;         // Версия типа узла
    position: [number, number];  // Координаты на canvas [x, y]
    parameters: object;          // Параметры узла (зависят от типа)
    credentials?: {              // Credentials для узла (опционально)
      [credentialType: string]: {
        id: string;              // ID credential
        name: string;            // Имя credential
      }
    };
  }>;

  // Связи между узлами
  connections: {
    [nodeName: string]: {
      main?: Array<Array<{
        node: string;            // Имя целевого узла
        type: string;            // Тип связи ("main")
        index: number;           // Индекс выхода
      }>>;
    };
  };

  // Настройки и метаданные
  settings: object;              // Настройки workflow
  staticData: object | null;     // Статические данные
  tags: Array<string>;           // ID тегов

  // Временные метки
  createdAt: string;             // ISO 8601 дата создания
  updatedAt: string;             // ISO 8601 дата обновления
}
```

### Пример минимального Workflow

```json
{
  "name": "Simple Workflow",
  "nodes": [],
  "connections": {},
  "active": false,
  "settings": {},
  "staticData": null,
  "tags": []
}
```

### Пример Workflow с узлами

```json
{
  "name": "HTTP to Slack",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "my-webhook",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [450, 300],
      "parameters": {
        "channel": "#general",
        "text": "New webhook received!"
      },
      "credentials": {
        "slackApi": {
          "id": "1",
          "name": "My Slack Account"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "staticData": null,
  "tags": []
}
```

---

## Примеры использования

### Пример 1: Получить все активные workflows и деактивировать их

```javascript
const deactivateAllActiveWorkflows = async () => {
  try {
    // 1. Получить все активные workflows
    const { data: workflows } = await axios.get(
      'https://your-instance.app.n8n.cloud/api/v1/workflows',
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        },
        params: { active: true }
      }
    );

    console.log(`Found ${workflows.data.length} active workflows`);

    // 2. Деактивировать каждый
    for (const workflow of workflows.data) {
      await axios.put(
        `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflow.id}/deactivate`,
        {},
        {
          headers: {
            'X-N8N-API-KEY': 'your_api_key_here',
            'Accept': 'application/json'
          }
        }
      );

      console.log(`Deactivated: ${workflow.name}`);
    }

    console.log('All workflows deactivated');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

### Пример 2: Клонировать workflow

```javascript
const cloneWorkflow = async (workflowId, newName) => {
  try {
    // 1. Получить исходный workflow
    const { data: original } = await axios.get(
      `https://your-instance.app.n8n.cloud/api/v1/workflows/${workflowId}`,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      }
    );

    // 2. Создать копию с новым именем
    const cloneData = {
      name: newName || `${original.data.name} (Copy)`,
      nodes: original.data.nodes,
      connections: original.data.connections,
      active: false,  // Клон создается неактивным
      settings: original.data.settings,
      staticData: original.data.staticData,
      tags: original.data.tags
    };

    const { data: clone } = await axios.post(
      'https://your-instance.app.n8n.cloud/api/v1/workflows',
      cloneData,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Cloned workflow:', clone.data);
    return clone.data;
  } catch (error) {
    console.error('Error cloning workflow:', error.response?.data || error.message);
  }
};

cloneWorkflow('123', 'My Cloned Workflow');
```

### Пример 3: Найти workflows по имени (поиск)

```javascript
const searchWorkflowsByName = async (searchTerm) => {
  try {
    // Получить все workflows
    const { data: workflows } = await axios.get(
      'https://your-instance.app.n8n.cloud/api/v1/workflows',
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      }
    );

    // Фильтровать по имени (case-insensitive)
    const matches = workflows.data.filter(workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`Found ${matches.length} workflows matching "${searchTerm}"`);
    return matches;
  } catch (error) {
    console.error('Error searching workflows:', error.response?.data || error.message);
  }
};

searchWorkflowsByName('report');
```

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Следующий раздел:** [20-EXECUTIONS-API.md](./20-EXECUTIONS-API.md)
