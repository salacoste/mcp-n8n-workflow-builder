# 40-TAGS-API.md - Tags API Endpoints

**Версия API:** v1
**Дата документации:** 2025-12-25
**Источник:** Официальная документация n8n + анализ кода MCP сервера

---

## 📋 Содержание

1. [GET /api/v1/tags](#get-apiv1tags) - Получить список tags
2. [GET /api/v1/tags/{id}](#get-apiv1tagsid) - Получить конкретный tag
3. [POST /api/v1/tags](#post-apiv1tags) - Создать новый tag
4. [PUT /api/v1/tags/{id}](#put-apiv1tagsid) - Обновить tag
5. [DELETE /api/v1/tags/{id}](#delete-apiv1tagsid) - Удалить tag
6. [Структура объекта Tag](#структура-объекта-tag)
7. [Примеры использования](#примеры-использования)

---

## 🎯 Обзор Tags API

Tags (теги) в n8n используются для организации и классификации workflows. Они позволяют:
- Группировать workflows по проектам, командам или функциональности
- Фильтровать workflows в UI и через API
- Управлять большим количеством workflows эффективно

**Поддержка в MCP сервере:** ✅ Tags API **полностью реализован** в MCP сервере n8n-workflow-builder.

---

## GET /api/v1/tags

### Описание

Получить список всех tags из n8n instance с поддержкой пагинации.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/tags
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/tags
```

### Параметры

#### Query Parameters (Параметры запроса)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `limit` | integer | Optional | Максимальное количество tags для возврата (по умолчанию: 100, максимум: 250) |
| `cursor` | string | Optional | Курсор для пагинации (получается из предыдущего ответа) |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X GET \
  'https://n8n.example.com/api/v1/tags' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

**С пагинацией:**
```bash
curl -X GET \
  'https://n8n.example.com/api/v1/tags?limit=50&cursor=MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function listTags(limit = 100, cursor = null) {
  try {
    const params = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get('https://n8n.example.com/api/v1/tags', {
      params,
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`Получено ${response.data.data.length} tags`);

    if (response.data.nextCursor) {
      console.log('Есть следующая страница');
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка получения tags:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
const tags = await listTags();
tags.data.forEach(tag => {
  console.log(`- ${tag.name} (ID: ${tag.id})`);
});
```

#### Пример получения всех tags с пагинацией

```javascript
async function getAllTags() {
  const allTags = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const response = await listTags(100, cursor);
    allTags.push(...response.data);

    cursor = response.nextCursor;
    hasMore = !!cursor;
  }

  console.log(`Всего получено ${allTags.length} tags`);
  return allTags;
}

// Использование
const allTags = await getAllTags();
```

### Ответы

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "1",
      "name": "Production",
      "createdAt": "2025-12-20T08:00:00.000Z",
      "updatedAt": "2025-12-20T08:00:00.000Z"
    },
    {
      "id": "2",
      "name": "Development",
      "createdAt": "2025-12-21T10:30:00.000Z",
      "updatedAt": "2025-12-21T10:30:00.000Z"
    },
    {
      "id": "3",
      "name": "Marketing",
      "createdAt": "2025-12-22T14:15:00.000Z",
      "updatedAt": "2025-12-22T14:15:00.000Z"
    }
  ],
  "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| `data` | array | Массив объектов Tag (см. [Структура объекта Tag](#структура-объекта-tag)) |
| `nextCursor` | string | Курсор для получения следующей страницы (отсутствует на последней странице) |

#### Error Responses

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

- **Сортировка:** Tags возвращаются отсортированными по дате создания (новые первыми)
- **Пагинация:** При большом количестве tags используйте параметр `cursor` для навигации
- **Лимиты:** По умолчанию возвращается до 100 tags, максимум 250 за один запрос

---

## GET /api/v1/tags/{id}

### Описание

Получить детальную информацию о конкретном tag по его ID.

### HTTP Метод

`GET`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/tags/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/tags/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Required | ID tag для получения |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X GET \
  'https://n8n.example.com/api/v1/tags/1' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function getTag(tagId) {
  try {
    const response = await axios.get(`https://n8n.example.com/api/v1/tags/${tagId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const tag = response.data;
    console.log(`Tag: ${tag.name}`);
    console.log(`ID: ${tag.id}`);
    console.log(`Создан: ${tag.createdAt}`);
    console.log(`Обновлен: ${tag.updatedAt}`);

    return tag;
  } catch (error) {
    console.error('Ошибка получения tag:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования
const tag = await getTag('1');
```

### Ответы

#### Success Response (200 OK)

```json
{
  "id": "1",
  "name": "Production",
  "createdAt": "2025-12-20T08:00:00.000Z",
  "updatedAt": "2025-12-20T08:00:00.000Z"
}
```

#### Error Responses

**404 Not Found** - Tag не найден
```json
{
  "error": "Tag with ID 1 not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Использование:** Полезно для проверки существования tag перед операциями
- **Workflows:** Этот endpoint не возвращает список workflows с данным tag

---

## POST /api/v1/tags

### Описание

Создать новый tag для организации workflows.

### HTTP Метод

`POST`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/tags
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/tags
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
| `name` | string | Required | Название tag (должно быть уникальным) |

### Примеры

#### Пример запроса (curl)

```bash
curl -X POST \
  'https://n8n.example.com/api/v1/tags' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Production"
  }'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function createTag(tagName) {
  try {
    const response = await axios.post(
      'https://n8n.example.com/api/v1/tags',
      {
        name: tagName
      },
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const newTag = response.data;
    console.log(`✅ Создан tag с ID: ${newTag.id}`);
    console.log(`   Название: ${newTag.name}`);

    return newTag;
  } catch (error) {
    console.error('Ошибка создания tag:', error.response?.data || error.message);
    throw error;
  }
}

// Примеры использования
await createTag('Production');
await createTag('Development');
await createTag('Marketing');
await createTag('Customer Support');
```

#### Пример тела запроса

```json
{
  "name": "Production"
}
```

### Ответы

#### Success Response (201 Created)

```json
{
  "id": "10",
  "name": "Production",
  "createdAt": "2025-12-25T10:30:00.000Z",
  "updatedAt": "2025-12-25T10:30:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Неверные данные или пустое имя
```json
{
  "error": "Tag name is required"
}
```

**409 Conflict** - Tag с таким именем уже существует
```json
{
  "error": "Tag with name 'Production' already exists"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Уникальность:** Имена tags должны быть уникальными в рамках n8n instance
- **Case sensitivity:** Имена tags чувствительны к регистру ("Production" ≠ "production")
- **Длина:** Рекомендуется использовать короткие, понятные имена (до 50 символов)
- **Спецсимволы:** Разрешены пробелы и специальные символы в именах

---

## PUT /api/v1/tags/{id}

### Описание

Обновить существующий tag. В настоящее время можно обновить только название tag.

### HTTP Метод

`PUT`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/tags/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/tags/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Required | ID tag для обновления |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Content-Type` | string | Required | Должен быть `application/json` |
| `Accept` | string | Required | Должен быть `application/json` |

#### Request Body (Тело запроса)

| Поле | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `name` | string | Required | Новое название tag |

### Примеры

#### Пример запроса (curl)

```bash
curl -X PUT \
  'https://n8n.example.com/api/v1/tags/10' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Production v2"
  }'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function updateTag(tagId, newName) {
  try {
    const response = await axios.put(
      `https://n8n.example.com/api/v1/tags/${tagId}`,
      {
        name: newName
      },
      {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const updatedTag = response.data;
    console.log(`✅ Tag ${tagId} обновлен`);
    console.log(`   Новое название: ${updatedTag.name}`);

    return updatedTag;
  } catch (error) {
    console.error('Ошибка обновления tag:', error.response?.data || error.message);
    throw error;
  }
}

// Примеры использования
await updateTag('10', 'Production v2');
await updateTag('11', 'Staging Environment');
```

#### Пример тела запроса

```json
{
  "name": "Production v2"
}
```

### Ответы

#### Success Response (200 OK)

```json
{
  "id": "10",
  "name": "Production v2",
  "createdAt": "2025-12-25T10:30:00.000Z",
  "updatedAt": "2025-12-25T11:00:00.000Z"
}
```

#### Error Responses

**404 Not Found** - Tag не найден
```json
{
  "error": "Tag with ID 10 not found"
}
```

**400 Bad Request** - Неверные данные или пустое имя
```json
{
  "error": "Tag name is required"
}
```

**409 Conflict** - Tag с новым именем уже существует
```json
{
  "error": "Tag with name 'Production v2' already exists"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **updatedAt:** Автоматически обновляется при изменении
- **Active workflows:** Обновление tag автоматически обновляет все workflows, использующие этот tag
- **UI синхронизация:** Изменения мгновенно отражаются в n8n UI

---

## DELETE /api/v1/tags/{id}

### Описание

Удалить tag. **Внимание:** Удаление tag не удаляет workflows, помеченные этим tag - tag просто удаляется из workflows.

### HTTP Метод

`DELETE`

### Endpoint

**Self-Hosted:**
```
<N8N_HOST>:<N8N_PORT>/<N8N_PATH>/api/v1/tags/{id}
```

**n8n Cloud:**
```
<instance>.app.n8n.cloud/api/v1/tags/{id}
```

### Параметры

#### Path Parameters (Параметры пути)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `id` | string | Required | ID tag для удаления |

#### Request Headers (Заголовки запроса)

| Заголовок | Тип | Обязательный | Описание |
|-----------|-----|--------------|----------|
| `X-N8N-API-KEY` | string | Required | API ключ для аутентификации |
| `Accept` | string | Required | Должен быть `application/json` |

### Примеры

#### Пример запроса (curl)

```bash
curl -X DELETE \
  'https://n8n.example.com/api/v1/tags/10' \
  -H 'X-N8N-API-KEY: your_api_key_here' \
  -H 'Accept: application/json'
```

#### Пример запроса (JavaScript/Node.js)

```javascript
const axios = require('axios');

async function deleteTag(tagId) {
  try {
    const response = await axios.delete(`https://n8n.example.com/api/v1/tags/${tagId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`✅ Tag ${tagId} удален`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления tag:', error.response?.data || error.message);
    throw error;
  }
}

// Пример использования с проверкой
async function safeDeleteTag(tagId) {
  try {
    // 1. Получить информацию о tag
    const tag = await axios.get(`https://n8n.example.com/api/v1/tags/${tagId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    console.log(`Удаление tag: ${tag.data.name}`);

    // 2. Получить список workflows с этим tag
    const workflows = await axios.get(`https://n8n.example.com/api/v1/workflows?tags=${tagId}`, {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    if (workflows.data.data.length > 0) {
      console.log(`⚠️  Tag используется в ${workflows.data.data.length} workflow(s):`);
      workflows.data.data.forEach(workflow => {
        console.log(`   - ${workflow.name}`);
      });
      console.log('Tag будет удален из этих workflows');
    }

    // 3. Удалить tag
    await deleteTag(tagId);
    console.log('✅ Tag успешно удален');

  } catch (error) {
    console.error('Ошибка безопасного удаления:', error.message);
    throw error;
  }
}

// Использование
await safeDeleteTag('10');
```

### Ответы

#### Success Response (204 No Content)

**Пустой ответ** - tag успешно удален

```
(пустое тело ответа)
```

#### Error Responses

**404 Not Found** - Tag не найден
```json
{
  "error": "Tag with ID 10 not found"
}
```

**401 Unauthorized** - Неверный или отсутствующий API ключ
```json
{
  "error": "Unauthorized"
}
```

### Примечания

- **Workflows:** Удаление tag не удаляет workflows - tag просто удаляется из их списка tags
- **Необратимость:** Удаление tag необратимо
- **Cascading:** Tag удаляется из всех workflows автоматически

---

## Структура объекта Tag

### Полная структура Tag (TypeScript Interface)

```typescript
interface Tag {
  // Основные поля
  id: string;                           // Уникальный ID tag
  name: string;                         // Название tag (уникальное)

  // Временные метки
  createdAt: string;                    // ISO 8601 timestamp создания
  updatedAt: string;                    // ISO 8601 timestamp последнего обновления
}

// Response при создании/получении tag
interface TagResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Response при получении списка tags
interface TagListResponse {
  data: TagResponse[];                  // Массив tags
  nextCursor?: string;                  // Курсор для следующей страницы (optional)
}
```

### Примеры Tag объектов

**Простой tag:**
```json
{
  "id": "1",
  "name": "Production",
  "createdAt": "2025-12-20T08:00:00.000Z",
  "updatedAt": "2025-12-20T08:00:00.000Z"
}
```

**Tag после обновления:**
```json
{
  "id": "1",
  "name": "Production v2",
  "createdAt": "2025-12-20T08:00:00.000Z",
  "updatedAt": "2025-12-25T11:00:00.000Z"
}
```

---

## Примеры использования

### Пример 1: Создание стандартных tags для организации

```javascript
const axios = require('axios');

const N8N_API_KEY = 'your_api_key_here';
const N8N_HOST = 'https://n8n.example.com';

async function createTag(name) {
  const response = await axios.post(
    `${N8N_HOST}/api/v1/tags`,
    { name },
    {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

async function setupStandardTags() {
  try {
    console.log('🏷️  Создание стандартных tags...\n');

    // Tags по окружению
    const environments = ['Production', 'Staging', 'Development', 'Testing'];

    // Tags по отделам
    const departments = ['Marketing', 'Sales', 'Engineering', 'Customer Support', 'Finance'];

    // Tags по функциональности
    const functionality = ['Data Sync', 'Notifications', 'Reporting', 'Integration', 'Automation'];

    // Tags по приоритету
    const priority = ['Critical', 'High Priority', 'Medium Priority', 'Low Priority'];

    const allTags = [...environments, ...departments, ...functionality, ...priority];

    const createdTags = {};

    for (const tagName of allTags) {
      try {
        const tag = await createTag(tagName);
        createdTags[tagName] = tag.id;
        console.log(`✅ ${tagName} (ID: ${tag.id})`);

        // Задержка для избежания rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⏭️  ${tagName} уже существует`);
        } else {
          console.error(`❌ Ошибка создания ${tagName}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Создано ${Object.keys(createdTags).length} новых tags`);
    return createdTags;

  } catch (error) {
    console.error('Ошибка setup tags:', error.message);
    throw error;
  }
}

// Запуск
await setupStandardTags();
```

### Пример 2: Массовое назначение tags workflows

```javascript
const axios = require('axios');

async function assignTagsToWorkflows(workflowPattern, tagNames) {
  try {
    // 1. Получить все tags
    const tagsResponse = await axios.get('https://n8n.example.com/api/v1/tags', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    // 2. Найти IDs нужных tags
    const tagMap = new Map(tagsResponse.data.data.map(tag => [tag.name, tag.id]));
    const tagIds = tagNames.map(name => tagMap.get(name)).filter(id => id);

    if (tagIds.length === 0) {
      console.log('❌ Tags не найдены');
      return;
    }

    console.log(`Найдено ${tagIds.length} tags:`, tagNames.filter(name => tagMap.has(name)));

    // 3. Получить все workflows
    const workflowsResponse = await axios.get('https://n8n.example.com/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    // 4. Фильтровать workflows по pattern
    const matchingWorkflows = workflowsResponse.data.data.filter(workflow =>
      workflow.name.includes(workflowPattern)
    );

    console.log(`\nНайдено ${matchingWorkflows.length} workflows с pattern "${workflowPattern}"`);

    // 5. Назначить tags каждому workflow
    let updatedCount = 0;

    for (const workflow of matchingWorkflows) {
      try {
        // Получить полные данные workflow
        const workflowDetail = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
          headers: {
            'X-N8N-API-KEY': 'your_api_key_here',
            'Accept': 'application/json'
          }
        });

        // Объединить существующие tags с новыми
        const existingTagIds = workflowDetail.data.tags || [];
        const allTagIds = [...new Set([...existingTagIds, ...tagIds])];

        // Обновить workflow
        await axios.patch(
          `https://n8n.example.com/api/v1/workflows/${workflow.id}`,
          {
            tags: allTagIds
          },
          {
            headers: {
              'X-N8N-API-KEY': 'your_api_key_here',
              'Content-Type': 'application/json'
            }
          }
        );

        updatedCount++;
        console.log(`✅ ${workflow.name} - tags обновлены`);

        // Задержка
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Ошибка обновления ${workflow.name}:`, error.message);
      }
    }

    console.log(`\n✅ Обновлено ${updatedCount} workflows`);

  } catch (error) {
    console.error('Ошибка массового назначения tags:', error.message);
    throw error;
  }
}

// Примеры использования

// Назначить tags всем production workflows
await assignTagsToWorkflows('Prod', ['Production', 'Critical']);

// Назначить tags всем marketing workflows
await assignTagsToWorkflows('Marketing', ['Marketing', 'Automation']);

// Назначить tags workflows интеграций
await assignTagsToWorkflows('Integration', ['Integration', 'Data Sync']);
```

### Пример 3: Анализ использования tags

```javascript
const axios = require('axios');

async function analyzeTagUsage() {
  try {
    console.log('📊 Анализ использования tags\n');

    // 1. Получить все tags
    const tagsResponse = await axios.get('https://n8n.example.com/api/v1/tags', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const tags = tagsResponse.data.data;
    console.log(`Всего tags: ${tags.length}\n`);

    // 2. Получить все workflows
    const workflowsResponse = await axios.get('https://n8n.example.com/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const workflows = workflowsResponse.data.data;
    console.log(`Всего workflows: ${workflows.length}\n`);

    // 3. Подсчитать использование каждого tag
    const tagUsage = new Map(tags.map(tag => [tag.id, {
      name: tag.name,
      count: 0,
      workflows: []
    }]));

    for (const workflow of workflows) {
      // Получить полные данные workflow для tags
      const workflowDetail = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      const workflowTags = workflowDetail.data.tags || [];

      workflowTags.forEach(tagId => {
        if (tagUsage.has(tagId)) {
          const usage = tagUsage.get(tagId);
          usage.count++;
          usage.workflows.push(workflow.name);
        }
      });
    }

    // 4. Сортировать по использованию
    const sortedUsage = Array.from(tagUsage.values())
      .sort((a, b) => b.count - a.count);

    // 5. Вывести статистику

    console.log('🏆 Топ-10 самых используемых tags:');
    sortedUsage.slice(0, 10).forEach((usage, index) => {
      console.log(`${index + 1}. ${usage.name}: ${usage.count} workflows`);
    });

    console.log('\n⚠️  Неиспользуемые tags:');
    const unusedTags = sortedUsage.filter(usage => usage.count === 0);
    if (unusedTags.length > 0) {
      unusedTags.forEach(usage => {
        console.log(`   - ${usage.name}`);
      });
      console.log(`\nВсего неиспользуемых: ${unusedTags.length}`);
      console.log('Рекомендация: рассмотрите удаление');
    } else {
      console.log('   Все tags используются ✅');
    }

    // 6. Workflows без tags
    const workflowsWithoutTags = [];
    for (const workflow of workflows) {
      const workflowDetail = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      if (!workflowDetail.data.tags || workflowDetail.data.tags.length === 0) {
        workflowsWithoutTags.push(workflow.name);
      }
    }

    if (workflowsWithoutTags.length > 0) {
      console.log(`\n📝 Workflows без tags (${workflowsWithoutTags.length}):`);
      workflowsWithoutTags.slice(0, 10).forEach(name => {
        console.log(`   - ${name}`);
      });
      if (workflowsWithoutTags.length > 10) {
        console.log(`   ... и еще ${workflowsWithoutTags.length - 10}`);
      }
      console.log('Рекомендация: добавьте tags для лучшей организации');
    }

    return {
      totalTags: tags.length,
      totalWorkflows: workflows.length,
      unusedTags: unusedTags.length,
      workflowsWithoutTags: workflowsWithoutTags.length,
      topUsedTags: sortedUsage.slice(0, 10)
    };

  } catch (error) {
    console.error('Ошибка анализа:', error.message);
    throw error;
  }
}

// Запуск анализа
await analyzeTagUsage();
```

### Пример 4: Cleanup неиспользуемых tags

```javascript
const axios = require('axios');

async function cleanupUnusedTags(dryRun = true) {
  try {
    console.log(`🧹 Cleanup неиспользуемых tags ${dryRun ? '(DRY RUN)' : ''}\n`);

    // 1. Получить все tags
    const tagsResponse = await axios.get('https://n8n.example.com/api/v1/tags', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    const tags = tagsResponse.data.data;

    // 2. Получить все workflows
    const workflowsResponse = await axios.get('https://n8n.example.com/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': 'your_api_key_here',
        'Accept': 'application/json'
      }
    });

    // 3. Собрать все используемые tag IDs
    const usedTagIds = new Set();

    for (const workflow of workflowsResponse.data.data) {
      const workflowDetail = await axios.get(`https://n8n.example.com/api/v1/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': 'your_api_key_here',
          'Accept': 'application/json'
        }
      });

      const workflowTags = workflowDetail.data.tags || [];
      workflowTags.forEach(tagId => usedTagIds.add(tagId));
    }

    // 4. Найти неиспользуемые tags
    const unusedTags = tags.filter(tag => !usedTagIds.has(tag.id));

    if (unusedTags.length === 0) {
      console.log('✅ Неиспользуемых tags не найдено');
      return { deleted: 0 };
    }

    console.log(`Найдено ${unusedTags.length} неиспользуемых tags:\n`);
    unusedTags.forEach(tag => {
      console.log(`   - ${tag.name} (ID: ${tag.id}, создан: ${tag.createdAt})`);
    });

    if (dryRun) {
      console.log('\n⚠️  DRY RUN MODE - tags не будут удалены');
      console.log('Запустите с dryRun=false для фактического удаления');
      return { deleted: 0, wouldDelete: unusedTags.length };
    }

    // 5. Удалить неиспользуемые tags
    console.log('\n🗑️  Удаление неиспользуемых tags...\n');

    let deletedCount = 0;
    for (const tag of unusedTags) {
      try {
        await axios.delete(`https://n8n.example.com/api/v1/tags/${tag.id}`, {
          headers: {
            'X-N8N-API-KEY': 'your_api_key_here',
            'Accept': 'application/json'
          }
        });

        console.log(`✅ Удален: ${tag.name}`);
        deletedCount++;

        // Задержка
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Ошибка удаления ${tag.name}:`, error.message);
      }
    }

    console.log(`\n✅ Cleanup завершен. Удалено ${deletedCount} tags`);

    return { deleted: deletedCount };

  } catch (error) {
    console.error('Ошибка cleanup:', error.message);
    throw error;
  }
}

// Примеры использования

// Dry run - только показать что будет удалено
await cleanupUnusedTags(true);

// Реальное удаление (осторожно!)
// await cleanupUnusedTags(false);
```

---

## Лучшие практики

### 1. Именование Tags

**Рекомендации:**
- Используйте понятные, описательные имена
- Следуйте единому стилю (CamelCase, kebab-case, или Title Case)
- Группируйте по категориям (Environment, Department, Priority, Functionality)
- Избегайте дублирования похожих tags

**Примеры хорошего именования:**
```
✅ Production, Staging, Development
✅ Marketing Team, Sales Team, Engineering Team
✅ High Priority, Medium Priority, Low Priority
✅ Data Integration, Email Automation, Reporting
```

**Примеры плохого именования:**
```
❌ prod, PROD, Prod, production (дубликаты)
❌ test, testing, test-env (неясность)
❌ tag1, tag2, tag3 (неинформативно)
```

### 2. Организация

**Иерархия tags:**
```
Environment:
  - Production
  - Staging
  - Development
  - Testing

Department:
  - Marketing
  - Sales
  - Engineering
  - Support

Priority:
  - Critical
  - High Priority
  - Medium Priority
  - Low Priority

Type:
  - Integration
  - Automation
  - Reporting
  - Notification
```

### 3. Maintenance

- **Регулярный audit:** Проверяйте неиспользуемые tags раз в месяц
- **Cleanup:** Удаляйте устаревшие tags
- **Документация:** Ведите список tags и их назначения
- **Стандартизация:** Установите правила создания и использования tags

### 4. Использование с Workflows

```javascript
// Назначить несколько tags workflow при создании
await axios.post('https://n8n.example.com/api/v1/workflows', {
  name: 'Customer Email Automation',
  nodes: [...],
  connections: {...},
  tags: [productionTagId, marketingTagId, automationTagId]
});

// Фильтрация workflows по tag через API
const marketingWorkflows = await axios.get(
  `https://n8n.example.com/api/v1/workflows?tags=${marketingTagId}`
);
```

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Подготовлено:** James (Dev Agent) с использованием Context7 MCP Server + анализа кода MCP сервера

**Примечание:** Tags API **полностью реализован** в MCP сервере n8n-workflow-builder и готов к использованию.
