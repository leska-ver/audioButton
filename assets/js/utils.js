// Если меньше 10, то выводим 0. А если нет, то просто будем отдавать ему тайм. И это всё мы ещё вернём тогда вот в эту функцию.
const formatTime = (time) => (time < 10 ? `0${time}` : time)

export const toMinAndSec = (duration) => {
  //floor округляем. Находим минуты
  const minutes = formatTime(Math.floor(duration / 60));
  // Находим секунды
  const seconds = formatTime(Math.floor(duration - minutes * 60));

  //Оператор return завершает выполнение текущей функции и возвращает её значение.
  return `${minutes}:${seconds}`;
};

// 1:16:48 handleShuffle() в scripts.js
export const shuffle = (array) => array.sort(() => 0.5 - Math.random());