# Справка по проекту расширения для Google Chrome "RightClick Enable"

## Архитектура расширения (Manifest V3)

### 1 Фоновый процесс
**worker.js** - центральный Service Worker:
* Управляет внедрением скриптов
* Обрабатывает межкомпонентные сообщения
* Запускает попапы обратной связи

### 2 Контент-скрипты
Внедряются в веб-страницы (data/inject/):
* **core.js**: Инициализация `window.pointers`, координация работы скриптов
* **mouse.js**: Разблокировка элементов при правом клике/касании
* **user-select.js**: Обход CSS-ограничений (`user-select: none`)

### 3 Интерфейсы
* **options/index.js**: Страница настроек (белый список сайтов)

---

## Ключевые механизмы

### 1. Разблокировка элементов (mouse.js)
```javascript
// Временное снятие ограничений с медиаэлементов
elements.set(mv, mv.style['pointer-events']);
mv.style.setProperty('pointer-events', 'all', 'important');
```
* Активируется при правом клике/касании
* Автоматический откат через 500 мс

### 2. Обход CSS-ограничений (user-select.js)
```javascript
// Сброс user-select в стилях
if (style['user-select']) {
  style['user-select'] = 'initial';
}
```
* Патчит CSSRules в реальном времени
* Отслеживает динамические изменения стилей

---

## Важные зависимости

### 1. `window.pointers` (core.js)
* `status`: "ready" (активно) / "removed" (выключено)
* `run`: Set функций для очистки при деактивации
* `inject`: Динамическое выполнение кода

### 2. Разрешения
```json
"permissions": [
  "storage", "activeTab", "scripting",
  "contextMenus", "notifications"
],
"host_permissions": ["*://*/*"]
```

---

## Точки входа для разработки

1. **Добавление нового типа разблокировки**:  
   `mouse.js` → функция `unblock()`
   
---

## Тестовые сценарии

* **Страница настроек**: `chrome-extension://[id]/data/options/index.html`
* **Тестовый сайт**: https://webbrowsertools.com/test-right-click