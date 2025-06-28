const moment = require('moment');
//
// const {customAlphabet} = require("nanoid");
//const {customRandom, urlAlphabet, customAlphabet} = require('nanoid');
//const nanoid = customAlphabet('1234567890abcdef', 10);


function merge() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaults = arguments.length > 1 ? arguments[1] : undefined;

    for (var key in defaults) {
        if (typeof obj[key] === 'undefined') {
            obj[key] = defaults[key];
        }
    }

    return obj;
}

function assertString(input) {
    var isString = typeof input === 'string' || input instanceof String;

    if (!isString) {
        var invalidType;

        if (input === null) {
            invalidType = 'null';
        } else {
            invalidType = _typeof(input);

            if (invalidType === 'object' && input.constructor && input.constructor.hasOwnProperty('name')) {
                invalidType = input.constructor.name;
            } else {
                invalidType = "a ".concat(invalidType);
            }
        }

        throw new TypeError("Expected string but received ".concat(invalidType, "."));
    }
}

function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
            return typeof obj;
        };
    } else {
        _typeof = function (obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }

    return _typeof(obj);
}

/**
 * Formats a string into a caterpillar-cased-string. This is really mostly helpful
 * for creating unique ids or class names.
 *
 * Example:
 * 'Hello World Stuff' -> 'hello-world-stuff'
 * 'WowzaNoWay' -> 'wowza-no-way'
 *
 * @param {String} str - the string to caterpillar-case
 * @return {String} the caterpillar-cased string.
 */
exports.toCaterpillarCase = function (str) {
    return str.replace(/\/|\\|\[|]/g, '').split(/\s|(?=[A-Z])/).join('-').toLowerCase();
}


/**
 * r
 * Replace
 */
exports.replace = (string, from, to) => {
    return string.replace(from, to);
};


/**
 *  toCurrency(n, curr, LanguageFormat = undefined)
 *  @param {number} float - the amount/money
 * @return {currency} str - the currency of the number.
 * @return {LanguageFormat} str - the Language Format.
 *
 * example
 * toCurrency(123456.789, 'EUR');   // €123,456.79  | currency: Euro | currencyLangFormat: Local
 * toCurrency(123456.789, 'USD', 'en-us');   // $123,456.79  | currency: US Dollar | currencyLangFormat: English (United States)
 */
exports.toCurrency = (number, currency, LanguageFormat = undefined) => {
    return Intl.NumberFormat(LanguageFormat, {style: 'currency', currency: currency}).format(number);
};


/**
 byteSize
 Returns the length of a string in bytes.
 Convert a given string to a Blob Object and find its size.
 Examples
 byteSize('😀'); // 4
 byteSize('Hello World'); // 11
 */
exports.byteSize = (string) => {
    return new Blob([string]).size;
};


/**
 capitalizeWordFirstLetter
 Capitalizes the first letter of a string.
 Use array destructuring and String.prototype.toUpperCase() to capitalize first letter,
 ...rest to get array of characters after first letter and then Array.prototype.join('') to make it a string again.
 Omit the lowerRest parameter to keep the rest of the string intact, or set it to true to convert to lowercase.
 Examples
 capitalizeWordFirstLetter('fooBar'); // 'FooBar'
 capitalizeWordFirstLetter('fooBar', true); // 'Foobar'
 */
exports.capitalizeWordFirstLetter = ([first, ...rest], lowerRest = false) => {
    return first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''));
};


/**
 deCapitalizeWordFirstLetter
 Decapitalizes the first letter of a string.
 Use array destructuring and String.toLowerCase() to decapitalize first letter,
 ...rest to get array of characters after first letter and then Array.prototype.join('') to make it a string again.
 Omit the upperRest parameter to keep the rest of the string intact, or set it to true to convert to uppercase.
 const decapitalize = ([first, ...rest], upperRest = false) =>
 first.toLowerCase() + (upperRest ? rest.join('').toUpperCase() : rest.join(''));
 Examples
 deCapitalizeWordFirstLetter('FooBar'); // 'fooBar'
 deCapitalizeWordFirstLetter('FooBar', true); // 'fOOBAR'
 */
exports.deCapitalizeWordFirstLetter = ([first, ...rest], upperRest = false) => {
    return first.toLowerCase() + (upperRest ? rest.join('').toUpperCase() : rest.join(''));
};


/**
 capitalizeEveryWordFirstLetter
 Capitalizes the first letter of every word in a string.
 Use String.prototype.replace() to match the first character
 of each word and String.prototype.toUpperCase() to capitalize it.
 Examples
 capitalizeEveryWordFirstLetter('hello world!'); // 'Hello World!'
 */
exports.capitalizeEveryWordFirstLetter = (string) => {
    string.toLowerCase();
    return string.replace(/\b[a-z]/g, char => char.toUpperCase());
};


/**
 compactWhitespace
 Returns a string with whitespaces compacted.
 Use String.prototype.replace() with a regular expression to replace all
 occurrences of 2 or more whitespace characters with a single space.
 Examples
 compactWhitespace('Lorem    Ipsum'); // 'Lorem Ipsum'
 compactWhitespace('Lorem \n Ipsum'); // 'Lorem Ipsum'
 */
exports.compactWhitespace = (string) => {
    return string.replace(/\s{2,}/g, ' ');
};


/**
 *
 */
exports.toLowerCase = (string) => {
    return string.toLowerCase()
};


/**
 *
 */
exports.toUpperCase = (string) => {
    return string.toUpperCase()
};


/**
 isLowerCase
 Checks if a string is lower case.
 Convert the given string to lower case, using String.toLowerCase() and compare it to the original.
 Examples
 isLowerCase('abc'); // true
 isLowerCase('a3@$'); // true
 isLowerCase('Ab4'); // false
 */
exports.isLowerCase = (string) => {
    return string === string.toLowerCase();
};


/**
 isUpperCase
 Checks if a string is upper case.
 Convert the given string to upper case, using String.prototype.toUpperCase() and compare it to the original.
 Examples
 isUpperCase('ABC'); // true
 isUpperCase('A3@$'); // true
 isUpperCase('aB4'); // false
 */
exports.isUpperCase = (string) => {
    return string === string.toUpperCase();
};


/**
 toCamelCase
 Converts a string to camelcase.
 Break the string into words and combine them capitalizing the first letter of each word, using a regexp.
 Examples
 toCamelCase('some_database_field_name'); // 'someDatabaseFieldName'
 toCamelCase('Some label that needs to be camelized'); // 'someLabelThatNeedsToBeCamelized'
 toCamelCase('some-javascript-property'); // 'someJavascriptProperty'
 toCamelCase('some-mixed_string with spaces_underscores-and-hyphens'); // 'someMixedStringWithSpacesUnderscoresAndHyphens'
 };
 */
exports.toCamelCase = (string) => {
    let newString = string && string.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
        .join('');
    return newString.slice(0, 1).toLowerCase() + newString.slice(1);
};

/**
 * fromCamelCase
 Converts a string from camelcase.
 Use String.prototype.replace() to remove underscores, hyphens, and spaces and convert words to camelcase.
 Omit the second argument to use a default separator of ' '.
 Examples
 fromCamelCase('someDatabaseFieldName', ' '); // 'some database field name'
 fromCamelCase('someLabelThatNeedsToBeCamelized', '-'); // 'some-label-that-needs-to-be-camelized'
 fromCamelCase('someJavascriptProperty', '_'); // 'some_javascript_property'
 */
exports.fromCamelCase = (string, separator = ' ') => {
    return string.replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
        .toLowerCase();
};


/**
 toKebabCase
 Converts a string to kebab case.
 Break the string into words and combine them adding - as a separator, using a regexp.
 Examples
 toKebabCase('camelCase'); // 'camel-case'
 toKebabCase('some text'); // 'some-text'
 toKebabCase('some-mixed_string With spaces_underscores-and-hyphens'); // 'some-mixed-string-with-spaces-underscores-and-hyphens'
 toKebabCase('AllThe-small Things'); // "all-the-small-things"
 toKebabCase('IAmListeningToFMWhileLoadingDifferentURLOnMyBrowserAndAlsoEditingSomeXMLAndHTML'); // "i-am-listening-to-fm-while-loading-different-url-on-my-browser-and-also-editing-xml-and-html"
 */
exports.toKebabCase = (string) => {
    return string && string.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');

};


/**
 toSnakeCase
 Converts a string to snake case.
 Break the string into words and combine them adding _ as a separator, using a regexp.
 Examples
 toSnakeCase('camelCase'); // 'camel_case'
 toSnakeCase('some text'); // 'some_text'
 toSnakeCase('some-mixed_string With spaces_underscores-and-hyphens'); // 'some_mixed_string_with_spaces_underscores_and_hyphens'
 toSnakeCase('AllThe-small Things'); // "all_the_smal_things"
 toSnakeCase('IAmListeningToFMWhileLoadingDifferentURLOnMyBrowserAndAlsoEditingSomeXMLAndHTML'); // "i_am_listening_to_fm_while_loading_different_url_on_my_browser_and_also_editing_some_xml_and_html"
 */
exports.toSnakeCase = (string) => {
    return string && string.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
};


/**
 toTitleCase
 Converts a string to title case.
 Break the string into words, using a regexp, and combine them capitalizing the
 first letter of each word and adding a whitespace between them.
 Examples
 toTitleCase('some_database_field_name'); // 'Some Database Field Name'
 toTitleCase('Some label that needs to be title-cased'); // 'Some Label That Needs To Be Title Cased'
 toTitleCase('some-package-name'); // 'Some Package Name'
 toTitleCase('some-mixed_string with spaces_underscores-and-hyphens'); // 'Some Mixed String With Spaces Underscores And Hyphens'
 */
exports.toTitleCase = (string) => {
    string.toLowerCase();
    return string && string.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.charAt(0).toUpperCase() + x.slice(1))
        .join(' ');

};





/**
 mask
 Replaces all but the last num of characters with the specified mask character.
 Use String.prototype.slice() to grab the portion of the characters that will remain unmasked
 and use String.padStart() to fill the beginning of the string with the mask character up to the original length.
 Omit the second argument, num, to keep a default of 4 characters unmasked. If num is negative, the unmasked characters
 will be at the start of the string. Omit the third argument, mask, to use a default character of '*' for the mask.
 Examples
 mask(1234567890); // '******7890'
 mask(1234567890, 3); // '*******890'
 mask(1234567890, -4, '$'); // '$$$$567890'
 */
exports.mask = (character, num = 4, mask = '*') => {
    return `${character}`.slice(-num).padStart(`${character}`.length, mask);
};


/**
 truncateString
 Truncates a string up to a specified length.
 Determine if the string's length is greater than num.
 Return the string truncated to the desired length, with '...' appended to the end or the original string.
 Examples
 truncateString('boomerang', 7); // 'boom...'
 */
exports.truncateString = (string, number) => {
    return string.length > number ? string.slice(0, number > 3 ? number - 3 : number) + '...' : string;
};


/**
 escapeHTML
 Escapes a string for use in HTML.
 Use String.prototype.replace() with a regexp that matches the characters that need to be escaped, using a callback function to
 replace each character instance with its associated escaped character using a dictionary (object).
 Examples
 escapeHTML('<a href="#">Me & you</a>'); // '&lt;a href=&quot;#&quot;&gt;Me &amp; you&lt;/a&gt;'
 */
exports.escapeHTML = (string) => {
    return string.replace(
        /[&<>'"]/g,
        tag =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
    );
};


/**
 unescapeHTML
 Unescapes escaped HTML characters.
 Use String.prototype.replace() with a regex that matches the characters that need to be unescaped,
 using a callback function to replace each escaped character instance with its associated unescaped
 character using a dictionary (object).
 Examples
 unescapeHTML('&lt;a href=&quot;#&quot;&gt;Me &amp; you&lt;/a&gt;'); // '<a href="#">Me & you</a>'
 */
exports.unescapeHTML = (string) => {
    return string.replace(
        /&amp;|&lt;|&gt;|&#39;|&quot;/g,
        tag =>
            ({
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&#39;': "'",
                '&quot;': '"'
            }[tag] || tag)
    );
};

/**
 stripHTMLTags
 Removes HTML/XML tags from string.
 Use a regular expression to remove HTML/XML tags from a string.
 Examples
 stripHTMLTags('<p><em>lorem</em> <strong>ipsum</strong></p>'); // 'lorem ipsum'
 */
exports.stripHTMLTags = (string) => {
    return string.replace(/<[^>]*>/g, '');
};


/**
 URLJoin advanced
 Joins all given URL segments together, then normalizes the resulting URL.
 Use String.prototype.join('/') to combine URL segments, then a series of String.prototype.replace()
 calls with various regexps to normalize the resulting URL (remove double slashes, add proper slashes for
 protocol, remove slashes before parameters, combine parameters with '&' and normalize first parameter delimiter).
 Examples
 URLJoin('http://www.google.com', 'a', '/b/cd', '?foo=123', '?bar=foo'); // 'http://www.google.com/a/b/cd?foo=123&bar=foo'
 */
exports.URLJoin = (...args) => {
    return args
        .join('/')
        .replace(/[\/]+/g, '/')
        .replace(/^(.+):\//, '$1://')
        .replace(/^file:/, 'file:/')
        .replace(/\/(\?|&|#[^!])/g, '$1')
        .replace(/\?/g, '&')
        .replace('&', '?');
};



/**
 *  isUrl
 */
exports.isUrl = (url) => {
    const regx = new RegExp(
        "^" +
        // protocol identifier
        "(?:(?:https?|http)://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:" +
        // IP address exclusion
        // private & local networks
        "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
        "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
        "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
        "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
        "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
        "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
        "|" +
        // host name
        "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
        // domain name
        "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
        // TLD identifier
        "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
        ")" +
        // port number
        "(?::\\d{2,5})?" +
        // resource path
        "(?:/\\S*)?" +
        "$", "i");

    return regx.test(url);
};



/**
 isEmpty
 Returns true if the a value is an empty object, collection, has no enumerable properties or is any type that is not considered a collection.
 Check if the provided value is null or if its length is equal to 0.
 Examples
 isEmpty([]); // true
 isEmpty({}); // true
 isEmpty(''); // true
 isEmpty([1, 2]); // false
 isEmpty({ a: 1, b: 2 }); // false
 isEmpty('text'); // false
 isEmpty(123); // true - type is not considered a collection
 isEmpty(true); // true - type is not considered a collection
 */
exports.isEmpty = (value) =>  {
     return value === null || value === undefined || value === 'undefined' || value === "" ||  !(Object.keys(value) || value).length;
}



/**
 isBoolean
 Checks if the given argument is a native boolean element.
 Use typeof to check if a value is classified as a boolean primitive.
 Examples
 isBoolean(null); // false
 isBoolean(false); // true
 */
exports.isBoolean = (str) =>  {
    assertString(str);
    return ['true', 'false', '1', '0'].indexOf(str) >= 0;
}


exports.isInt = (str, options) => {
    var _int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
    var intLeadingZeroes = /^[-+]?[0-9]+$/;
    assertString(str);
    options = options || {}; // Get the regex to use for testing, based on whether
    // leading zeroes are allowed or not.

    var regex = options.hasOwnProperty('allow_leading_zeroes') && !options.allow_leading_zeroes ? _int : intLeadingZeroes; // Check min/max/lt/gt

    var minCheckPassed = !options.hasOwnProperty('min') || str >= options.min;
    var maxCheckPassed = !options.hasOwnProperty('max') || str <= options.max;
    var ltCheckPassed = !options.hasOwnProperty('lt') || str < options.lt;
    var gtCheckPassed = !options.hasOwnProperty('gt') || str > options.gt;
    return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
}


function isJSON(str) {
    assertString(str);

    try {
        var obj = JSON.parse(str);
        return !!obj && _typeof(obj) === 'object';
    } catch (e) {
        /* ignore */
    }

    return false;
}



function isNumeric(str, options) {
    assertString(str);
    const numeric = /^[+-]?([0-9]*[.])?[0-9]+$/;
    const numericNoSymbols = /^[0-9]+$/;

    if (options && options.no_symbols) {
        return numericNoSymbols.test(str);
    }

    return numeric.test(str);
}


/**
 delay
 Invokes the provided function after wait milliseconds.
 Use setTimeout() to delay execution of fn. Use the spread (...) operator
 to supply the function with an arbitrary number of arguments.
 Examples
 delay(
 function(text) {
    console.log(text);
  },
 1000,
 'later'
 ); // Logs 'later' after one second.
 */
exports.delay = (fn, wait, ...args) =>  {
     return setTimeout(fn, wait, ...args);
}




/**
 delay
 Invokes the provided function after wait milliseconds.
 Use setTimeout() to delay execution of fn. Use the spread (...) operator
 to supply the function with an arbitrary number of arguments.
 Examples
 delay(
 function(text) {
    console.log(text);
  },
 1000,
 'later'
 ); // Logs 'later' after one second.
 */
exports.delay = (fn, wait, ...args) =>  {
     return setTimeout(fn, wait, ...args);
}



/**
 getURLParameters
 Returns an object containing the parameters of the current URL.
 Use String.match() with an appropriate regular expression to get all key-value pairs,
 Array.prototype.reduce() to map and combine them into a single object.
 Pass location.search as the argument to apply to the current url.

 Examples
 getURLParameters('http://url.com/page?name=Adam&surname=Smith'); // {name: 'Adam', surname: 'Smith'}
 getURLParameters('google.com'); // {}
 */
exports.getURLParameters = (url) =>  {
     return  (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
         (a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
         {}
     );
}



/**
 objectToQueryString
 Returns a query string generated from the key-value pairs of the given object.
 Use Array.prototype.reduce() on Object.entries(queryParameters) to create the query string.
 Determine the symbol to be either ? or & based on the index and concatenate val to queryString
 only if it's a string. Return the queryString or an empty string when the queryParameters are falsy.
 Examples
 objectToQueryString({ page: '1', size: '2kg', key: undefined }); // '?page=1&size=2kg'
 */
exports.objectToQueryString = (queryParameters) =>  {
    return queryParameters
        ? Object.entries(queryParameters).reduce((queryString, [key, val], index) => {
            const symbol = index === 0 ? '?' : '&';
            queryString += typeof val === 'string' ? `${symbol}${key}=${val}` : '';
            return queryString;
        }, '')
        : '';
}



/**
 prettyBytes advanced
 Converts a number in bytes to a human-readable string.
 Use an array dictionary of units to be accessed based on the exponent. Use Number.toPrecision()
 to truncate the number to a certain number of digits. Return the prettified string by building it up,
 taking into account the supplied options and whether it is negative or not. Omit the second argument,
 precision, to use a default precision of 3 digits.
 Omit the third argument, addSpace, to add space between the number and unit by default.

 Examples
 prettyBytes(1000); // "1 KB"
 prettyBytes(-27145424323.5821, 5); // "-27.145 GB"
 prettyBytes(123456789, 3, false); // "123MB"
 */
exports.prettyBytes = (num, precision = 3, addSpace = true) =>  {
    const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (Math.abs(num) < 1) return num + (addSpace ? ' ' : '') + UNITS[0];
    const exponent = Math.min(Math.floor(Math.log10(num < 0 ? -num : num) / 3), UNITS.length - 1);
    const n = Number(((num < 0 ? -num : num) / 1000 ** exponent).toPrecision(precision));
    return (num < 0 ? '-' : '') + n + (addSpace ? ' ' : '') + UNITS[exponent];
}



/**
 randomHexColorCode
 Generates a random hexadecimal color code.
 Use Math.random to generate a random 24-bit(6x4bits) hexadecimal number.
 Use bit shifting and then convert it to an hexadecimal String using toString(16).
 Examples
 randomHexColorCode(); // "#e34155"
 */
exports.randomHexColorCode = () =>  {
    let n = (Math.random() * 0xfffff * 16777215).toString(16);
    //let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
}

/**
 *  getRandomNumber
 */
exports.getRandomNumber = (size = 100000) => {
    return  Math.floor(Math.random() * Math.floor(size));
};


/**
 isBrowser
 Determines if the current runtime environment is a browser so that front-end modules
 can run on the server (Node) without throwing errors.
 Use Array.prototype.includes() on the typeof values of both window and document
 (globals usually only available in a browser environment unless they were explicitly defined),
 which will return true if one of them is undefined. typeof allows globals to be checked for
 existence without throwing a ReferenceError. If both of them are not undefined, then the current
 environment is assumed to be a browser.
 Examples
 isBrowser(); // true (browser)
 isBrowser(); // false (Node)
 */
exports.isBrowser = () =>  {
     return   ![typeof window, typeof document].includes('undefined');
}




function ltrim(str, chars) {
    assertString(str); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping

    var pattern = chars ? new RegExp("^[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "]+"), 'g') : /^\s+/g;
    return str.replace(pattern, '');
}

function rtrim(str, chars) {
    assertString(str); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping

    var pattern = chars ? new RegExp("[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "]+$"), 'g') : /\s+$/g;
    return str.replace(pattern, '');
}

function trim(str, chars) {
    return rtrim(ltrim(str, chars), chars);
}

function toDate(date) {
    assertString(date);
    date = Date.parse(date);
    return !isNaN(date) ? new Date(date) : null;
}

function toFloat(str) {
    assertString(str);
    return parseFloat(str);
}

function toInt(str, radix) {
    assertString(str);
    return parseInt(str, radix || 10);
}

function toBoolean(str, strict) {
    assertString(str);

    if (strict) {
        return str === '1' || str === 'true';
    }

    return str !== '0' && str !== 'false' && str !== '';
}

function equals(str, comparison) {
    assertString(str);
    return str === comparison;
}





exports.getAppSupportLineContactNumberByType  = (SupportLineContact, type) => {
    for (let id in SupportLineContact) {
        if(SupportLineContact[id].type === type){
            return SupportLineContact[id].number
        }
    }
};



exports.getDateMilliseconds  = (date) => {
  return moment(date, 'DD-MM-YYYY HH:mm a').valueOf()
}

exports.getDateTimeMoment = (date) => {

    // date = new Date(inputDate).toISOString();
    const diffHours = moment(new Date()).diff(moment(date), 'hour');
    const diffDays = moment(new Date()).startOf('day').diff(moment(date).startOf('day'), 'day');

    if (diffHours <= 0) {
        return moment(date).fromNow(false);
    }

    if (diffDays <= 0) {
        return moment(date).format('HH:mm a');
    }

    if (diffDays <= 6) {
        if (diffDays === 1) {
            return 'yesterday';
        }

        return moment(date).format('dddd');
    }

   // return moment(date).format('DD/MM/YYYY'); // 8/03/2020
    return moment(date).format('MMMM Do YYYY');   // March 8th 2020
   // return moment(date).format('MMMM Do YYYY');   // Mar 8th 20

}

exports.mergeWithoutDuplicate = (array1, array2) => {
    function arrayUnique(array) {
        let a = array.concat();
        for(let i=0; i<a.length; ++i) {
            for(let j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    }
    return arrayUnique(array1.concat(array2))
}


exports.removeDuplicatesArray = (array) => {
    // Create a Set from the array to remove duplicates
    let uniqueElements = new Set(array);

    // Convert the Set back to an array
    let uniqueArray = Array.from(uniqueElements);

    return uniqueArray;
}




exports.createSlug = async (Model, length=5) => {
    const {customRandom, urlAlphabet, customAlphabet} = await import('nanoid');
    const nanoid = customAlphabet('1234567890abcdef', 10);

    let slug = nanoid(length);
    const slugPipeline = [
        {
            $match: {slug}
        },
        {
            $group: {
                _id: null,
                count: {$sum: 1}
            }
        }
    ];
    let count = await Model.aggregate(slugPipeline);
    while (count[0]?.count > 0) {
        slug = nanoid(length);
        count = await Model.aggregate(slugPipeline);
    }

    return slug.toString().toLowerCase()
}

exports.createUniqueID =  async (length= 5) => {
    const {customRandom, urlAlphabet, customAlphabet} = await import('nanoid');
    const nanoid = customAlphabet('1234567890abcdef', 10);
    return nanoid(length).toString().toLowerCase();
}