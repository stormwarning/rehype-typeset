import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { rehype } from 'rehype'

import rehypeTypeset from '../plugin.js'

describe('rehypeTypeset', async () => {
	describe('quotes', async () => {
		await it('replaces quotes', async () => {
			let file = await processMarkup('<p>"Hello," said the fox.</p>')

			assert.equal(String(file), '<p>“Hello,” said the fox.</p>')
		})

		await it('ignores certain elements', async () => {
			let file = await processMarkup(
				`<code><span>import rehypeTypeset from 'rehype-typeset'</span></code>`,
			)

			assert.equal(
				String(file),
				`<code><span>import rehypeTypeset from 'rehype-typeset'</span></code>`,
			)
		})

		await it('replaces quotes preceeding other punctuation', async () => {
			let file = await processMarkup('<p>"Hello,". said the fox.</p>')

			assert.equal(String(file), '<p>“Hello,”. said the fox.</p>')
		})

		await it('replaces encoded quotes with literal characters', async () => {
			let file = await processMarkup(
				'<p>I don&#39;t <em>nee&#39;d</em> to <em>d&#39;o</em>.</p>',
			)

			assert.equal(
				String(file),
				'<p>I don’t <em>nee’d</em> to <em>d’o</em>.</p>',
			)
		})

		await it('handles different kinds of quotes', async () => {
			let file = await processMarkup(
				`<p>"She's faster than a 120' 4" whale." </p>`,
			)

			assert.equal(String(file), '<p>“She’s faster than a 120′ 4″ whale.” </p>')
		})
	})
})

/**
 * @param {string} html
 */
async function processMarkup(html) {
	return await rehype()
		.data('settings', { fragment: true })
		.use(rehypeTypeset)
		.process(html)
}
