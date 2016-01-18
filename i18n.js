/**
 * Copyright (C) 2015  Austin Peterson
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Internationalization Helper.
 * @param  {String} locale The default locale to use.
 */
function i18n(locale) {
    this.strings = require('./lang');
    this.defaultLocale = locale;
}

/**
 * Get an internationalized string.
 * @param  {String} key    The string to get.
 * @param  {String} locale Optional. The locale to use.
 * @return {String}        The string to use.
 */
i18n.prototype.getString = function (key, locale) {
    if(!locale) {locale = this.defaultLocale;}

    //try to get proper locale string, fall back to en-us string, fall back to empty string.
    var localeArray = (this.strings[locale] || this.strings[this.defaultLocale] || this.strings["en-us"]);

    if(localeArray) {
        return (localeArray[key] || this.strings[this.defaultLocale][key] || this.strings["en-us"][key] || ""); //TODO: Make this throw an error or something.
    }

    return "";
};

module.exports = i18n;
