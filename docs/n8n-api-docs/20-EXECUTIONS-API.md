# 20-EXECUTIONS-API.md - Executions API Endpoints

**Версия API:** v1
**Дата документации:** 2025-12-25
**Источник:** Официальная документация n8n + анализ кода MCP сервера

---

## 📋 Содержание

1. [GET /api/v1/executions](#get-apiv1executions) - Получить список выполнений
2. [GET /api/v1/executions/{id}](#get-apiv1executionsid) - Получить конкретное выполнение
3. [DELETE /api/v1/executions/{id}](#delete-apiv1executionsid) - Удалить выполнение
4. [POST /api/v1/executions/{id}/retry](#post-apiv1executionsidretry) - Повторить failed выполнение
5. [Структура объекта Execution](#структура-объекта-execution)
6. [Примеры использования](#примеры-использования)

---

## GET /api/v1/executions

### Описание

Получить список всех выполнений workflows с возможностью фильтрации по различным параметрам. Поддерживает пагинацию для больших объемов данных.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/executions
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/executions
```

### Параметры

#### Query Parameters (Параметры запроса)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `includeData` | boolean | Optional | Включить полные данные выполнения в ответ (по умолчанию: false) |
| `status` | string | Optional | Фильтр по статусу: `error`, `success`, `waiting` |
| `workflowId` | string | Optional | Фильтр по ID конкретного workflow |
| `projectId` | string | Optional | Фильтр по ID проекта |
| `limit` | integer | Optional | Максимальное количество результатов (по умолчанию: 100, максимум: 250) |
| `cursor` | string | Optional | Курсор для пагинации (получается из предыдущего ответа) |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

**Получить все выполнения:**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/executions' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

**Получить только failed выполнения:**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/executions?status=error&limit=50' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

**Получить выполнения конкретного workflow:**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/executions?workflowId=123&includeData=true' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

**Пагинация (следующая страница):**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/executions?limit=100&cursor=MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

// Функция для получения списка executions
async function listExecutions(filters = {}) {
  try {
    const response = await axios.get('https://n8n.example.com/api/v1/executions', {
      params: {
        includeData: filters.includeData || false,
        status: filters.status, // 'error', 'success', 'waiting'
        workflowId: filters.workflowId,
        projectId: filters.projectId,
        limit: filters.limit || 100,
        cursor: filters.cursor
      },
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`Получено ${response.data.data.length} executions`);

    if (response.data.nextCursor) {
      console.log('Есть следующая страница, курсор:', response.data.nextCursor);
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка получения executions:', error.response?.data || error.message);
    throw error;
  }
}

// Примеры использования
await listExecutions(); // Все выполнения
await listExecutions({ status: 'error' }); // Только failed
await listExecutions({ workflowId: '123', includeData: true }); // С полными данными
```

### Ответы

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": 231,
      "finished": true,
      "mode": "manual",
      "retryOf": null,
      "retrySuccessId": null,
      "startedAt": "2025-12-25T10:30:00.000Z",
      "stoppedAt": "2025-12-25T10:30:15.000Z",
      "workflowId": 123,
      "waitTill": null,
      "customData": {},
      "data": {
        "resultData": {
          "runData": {
            "Start": [...],
            "HTTP Request": [...]
          },
          "lastNodeExecuted": "HTTP Request"
        },
        "workflowData": {
          "name": "My Workflow",
          "nodes": [...],
          "connections": {...},
          "active": true
        }
      }
    }
  ],
  "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| `data` | array | Массив объектов Execution (см. [Структура объекта Execution](#структура-объекта-execution)) |
| `nextCursor` | string | Курсор для получения следующей страницы (отсутствует на последней странице) |

#### Error Responses

**400 Bad Request** - Неверные параметры запроса
```json
{
  "error": "Invalid status value. Must be 'error', 'success', or 'waiting'"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error** - Внутренняя ошибка сервера
```json
{
  "error": "Internal server error"
}
```

### Примечания

- **Пагинация:** При большом количестве executions рекомендуется использовать пагинацию с параметром `cursor`
- **includeData:** Установка `includeData=true` значительно увеличивает размер ответа, используйте только когда необходимы полные данные выполнения
- **Фильтрация:** Все параметры фильтрации можно комбинировать (например, `status=error&workflowId=123`)
- **Лимиты:** По умолчанию возвращается до 100 executions, максимум 250 за один запрос
- **Sorting:** Executions возвращаются отсортированными по времени начала (новые первыми)

---

## GET /api/v1/executions/{id}

### Описание

Получить детальную информацию о конкретном выполнении workflow по его ID.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/executions/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/executions/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | integer | Required | ID выполнения для получения |

#### Query Parameters (Параметры запроса)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `includeData` | boolean | Optional | Включить полные данные выполнения (по умолчанию: true) |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X GET \
  'https://n8n.example.com/api/v1/executions/231' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

**Без полных данных:**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/executions/231?includeData=false' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

// Функция для получения execution по ID
async function getExecution(executionId, includeData = true) {
  try {
    const response = await axios.get(`https://n8n.example.com/api/v1/executions/${executionId}`, {
      params: {
        includeData: includeData
      },
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const execution = response.data;
    console.log(`Execution ${execution.id}:`);
    console.log(`  Workflow ID: ${execution.workflowId}`);
    console.log(`  Status: ${execution.finished ? 'Completed' : 'Running'}`);
    console.log(`  Started: ${execution.startedAt}`);
    console.log(`  Stopped: ${execution.stoppedAt}`);
    console.log(`  Mode: ${execution.mode}`);

    return execution;
  } catch (error) {
    console.error('Ошибка получения execution:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
const execution = await getExecution(231);
```

### Ответы

#### Success Response (200 OK)

**С полными данными (includeData=true):**
```json
{
  "id": 231,
  "finished": true,
  "mode": "manual",
  "retryOf": null,
  "retrySuccessId": null,
  "startedAt": "2025-12-25T10:30:00.000Z",
  "stoppedAt": "2025-12-25T10:30:15.000Z",
  "workflowId": 123,
  "waitTill": null,
  "customData": {
    "userId": "user_123"
  },
  "data": {
    "resultData": {
      "runData": {
        "Start": [
          {
            "name": "Start",
            "type": "n8n-nodes-base.start",
            "startTime": 1703501400000,
            "endTime": 1703501400100,
            "inputData": {
              "main": [[]]
            },
            "outputData": {
              "main": [[{ "json": {} }]]
            }
          }
        ],
        "HTTP Request": [
          {
            "name": "HTTP Request",
            "type": "n8n-nodes-base.httpRequest",
            "startTime": 1703501400100,
            "endTime": 1703501415000,
            "inputData": {
              "main": [[{ "json": {} }]]
            },
            "outputData": {
              "main": [[{ "json": { "status": "success" } }]]
            }
          }
        ]
      },
      "lastNodeExecuted": "HTTP Request"
    },
    "workflowData": {
      "name": "My Workflow",
      "nodes": [
        {
          "name": "Start",
          "type": "n8n-nodes-base.start",
          "typeVersion": 1,
          "position": [250, 300],
          "parameters": {}
        },
        {
          "name": "HTTP Request",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.1,
          "position": [450, 300],
          "parameters": {
            "url": "https://api.example.com/data",
            "method": "GET"
          }
        }
      ],
      "connections": {
        "Start": {
          "main": [[{
            "node": "HTTP Request",
            "type": "main",
            "index": 0
          }]]
        }
      },
      "active": true,
      "settings": {}
    }
  }
}
```

**Без полных данных (includeData=false):**
```json
{
  "id": 231,
  "finished": true,
  "mode": "manual",
  "retryOf": null,
  "retrySuccessId": null,
  "startedAt": "2025-12-25T10:30:00.000Z",
  "stoppedAt": "2025-12-25T10:30:15.000Z",
  "workflowId": 123,
  "waitTill": null,
  "customData": {}
}
```

#### Error Responses

**404 Not Found** - Execution не найден
```json
{
  "error": "Execution with ID 231 not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error** - Внутренняя ошибка сервера
```json
{
  "error": "Internal server error"
}
```

### Примечания

- **includeData:** По умолчанию включает полные данные выполнения. Для получения только метаданных используйте `includeData=false`
- **Размер данных:** Полные данные выполнения могут быть очень большими для сложных workflows
- **История:** Execution хранится согласно настройкам retention policy в n8n (см. EXECUTIONS_DATA_MAX_AGE, EXECUTIONS_DATA_PRUNE_MAX_COUNT)

---

## DELETE /api/v1/executions/{id}

### Описание

Удалить execution из истории выполнений. Эта операция необратима.

### HTTP Метод

`DELETE`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/executions/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/executions/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | integer | Required | ID выполнения для удаления |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X DELETE \
  'https://n8n.example.com/api/v1/executions/231' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

// Функция для удаления execution
async function deleteExecution(executionId) {
  try {
    const response = await axios.delete(`https://n8n.example.com/api/v1/executions/${executionId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`Execution ${executionId} успешно удален`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления execution:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
await deleteExecution(231);
```

### Ответы

#### Success Response (204 No Content)

**Пустой ответ** - execution успешно удален

```
(пустое тело ответа)
```

#### Error Responses

**404 Not Found** - Execution не найден
```json
{
  "error": "Execution with ID 231 not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error** - Внутренняя ошибка сервера
```json
{
  "error": "Internal server error"
}
```

### Примечания

- **Необратимость:** Удаление execution необратимо, восстановление невозможно
- **Cascading:** Удаление execution не влияет на workflow
- **Running executions:** Нельзя удалить execution, который в данный момент выполняется (статус `running` или `waiting`)
- **Bulk deletion:** Для массового удаления используйте настройки автоматической очистки (EXECUTIONS_DATA_PRUNE)

---

## POST /api/v1/executions/{id}/retry

### Описание

Повторить failed выполнение workflow. Доступно только для executions со статусом `error`. Создает новое execution, которое является retry оригинального.

### HTTP Метод

`POST`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/executions/{id}/retry
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/executions/{id}/retry
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | integer | Required | ID failed execution для повтора |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Content-Type` | string | Required | Должен быть `application/json` |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X POST \
  'https://n8n.example.com/api/v1/executions/231/retry' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

// Функция для повтора failed execution
async function retryExecution(executionId) {
  try {
    const response = await axios.post(
      `https://n8n.example.com/api/v1/executions/${executionId}/retry`,
      {},
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const newExecution = response.data;
    console.log(`Создано новое retry execution с ID: ${newExecution.id}`);
    console.log(`Retry оригинального execution: ${newExecution.retryOf}`);

    return newExecution;
  } catch (error) {
    console.error('Ошибка retry execution:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
const retryExec = await retryExecution(231);
```

### Ответы

#### Success Response (201 Created)

```json
{
  "id": 250,
  "finished": false,
  "mode": "retry",
  "retryOf": 231,
  "retrySuccessId": null,
  "startedAt": "2025-12-25T11:00:00.000Z",
  "stoppedAt": null,
  "workflowId": 123,
  "waitTill": null,
  "customData": {},
  "data": {
    "resultData": {
      "runData": {}
    },
    "workflowData": {
      "name": "My Workflow",
      "nodes": [...],
      "connections": {...},
      "active": true
    }
  }
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | integer | ID нового retry execution |
| `mode` | string | Всегда `"retry"` для повторных выполнений |
| `retryOf` | integer | ID оригинального failed execution |
| `retrySuccessId` | integer\|null | ID успешного retry (если был) |

#### Error Responses

**400 Bad Request** - Execution не имеет статус `error`
```json
{
  "error": "Execution 231 cannot be retried because it did not fail"
}
```

**404 Not Found** - Execution не найден
```json
{
  "error": "Execution with ID 231 not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error** - Внутренняя ошибка сервера
```json
{
  "error": "Internal server error"
}
```

### Примечания

- **Только для failed:** Можно повторить только executions со статусом `error`
- **Новое execution:** Retry создает полностью новое execution с mode="retry"
- **retryOf:** Новое execution содержит ссылку на оригинальное в поле `retryOf`
- **retrySuccessId:** Если retry успешен, оригинальное execution получит ссылку в поле `retrySuccessId`
- **Workflow state:** Retry использует текущую версию workflow, не снапшот из оригинального execution

---

## Структура объекта Execution

### Полная структура Execution (TypeScript Interface)

```typescript
interface Execution {
  // Основные поля
  id: number;                           // Уникальный ID execution
  workflowId: number;                   // ID workflow, который был выполнен
  finished: boolean;                    // Завершено ли выполнение
  mode: ExecutionMode;                  // Режим выполнения
  startedAt: string;                    // ISO 8601 timestamp начала
  stoppedAt: string;                    // ISO 8601 timestamp завершения

  // Retry информация
  retryOf?: number | null;              // ID оригинального execution (для retry)
  retrySuccessId?: number | null;       // ID успешного retry (в оригинальном execution)

  // Wait информация
  waitTill?: string | null;             // ISO 8601 timestamp до которого ждать

  // Пользовательские данные
  customData?: {                        // Произвольные пользовательские данные
    [key: string]: any;
  };

  // Полные данные выполнения (если includeData=true)
  data?: {
    // Результаты выполнения
    resultData: {
      runData: {
        [nodeName: string]: NodeExecutionData[];
      };
      lastNodeExecuted?: string;
      error?: {
        message: string;
        stack?: string;
      };
    };

    // Снапшот workflow на момент выполнения
    workflowData: {
      name: string;
      nodes: Node[];
      connections: Connections;
      active: boolean;
      settings?: object;
    };

    // Дополнительные метаданные выполнения
    executionData?: {
      contextData?: {
        [key: string]: any;
      };
      nodeExecutionOrder?: string[];
      waitingExecution?: object;
      waitingExecutionSource?: object;
    };
  };
}

// Режим выполнения
type ExecutionMode =
  | 'cli'         // Выполнен через CLI
  | 'error'       // Выполнен через Error Trigger
  | 'integrated'  // Интеграционное выполнение
  | 'internal'    // Внутреннее выполнение
  | 'manual'      // Ручное выполнение через UI
  | 'retry'       // Повторное выполнение failed execution
  | 'trigger'     // Выполнен через trigger (webhook, schedule, etc.)
  | 'webhook';    // Выполнен через webhook

// Данные выполнения одного node
interface NodeExecutionData {
  name: string;                         // Имя node
  type: string;                         // Тип node (например, 'n8n-nodes-base.httpRequest')
  startTime: number;                    // Timestamp начала выполнения node (Unix milliseconds)
  endTime?: number;                     // Timestamp завершения выполнения node

  // Входные данные node
  inputData: {
    [key: string]: Array<{
      [key: string]: any;
    }>;
  };

  // Выходные данные node
  outputData?: {
    [key: string]: Array<{
      [key: string]: any;
    }>;
  };

  // Ошибка выполнения node
  error?: {
    message: string;
    stack?: string;
    name?: string;
    description?: string;
  };
}

// Node структура
interface Node {
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: {
    [key: string]: any;
  };
  credentials?: {
    [credentialType: string]: {
      id: string;
      name: string;
    };
  };
}

// Connections структура
interface Connections {
  [nodeName: string]: {
    main?: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}
```

### Примеры execution в различных состояниях

**Успешное execution:**
```json
{
  "id": 100,
  "workflowId": 50,
  "finished": true,
  "mode": "trigger",
  "startedAt": "2025-12-25T10:00:00.000Z",
  "stoppedAt": "2025-12-25T10:00:05.000Z",
  "retryOf": null,
  "retrySuccessId": null,
  "waitTill": null
}
```

**Failed execution:**
```json
{
  "id": 101,
  "workflowId": 50,
  "finished": true,
  "mode": "manual",
  "startedAt": "2025-12-25T10:05:00.000Z",
  "stoppedAt": "2025-12-25T10:05:02.000Z",
  "retryOf": null,
  "retrySuccessId": 105,
  "waitTill": null,
  "data": {
    "resultData": {
      "runData": {...},
      "lastNodeExecuted": "HTTP Request",
      "error": {
        "message": "Connection timeout",
        "stack": "Error: Connection timeout\n    at ..."
      }
    }
  }
}
```

**Retry execution:**
```json
{
  "id": 105,
  "workflowId": 50,
  "finished": true,
  "mode": "retry",
  "startedAt": "2025-12-25T10:10:00.000Z",
  "stoppedAt": "2025-12-25T10:10:05.000Z",
  "retryOf": 101,
  "retrySuccessId": null,
  "waitTill": null
}
```

**Waiting execution:**
```json
{
  "id": 110,
  "workflowId": 60,
  "finished": false,
  "mode": "webhook",
  "startedAt": "2025-12-25T10:15:00.000Z",
  "stoppedAt": null,
  "retryOf": null,
  "retrySuccessId": null,
  "waitTill": "2025-12-25T11:15:00.000Z"
}
```

---

## Примеры использования

### Пример 1: Мониторинг failed executions

```javascript
const axios = require('axios');

async function monitorFailedExecutions() {
  try {
    // Получить все failed executions
    const response = await axios.get('https://n8n.example.com/api/v1/executions', {
      params: {
        status: 'error',
        limit: 50
      },
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const failedExecutions = response.data.data;

    console.log(`Найдено ${failedExecutions.length} failed executions`);

    // Группировка по workflow
    const byWorkflow = failedExecutions.reduce((acc, exec) => {
      if (!acc[exec.workflowId]) {
        acc[exec.workflowId] = [];
      }
      acc[exec.workflowId].push(exec);
      return acc;
    }, {});

    // Вывести статистику
    for (const [workflowId, executions] of Object.entries(byWorkflow)) {
      console.log(`\nWorkflow ${workflowId}: ${executions.length} failures`);

      // Вывести последнюю ошибку
      const latest = executions[0];
      if (latest.data?.resultData?.error) {
        console.log(`  Последняя ошибка: ${latest.data.resultData.error.message}`);
      }
    }

    return byWorkflow;
  } catch (error) {
    console.error('Ошибка мониторинга:', error.message);
    throw error;
  }
}

// Запуск мониторинга каждые 5 минут
setInterval(monitorFailedExecutions, 5 * 60 * 1000);
```

### Пример 2: Автоматический retry failed executions

```javascript
const axios = require('axios');

async function autoRetryFailedExecutions(workflowId) {
  try {
    // 1. Получить failed executions для конкретного workflow
    const listResponse = await axios.get('https://n8n.example.com/api/v1/executions', {
      params: {
        status: 'error',
        workflowId: workflowId,
        limit: 10
      },
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const failedExecutions = listResponse.data.data;
    console.log(`Найдено ${failedExecutions.length} failed executions для workflow ${workflowId}`);

    // 2. Retry каждого failed execution
    const retryResults = [];

    for (const execution of failedExecutions) {
      // Пропустить executions, которые уже были успешно повторены
      if (execution.retrySuccessId) {
        console.log(`Execution ${execution.id} уже имеет успешный retry ${execution.retrySuccessId}, пропускаем`);
        continue;
      }

      try {
        const retryResponse = await axios.post(
          `https://n8n.example.com/api/v1/executions/${execution.id}/retry`,
          {},
          {
            headers: {
              'X-N8N-API-KEY': 'your_api_key_here',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log(`✅ Создан retry execution ${retryResponse.data.id} для execution ${execution.id}`);
        retryResults.push({
          originalId: execution.id,
          retryId: retryResponse.data.id,
          status: 'created'
        });

        // Задержка между retry для избежания перегрузки
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (retryError) {
        console.error(`❌ Ошибка retry execution ${execution.id}:`, retryError.message);
        retryResults.push({
          originalId: execution.id,
          retryId: null,
          status: 'failed',
          error: retryError.message
        });
      }
    }

    return retryResults;
  } catch (error) {
    console.error('Ошибка auto-retry:', error.message);
    throw error;
  }
}

// Пример использования
await autoRetryFailedExecutions(123);
```

### Пример 3: Очистка старых executions

```javascript
const axios = require('axios');

async function cleanupOldExecutions(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(`Очистка executions старше ${daysOld} дней (до ${cutoffDate.toISOString()})`);

    let deletedCount = 0;
    let cursor = undefined;
    let hasMore = true;

    while (hasMore) {
      // Получить executions
      const response = await axios.get('https://n8n.example.com/api/v1/executions', {
        params: {
          limit: 100,
          cursor: cursor,
          includeData: false
        },
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      const executions = response.data.data;
      cursor = response.data.nextCursor;
      hasMore = !!cursor;

      // Фильтровать старые executions
      const oldExecutions = executions.filter(exec => {
        const execDate = new Date(exec.startedAt);
        return execDate < cutoffDate;
      });

      console.log(`Найдено ${oldExecutions.length} старых executions в текущем batch`);

      // Удалить каждое старое execution
      for (const execution of oldExecutions) {
        try {
          await axios.delete(`https://n8n.example.com/api/v1/executions/${execution.id}`, {
            headers: {
              'X-N8N-API-KEY': 'your_api_key_here',
              'Accept': 'application/json'
            }
          });

          deletedCount++;

          if (deletedCount % 10 === 0) {
            console.log(`Удалено ${deletedCount} executions...`);
          }

          // Задержка для избежания перегрузки API
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (deleteError) {
          console.error(`Ошибка удаления execution ${execution.id}:`, deleteError.message);
        }
      }
    }

    console.log(`✅ Всего удалено ${deletedCount} executions`);
    return deletedCount;

  } catch (error) {
    console.error('Ошибка очистки executions:', error.message);
    throw error;
  }
}

// Пример использования
await cleanupOldExecutions(30); // Удалить executions старше 30 дней
```

---

## Дополнительные примечания

### Автоматическая очистка Executions

n8n поддерживает автоматическую очистку старых executions через environment variables:

**Настройки (Self-Hosted):**
```bash
# Включить автоматическую очистку
export EXECUTIONS_DATA_PRUNE=true

# Максимальный возраст executions в часах (168 = 7 дней)
export EXECUTIONS_DATA_MAX_AGE=168

# Максимальное количество executions для хранения
export EXECUTIONS_DATA_PRUNE_MAX_COUNT=50000
```

**Docker Compose:**
```yaml
n8n:
  environment:
    - EXECUTIONS_DATA_PRUNE=true
    - EXECUTIONS_DATA_MAX_AGE=168
    - EXECUTIONS_DATA_PRUNE_MAX_COUNT=50000
```

**Исключения из очистки:**
- Executions со статусом `new`, `running`, `waiting`
- Executions с аннотациями (annotations)

### Статусы Execution

| Статус | Описание |
|--------|----------|
| `success` | Execution успешно завершен без ошибок |
| `error` | Execution завершен с ошибкой |
| `waiting` | Execution ожидает (например, Wait node или Webhook response) |
| `new` | Execution только что создан, еще не начат |
| `running` | Execution в процессе выполнения |

### Режимы Execution (ExecutionMode)

| Режим | Описание |
|-------|----------|
| `manual` | Ручное выполнение через UI (кнопка "Execute Workflow") |
| `trigger` | Выполнение через trigger node (Schedule, Webhook, etc.) |
| `webhook` | Выполнение через webhook |
| `retry` | Повторное выполнение failed execution |
| `cli` | Выполнение через CLI |
| `error` | Выполнение через Error Trigger node |
| `integrated` | Интеграционное выполнение |
| `internal` | Внутреннее системное выполнение |

### Лучшие практики

1. **Пагинация:** Всегда используйте пагинацию при получении списков executions
2. **includeData:** Используйте `includeData=true` только когда необходимы полные данные
3. **Фильтрация:** Фильтруйте по workflowId и status для уменьшения объема данных
4. **Monitoring:** Регулярно мониторьте failed executions для выявления проблем
5. **Cleanup:** Настройте автоматическую очистку или используйте периодические задачи
6. **Retry:** Не retry executions автоматически без анализа причины ошибки
7. **Rate Limiting:** Используйте задержки между API запросами для избежания перегрузки

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Подготовлено:** James (Dev Agent) с использованием Context7 MCP Server
