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
			assert.equal(
				String(
					await processMarkup(
						`<code><span>import rehypeTypeset from 'rehype-typeset'</span></code>`,
					),
				),
				`<code><span>import rehypeTypeset from 'rehype-typeset'</span></code>`,
			)
			assert.equal(
				String(
					await processMarkup(
						`<script>import rehypeTypeset from 'rehype-typeset'</script>`,
					),
				),
				`<script>import rehypeTypeset from 'rehype-typeset'</script>`,
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

	describe('punctuation', async () => {
		await it('replaces a hyphen between digits with an en dash', async () => {
			assert.equal(
				String(await processMarkup('<p>1880 – 1912</p>')),
				'<p>1880 – 1912</p>',
			)
			assert.equal(
				String(await processMarkup('<p>1880 &ndash; 1912</p>')),
				'<p>1880 – 1912</p>',
			)
			assert.equal(
				String(await processMarkup('<p>1880 — 1912</p>')),
				'<p>1880 – 1912</p>',
			)
		})

		await it('replaces two hyphens with an em dash', async () => {
			let file = await processMarkup(
				'<p>I believe I shall -- <em>no</em>, I’m going to do it.</p>',
			)

			assert.equal(
				String(file),
				'<p>I believe I shall — <em>no</em>, I’m going to do it.</p>',
			)
		})

		await it('replaces three periods with an ellipsis', async () => {
			let file = await processMarkup('<p>Wait for it...</p>')

			assert.equal(String(file), '<p>Wait for it…</p>')
		})
	})

	describe('spaces', async () => {
		await it('replaces full spaces around an em dash with hair spaces', async () => {
			let file = await processMarkup(
				'<p>The food — which was delicious — reminded me of home.</p>',
			)

			assert.equal(
				String(file),
				'<p>The food — which was delicious — reminded me of home.</p>',
			)
		})

		await it('replaces full spaces around other characters with hair spaces', async () => {
			let file = await processMarkup('<p> 4 × 4 = 16; 10 / 2 = 5;</p>')

			assert.equal(String(file), '<p> 4 × 4 = 16; 10 / 2 = 5;</p>')
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
