/**
 @todo 1) Cоздать на основе express и handlebars веб-сервисс HTML-интерфейсом для динамической загрузки информации с одного из нескольки хсайтов в выбранном формате.
 Зайдя на этот сервис, пользователь сможет спомощью формы настроить параметры информационной подборки (например, количество отображаемых новостей или их категорию )
 и получить ее в удобном виде. Форма должна отправляться насервер методом POST.)

 @todo 2) Реализовать запоминание спомощью cookie текущих настроек формы и призаходе на сайт показывать последние использованные настройки.
 Если cookie несуществует, можно при отображении формы дополнительно учитывать передаваемые GET-запросы(например, ?count=10&lang=ru ит.д.)
 */
const path = require('path');
const clc = require('cli-color');
const express = require('express');
const consolidate = require('consolidate');
const cookieParser = require('cookie-parser');
const handlebars = require('handlebars');

const Parser = require( './parser' );
const { PORT, SERVER_URL, FILTER_COOKIE, FEEDS, FEEDS_CATEGORIES } = require( './configs' );

const app = express();
app.engine('hbs', consolidate.handlebars );

app.use( cookieParser() )
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( 
    express.static( path.resolve( __dirname, 'views','css') ) 
);

app.set( 'view engine', 'hbs' );
app.set( 'views', path.resolve( __dirname, 'views') );

const parserModel = new Parser();

/** для удобства перенаправляю на страницу новостей */
app.get( '/', ( req, res ) => {
  const cookieData = req.cookies[ FILTER_COOKIE ];
  res.cookie( FILTER_COOKIE, cookieData );
  res.redirect( '/news' );
});

/**
 * Так как в шаблонизатор нельзя вставлять JS выражения, добавил такой хелпер, который отмечает выбраный тип новости в списке
 * @param { Boolean } isSelected
 * @return { String }
 **/
handlebars.registerHelper('isSelected', ( isSelected ) => {
  return isSelected ? 'selected' : '';
});

/**
 * страница новостей ( оснавная страница в этом приложении )
 * @todo слишком много обязанностей у этого эндпоинта, придумать как поправить
 **/
app.get( '/news', ( req, res ) => {
  const cookieData = req.cookies[ FILTER_COOKIE ] || {};
  res.cookie( FILTER_COOKIE, cookieData );

  const { selectedType, newsCount } = getRequestFilter( req, cookieData );
  const selectedNews = FEEDS[ selectedType ];
  const responseBody = { typesList: FEEDS_CATEGORIES, newsData: [], newsCount };

  if ( !selectedNews ) {
    renderNewsPage( res, 'news', responseBody );
    return;
  }
  /** загрузка данных в парсер, и вызов метода получения данных */
  parserModel
    .setConfig( selectedNews, newsCount )
    .getNews();

  /** когда данные будут готовы, отдаем контент на страницу */
  parserModel.once( Parser.DATA_LOADED_SUCCESS, () => {
    const preparedList = FEEDS_CATEGORIES.map( item => ({
      ...item,
      selected: item.id === selectedType ? 'selected' : ''
    }));

    return res.render( 'news', {
      ...responseBody,
      newsData: parserModel.data,
      typesList: preparedList
    });
  });
  /** В случае ошибки, просто редирект, страница/сообщения для ошибок не реализована */
  parserModel.once( Parser.DATA_LOADED_ERROR, () => res.redirect( '/news' ) );
});

/**
 *    Обработка отправки формы, делаю редирект с гет параметрами,
 *  чтоб не дублировать логику при работе с cookies и query string, а обрабатывать все в одном месте
 **/
app.post('/news', ( req, res ) => {
  const { newsType, newsCount } = req.body;
  res.cookie( FILTER_COOKIE, { type: newsType, count: newsCount }, { maxAge: 10000 } );
  res.redirect( `/news?type=${ newsType }&count=${ newsCount }` );
});

/**
 * Функция хелпер, для отрисовки страници
 * @param { Response } response,
 * @param { String } view
 * @param { Object } responseBody
 * @return { void }
 **/
function renderNewsPage( response, view, responseBody ) {
  response.render( view, responseBody );
}

function getRequestFilter( req, cookie ) {
  const { type, count } = req.query;
  return {
    selectedType: ( type || cookie.type ),
    newsCount: ( count || cookie.count ),
  };
}

/** запуск сервера */
app.listen( 3000, () => console.log(
  clc.yellow(`==================== Server start ====================\n`),
  clc.green(`\t${ SERVER_URL }:${ PORT }`)
));