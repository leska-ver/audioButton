import { data } from "./data.js";
import {  shuffle, toMinAndSec } from "./utils.js";// 35:00 Импортируем функцию из файла utils.js

// console.log(data);//Вывод в консоле

const AudioController = {
  //Создаём изначально пустой массив 27:40
  state: {
    audios: [],  
    //current отклик renderCurrentItem 41:13
    current: {},
    //1:11:50 В моей доработке она не нужна
    // repeating: false,
    //53:20
    playing: false,
    // 1:14:12
    volume: 0.5,
    // Добавила индикации режима повтора! «От себятина»
    repeatMode: 0, // ← 0=выкл, 1=+1 раз, 2=+2 раза, 3=∞
    repeatRemaining: 0, // ← счётчик оставшихся повторений
  },
  //Вызываем функцию init для блока items, чтобы работат с нашими аудио треками. Нам надо здесь их отобразить.
  init() {
    this.initVariables();
    //Реализовываем событие initEvents 38:55
    this.initEvents();
    this.renderAudios();

    // === Загружаем Playlist Saving (сохранение состояния): === «От себятина»
    const saved = JSON.parse(localStorage.getItem('musicPlayerState'));
    if (saved) {
      this.state.volume = saved.volume;
      this.volumeButton.value = saved.volume;
      
      if (saved.currentTrack) {
        // Просто загружаем состояние, но не играем
        this.state.currentTrackId = saved.currentTrack;
        // Пользователь сам кликнет на трек когда захочет
      }
    }
    // === КОНЕЦ ДОБАВЛЕНИЯ ===
  },

  initVariables() {
    //Кнопку создаём для смены класса. Это поможет менять у кнопки иконки 54:25
    this.playButton = null;
    this.audioList = document.querySelector(".items");
    this.currentItem = document.querySelector(".current");
    //Добавляем handling-repeat 1:11:11
    this.repeatButton = document.querySelector(".handling-repeat");
    //Добавляем controls-volume 1:13:52
    this.volumeButton = document.querySelector(".controls-volume");
    //1:16:20 Эта строка находит и сохраняет кнопку перемешивания треков в твоём плеере! 🔀
    this.shuffleButton = document.querySelector(".handling-shuffle");
  }, 

  //Добавляем событие клика для item-a. Блок полноценный музыкальный центр! 🎵 38:55
  initEvents() {
    this.audioList.addEventListener("click", this.handleItem.bind(this));
    //Добавляем клик handling-repeat(повтор трека/плейлиста) 1:11:11
    this.repeatButton.addEventListener("click", this.handleRepeat.bind(this));
    //Добавляем клик controls-volume 1:14:12
    this.volumeButton.addEventListener("change", this.handleVolume.bind(this));
    //Добавляем клик перемешивание треков 1:16:36
    this.shuffleButton.addEventListener("click", this.handleShuffle.bind(this));

    // === Управление с клавиатуры === «От себятина»
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleAudioPlay();
      } else if (e.code === 'ArrowRight') {
        this.handleNext();
      } else if (e.code === 'ArrowLeft') {
        this.handlePrev();
      }
    });
    // === КОНЕЦ ДОБАВЛЕНИЯ ===
  },

  // === Функция сохранения состояния === «От себятина»
  saveState() {
    localStorage.setItem('musicPlayerState', JSON.stringify({
      currentTrack: this.state.current?.id,
      volume: this.state.volume,
      playing: this.state.playing
    }));
  },
  // === КОНЕЦ ДОБАВЛЕНИЯ ===

  /*/ 1:16:48 сама функция в utils.js
  handleShuffle() {
    const { children } = this.audioList;// 1. Берём все элементы списка
    const shuffled = shuffle([...children]);// 2. Перемешиваем их    
    this.audioList.innerHTML = "";// 3. Очищаем контейнер
    shuffled.forEach((item) => this.audioList.appendChild(item));// 4. Вставляем в новом порядке

    // Добавь это для индикации: ИИ
    this.state.shuffling = !this.state.shuffling;
    console.log('Shuffle включен:', this.state.shuffling); // ← вот это!
    this.shuffleButton.classList.toggle("active", this.state.shuffling);*/
    /*/ Временно для теста
    this.shuffleButton.style.backgroundColor = this.state.shuffling ? '#4a90e2' : 'transparent';
    this.shuffleButton.style.border = this.state.shuffling ? '2px solid white' : 'none'; // ← рамка*/
  /*},*/

  handleShuffle() {
    // Сохраняем текущий трек
    const currentId = this.state.current?.id;
    
    const { children } = this.audioList;
    const shuffled = shuffle([...children]);   
    this.audioList.innerHTML = "";
    shuffled.forEach((item) => this.audioList.appendChild(item));
  
    // ИСПРАВЛЕНИЕ: Перемешиваем массив audios в том же порядке
    const shuffledAudios = [];
    const items = this.audioList.querySelectorAll('.item');
    
    items.forEach(item => {
      const id = parseInt(item.dataset.id);
      const audio = this.state.audios.find(a => a.id === id);
      if (audio) shuffledAudios.push(audio);
    });
    
    this.state.audios = shuffledAudios;
    
    // Восстанавливаем текущий трек если он был
    if (currentId) {
      const currentAudio = this.state.audios.find(a => a.id === currentId);
      if (currentAudio) {
        this.state.current = currentAudio;
      }
    }
  
    this.state.shuffling = !this.state.shuffling;
    this.shuffleButton.classList.toggle("active", this.state.shuffling);
    
    console.log('Shuffle применён, новый порядок треков:', this.state.audios.map(a => a.track));
  },

  // 1:15:00 Этот блок кода обрабатывает изменение громкости через ползунок! 🎛️→🔊
  handleVolume({ target: { value } }) {
    const { current } = this.state;// - получаем текущий трек
    this.state.volume = value;// - сохраняем новое значение громкости в состоянии плеера
    if (!current?.audio) return;// - проверяем: Есть ли текущий трек? Есть ли у него аудио-элемент? Если нет - выходим из функции
    current.audio.volume = value;// - применяем громкость к аудио-элементу

    this.saveState(); // Сохраняем громкость. «От себятина»
  },

  //1:11:50
  /*handleRepeat({ currentTarget }) {
    const { repeating } = this.state;

    //classList меняем на класс active
    currentTarget.classList.toggle("active", !repeating);
    this.state.repeating = !repeating;
  },*/

  // Добавила индикации режима повтора! «От себятина»
  handleRepeat({ currentTarget }) {
    // === ДОБАВИЛА ПРОВЕРКУ ===
    // Если нет текущего трека - игнорируем клик
    if (!this.state.current?.id) {
      console.log('Сначала выберите трек!');
      return;
    }
    // === КОНЕЦ ПРОВЕРКИ ===

    // Цикл режимов: 0 → 1 → 2 → 3 → 0
    this.state.repeatMode = (this.state.repeatMode + 1) % 4;

    // Устанавливаем счётчики в зависимости от режима
    if (this.state.repeatMode === 1) {
      this.state.repeatRemaining = 1; // +1 дополнительное проигрывание
    } else if (this.state.repeatMode === 2) {
      this.state.repeatRemaining = 2; // +2 дополнительных проигрывания
    } else if (this.state.repeatMode === 3) {
      this.state.repeatRemaining = Infinity; // бесконечность
    } else {
      this.state.repeatRemaining = 0;
    }
    
    // Убираем все классы повторения
    currentTarget.classList.remove('repeat-one', 'repeat-two', 'repeat-all', 'active');
    
    // Добавляем нужный класс в зависимости от режима
    if (this.state.repeatMode === 1) {
      currentTarget.classList.add('repeat-one', 'active');
      currentTarget.setAttribute('data-count', '1'); // ← цифра 1
    } else if (this.state.repeatMode === 2) {
      currentTarget.classList.add('repeat-two', 'active');
      currentTarget.setAttribute('data-count', '2'); // ← цифра 2
    } else if (this.state.repeatMode === 3) {
      currentTarget.classList.add('repeat-infinity', 'active');
      currentTarget.setAttribute('data-count', '∞'); // ← бесконечность
    } else {
      currentTarget.removeAttribute('data-count');
    }
    
    console.log(`Режим повтора: ${this.state.repeatMode}, Осталось повторений: ${this.state.repeatRemaining}`);
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

    // === Обновляем маленькую кнопку текущего трека === «От себятина»
    const currentItemPlay = document.querySelector(`[data-id="${current.id}"] .item-play`);
    if (currentItemPlay) {
      currentItemPlay.classList.toggle('playing', !playing);
    }

    this.saveState(); // Сохраняем состояние воспроизведения
    // === КОНЕЦ ДОБАВЛЕНИЯ ===
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
    const progressBar = progress.parentElement; // сам прогресс-бар «От себятина»
    //Тоже будет меняться. 48:20
    const timeline = document.querySelector(".timeline-start");

    // === Progress Click (перемотка по клику): === «От себятина»
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      const newTime = percent * duration;
      
      audio.currentTime = newTime;
      progress.style.width = `${percent * 100}%`;
      timeline.innerHTML = toMinAndSec(newTime);
    });
    // === КОНЕЦ ===

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


    /*/Когда трек до поёт, заиграет следующий 1:09:55 
    audio.addEventListener("ended", ({ target }) => {
      //Обновляем 0
      target.currentTime = 0;*/
    audio.addEventListener("ended", () => { //«От себятина»
      //Обновляем 0
      audio.currentTime = 0;  
      progress.style.width = `0%`;

      console.log(`Трек завершён. Режим: ${this.state.repeatMode}, Осталось: ${this.state.repeatRemaining}`); // ← ДЛЯ ОТЛАДКИ

      //Переделали запись 1:13:20
      // this.handleNext();
      // this.state.repeating ? target.play() : this.handleNext();ЗАМЕНИЛИ. В моей доработке она не нужна

      // === НА ЭТУ НОВУЮ ЛОГИКУ! ИСПОЛЬЗУЙ this.state.repeatMode НАПРЯМУЮ. ===
      if (this.state.repeatMode === 1 || this.state.repeatMode === 2) {

        console.log(`Осталось повторений: ${this.state.repeatCounter}`); // ← ДЛЯ ОТЛАДКИ
        
        if (this.state.repeatRemaining > 0) {
          this.state.repeatRemaining--; //уменьшаем счётчик ПЕРЕД воспроизведением  

          // Обновляем цифру на кнопке
          if (this.state.repeatRemaining > 0) {
            this.repeatButton.setAttribute('data-count', this.state.repeatRemaining.toString());
          } else {
            this.repeatButton.removeAttribute('data-count'); // убираем цифру
          }
          audio.play(); // играем снова
          console.log(`Повторяем трек. Осталось повторений: ${this.state.repeatRemaining}`);
        } else {
          // Повторы закончились - выключаем
          this.state.repeatMode = 0;
          this.state.repeatRemaining = 0;
          this.repeatButton.removeAttribute('data-count');
          this.repeatButton.classList.remove('active', 'repeat-one', 'repeat-two', 'repeat-all');
          this.handleNext(); // переходим к следующему треку
        }
      } else if (this.state.repeatMode === 3) {
        // Бесконечный режим - играем снова
        audio.play();
      } else {
        // Без повтора - следующий трек
        this.handleNext();
      }
      // === КОНЕЦ ЗАМЕНЫ ===
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

  /*/ Ставим пал(чтобы играла одна музыка при переключение аудио) 1:03:55
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
  },*/

  // Мой вариант
  pauseCurrentAudio() {
    const { current: { audio } } = this.state;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  },

  //Эта функция кнопки будет реагировать на состояние предыдущей кнопки(была на паузе, значит пауза - была воспроизведённой, значит будет воспроизведёная) 1:06:14
  togglePlaying() {
    const { playing, current } = this.state;// playing должно означать "сейчас играет"
    //Берём аудио из current-a
    const { audio } = current;

    // Перенесли из handleAudioPlay() 1:07:42. Если воспроизводится, то и следующая должна воспроизводиться
    //playing ? audio.play() : audio.pause();Здесь ошибка
    // Если НЕ играет - играть, если играет - пауза
    !playing ? audio.play() : audio.pause();

    // ДОБАВЬ ЭТУ СТРОКУ чтобы синхронизировать состояние: Моя «От себятина»
    this.state.playing = !playing;

    /*/Здесь меняет у кнопки иконки. 55:00. Перенесли из handleAudioPlay() 1:07:42 Если воспроизводится, то и следующая должна воспроизводиться
    this.playButton.classList.toggle("playing", playing);*/

    // Моя «От себятина». Большая кнопка
    this.playButton.classList.toggle("playing", !playing); // ← инвертируй!    
  },

  // Функция 41:44 Сохранение состояния при переключении трека
  setCurrentItem(itemId) {
    //Осуществляем поиск по нашему аудио
    const current = this.state.audios.find(({ id }) => +id === +itemId);

    //Проверка
    if (!current) return;

    // Вызываем пал 1:03:57 Останавливаем текущий трек
    this.pauseCurrentAudio();

    // === СБРОС ПОВТОРОВ ПРИ СМЕНЕ ТРЕКА ===
    this.state.repeatMode = 0;
    // this.state.repeatCounter = 1;
    this.state.repeatRemaining = 0;
    this.repeatButton.removeAttribute('data-count');
    this.repeatButton.classList.remove('active', 'repeat-one', 'repeat-two', 'repeat-all');
    // === КОНЕЦ ДОБАВЛЕНИЯ ===

    // СБРАСЫВАЕМ СОСТОЯНИЕ playing «От себятина»
    this.state.playing = false;  // сначала сбрасываем состояние

    this.state.current = current; // потом устанавливаем новый трек
    //Вместе они переключатель. Нажимая на нижние, верху появляется нажатый нижний. 46:40    
    this.currentItem.innerHTML = this.renderCurrentItem(current);

    // 1:15:40 Эта строка устанавливает громкость аудиоплеера.🎛️→🔊
    current.audio.volume = this.state.volume;

    //Вызываем функцию 56:16
    this.handlePlayer();
    //Вывод функции. Она будет находит <div class="progress"> 47:38
    this.audioUpdateHandler(current);

    // === Обновляем иконки ВСЕХ маленьких кнопок === «От себятина»
    const allItemPlays = document.querySelectorAll('.item-play');
    allItemPlays.forEach(btn => btn.classList.remove('playing'));
    
    // Для текущего трека добавляем playing
    const currentItemPlay = document.querySelector(`[data-id="${itemId}"] .item-play`);
    if (currentItemPlay) {
      currentItemPlay.classList.add('playing');
    }
    // === КОНЕЦ ДОБАВЛЕНИЯ ===

    // Запускаем воспроизведение «От себятина»
    current.audio.play();
    this.state.playing = true;
    this.playButton.classList.add("playing");

    /*/Прописываем таймаут 1:06:30 Этот блок не нужен в моём варианте
    setTimeout(() => {
      this.togglePlaying();
    }, 5) //10 секунд;*/

    this.saveState(); //ВЫЗОВ функции! «От себятина»    
  },

  /*/Функция
  handleItem({ target }) {
    //console.log(target); 40:14

    //Получаем id 40:32 
    const { id } = target.dataset;

    if (!id) return;

    // Отдаём id 41:44
    this.setCurrentItem(id);
  },*/

  // Моя переделка функции. Теперь кнопка play(маленькая) будет включать музыку!
  handleItem({ target }) {
    //console.log(target); 40:14

    // Ищем ближайший родительский элемент с data-id (исправление!)
    const item = target.closest('[data-id]');
    
    if (!item) return;

    //Получаем id 40:32 
    const { id } = item.dataset; // ← поменял target на item!
    // if (!id) return;

    // === ДОБАВЬ ЭТУ ПРОВЕРКУ === «От себятина»
    // Если кликаем на текущий уже играющий трек - ставим паузу/продолжаем
    if (this.state.current?.id?.toString() === id) {
      this.handleAudioPlay(); // используем ту же логику что и для большой кнопки
      return;
    }
    // === КОНЕЦ ДОБАВЛЕНИЯ ===

    // Отдаём id 41:44 Если кликаем на другой трек - переключаемся
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
 