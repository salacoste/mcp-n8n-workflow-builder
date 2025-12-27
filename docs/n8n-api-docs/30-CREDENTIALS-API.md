# 30-CREDENTIALS-API.md - Credentials API Endpoints

**Версия API:** v1
**Дата документации:** 2025-12-25
**Источник:** Официальная документация n8n через Context7

---

## 📋 Содержание

1. [GET /api/v1/credentials](#get-apiv1credentials) - Получить список credentials
2. [GET /api/v1/credentials/{id}](#get-apiv1credentialsid) - Получить конкретный credential
3. [POST /api/v1/credentials](#post-apiv1credentials) - Создать новый credential
4. [PUT /api/v1/credentials/{id}](#put-apiv1credentialsid) - Обновить credential
5. [DELETE /api/v1/credentials/{id}](#delete-apiv1credentialsid) - Удалить credential
6. [GET /api/v1/credentials/schema/{typeName}](#get-apiv1credentialsschemattypename) - Получить схему типа credential
7. [Структура объекта Credential](#структура-объекта-credential)
8. [Типы Credentials](#типы-credentials)
9. [Примеры использования](#примеры-использования)

---

## ⚠️ Важное примечание

**Credentials API НЕ реализован в текущей версии MCP сервера** n8n-workflow-builder. Эта документация описывает официальное n8n REST API для управления credentials и может быть использована:

- Для прямого взаимодействия с n8n API (в обход MCP сервера)
- Как справочная информация для разработчиков
- Для будущего расширения функциональности MCP сервера

Для работы с credentials через n8n UI используйте веб-интерфейс n8n.

---

## GET /api/v1/credentials

### Описание

Получить список всех credentials, доступных в n8n instance. Credentials содержат конфиденциальную информацию для аутентификации с внешними сервисами.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/credentials
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/credentials
```

### Параметры

#### Query Parameters (Параметры запроса)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `limit` | integer | Optional | Максимальное количество credentials для возврата (по умолчанию: 100) |
| `cursor` | string | Optional | Курсор для пагинации |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X GET \
  'https://n8n.example.com/api/v1/credentials' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function listCredentials() {
  try {
    const response = await axios.get('https://n8n.example.com/api/v1/credentials', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`Найдено ${response.data.data.length} credentials`);

    // Группировка по типу
    const byType = response.data.data.reduce((acc, cred) => {
      if (!acc[cred.type]) {
        acc[cred.type] = [];
      }
      acc[cred.type].push(cred);
      return acc;
    }, {});

    console.log('Credentials по типам:', Object.keys(byType));

    return response.data;
  } catch (error) {
    console.error('Ошибка получения credentials:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
await listCredentials();
```

### Ответы

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "1",
      "name": "My Google Drive",
      "type": "googleDriveOAuth2Api",
      "nodesAccess": [
        {
          "nodeType": "n8n-nodes-base.googleDrive",
          "date": "2025-12-25T10:00:00.000Z"
        }
      ],
      "createdAt": "2025-12-20T08:30:00.000Z",
      "updatedAt": "2025-12-20T08:30:00.000Z"
    },
    {
      "id": "2",
      "name": "Slack Workspace",
      "type": "slackApi",
      "nodesAccess": [
        {
          "nodeType": "n8n-nodes-base.slack",
          "date": "2025-12-22T14:15:00.000Z"
        }
      ],
      "createdAt": "2025-12-22T14:15:00.000Z",
      "updatedAt": "2025-12-22T14:15:00.000Z"
    }
  ],
  "nextCursor": null
}
```

**Примечания:**
- Поле `data` (секретные данные) **НЕ возвращается** в списке по соображениям безопасности
- Возвращается только метаинформация: id, name, type, nodesAccess, timestamps

#### Error Responses

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Безопасность:** Секретные данные (API keys, tokens, passwords) никогда не возвращаются в списке
- **nodesAccess:** Показывает какие типы nodes имеют доступ к данному credential
- **Фильтрация:** В текущей версии API фильтрация по типу не поддерживается

---

## GET /api/v1/credentials/{id}

### Описание

Получить детальную информацию о конкретном credential по ID. **Внимание:** секретные данные могут быть возвращены в зашифрованном виде или не возвращены вообще.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/credentials/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/credentials/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Required | ID credential для получения |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X GET \
  'https://n8n.example.com/api/v1/credentials/1' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function getCredential(credentialId) {
  try {
    const response = await axios.get(`https://n8n.example.com/api/v1/credentials/${credentialId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const credential = response.data;
    console.log(`Credential: ${credential.name}`);
    console.log(`Type: ${credential.type}`);
    console.log(`Nodes with access: ${credential.nodesAccess.map(n => n.nodeType).join(', ')}`);

    return credential;
  } catch (error) {
    console.error('Ошибка получения credential:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
await getCredential('1');
```

### Ответы

#### Success Response (200 OK)

```json
{
  "id": "1",
  "name": "My Google Drive",
  "type": "googleDriveOAuth2Api",
  "data": {
    "oauthTokenData": {
      "access_token": "***encrypted***",
      "refresh_token": "***encrypted***"
    }
  },
  "nodesAccess": [
    {
      "nodeType": "n8n-nodes-base.googleDrive",
      "date": "2025-12-25T10:00:00.000Z"
    }
  ],
  "createdAt": "2025-12-20T08:30:00.000Z",
  "updatedAt": "2025-12-20T08:30:00.000Z"
}
```

**Примечания:**
- Секретные данные могут быть зашифрованы или скрыты
- Структура поля `data` зависит от типа credential

#### Error Responses

**404 Not Found** - Credential не найден
```json
{
  "error": "Credential with ID 1 not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Безопасность:** Секретные данные зашифрованы в базе данных n8n
- **Доступ:** API ключ должен иметь права на чтение credentials

---

## POST /api/v1/credentials

### Описание

Создать новый credential для аутентификации с внешним сервисом.

### HTTP Метод

`POST`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/credentials
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/credentials
```

### Параметры

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Content-Type` | string | Required | Должен быть `application/json` |
| `Accept` | string | Required | Должен быть `application/json` |

#### Request Body (Тело запроса)

| Поле | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `name` | string | Required | Название credential (отображается в UI) |
| `type` | string | Required | Тип credential (например, `googleDriveOAuth2Api`, `slackApi`) |
| `data` | object | Required | Секретные данные для аутентификации (структура зависит от типа) |
| `nodesAccess` | array | Optional | Список типов nodes, которым разрешен доступ к credential |

### Примеры

#### Пример запроса (curl) - API Key

```bash
curl -X POST \
  'https://n8n.example.com/api/v1/credentials' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Airtable Production",
    "type": "airtableApi",
    "nodesAccess": [
      {
        "nodeType": "n8n-nodes-base.airtable"
      }
    ],
    "data": {
      "apiKey": "keyABC123XYZ789"
    }
  }'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function createCredential(credentialData) {
  try {
    const response = await axios.post(
      'https://n8n.example.com/api/v1/credentials',
      {
        name: credentialData.name,
        type: credentialData.type,
        nodesAccess: credentialData.nodesAccess || [],
        data: credentialData.data
      },
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const newCredential = response.data;
    console.log(`✅ Создан credential с ID: ${newCredential.id}`);
    console.log(`   Название: ${newCredential.name}`);
    console.log(`   Тип: ${newCredential.type}`);

    return newCredential;
  } catch (error) {
    console.error('Ошибка создания credential:', error.response?.data || error.message);
    throw error;
  }
}

// Примеры использования для различных типов credentials

// 1. Airtable API Key
await createCredential({
  name: 'Airtable Production',
  type: 'airtableApi',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.airtable' }],
  data: {
    apiKey: 'keyABC123XYZ789'
  }
});

// 2. Slack API Token
await createCredential({
  name: 'Slack Workspace',
  type: 'slackApi',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.slack' }],
  data: {
    accessToken: 'xoxb-1234567890-1234567890-ABC123XYZ789'
  }
});

// 3. GitHub OAuth2
await createCredential({
  name: 'GitHub Account',
  type: 'githubOAuth2Api',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.github' }],
  data: {
    oauthTokenData: {
      access_token: 'gho_ABC123XYZ789',
      token_type: 'bearer',
      scope: 'repo,user'
    }
  }
});
```

#### Пример тела запроса (Basic Auth)

```json
{
  "name": "HTTP Basic Auth",
  "type": "httpBasicAuth",
  "nodesAccess": [
    {
      "nodeType": "n8n-nodes-base.httpRequest"
    }
  ],
  "data": {
    "user": "username",
    "password": "secretpassword"
  }
}
```

### Ответы

#### Success Response (201 Created)

```json
{
  "id": "29",
  "name": "Airtable Production",
  "type": "airtableApi",
  "data": {
    "apiKey": "keyABC123XYZ789"
  },
  "nodesAccess": [
    {
      "nodeType": "n8n-nodes-base.airtable",
      "date": "2025-12-25T10:30:00.000Z"
    }
  ],
  "createdAt": "2025-12-25T10:30:00.000Z",
  "updatedAt": "2025-12-25T10:30:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Неверные данные
```json
{
  "error": "Invalid credential type or missing required fields"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

**409 Conflict** - Credential с таким именем уже существует
```json
{
  "error": "Credential with name 'Airtable Production' already exists"
}
```

### Примечания

- **Типы credentials:** Доступные типы зависят от установленных nodes в n8n instance
- **Структура data:** Каждый тип credential имеет свою структуру поля `data`
- **nodesAccess:** Если не указан, credential будет доступен всем nodes данного типа
- **Безопасность:** Данные автоматически шифруются n8n перед сохранением в базу данных

---

## PUT /api/v1/credentials/{id}

### Описание

Обновить существующий credential. Позволяет изменить название, тип, секретные данные и права доступа.

### HTTP Метод

`PUT`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/credentials/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/credentials/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Required | ID credential для обновления |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Content-Type` | string | Required | Должен быть `application/json` |
| `Accept` | string | Required | Должен быть `application/json` |

#### Request Body (Тело запроса)

| Поле | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `name` | string | Optional | Новое название credential |
| `type` | string | Optional | Новый тип credential (осторожно: может сломать существующие workflows) |
| `data` | object | Optional | Новые секретные данные |
| `nodesAccess` | array | Optional | Обновленный список доступа nodes |

### Примеры

#### Пример запроса (curl)

```bash
curl -X PUT \
  'https://n8n.example.com/api/v1/credentials/29' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Airtable Production Updated",
    "data": {
      "apiKey": "keyNEW456DEF789"
    }
  }'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function updateCredential(credentialId, updates) {
  try {
    const response = await axios.put(
      `https://n8n.example.com/api/v1/credentials/${credentialId}`,
      updates,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log(`✅ Credential ${credentialId} обновлен`);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления credential:', error.response?.data || error.message);
    throw error;
  }
}

// Примеры использования

// Обновить только API key
await updateCredential('29', {
  data: {
    apiKey: 'keyNEW456DEF789'
  }
});

// Обновить название и данные
await updateCredential('29', {
  name: 'Airtable Production Updated',
  data: {
    apiKey: 'keyNEW456DEF789'
  }
});

// Обновить права доступа
await updateCredential('29', {
  nodesAccess: [
    { nodeType: 'n8n-nodes-base.airtable' },
    { nodeType: 'n8n-nodes-base.httpRequest' }
  ]
});
```

### Ответы

#### Success Response (200 OK)

```json
{
  "id": "29",
  "name": "Airtable Production Updated",
  "type": "airtableApi",
  "data": {
    "apiKey": "keyNEW456DEF789"
  },
  "nodesAccess": [
    {
      "nodeType": "n8n-nodes-base.airtable",
      "date": "2025-12-25T10:00:00.000Z"
    }
  ],
  "createdAt": "2025-12-25T10:00:00.000Z",
  "updatedAt": "2025-12-25T11:00:00.000Z"
}
```

#### Error Responses

**404 Not Found** - Credential не найден
```json
{
  "error": "Credential with ID 29 not found"
}
```

**400 Bad Request** - Неверные данные
```json
{
  "error": "Invalid credential data"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Частичное обновление:** Можно обновить только нужные поля, остальные останутся без изменений
- **Изменение типа:** Изменение `type` может сломать workflows, использующие этот credential
- **Active workflows:** Обновление credential, используемого в активных workflows, может повлиять на их выполнение
- **updatedAt:** Автоматически обновляется при любом изменении

---

## DELETE /api/v1/credentials/{id}

### Описание

Удалить credential из n8n. **Внимание:** эта операция необратима и может сломать workflows, использующие данный credential.

### HTTP Метод

`DELETE`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/credentials/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/credentials/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Required | ID credential для удаления |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X DELETE \
  'https://n8n.example.com/api/v1/credentials/29' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function deleteCredential(credentialId) {
  try {
    const response = await axios.delete(`https://n8n.example.com/api/v1/credentials/${credentialId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`✅ Credential ${credentialId} удален`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления credential:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования с проверкой зависимостей
async function safeDeleteCredential(credentialId) {
  try {
    // 1. Получить список workflows
    const workflowsResponse = await axios.get('https://n8n.example.com/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    // 2. Проверить использование credential в workflows
    const workflows = workflowsResponse.data.data;
    const usingWorkflows = [];

    for (const workflow of workflows) {
      // Получить полные данные workflow
      const workflowData = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      // Проверить nodes на использование credential
      const usesCredential = workflowData.data.nodes.some(node =>
        node.credentials &&
        Object.values(node.credentials).some(cred => cred.id === credentialId)
      );

      if (usesCredential) {
        usingWorkflows.push(workflow.name);
      }
    }

    // 3. Если credential используется, вывести предупреждение
    if (usingWorkflows.length > 0) {
      console.log(`⚠️  Credential используется в ${usingWorkflows.length} workflow(s):`);
      usingWorkflows.forEach(name => console.log(`   - ${name}`));
      console.log('Удаление credential сломает эти workflows!');
      return null;
    }

    // 4. Если не используется, безопасно удалить
    await deleteCredential(credentialId);
    return true;

  } catch (error) {
    console.error('Ошибка проверки зависимостей:', error.message);
    throw error;
  }
}

// Использование
await safeDeleteCredential('29');
```

### Ответы

#### Success Response (204 No Content)

**Пустой ответ** - credential успешно удален

```
(пустое тело ответа)
```

#### Error Responses

**404 Not Found** - Credential не найден
```json
{
  "error": "Credential with ID 29 not found"
}
```

**409 Conflict** - Credential используется в workflows
```json
{
  "error": "Cannot delete credential that is being used in workflows",
  "workflows": ["Workflow 1", "Workflow 2"]
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Необратимость:** Удаление credential необратимо
- **Зависимости:** Рекомендуется проверить использование credential в workflows перед удалением
- **Active workflows:** Удаление credential, используемого в активных workflows, приведет к их сбою
- **Безопасность:** Удаленные credentials полностью стираются из базы данных

---

## GET /api/v1/credentials/schema/{typeName}

### Описание

Получить JSON schema для определенного типа credential. Schema описывает структуру данных, необходимых для создания credential данного типа.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/credentials/schema/{typeName}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/credentials/schema/{typeName}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `typeName` | string | Required | Название типа credential (например, `googleDriveOAuth2Api`, `slackApi`) |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X GET \
  'https://n8n.example.com/api/v1/credentials/schema/airtableApi' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function getCredentialSchema(credentialType) {
  try {
    const response = await axios.get(
      `https://n8n.example.com/api/v1/credentials/schema/${credentialType}`,
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      }
    );

    const schema = response.data;
    console.log(`Schema для ${credentialType}:`);
    console.log(`Поля:`, schema.properties.map(p => p.name).join(', '));

    return schema;
  } catch (error) {
    console.error('Ошибка получения schema:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
const airtableSchema = await getCredentialSchema('airtableApi');
```

### Ответы

#### Success Response (200 OK)

**Пример для Airtable API:**
```json
{
  "type": "airtableApi",
  "displayName": "Airtable API",
  "documentationUrl": "https://airtable.com/api",
  "properties": [
    {
      "displayName": "API Key",
      "name": "apiKey",
      "type": "string",
      "typeOptions": {
        "password": true
      },
      "default": "",
      "required": true,
      "description": "The API key from your Airtable account"
    }
  ]
}
```

**Пример для HTTP Basic Auth:**
```json
{
  "type": "httpBasicAuth",
  "displayName": "Basic Auth",
  "properties": [
    {
      "displayName": "User",
      "name": "user",
      "type": "string",
      "default": "",
      "required": true
    },
    {
      "displayName": "Password",
      "name": "password",
      "type": "string",
      "typeOptions": {
        "password": true
      },
      "default": "",
      "required": true
    }
  ]
}
```

#### Error Responses

**404 Not Found** - Тип credential не найден
```json
{
  "error": "Credential type 'unknownType' not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Типы:** Доступные типы зависят от установленных nodes
- **Валидация:** Schema используется для валидации данных при создании credential
- **Документация:** Schema включает ссылки на официальную документацию сервиса

---

## Структура объекта Credential

### Полная структура Credential (TypeScript Interface)

```typescript
interface Credential {
  // Основные поля
  id: string;                           // Уникальный ID credential
  name: string;                         // Название credential (отображается в UI)
  type: string;                         // Тип credential (определяет структуру data)

  // Секретные данные
  data: {
    [key: string]: any;                 // Структура зависит от типа credential
  };

  // Права доступа
  nodesAccess: Array<{
    nodeType: string;                   // Тип node, которому разрешен доступ
    date: string;                       // ISO 8601 timestamp когда доступ был предоставлен
  }>;

  // Временные метки
  createdAt: string;                    // ISO 8601 timestamp создания
  updatedAt: string;                    // ISO 8601 timestamp последнего обновления
}

// Примеры структуры data для различных типов

// API Key Credential
interface ApiKeyCredentialData {
  apiKey: string;
}

// Basic Auth Credential
interface BasicAuthCredentialData {
  user: string;
  password: string;
}

// OAuth2 Credential
interface OAuth2CredentialData {
  oauthTokenData: {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in?: number;
    scope?: string;
  };
}

// Header Auth Credential
interface HeaderAuthCredentialData {
  name: string;                         // Название заголовка (например, "Authorization")
  value: string;                        // Значение заголовка
}

// Query Auth Credential
interface QueryAuthCredentialData {
  name: string;                         // Название query параметра
  value: string;                        // Значение параметра
}
```

---

## Типы Credentials

### Популярные типы credentials в n8n

#### API Key Based

| Тип | Сервис | Поля data |
|-----|---------|-----------|
| `airtableApi` | Airtable | `apiKey` |
| `slackApi` | Slack | `accessToken` |
| `githubApi` | GitHub | `accessToken` |
| `notionApi` | Notion | `apiKey` |

#### OAuth2 Based

| Тип | Сервис | Поля data |
|-----|---------|-----------|
| `googleDriveOAuth2Api` | Google Drive | `oauthTokenData` |
| `githubOAuth2Api` | GitHub | `oauthTokenData` |
| `slackOAuth2Api` | Slack | `oauthTokenData` |

#### Basic Auth

| Тип | Сервис | Поля data |
|-----|---------|-----------|
| `httpBasicAuth` | Generic HTTP | `user`, `password` |

#### Custom Auth

| Тип | Сервис | Поля data |
|-----|---------|-----------|
| `httpHeaderAuth` | Generic HTTP | `name`, `value` |
| `httpQueryAuth` | Generic HTTP | `name`, `value` |

### Получение списка доступных типов

```javascript
// Получить schema всех доступных типов credentials
async function getAllCredentialTypes() {
  // n8n не предоставляет endpoint для списка всех типов
  // Но можно получить типы из установленных nodes

  // Известные типы можно получить из документации node
  const commonTypes = [
    'airtableApi',
    'slackApi',
    'githubApi',
    'googleDriveOAuth2Api',
    'httpBasicAuth',
    'httpHeaderAuth',
    'httpQueryAuth',
    'notionApi'
  ];

  return commonTypes;
}
```

---

## Примеры использования

### Пример 1: Создание credentials для различных сервисов

```javascript
const axios = require('axios');

const N8N_API_KEY = 'your_api_key_here';
const N8N_HOST = 'https://n8n.example.com';

async function createCredential(credentialData) {
  const response = await axios.post(
    `${N8N_HOST}/api/v1/credentials`,
    credentialData,
    {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

// 1. Создать Airtable credential
const airtableCred = await createCredential({
  name: 'Airtable Production',
  type: 'airtableApi',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.airtable' }],
  data: {
    apiKey: 'keyABC123XYZ789'
  }
});
console.log('Airtable credential ID:', airtableCred.id);

// 2. Создать Slack credential
const slackCred = await createCredential({
  name: 'Slack Company Workspace',
  type: 'slackApi',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.slack' }],
  data: {
    accessToken: 'xoxb-1234567890-1234567890-ABC123XYZ789'
  }
});
console.log('Slack credential ID:', slackCred.id);

// 3. Создать HTTP Basic Auth credential
const httpBasicCred = await createCredential({
  name: 'Internal API Basic Auth',
  type: 'httpBasicAuth',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.httpRequest' }],
  data: {
    user: 'api_user',
    password: 'secret_password_123'
  }
});
console.log('HTTP Basic Auth credential ID:', httpBasicCred.id);

// 4. Создать HTTP Header Auth credential
const httpHeaderCred = await createCredential({
  name: 'Custom API Token',
  type: 'httpHeaderAuth',
  nodesAccess: [{ nodeType: 'n8n-nodes-base.httpRequest' }],
  data: {
    name: 'X-API-Token',
    value: 'custom_token_ABC123'
  }
});
console.log('HTTP Header Auth credential ID:', httpHeaderCred.id);
```

### Пример 2: Audit credentials - проверка безопасности

```javascript
const axios = require('axios');

async function auditCredentials() {
  try {
    // 1. Получить все credentials
    const credentialsResponse = await axios.get('https://n8n.example.com/api/v1/credentials', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const credentials = credentialsResponse.data.data;
    console.log(`\n📊 Audit Report: ${credentials.length} credentials найдено\n`);

    // 2. Группировка по типам
    const byType = credentials.reduce((acc, cred) => {
      if (!acc[cred.type]) {
        acc[cred.type] = [];
      }
      acc[cred.type].push(cred);
      return acc;
    }, {});

    console.log('Credentials по типам:');
    for (const [type, creds] of Object.entries(byType)) {
      console.log(`  ${type}: ${creds.length}`);
    }

    // 3. Проверка старых credentials
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const oldCredentials = credentials.filter(cred =>
      new Date(cred.updatedAt) < oneYearAgo
    );

    if (oldCredentials.length > 0) {
      console.log(`\n⚠️  ${oldCredentials.length} credentials не обновлялись больше года:`);
      oldCredentials.forEach(cred => {
        console.log(`  - ${cred.name} (${cred.type}) - последнее обновление: ${cred.updatedAt}`);
      });
    }

    // 4. Проверка credentials без ограничений доступа
    const unrestrictedCredentials = credentials.filter(cred =>
      !cred.nodesAccess || cred.nodesAccess.length === 0
    );

    if (unrestrictedCredentials.length > 0) {
      console.log(`\n⚠️  ${unrestrictedCredentials.length} credentials без ограничений доступа:`);
      unrestrictedCredentials.forEach(cred => {
        console.log(`  - ${cred.name} (${cred.type})`);
      });
    }

    // 5. Получить workflows для проверки использования
    const workflowsResponse = await axios.get('https://n8n.example.com/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const workflows = workflowsResponse.data.data;

    // 6. Найти неиспользуемые credentials
    const credentialUsage = new Map(credentials.map(c => [c.id, 0]));

    for (const workflow of workflows) {
      const workflowDetail = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      workflowDetail.data.nodes.forEach(node => {
        if (node.credentials) {
          Object.values(node.credentials).forEach(cred => {
            if (credentialUsage.has(cred.id)) {
              credentialUsage.set(cred.id, credentialUsage.get(cred.id) + 1);
            }
          });
        }
      });
    }

    const unusedCredentials = credentials.filter(cred => credentialUsage.get(cred.id) === 0);

    if (unusedCredentials.length > 0) {
      console.log(`\n💡 ${unusedCredentials.length} неиспользуемых credentials найдено:`);
      unusedCredentials.forEach(cred => {
        console.log(`  - ${cred.name} (${cred.type})`);
      });
      console.log('   Рекомендация: рассмотрите возможность удаления');
    }

    return {
      total: credentials.length,
      byType,
      old: oldCredentials,
      unrestricted: unrestrictedCredentials,
      unused: unusedCredentials
    };

  } catch (error) {
    console.error('Ошибка audit:', error.message);
    throw error;
  }
}

// Запуск audit
await auditCredentials();
```

### Пример 3: Rotation credentials - ротация ключей

```javascript
const axios = require('axios');

async function rotateApiKey(credentialId, newApiKey) {
  try {
    console.log(`🔄 Начинаем ротацию credential ${credentialId}...`);

    // 1. Получить текущий credential
    const currentCred = await axios.get(`https://n8n.example.com/api/v1/credentials/${credentialId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`   Текущий credential: ${currentCred.data.name} (${currentCred.data.type})`);

    // 2. Найти все workflows, использующие этот credential
    const workflowsResponse = await axios.get('https://n8n.example.com/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const affectedWorkflows = [];
    for (const workflow of workflowsResponse.data.data) {
      const workflowDetail = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      const usesCredential = workflowDetail.data.nodes.some(node =>
        node.credentials &&
        Object.values(node.credentials).some(cred => cred.id === credentialId)
      );

      if (usesCredential) {
        affectedWorkflows.push({
          id: workflow.id,
          name: workflow.name,
          active: workflow.active
        });
      }
    }

    console.log(`   Найдено ${affectedWorkflows.length} workflows, использующих credential`);

    // 3. Деактивировать активные workflows
    const activeWorkflows = affectedWorkflows.filter(w => w.active);
    for (const workflow of activeWorkflows) {
      await axios.put(
        `https://n8n.example.com/api/v1/workflows/${workflow.id}/deactivate`,
        {},
        {
          headers: {
            'X-N8N-API-KEY': 'your_api_key_here',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`   ⏸️  Деактивирован workflow: ${workflow.name}`);
    }

    // 4. Обновить credential с новым API key
    const updatedCred = await axios.put(
      `https://n8n.example.com/api/v1/credentials/${credentialId}`,
      {
        data: {
          apiKey: newApiKey
        }
      },
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log(`   ✅ Credential обновлен с новым API key`);

    // 5. Реактивировать workflows
    for (const workflow of activeWorkflows) {
      await axios.put(
        `https://n8n.example.com/api/v1/workflows/${workflow.id}/activate`,
        {},
        {
          headers: {
            'X-N8N-API-KEY': 'your_api_key_here',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`   ▶️  Реактивирован workflow: ${workflow.name}`);
    }

    console.log(`\n✅ Ротация завершена успешно!`);
    console.log(`   Обновлено workflows: ${affectedWorkflows.length}`);
    console.log(`   Реактивировано workflows: ${activeWorkflows.length}`);

    return {
      credential: updatedCred.data,
      affectedWorkflows: affectedWorkflows.length,
      reactivated: activeWorkflows.length
    };

  } catch (error) {
    console.error('❌ Ошибка ротации credential:', error.message);
    throw error;
  }
}

// Пример использования
await rotateApiKey('29', 'keyNEW789XYZ456');
```

---

## Лучшие практики

### 1. Безопасность

- **Никогда не логируйте** секретные данные credentials
- **Используйте environment variables** для хранения API keys в коде
- **Регулярно ротируйте** API keys и tokens
- **Ограничивайте доступ** через поле `nodesAccess`
- **Удаляйте неиспользуемые** credentials

### 2. Управление

- **Именование:** Используйте понятные имена с указанием среды (`Slack Production`, `GitHub Staging`)
- **Audit:** Регулярно проверяйте список credentials
- **Документация:** Ведите учет где какой credential используется
- **Backup:** Храните копии важных credentials в безопасном месте

### 3. Организация

- **По среде:** Разделяйте credentials для production, staging, development
- **По проекту:** Группируйте credentials по проектам/командам
- **Централизация:** Избегайте дублирования одинаковых credentials

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Подготовлено:** James (Dev Agent) с использованием Context7 MCP Server

**Примечание:** Credentials API описан согласно официальной документации n8n, но **не реализован** в текущей версии MCP сервера n8n-workflow-builder.
