# Termux Assistant

Нативное Flutter приложение для управления Termux на Android устройствах.

## Возможности

- **Терминал** - Полноценный терминал с поддержкой bash
- **Пакеты** - Управление пакетами Termux (поиск, установка, удаление)
- **Файловый менеджер** - Навигация по файловой системе Termux
- **Скрипты** - Создание, редактирование и запуск скриптов
- **Мониторинг** - Отслеживание CPU, RAM и системы в реальном времени
- **Настройки** - Настройка приложения

## Требования

- Flutter 3.4+
- Android SDK
- Termux установленный на устройстве

## Установка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd termux_app
```

### 2. Установка зависимостей

```bash
flutter pub get
```

### 3. Сборка APK

```bash
# Debug сборка
flutter build apk --debug

# Release сборка
flutter build apk --release
```

## Структура проекта

```
lib/
├── main.dart                    # Точка входа
├── core/
│   ├── constants/
│   │   └── app_theme.dart       # Темы приложения
│   └── services/
│       └── termux_service.dart  # Сервис для работы с Termux
└── features/
    ├── terminal/                # Терминал
    ├── packages/                # Управление пакетами
    ├── files/                   # Файловый менеджер
    ├── scripts/                 # Редактор скриптов
    ├── monitor/                 # Системный монитор
    └── settings/                # Настройки
```

## Как это работает

Приложение напрямую взаимодействует с Termux через:
- `/data/data/com.termux/files/usr/bin/` - бинарные файлы Termux
- `/data/data/com.termux/files/home/` - домашняя директория

## Разработка

### Добавление новой функции

1. Создайте папку в `lib/features/`
2. Добавьте presentation слой
3. Импортируйте `TermuxService` для выполнения команд

### Пример

```dart
final termuxService = context.read<TermuxService>();
final result = await termuxService.executeCommand('pkg', ['list-installed']);
```

## Лицензия

MIT License
