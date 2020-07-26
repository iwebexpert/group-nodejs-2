/**
 *     Создать переводчик слов с английского на русский, который будет
 *   обрабатывать входящие GET запросы и возвращать ответы,
 *   полученные через API Яндекс.Переводчика. 
 **/
const clc = require('cli-color');
const request = require('request');

module.exports = class Translate {
  /** 
   * Конструктор
   * @param { Object<{ command: String, code: String, desc: String }> } languagesConfig
   * @return { void }
   */
  constructor( languagesConfig ) {
    this.availableLanguages = languagesConfig;

    if ( !languagesConfig || !Array.isArray( languagesConfig ) || !languagesConfig.length ) {
      throw new Error( 'Invalid Lang Config!!' )
    }

    this.state = {
      url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
      key: 'trnsl.1.1.20191123T035539Z.11f37bc35e92c80a.d6cf7aafb855a540ffc51a473ff508a5131eded3',
      lang: languagesConfig[0].code,
      text: ''
    };

    this.showInfoMessage();
    this.showCurrentTranslateLang();
  }

  /** 
   * обновление состояния приложения
   * @param { Object } updatedState
   * @return { void }
   */
  setState( updatedState ) {
    this.state = { ...this.state, ...updatedState };
  }

  /** 
   * вывод перевода в консоль
   * @param { String } translate
   * @return { void }
   */
  print( translate ) {
    const lang = this.availableLanguages.find( lang => lang.code === this.state.lang )
    console.log( `${ lang.desc }: ${ clc.yellow( translate ) }` );
  }
  
  /** 
   * обработка ответа
   * @param { String } err
   * @param { Object } res
   * @return { void }
   */
  handleResponse = (err, res) => {
    if ( err ) {
      this.print( err );
      return;
    }
    const { text } = JSON.parse( res.body );
    this.print( text );

    this.showCurrentTranslateLang();
  }
  
  /** 
   * функция которая запускает всю необходимую логику получения ответа от яндекса
   * @return { Promise }
   */
  getTranslate() {
    const { url , ...queryParams } = this.state;
    return request( {
      url, 
      qs: queryParams,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }, this.handleResponse );
  }

  /** 
   * установка текста на перевод
   * @param { String } text
   * @return { Translate }
   **/
  setText( text ) {
    this.setState({ text });
    return this;
  }

  /** 
   * Установка языка перевода
   * @param { String } command
   * @return { void }
   **/
  setTargetLang( command ) {
    const selectedLang = this.availableLanguages.find( (lang) => lang.command === command );
    
    if ( !selectedLang ) {
      return;
    }

    this.setState({ lang: selectedLang.code });
    this.showCurrentTranslateLang();
  }

  /** 
   * Вывод информационного сообщения
   * @return { void }
   **/
  showInfoMessage() {
    console.log( '\n\tВведите слово для перевода, Русское либо Английское ( перевод осуществляется с Русского на Английский, либо с Английского на русский )' );
    console.log( 'Для установки языка, на который нужно переводить, введите:');

    this.availableLanguages.forEach( lang => {
      console.log(  `${ clc.blue( lang.desc ) }: ${ clc.green( lang.command ) }`);
    });
  }

  /** 
   * Проверка на команду смены языка
   * @param { String } command
   * @return { boolean }
   **/
  isChangeLangCommand( command ) {
    return Boolean( this.availableLanguages.find(( lang ) => command === lang.command ) );
  }

  /** 
   * Вывод информации о режеме перевода
   * @return { void }
   **/
  showCurrentTranslateLang() {
    console.log(  `============== current mode: ${ clc.blue( this.state.lang ) } ==============`);
  }
}