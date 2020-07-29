const AVAILABLE_FEEDS = {
  js: {
    name: 'JavaScript',
    url: 'https://jsfeeds.com',
    mainSelector: '.article_body .row',
    paramsSelector: [
      { selector: 'h3 a', key: 'title' },
      { selector: '.col-md-6 a>img', key: 'img', dataParam: 'src'},
      { selector: '.col-md-18', key: 'body' },
    ]
  },
  python: {
    name: 'Python',
    url: 'https://www.infoworld.com/category/python/',
    mainSelector: '.river-well.article',
    paramsSelector: [
      { selector: 'h3 a', key: 'title' },
      { selector: '.well-img a>img', key: 'img', dataParam: 'original'},
      { selector: 'h4', key: 'body' },
    ]
  },
  /** взял тотже сайт чтоб с селекторами снова не разбиратся */
  dotNet: {
    name: 'Microsoft .NET',
    url: 'https://www.infoworld.com/category/microsoft-net/',
    mainSelector: '.river-well.article',
    paramsSelector: [
      { selector: 'h3 a', key: 'title' },
      { selector: '.well-img a>img', key: 'img', dataParam: 'original'},
      { selector: 'h4', key: 'body' },
    ]
  }
};

/** 
 * вспомогательная функция плолучение категорий новостей
 * @param { Object } feedsConfig
 * @return { Array<{ id: string, name: string }> }
 */
function getCategories( feedsConfig ) {
  const entries = Object.entries( feedsConfig );
  return entries.map(([ key, value ]) => {
    return { id: key, name: value.name };
  });
}

module.exports = {
  PORT: 3000,
  SERVER_URL: 'http://localhost', /** url адресс нашего приложения */
  FILTER_COOKIE: 'filter', /** кука в которой мы храним значения фильтра */

  CODE_OK: 200,
  FEEDS: AVAILABLE_FEEDS,
  FEEDS_CATEGORIES: getCategories( AVAILABLE_FEEDS ),
};