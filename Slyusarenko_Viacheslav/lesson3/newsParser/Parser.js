/**
 *  1) Создать программу для получения информации о последних
 *  новостей с выбранного вами сайта в структурированном виде
 **/
const Cheerio = require('cheerio');

module.exports = class Parser extends Cheerio {
  static IMG = 'img';
  static STYLES = {
    containerStyle: 'display: flex; border: 6px solid #ddd; margin: 10px;',
    imgStyle: 'width: 30%; height: 30%;',
    contentStyle: 'padding: 10px;'
  };

  /** 
  * получение готовой html разметки с новостями 
  * @param { String } html
  * @param { String } mainSelector
  * @param { Object<{ selector: String, key: String }> } params
  * @return { void }
  **/
  constructor( html, mainSelector, params ) {
    super();
    /** Вызываем метод родителя */
    this.html = Parser.load(html);
    this.mainSelector = mainSelector;
    this.params = params;
  }

  /** 
  * получение готовой html разметки с новостями 
  * @return { String }
  **/
  getNews = () => this.buildFeedElement().join('');

 /** 
  * метод парсинга и сбора новостей по селекторам
  * @return { Array }
  **/
  parseNews = () => {
    let feeds = {};
    const { params, mainSelector } = this;
    const arrayOfSelectors = params && Array.isArray( params ) ? params: [];
    /** проходим по всем элементам массива с доп селекторами, и собираем данные*/
    arrayOfSelectors.forEach( ({ key, selector }) => {
      const itemSelector = `${ mainSelector } ${ selector }`;
      feeds = this.collectNewsData( feeds, key, itemSelector );
    });
    /** отдаем только новости */
    return Object.values( feeds );
  };
    
 /** 
  * Сбор данных о новостях
  * @param { Object } feeds
  * @param { String } key
  * @param { String } selector
  * @return { Object }
  **/
  collectNewsData( feeds, key, selector ) {
    const { html } = this;
    const { IMG } = Parser;
    /** поиск по селекторам */
    html( selector ).each( ( idx, element ) => {
      let method = () => html( element ).text();

      if ( key === IMG ) {
        method = () => html( element ).data('src');
      }
      /** обновляем обьект новостей заполняя новыми данными, и сохраняя уже существующие */
      feeds[ idx ] = { ...feeds[ idx ], [ key ]: method() };
    });
    return feeds;
  }

 /**  
  * Вывод разметки новостей
  * @return { Array }
  **/
  buildFeedElement() {
    const feeds = this.parseNews();
    const { STYLES: { containerStyle, imgStyle, contentStyle } } = Parser;

    return feeds.map( ({ title, img, body }) =>
      `<div style="${ containerStyle }">
        <img style="${ imgStyle }" src="${ img }" alt="img"> 
        <div style="${ contentStyle }">
          <h3>${ title }</h3>
          <div>${ body }</div>  
        </div> 
      </div>`
    );
  }
}