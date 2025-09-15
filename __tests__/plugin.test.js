import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { rehype } from 'rehype'

import rehypeTypeset from '../plugin.js'

describe('rehypeTypeset', async () => {
	await it('should work', async () => {
		let file = await rehype()
			.data('settings', { fragment: true })
			.use(rehypeTypeset)
			.process('<p>"Hello," said the fox.</p>')

		assert.equal(String(file), '<p>“Hello,” said the fox.</p>')
	})

	await it('ignores certain elements', async () => {
		let file = await rehype()
			.data('settings', { fragment: true })
			.use(rehypeTypeset)
			.process(
				`<code><span>import rehypeTypeset from 'rehype-typeset'</span></code>`,
			)

		assert.equal(
			String(file),
			`<code><span>import rehypeTypeset from 'rehype-typeset'</span></code>`,
		)
	})
})
