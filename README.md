<h1>Видео урок - https://www.youtube.com/watch?v=oFB0HBmyCtI</h1>
<br>
<h2>Автора репозиторий с готовым кодом и файлами:<h2> https://github.com/tomkovich/js/tree/master/spotimy
<br>

1. Создала папку audioButton - > В неё скачала её папку assets и создала файл index.html(по видео)<br>
2. Взяли шрифт - https://fonts.google.com/specimen/Ubuntu?query=ubuntu и подключили в index.html<br>
3. Подключили в index.html:<br>
 - <link rel="stylesheet" href="./assets/scss/reset.css"><br>
 - <link rel="stylesheet" href="./assets/scss/style.css"><br>
 
 ## --19:25 - JS--
 1. Создаём папку JS -> В ней создали файл data.js(файл с нашими данными), из неё мы ничего не будем получать. Типа инфы о каждой песни.<br> 
 2. Создаём файл scripts.js(здесь будет прописана вся логика) -> подключили в index.htm -> в подключении дописываем type="module". type="module", он для импорта data.js в файле scripts.js.<br>  

 ## --33:00 - JS--
 1. Создаём файл utils.js. В ней будет создана вспомогательная функция которая будет превращать наши миллисекунды в секунды и минуты.

 ## В style.css
 - Добавила свои стили .handling-shuffle.active