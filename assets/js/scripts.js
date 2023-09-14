import { data } from "./data.js";
import {  toMinAndSec } from "./utils.js";// 35:00 Импортируем функцию из файла utils.js

// console.log(data);//Вывод в консоле

const AudioController = {
  //Создаём изначально пустой массив 27:40
  state: {
    audios: [],  
  //current отклик renderCurrentItem 41:13
  current: {},
    //1:11:52
    repeating: false,
    //53:20
    playing: false,
  },
  //Вызываем функцию init для блока items, чтобы работат с нашими аудио треками. Нам надо здесь их отобразить.
  init() {
    this.initVariables();
    //Реализовываем событие initEvents 38:55
    this.initEvents();
    this.renderAudios();
  },

  initVariables() {
    //Кнопку создаём для смены класса. Это поможет менять у кнопки иконки 54:25
    this.playButton = null;
    this.audioList = document.querySelector(".items");
    this.currentItem = document.querySelector(".current");
    //Добавляем handling-repeat 1:11:11
    this.repeatButton = document.querySelector(".handling-repeat");
  }, 

  //Добавляем событие клика для item-a 38:55
  initEvents() {
    this.audioList.addEventListener("click", this.handleItem.bind(this));
    //Добавляем клик handling-repeat 1:11:11
    this.shuffleButton.addEventListener("click", this.handleShuffle.bind(this));
  },

  //1:11:52
  handleRepeat({ currentTarget }) {
    const { repeating } = this.state;

    //classList меняем на класс active
    currentTarget.classList.toggle("active", !repeating);
    this.state.repeating = !repeating;
  },

  //Получаем аудио 53:20
  handleAudioPlay() {
    //console.log("clicked"); Проверка клика 55:31
    const { playing, current } = this.state;
    const { audio } = current;

    //Ставит паузу. На 53:51 ещё не работает. Перенос 1:07:42 в togglePlaying()
    !playing ? audio.play() : audio.pause();

    //Здесь меняем значение playing на противоположное 54:00
    this.state.playing = !playing;

    // Здесь меняет у кнопки иконки. 55:00 Перенос 1:07:42 в togglePlaying()
    this.playButton.classList.toggle("playing", !playing);
  },

  // Функция handleNext. Кнопка нажатия следующей песни. Клик правой кнопки. 57:42
  handleNext() {
    const { current } = this.state;

    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const next = currentItem.nextSibling?.dataset;
    const first = this.audioList.firstChild?.dataset;

    //Задаём ему либо next?.id, а если нет то мы будем брать first?.id 1:00:20
    const itemId = next?.id || first?.id;

    //Если никого нет, то скажем return 1:00:45
    if (!itemId) return;

    //Но если всё таки есть, то мы отдаём ему itemId. Либо берёт первый элемент, должно работать бесконечное нажатие. 1:00:54
    this.setCurrentItem(itemId);
  },

  // Функция handlePrev. Кнопка нажатия следующей песни 1:01:49
  handlePrev() {
    const { current } = this.state;

    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const prev = currentItem.previousSibling?.dataset;
    const last = this.audioList.lastChild?.dataset;

    //Задаём ему либо prev?.id, а если нет то мы будем брать last?.id 
    const itemId = prev?.id || last?.id;

    //Если никого нет, то скажем return 
    if (!itemId) return;

    //Но если всё таки есть, то мы отдаём ему itemId. Либо берёт левый элемент, должно работать бесконечное нажатие.
    this.setCurrentItem(itemId);
  },

  // 52:22
  handlePlayer() {
    const play = document.querySelector(".controls-play");
    //Добавляем логику кнопок next и prev 57:19
    const next = document.querySelector(".controls-next");
    const prev = document.querySelector(".controls-prev");

    //54:40 Это поможет менять у кнопки иконки
    this.playButton = play;

    //Привязываем клик с помощью метода bind 52:48
    play.addEventListener("click", this.handleAudioPlay.bind(this));
    //Привязываем клик кнопок next и prev с помощью метода bind 57:19
    next.addEventListener("click", this.handleNext.bind(this));
    prev.addEventListener("click", this.handlePrev.bind(this));
  },

  //Получаем аудио 47:20
  audioUpdateHandler({ audio, duration }) { //Дуструктуризация - audio за сунули {} 49:43
    //Ищим .progress-current. Он будет меняться.
    const progress = document.querySelector(".progress-current");
    //Тоже будет меняться. 48:20
    const timeline = document.querySelector(".timeline-start");

    //Заиграет музыка 50:05. Закоментила 51:46
    // audio.play();         

    //Дуструктуризация таймера. Секунды у песни пойдут. 50:40
    audio.addEventListener("timeupdate", ({ target }) => {
      //console.log(target.currentTime); 49:10
      const { currentTime } = target;
      //Считаем текущую ширину прогресса 51:05
      const width = (currentTime * 100) / duration;

      timeline.innerHTML = toMinAndSec(currentTime);
      // Здесь каждое обновления меняет ширину прогресса. Мы ему тут сказали работай в процентах. 51:28   
      progress.style.width = `${width}%`;
    });


    //Когда трек до поёт, заиграет следующий 1:09:55 
    audio.addEventListener("ended", ({ target }) => {
      //Обновляем 0
      target.currentTime = 0;
      progress.style.width = `0%`;

      //Переделали запись 1:13:20
      // this.handleNext();
      this.state.repeating ? target.play() : this.handleNext();
    });
  },

  //Если клик в функции handleItem пройдёт, то нажатое аудио станет главной. 41:13
  renderCurrentItem({ link, track, year, group, duration }) {
    const [img] = link.split(".");
    
    //Блок взять из index.html 44:07 папа .current остался там
    return `<div class="current-image" style="background-image: url(./assets/img/${img}.jpg)"></div>
              <div class="current-info">
                <div class="current-info__top">
                  <div class="current-info__titles">
                    <h2 class="current-info__group">${group}</h2>
                    <h3 class="current-info__track">${track}</h3>
                  </div>
                  <div class="current-info__year">${year}</div>
                </div>
                <div class="controls">
                  <!-- Блок для кнопок -->
                  <div class="controls-buttons">
                    <!-- Кнопка влево -->
                    <button class="controls-button controls-prev">
                      <svg class="icon-arrow">
                        <use xlink:href="./assets/img/sprite.svg#arrow"></use>
                      </svg>
                    </button>
                    <!-- Это блок двух иконок, которые будут менят display: block; -->
                    <button class="controls-button controls-play">
                      <svg class="icon-pause">
                        <use xlink:href="./assets/img/sprite.svg#pause"></use>
                      </svg>
                      <svg class="icon-play">
                        <use xlink:href="./assets/img/sprite.svg#play"></use>
                      </svg>
                    </button>
                    <!-- Кнопка вправо -->
                    <button class="controls-button controls-next">
                      <svg class="icon-arrow">
                        <use xlink:href="./assets/img/sprite.svg#arrow"></use>
                      </svg>
                    </button>
                  </div>
                  <!-- Линия прогресса, которая показывает сколько прослушали аудио. -->
                  <div class="controls-progress">
                    <div class="progress">
                      <div class="progress-current"></div>
                    </div>
                    <!-- Аудио таймер -->
                    <div class="timeline">
                      <span class="timeline-start">00:00</span>
                      <span class="timeline-end">${toMinAndSec(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>`;
  },

  // Ставим пал(чтобы играла одна музыка при переключение аудио) 1:03:55
  pauseCurrentAudio() {
    const {
      current: { audio },
    } = this.state;

    //Если нету то мы ничего не будем делать
    if (!audio) return;

    //Говорим аудио пауза
    audio.pause();
    //При включение аудио начнёт сначала
    audio.currentTime = 0;
  },

  //Эта функция кнопки будет реагировать на состояние предыдущей кнопки(была на паузе, значит пауза - была воспроизведённой, значит будет воспроизведёная) 1:06:14
  togglePlaying() {
    const { playing, current } = this.state;
    //Берём аудио из current-a
    const { audio } = current;

    // Перенесли из handleAudioPlay() 1:07:42. Если воспроизводится, то и следующая должна воспроизводиться
    playing ? audio.play() : audio.pause();

    //Здесь меняет у кнопки иконки. 55:00. Перенесли из handleAudioPlay() 1:07:42 Если воспроизводится, то и следующая должна воспроизводиться
    this.playButton.classList.toggle("playing", playing);
  },

  // Функция 41:44
  setCurrentItem(itemId) {
    //Осуществляем поиск по нашему аудио
    const current = this.state.audios.find(({ id }) => +id === +itemId);

    // console.log(current);
    //Проверка
    if (!current) return;

    // Вызываем пал 1:03:57
    this.pauseCurrentAudio();

    this.state.current = current;
    //Вместе они переключатель. Нажимая на нижние, верху появляется нажатый нижний. 46:40    
    this.currentItem.innerHTML = this.renderCurrentItem(current);

    //Вызываем функцию 56:16
    this.handlePlayer();
    //Вывод функции. Она будет находит <div class="progress"> 47:38
    this.audioUpdateHandler(current);

    //Прописываем таймаут 1:06:30
    setTimeout(() => {
      this.togglePlaying();
    }, 5) //10 секунд;
  },

  //Функция
  handleItem({ target }) {
    //console.log(target); 40:14

    //Получаем id 40:32 
    const { id } = target.dataset;

    if (!id) return;

    // Отдаём id 41:44
    this.setCurrentItem(id);
  },

  //Перенесли из loadAudioData(audio) {const { ... }} = audio; 38:04
  renderItem({ id, link, track, genre, group, duration }) {
    const [img] = link.split(".");

    //Перенесли из const item = `...` 37:51
    return `<div class="item" data-id="${id}">
              <div class="item-image" style="background-image: url(./assets/img/${img}.jpg);">
              </div>
              <div class="item-titles">
                <h2 class="item-group">${group}</h2> <!--32:11-->
                <h3 class="item-track">${track}</h3> <!--32:11-->
              </div>
              <!-- item-duration для js. Будем получать число -->
              <p class="item-duration">${toMinAndSec(duration)}</p> <!--32:30-->
              <p class="item-genre">${genre}</p> <!--32:39-->
              <!-- Здесь можно сделать также чтобы иконки менялись, но она в этом блоке решила взять одну иконку. При добавление второй иконки, в css есть стили замены иконок. -->
              <button class="item-play">
                <svg class="icon-play">
                  <use xlink:href="./assets/img/sprite.svg#play"></use>
                </svg>
              </button>
            </div>`;
  },

  loadAudioData(audio) {//Перенесли из index.html сюда 29:48
    //Перенесли в renderItem({ ... }) { ... } 38:04
    // Делаем изьятия у аудио, типа клики по нужным id(data-id)
    // const { id, link, track, genre, group, duration } = audio; 38:04
    //Получаем image(картинку из data.js). У неё здесь должно быть одинаковое название картинки и аудио. И название картинки не должен имет пробел. 36:40???
    /*//Перенесли в renderItem({ ... }) { ... } 38:04
    const [img] = link.split(".");*/
    // console.log(image); 31:33
    // console.log(duration); 32:57
    // console.log(toMinAndSec(duration)); 35:00 Импортируем функцию из файла utils.js. В качестве аргумента дали ей duration.   
    
    /*/Перенесли в renderItem() {return ...} 37:51
    // const item = `<div class="item" data-id="${id}">
    //   <div class="item-image" style="background-image: url(./assets/img/${img}.jpg);">
    //   </div>
    //   <div class="item-titles">
    //     <h2 class="item-group">${group}</h2> <!--32:11-->
    //     <h3 class="item-track">${track}</h3> <!--32:11-->
    //   </div>
    //   <!-- item-duration для js. Будем получать число -->
    //   <p class="item-duration">${toMinAndSec(duration)}</p> <!--32:30-->
    //   <p class="item-genre">${genre}</p> <!--32:39-->
    //   <!-- Здесь можно сделать также чтобы иконки менялись, но она в этом блоке решила взять одну иконку. При добавление второй иконки, в css есть стили замены иконок. -->
    //   <button class="item-play">
    //     <svg class="icon-play">
    //       <use xlink:href="./assets/img/sprite.svg#play"></use>
    //     </svg>
    //   </button>
    // </div>`*/

    //Чтобы у нас этот маркап(const item) отображался на каждой итерации и добавлялся нам в нашу вот этот аудио(this.audioList = document.querySelector(".items");) лист, берём аудио лист и с помощью оператора audioList цикл добавляем наш item. Появились все 4 песни. 36:40
    // this.audioList.innerHTML += item;
    //Изменили 38:18 на 
    this.audioList.innerHTML += this.renderItem(audio);
  },

  renderAudios() {
    //Массив. Пробег по списку треку
    data.forEach((item) => {
      //Ищет нужное название трека
      const audio = new Audio(`./assets/audio/${item.link}`);

      //Добавляем событие(loadeddata) для загрузки аудио в браузере
      audio.addEventListener("loadeddata", () => {
        /*//Показывает в консоле время загрузки аудио 
        console.log(audio.duration); 27:20*/
        //Создаём обжек newItem и положим в него 
        const newItem = { ...item, duration: audio.duration, audio };
        
        //27:40 Здесь копируем массив state, в конец добавляем newItem
        // this.state.audios = [...this.state.audios, newItem] 1.Вариант 
        this.state.audios.push(newItem);//2.Вариан, тоже самое что и 1.Вариант
        // console.log(this.state.audios); 28:18
        // Задали в качестве аргумента newItem
        this.loadAudioData(newItem);
      });
    });
  },
};

AudioController.init();
 