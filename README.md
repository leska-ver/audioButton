<h1>Видео урок - https://www.youtube.com/watch?v=oFB0HBmyCtI</h1>
<br>

## Автора репозиторий с готовым кодом и файлами: https://github.com/tomkovich/js/tree/master/spotimy
<br>

### 1. Создала папку audioButton - > В неё скачала её папку assets и создала файл index.html(по видео)<br>
### 2. Взяли шрифт - https://fonts.google.com/specimen/Ubuntu?query=ubuntu и подключили в index.html<br>
### 3. Подключили в index.html:<br>
 - `<link rel="stylesheet" href="./assets/scss/reset.css"><br>`
 - `<link rel="stylesheet" href="./assets/scss/style.css"><br>`
 
 ## --19:25 - JS--
 1. Создаём папку JS -> В ней создали файл data.js(файл с нашими данными), из неё мы ничего не будем получать. Типа инфы о каждой песни.<br> 
 2. Создаём файл scripts.js(здесь будет прописана вся логика) -> подключили в index.htm -> в подключении дописываем type="module". type="module", он для импорта data.js в файле scripts.js.<br>  

 ## --33:00 - JS--
 1. Создаём файл utils.js. В ней будет создана вспомогательная функция которая будет превращать наши миллисекунды в секунды и минуты.
<br>

 ## В style.css
 - Добавила свои стили .handling-shuffle.active
<br>

<hr>


<hr>
<h2>Различия между локальной средой и CodePen</h2>
<br>
<p>В <b>CodePen</b> код работает иначе из-за особенностей его архитектуры.</p>
<br>

## Ссылка на кодепен: https://codepen.io/tmeebphp-the-sans/pen/KwzXmRK?editors=0010 
<br> 

<h3>Главная причина: Разные структуры проектов</h3>
<br>

### В обычном проекте:
`ваш-проект/
├── index.html
├── assets/
│   └── img/
│       └── kino.jpg    ← путь ./assets/img/kino.jpg работает
└── script.js`
<br>

### В CodePen:
`codepen-виртуальный-сервер/
├── ваш-код (в одном файле)
└── НЕТ папки assets/img/ !`
<br>

### Почему в CodePen нужно иначе:
<br>

1. Относительные пути не работают
<p>./assets/img/${img}.jpg → ведет в никуда, папки assets нет</p>
<p>CodePen не дает загружать локальные файлы изображений</p>
<br>

2. Решения в CodePen:
<p>Вариант A: Использовать абсолютные URL с CDN</p>
`<i>// Вместо ./assets/img/kino.jpg</i>
return `<div style="background-image: url(https://my-cdn.com/img/${img}.jpg)"></div>``
<p>Вариант B: Заранее загрузить изображения в CodePen Assets</p>
`<i>// CodePen сам генерирует URL<i>
return `<div style="background-image: url(https://assets.codepen.io/your-image.jpg)"></div>``
<p>Вариант C: Использовать внешние сервисы (как picsum.photos)</p>
`// Для тестовых/случайных изображений
return `<div style="background-image: url(https://picsum.photos/200/200)"></div>``