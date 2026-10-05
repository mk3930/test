# Справка по проекту расширения для Google Chrome "RightClick Enable"

## Архитектура расширения (Manifest V3)

### 1 Фоновый процесс
**worker.js** - центральный Service Worker:
* Управляет внедрением скриптов
* Контролирует триал-период (7 дней)
* Обрабатывает межкомпонентные сообщения
* Запускает попапы обратной связи

### 2 Контент-скрипты
Внедряются в веб-страницы (data/inject/):
* **core.js**: Инициализация `window.pointers`, координация работы скриптов
* **mouse.js**: Разблокировка элементов при правом клике/касании
* **user-select.js**: Обход CSS-ограничений (`user-select: none`)
* **check-payment.js**: Проверка статуса подписки

### 3 Интерфейсы
* **feedback-popup.js**: Попап "Работает ли расширение?"
* **paywall.html**: Страница оплаты подписки
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

### 3. Проверка подписки (check-payment.js)
```javascript
const userData = await paywall.getUser();
if (userData.paid !== true) {
  chrome.runtime.sendMessage({method: "openPayWallTab"});
}
```
* Интеграция с платежной системой через `wall.js`
* Триггер открытия `paywall.html` при отсутствии оплаты

### 4. Триал-период (worker.js)
```javascript
isTrialPeriodOver((trialOver) => {
  if (trialOver) injectPaymentCheck();
});
```
* 7 дней для новых пользователей
* Старые пользователи (до v3) имеют бессрочный доступ

### 5. Обратная связь (feedback-popup.js)
```javascript
submitFeedback('image', 'Cannot save image as');
```
* Иерархическая система отчетов:
    * Тип проблемы (текст/изображение/видео)
    * Конкретная причина
* Отправка данных на clevermathgames.com

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
   
2. **Изменение триал-периода**:  
   `worker.js` → `isTrialPeriodOver()` (константа `TRIAL_IN_MS`)
   
3. **Настройка платежной интеграции**:  
   `wall.js` → взаимодействие с API платежной системы
   
4. **Кастомизация попапа**:  
   `feedback-popup.js` → `createFeedbackPopup()`

---

## Тестовые сценарии

* **Страница настроек**: `chrome-extension://[id]/data/options/index.html`
* **Отладка фидбэка**: `debug-feedback.html`
* **Тестовый сайт**: https://webbrowsertools.com/test-right-click