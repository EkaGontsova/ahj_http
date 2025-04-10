export default function runRequest(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      headers = {},
      data = {},
      responseType = 'json',
      method = 'GET',
    } = options;

    const url = new URL('http://localhost:7070/');

    // Добавляем параметры метода в URL для GET и POST запросов
    if (method === 'GET') {
      Object.keys(data).forEach((key) => url.searchParams.append(key, data[key]));
    } else {
      // Для POST запросов метод также передается в query-параметрах
      Object.keys(data).forEach((key) => url.searchParams.append(key, data[key]));
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    // Устанавливаем заголовок для JSON
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Устанавливаем все дополнительные заголовки
    for (const header in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, header)) {
        xhr.setRequestHeader(header, headers[header]);
      }
    }

    xhr.responseType = responseType;

    // Отправляем запрос
    if (method === 'GET') {
      xhr.send();
    } else {
      // Отправляем данные как JSON
      xhr.send(JSON.stringify(data));
    }

    // Обработка ответа
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          // Используем xhr.response, если responseType 'json'
          const response = responseType === 'json' ? xhr.response : xhr.responseText;
          resolve(response);
        } catch (error) {
          reject(new Error(`Ошибка парсинга ответа: ${error.message}`));
        }
      } else {
        reject(new Error(`Ошибка ${xhr.status}: ${xhr.statusText}`));
      }
    });

    // Обработка сетевых ошибок
    xhr.addEventListener('error', () => {
      reject(new Error('Сетевая ошибка'));
    });
  });
}
