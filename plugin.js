/**
 * @import {Root} from 'hast'
 */

import { SKIP, visit } from 'unist-util-visit'

/**
 * @typedef {Object} QuotesOptions
 */
/**
 * @typedef {Object} PunctuationOptions
 * @property {'double' | 'triple'} em-dash-replacement Replace hyphen
 * sequences with em-dash glyph.  If `triple` is set, two hyphens will
 * be replaced with an en-dash.
 */
/**
 * @typedef {Object} SpacesOptions
 * @property {'open' | 'closed'} [en-dash-spacing] Should en-dashes be surrounded by spaces.
 */
/**
 * @typedef {Object} PluginOptions
 * @property {QuotesOptions | false} [quotes]
 * @property {PunctuationOptions | false} [punctuation]
 * @property {SpacesOptions | false} [spaces]
 */

const HAIR_SPACE = '\u200A'
const EN_DASH = '\u2013'
const EM_DASH = '\u2014'
const ELLIPSIS = '\u2026'

const IGNORED_ELEMENTS = new Set(['script', 'style', 'pre', 'code'])

/** @type {PluginOptions} */
const DEFAULT_OPTIONS = {
	quotes: {},
	punctuation: {
		'em-dash-replacement': 'double',
	},
	spaces: {
		'en-dash-spacing': 'open',
	},
}

/**
 * Process HTML content for better web typography.
 *
 * @param {PluginOptions} [options]
 */
export default function rehypeTypeset(options = DEFAULT_OPTIONS) {
	/**
	 * @param {Root} tree
	 * @return {undefined}
	 */
	return function (tree) {
		visit(tree, 'element', (node) => {
			if (IGNORED_ELEMENTS.has(node.tagName)) return SKIP

			for (let child of node.children) {
				if (child.type === 'text') {
					if (options.quotes) child.value = replaceQuotes(child.value)
					if (options.punctuation) child.value = replacePunctuation(child.value)
					if (options.spaces)
						child.value = replaceSpaces(child.value, options.spaces)
				}
			}
		})
	}
}

/**
 *
 * @param {string} text
 */
function replaceQuotes(text) {
	text = text.replaceAll('&#39;', "'")
	text = text.replaceAll('&quot;', '"')

	text = text
		.replaceAll(/(\W|^)"([^\s!?:;.,‽»])/g, '$1\u201C$2') // Beginning "
		.replaceAll(/(\u201C[^"]*)"([^"]*$|[^\u201C"]*\u201C)/g, '$1\u201D$2') // Ending "
		.replaceAll(/([^0-9])"/g, '$1\u201D') // Remaining " at end of word
		.replaceAll(/(\W|^)'(\S)/g, '$1\u2018$2') // Beginning '
		.replaceAll(/([a-z])'([a-z])/gi, '$1\u2019$2') // Conjunction's possession
		.replaceAll(/((\u2018[^']*)|[a-z])'([^0-9]|$)/gi, '$1\u2019$3') // Ending '
		.replaceAll(
			/(\u2018)([0-9]{2}[^\u2019]*)(\u2018([^0-9]|$)|$|\u2019[a-z])/gi,
			'\u2019$2$3',
		) // Abbrev. years like '93
		.replaceAll(
			/(\B|^)\u2018(?=([^\u2019]*\u2019\b)*([^\u2019\u2018]*\W[\u2019\u2018]\b|[^\u2019\u2018]*$))/gi,
			'$1\u2019',
		) // Backwards apostrophe
		.replaceAll("'''", '\u2034') // Triple prime
		.replaceAll(/("|'')/g, '\u2033') // Double prime
		.replaceAll("'", '\u2032')

	// Allow escaped quotes
	text = text
		.replaceAll(String.raw`\“`, '"')
		.replaceAll(String.raw`\”`, '"')
		.replaceAll(String.raw`\’`, "'")
		.replaceAll(String.raw`\‘`, "'")

	return text
}

/**
 *
 * @param {string} text
 *
 * @todo Add option for "open" or "closed" dashes.
 */
function replacePunctuation(text) {
	/**
	 * Replace hyphens, encoded en-dashes, and em-dashes — which are
	 * surrounded by digits — with an en-dash glyph.
	 * @see https://en.wikipedia.org/wiki/Dash#En_dash
	 */
	text = text.replaceAll(/(\d+\s?)-(\s?\d+)/g, `$1${EN_DASH}$2`)
	text = text.replaceAll(/(\d+\s?)&ndash;(\s?\d+)/g, `$1${EN_DASH}$2`)
	text = text.replaceAll(/(\d+\s?)&mdash;|—(\s?\d+)/g, `$1${EN_DASH}$2`)

	/**
	 * @see https://en.wikipedia.org/wiki/Dash#Em_dash
	 */
	text = text.replaceAll('--', EM_DASH)
	// Text = text.replaceAll(' – ', ` ${EM_DASH} `)

	/** @see https://en.wikipedia.org/wiki/Ellipsis */
	text = text.replaceAll('...', ELLIPSIS)

	/**
	 * @see https://en.wikipedia.org/wiki/Non-breaking_space
	 */
	let NBSP = '&nbsp;'
	let NBSP_PUNCTUATION_START = /([«¿¡]) /g
	let NBSP_PUNCTUATION_END = / ([!?:;.,‽»])/g

	text = text.replaceAll(NBSP_PUNCTUATION_START, '$1' + NBSP)
	text = text.replaceAll(NBSP_PUNCTUATION_END, NBSP + '$1')

	return text
}

/**
 *
 * @param {string} text
 * @param {SpacesOptions} [_options]
 */
function replaceSpaces(text, _options) {
	text = text.replaceAll(
		/(\d+)\s?–\s?(\d+)/g,
		`$1${HAIR_SPACE}${EN_DASH}${HAIR_SPACE}$2`,
	)

	text = text.replaceAll(' — ', `${HAIR_SPACE}${EM_DASH}${HAIR_SPACE}`)

	text = text.replaceAll(' × ', `${HAIR_SPACE}×${HAIR_SPACE}`)
	text = text.replaceAll(' / ', `${HAIR_SPACE}/${HAIR_SPACE}`)

	return text
}
