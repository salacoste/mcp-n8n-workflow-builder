# Story 2.4: PATCH Test on n8n v2.1.4

**Date:** 26 декабря 2024
**Platform:** n8n v2.1.4
**Result:** ❌ PATCH всё ещё НЕ поддерживается

## Результат теста

```
Status: 405
Response: {"message":"PATCH method not allowed"}
```

## Детали

**Запрос:**
```
PATCH https://auto.thepeace.ru/api/v1/workflows/UJH4wRPK17KVqZzc
Body: {"name":"UPDATED via PATCH on v2.1.4"}
```

**Ответ:**
- HTTP Status: **405 Method Not Allowed**
- Message: "PATCH method not allowed"

## Вывод

**Story 2.4 остаётся BLOCKED** - метод PATCH не поддерживается даже на n8n v2.1.4.

## История версий

| Версия n8n | PATCH Support | Дата проверки |
|------------|---------------|---------------|
| v1.82.3 | ❌ 405 | 26.12.2024 |
| v2.1.4 | ❌ 405 | 26.12.2024 |

## Рекомендация

Продолжать использовать **PUT** (update_workflow) для обновления workflows до тех пор, пока n8n не добавит поддержку PATCH.
