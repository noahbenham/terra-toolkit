/* global browser, describe, it, before, expect */
describe('I18n Locale', () => {
  before(() => {
    browser.url('/i18n-default.html');
  });

  it('Express correctly sets the application locale', () => {
    const browserLocale = browser.getAttribute('html', 'lang');
    const locale = 'en';
    expect(browserLocale).to.equal(locale);
  });
});
