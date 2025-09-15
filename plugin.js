/**
 * @import {Root} from 'hast'
 */

import { SKIP, visit } from 'unist-util-visit'

/**
 * Process HTML content for better web typography.
 */
export default function rehypeTypeset() {
	/**
	 * @param {Root} tree
	 * @return {undefined}
	 */
	return function (tree) {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'pre' || node.tagName === 'code') return SKIP

			for (let child of node.children) {
				if (child.type === 'text') {
					child.value = replaceQuotes(child.value)
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
