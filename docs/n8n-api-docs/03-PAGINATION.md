# 03-PAGINATION.md - n8n REST API Pagination

**Версия API:** v1
**Дата документации:** 2025-12-25
**Источник:** Официальная документация n8n через Context7

---

## 📋 Содержание

1. [Введение](#введение)
2. [Cursor-Based Pagination](#cursor-based-pagination)
3. [Параметры пагинации](#параметры-пагинации)
4. [Структура ответа](#структура-ответа)
5. [Примеры использования](#примеры-использования)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Введение

n8n REST API использует **cursor-based pagination** для эффективной работы с большими наборами данных. Пагинация позволяет разбивать результаты на управляемые страницы, снижая нагрузку на сервер и ускоряя время отклика API.

### Зачем нужна пагинация?

**Проблема без пагинации:**
- Получение всех workflows сразу может вернуть тысячи записей
- Большие ответы замедляют передачу данных
- Высокая нагрузка на память клиента и сервера
- Долгое время ожидания ответа

**Решение с пагинацией:**
- ✅ Контролируемый размер ответов
- ✅ Быстрые ответы API
- ✅ Меньшая нагрузка на память
- ✅ Возможность обработки данных по частям
- ✅ Лучшая производительность

### Endpoints с поддержкой пагинации

Следующие endpoints поддерживают пагинацию:

| Endpoint | Описание | Default Limit | Max Limit |
|----------|----------|---------------|-----------|
| `GET /api/v1/workflows` | Список workflows | 100 | 250 |
| `GET /api/v1/executions` | Список executions | 100 | 250 |
| `GET /api/v1/tags` | Список tags | 100 | 250 |

---

## Cursor-Based Pagination

### Принцип работы

n8n API использует **cursor-based pagination** вместо традиционной offset-based пагинации.

**Cursor-Based (используется в n8n):**
```
Page 1: GET /workflows?limit=100
        Response: { data: [...], nextCursor: "ABC" }

Page 2: GET /workflows?limit=100&cursor=ABC
        Response: { data: [...], nextCursor: "XYZ" }

Page 3: GET /workflows?limit=100&cursor=XYZ
        Response: { data: [...] }  // No nextCursor = last page
```

**Преимущества Cursor-Based:**
- ✅ Консистентные результаты при изменении данных
- ✅ Лучшая производительность для больших наборов данных
- ✅ Защита от пропуска или дублирования записей
- ✅ Эффективное использование индексов базы данных

**Offset-Based (НЕ используется в n8n):**
```
Page 1: GET /workflows?limit=100&offset=0
Page 2: GET /workflows?limit=100&offset=100
Page 3: GET /workflows?limit=100&offset=200
```

**Проблемы Offset-Based:**
- ❌ Дублирование/пропуск записей при изменении данных
- ❌ Медленная работа на больших offset
- ❌ Сложность поддержания консистентности

### Cursor Token

**Что такое cursor?**
- Непрозрачный строковый токен (opaque string token)
- Указывает на позицию в результатах
- Сгенерирован сервером, не должен модифицироваться клиентом
- Используется для получения следующей страницы

**Пример cursor:**
```
MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA
```

**❌ НЕ делайте:**
- Не пытайтесь декодировать или модифицировать cursor
- Не создавайте собственные cursor значения
- Не сохраняйте cursor для длительного использования (они могут истечь)

**✅ Делайте:**
- Используйте cursor точно как получили от API
- Получайте новый cursor из каждого ответа
- Проверяйте наличие `nextCursor` для определения последней страницы

---

## Параметры пагинации

### Query Parameters

#### `limit` (integer, optional)

Количество результатов на одной странице.

**Формат:**
```
?limit=<number>
```

**Значения:**
- **Default:** 100
- **Minimum:** 1
- **Maximum:** 250

**Примеры:**
```bash
# Получить 50 workflows на странице
GET /api/v1/workflows?limit=50

# Получить максимальное количество (250)
GET /api/v1/workflows?limit=250

# Default (100) если не указан
GET /api/v1/workflows
```

#### `cursor` (string, optional)

Cursor токен для получения следующей страницы результатов.

**Формат:**
```
?cursor=<cursor-token>
```

**Получение cursor:**
- Извлекается из поля `nextCursor` предыдущего ответа
- Отсутствует в первом запросе (получаем первую страницу)

**Примеры:**
```bash
# Первая страница (без cursor)
GET /api/v1/workflows?limit=100

# Вторая страница (с cursor из первого ответа)
GET /api/v1/workflows?limit=100&cursor=MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA

# Третья страница (с cursor из второго ответа)
GET /api/v1/workflows?limit=100&cursor=NDU2ZGVmNzgtYWJjZC0xMmQzLWE0NTYtNzg5MDEyMzQ1Njc4
```

### Комбинирование параметров

Пагинация может комбинироваться с другими query параметрами:

```bash
# Активные workflows с пагинацией
GET /api/v1/workflows?active=true&limit=50&cursor=ABC

# Executions с фильтрацией и пагинацией
GET /api/v1/executions?status=error&workflowId=123&limit=100&cursor=XYZ

# Tags с пагинацией
GET /api/v1/tags?limit=25&cursor=DEF
```

---

## Структура ответа

### Response Format

Все paginated endpoints возвращают ответы в следующем формате:

```json
{
  "data": [...],           // Массив результатов
  "nextCursor": "string"   // Cursor для следующей страницы (optional)
}
```

### Поля ответа

#### `data` (array, required)

Массив объектов результатов для текущей страницы.

**Пример:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Workflow 1",
      "active": true
    },
    {
      "id": "2",
      "name": "Workflow 2",
      "active": false
    }
  ]
}
```

#### `nextCursor` (string, optional)

Cursor токен для получения следующей страницы.

**Наличие поля:**
- ✅ **Присутствует:** Есть еще страницы данных
- ❌ **Отсутствует:** Это последняя страница

**Примеры:**

**Есть следующая страница:**
```json
{
  "data": [...100 items...],
  "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

**Последняя страница:**
```json
{
  "data": [...50 items...]
  // nextCursor отсутствует
}
```

---

## Примеры использования

### Пример 1: Basic Pagination (cURL)

**Первая страница:**
```bash
# n8n Cloud
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows?active=true&limit=150' \
  -H 'accept: application/json' \
  -H 'X-N8N-API-KEY: your_api_key_here'
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Workflow 1",
      "active": true
    },
    ...150 workflows...
  ],
  "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

**Вторая страница:**
```bash
curl -X GET \
  'https://your-instance.app.n8n.cloud/api/v1/workflows?active=true&limit=150&cursor=MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA' \
  -H 'accept: application/json' \
  -H 'X-N8N-API-KEY: your_api_key_here'
```

### Пример 2: Получить все workflows (JavaScript)

```javascript
const axios = require('axios');

const N8N_API_KEY = 'your_api_key_here';
const N8N_HOST = 'https://your-instance.app.n8n.cloud';

async function getAllWorkflows() {
  const allWorkflows = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    // Построить URL с параметрами
    const params = {
      limit: 250,  // Максимальный размер страницы
      ...(cursor && { cursor })  // Добавить cursor если есть
    };

    try {
      const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
        params,
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Accept': 'application/json'
        }
      });

      // Добавить результаты к общему массиву
      allWorkflows.push(...response.data.data);

      // Проверить наличие следующей страницы
      if (response.data.nextCursor) {
        cursor = response.data.nextCursor;
        console.log(`Получено ${allWorkflows.length} workflows, загружаем еще...`);
      } else {
        hasMore = false;
        console.log(`✅ Всего получено ${allWorkflows.length} workflows`);
      }

    } catch (error) {
      console.error('Ошибка получения workflows:', error.message);
      throw error;
    }
  }

  return allWorkflows;
}

// Использование
getAllWorkflows()
  .then(workflows => {
    console.log(`Всего workflows: ${workflows.length}`);
    workflows.forEach(workflow => {
      console.log(`- ${workflow.name} (${workflow.id})`);
    });
  })
  .catch(error => {
    console.error('Ошибка:', error);
  });
```

### Пример 3: Paginated Iteration (JavaScript)

```javascript
async function processWorkflowsInPages() {
  let cursor = null;
  let pageNumber = 1;

  do {
    const params = {
      limit: 100,
      ...(cursor && { cursor })
    };

    const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
      params,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    // Обработать текущую страницу
    console.log(`\n📄 Страница ${pageNumber}:`);
    console.log(`Получено ${response.data.data.length} workflows`);

    response.data.data.forEach((workflow, index) => {
      console.log(`  ${index + 1}. ${workflow.name} (Active: ${workflow.active})`);
    });

    // Подготовить следующую итерацию
    cursor = response.data.nextCursor;
    pageNumber++;

    // Задержка между запросами (rate limiting)
    if (cursor) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } while (cursor);

  console.log(`\n✅ Обработано ${pageNumber - 1} страниц`);
}

processWorkflowsInPages();
```

### Пример 4: Python Implementation

```python
import requests
from typing import List, Dict, Optional

N8N_API_KEY = 'your_api_key_here'
N8N_HOST = 'https://your-instance.app.n8n.cloud'

def get_all_workflows() -> List[Dict]:
    """Получить все workflows с пагинацией"""
    all_workflows = []
    cursor = None
    has_more = True

    while has_more:
        # Построить параметры запроса
        params = {'limit': 250}
        if cursor:
            params['cursor'] = cursor

        try:
            response = requests.get(
                f'{N8N_HOST}/api/v1/workflows',
                params=params,
                headers={
                    'X-N8N-API-KEY': N8N_API_KEY,
                    'Accept': 'application/json'
                }
            )
            response.raise_for_status()

            data = response.json()

            # Добавить результаты
            all_workflows.extend(data['data'])

            # Проверить следующую страницу
            if 'nextCursor' in data:
                cursor = data['nextCursor']
                print(f'Получено {len(all_workflows)} workflows, загружаем еще...')
            else:
                has_more = False
                print(f'✅ Всего получено {len(all_workflows)} workflows')

        except requests.exceptions.RequestException as error:
            print(f'Ошибка получения workflows: {error}')
            raise

    return all_workflows

# Использование
workflows = get_all_workflows()
print(f'\nВсего workflows: {len(workflows)}')
for workflow in workflows:
    print(f"- {workflow['name']} ({workflow['id']})")
```

### Пример 5: Generator Pattern (Python)

```python
from typing import Iterator, Dict

def iterate_workflows(page_size: int = 100) -> Iterator[Dict]:
    """Generator для итерации по workflows постранично"""
    cursor = None

    while True:
        params = {'limit': page_size}
        if cursor:
            params['cursor'] = cursor

        response = requests.get(
            f'{N8N_HOST}/api/v1/workflows',
            params=params,
            headers={
                'X-N8N-API-KEY': N8N_API_KEY,
                'Accept': 'application/json'
            }
        )
        response.raise_for_status()

        data = response.json()

        # Yield каждый workflow
        for workflow in data['data']:
            yield workflow

        # Проверить следующую страницу
        if 'nextCursor' not in data:
            break
        cursor = data['nextCursor']

# Использование с generator
print('Активные workflows:')
for workflow in iterate_workflows(page_size=50):
    if workflow['active']:
        print(f"- {workflow['name']}")
```

### Пример 6: Async/Await (JavaScript)

```javascript
async function* paginatedWorkflows(pageSize = 100) {
  let cursor = null;

  do {
    const params = {
      limit: pageSize,
      ...(cursor && { cursor })
    };

    const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
      params,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    // Yield каждый workflow
    for (const workflow of response.data.data) {
      yield workflow;
    }

    cursor = response.data.nextCursor;
  } while (cursor);
}

// Использование async generator
(async () => {
  console.log('Активные workflows:');
  for await (const workflow of paginatedWorkflows(50)) {
    if (workflow.active) {
      console.log(`- ${workflow.name}`);
    }
  }
})();
```

---

## Best Practices

### 1. Выбор размера страницы

**Рекомендации:**

```javascript
// ✅ Хорошо: Используйте разумные размеры страниц
const SMALL_PAGE = 50;    // Для быстрых операций
const MEDIUM_PAGE = 100;  // Default, оптимальный баланс
const LARGE_PAGE = 250;   // Максимум, для bulk операций

// ❌ Плохо: Слишком маленькие или большие размеры
const TOO_SMALL = 1;      // Слишком много запросов
const TOO_LARGE = 1000;   // Превышает максимум (250)
```

**Когда использовать:**
- **50-100:** UI отображение, интерактивная работа
- **100-150:** Общие операции, хороший баланс
- **200-250:** Массовая обработка, экспорт данных

### 2. Error Handling

```javascript
async function safeGetAllWorkflows(maxRetries = 3) {
  const allWorkflows = [];
  let cursor = null;
  let retries = 0;

  do {
    try {
      const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
        params: {
          limit: 250,
          ...(cursor && { cursor })
        },
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Accept': 'application/json'
        }
      });

      allWorkflows.push(...response.data.data);
      cursor = response.data.nextCursor;
      retries = 0; // Reset retries на успешный запрос

    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit - wait and retry
        if (retries < maxRetries) {
          retries++;
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          console.log(`Rate limited, waiting ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      throw error;
    }
  } while (cursor);

  return allWorkflows;
}
```

### 3. Progress Tracking

```javascript
async function getAllWorkflowsWithProgress() {
  const allWorkflows = [];
  let cursor = null;
  let totalFetched = 0;

  // Прогресс бар (опционально)
  const startTime = Date.now();

  do {
    const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
      params: {
        limit: 250,
        ...(cursor && { cursor })
      },
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    const pageSize = response.data.data.length;
    totalFetched += pageSize;

    allWorkflows.push(...response.data.data);

    // Отображение прогресса
    console.log(`📊 Получено: ${totalFetched} workflows${response.data.nextCursor ? ' (загружаем еще...)' : ''}`);

    cursor = response.data.nextCursor;
  } while (cursor);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Завершено: ${totalFetched} workflows за ${duration}s`);

  return allWorkflows;
}
```

### 4. Caching Strategies

```javascript
class WorkflowCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes TTL
    this.cache = null;
    this.timestamp = null;
    this.ttl = ttl;
  }

  async getAll() {
    // Проверить cache
    if (this.cache && Date.now() - this.timestamp < this.ttl) {
      console.log('📦 Используем cached workflows');
      return this.cache;
    }

    // Загрузить с пагинацией
    console.log('🔄 Загружаем workflows...');
    this.cache = await getAllWorkflows();
    this.timestamp = Date.now();

    return this.cache;
  }

  invalidate() {
    this.cache = null;
    this.timestamp = null;
  }
}

// Использование
const workflowCache = new WorkflowCache();
const workflows = await workflowCache.getAll();
```

### 5. Rate Limiting

```javascript
class RateLimiter {
  constructor(requestsPerSecond = 10) {
    this.delay = 1000 / requestsPerSecond;
    this.lastRequest = 0;
  }

  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    if (timeSinceLastRequest < this.delay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.delay - timeSinceLastRequest)
      );
    }

    this.lastRequest = Date.now();
  }
}

async function getAllWorkflowsWithRateLimit() {
  const rateLimiter = new RateLimiter(5); // 5 requests/second
  const allWorkflows = [];
  let cursor = null;

  do {
    await rateLimiter.throttle();

    const response = await axios.get(`${N8N_HOST}/api/v1/workflows`, {
      params: {
        limit: 250,
        ...(cursor && { cursor })
      },
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    });

    allWorkflows.push(...response.data.data);
    cursor = response.data.nextCursor;
  } while (cursor);

  return allWorkflows;
}
```

---

## Troubleshooting

### Проблема 1: Пустой ответ на первой странице

**Симптом:**
```json
{
  "data": []
}
```

**Причины:**
- Нет данных соответствующих фильтрам
- Неверные параметры фильтрации

**Решение:**
```bash
# Проверьте без фильтров
GET /api/v1/workflows

# Проверьте с другими фильтрами
GET /api/v1/workflows?active=false
```

### Проблема 2: nextCursor всегда присутствует

**Симптом:**
Поле `nextCursor` присутствует даже на последней странице

**Причина:**
- Bug в API (очень редко)

**Решение:**
```javascript
// Защита от бесконечного цикла
const MAX_PAGES = 1000;
let pageCount = 0;

while (cursor && pageCount < MAX_PAGES) {
  // fetch page
  pageCount++;
}

if (pageCount >= MAX_PAGES) {
  console.warn('Достигнут максимум страниц');
}
```

### Проблема 3: Cursor expired

**Симптом:**
```json
{
  "error": "Invalid or expired cursor"
}
```

**Причина:**
- Cursor устарел (слишком долго между запросами)
- Cursor поврежден

**Решение:**
```javascript
// Начать с начала если cursor expired
try {
  const response = await fetch(url);
  // ...
} catch (error) {
  if (error.message.includes('cursor')) {
    console.log('Cursor expired, начинаем с начала');
    cursor = null;
    // retry
  }
}
```

### Проблема 4: Дублирование данных

**Симптом:**
Одни и те же записи появляются на разных страницах

**Причина:**
- Изменение данных между запросами (очень редко с cursor-based)

**Решение:**
```javascript
// Дедупликация по ID
const seen = new Set();
const uniqueWorkflows = [];

for (const workflow of allWorkflows) {
  if (!seen.has(workflow.id)) {
    seen.add(workflow.id);
    uniqueWorkflows.push(workflow);
  }
}
```

---

## Связанные документы

- [01-OVERVIEW.md](./01-OVERVIEW.md) - Обзор n8n REST API
- [02-AUTHENTICATION.md](./02-AUTHENTICATION.md) - Аутентификация
- [10-WORKFLOWS-API.md](./10-WORKFLOWS-API.md) - Workflows API
- [20-EXECUTIONS-API.md](./20-EXECUTIONS-API.md) - Executions API
- [40-TAGS-API.md](./40-TAGS-API.md) - Tags API

---

**Последнее обновление:** 2025-12-25
**Версия документации:** 1.0
**Подготовлено:** James (Dev Agent) с использованием Context7 MCP Server

**Источники:**
- [n8n API Pagination Documentation](https://docs.n8n.io/api/pagination/)
