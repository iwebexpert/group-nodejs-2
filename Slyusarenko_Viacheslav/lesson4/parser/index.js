const $ = require('cheerio');
const request = require('request');
const { EventEmitter } = require('events');
const { CODE_OK } = require('../configs');

module.exports = class Parser extends EventEmitter {
  $ = null;
  data = [];
  /** кастомные события */
  static DATA_LOADED_SUCCESS = 'dataLoadedSuccess';
  static DATA_LOADED_ERROR = 'dataLoadedError';

  /**
   * Установка параметров получения новостей
   * @param { Object } params
   * @param { Number|Null } count
   * @return { Parser }
   **/
  setConfig( params, count = null ) {
    const { mainSelector, paramsSelector, url } = params;

    this.url = url;
    this.mainSelector = mainSelector;
    this.params = paramsSelector;
    this.count = count;
    return this
  }

  /**
   * Метод для запуска получения новостей
   **/
  getNews = () => {
    if ( !this.url || !this.mainSelector ) {
      this.emit( Parser.DATA_LOADED_ERROR );
      console.warn('Params config Is not set!')
      return;
    }

    request( this.url, (error, response, html) => {
      if ( error || response.statusCode !== CODE_OK ) {
        this.emit( Parser.DATA_LOADED_ERROR );
        return;
      }
      this.$ = $.load(html);
      this.data = this.parseNews();
      this.emit( Parser.DATA_LOADED_SUCCESS );
    });
  };

  /**
   * Запуск Парсинга новостей
   * @return { Array }
   **/
  parseNews = () => {
    const { params, mainSelector } = this;
    const arrayOfSelectors = params && Array.isArray( params ) ? params: [];
  
    const feeds = arrayOfSelectors.reduce(( acc, params ) => {
      return this.collectNewsData( acc, mainSelector, params );
    }, {});
    /** отдаем только новости */
    return Object.values( feeds );
  };

  /**
   * Метод сбор данных со страници донора
   * @param { Object } feeds
   * @param { String } mainSelector
   * @param { Array } params
   * @return { Object }
   **/
  collectNewsData( feeds, mainSelector, params ) {
    const { $, count } = this;
    const { dataParam, key, selector } = params;
    const itemSelector = `${ mainSelector } ${ selector }`;

    /** поиск по селекторам */
    $( itemSelector ).each( ( idx, element ) => {
      /** если установлен лимит, и следущуюий элемент перейдет за предел, мы возвращаем false обрывая цикл Each */
      if ( count && Number( count ) < idx + 1 ) {
        return false;
      }

      let method = () => $( element ).text();
      if ( this.isImage( key ) ) {
          method = () => $( element ).data( dataParam );
      }
      /** обновляем обьект новостей заполняя новыми данными, и сохраняя уже существующие */
      feeds[ idx ] = { ...feeds[ idx ], [ key ]: method() };
    });
    return feeds;
  }

  /**
   * Проверка селектора, на то что он относится к картинке ( изза зарличных методов получения данных )
   * @param { string } key
   * @return { Boolean }
   **/
  isImage( key ) {
    return key === 'img';
  }
}