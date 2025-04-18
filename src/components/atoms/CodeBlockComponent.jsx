//import './CodeBlockComponent.scss'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export default ({
	node: {
		attrs: { language: javascript },
	},
}) => (
	<NodeViewWrapper className="code-block">
		<pre>
			<NodeViewContent as="code" />
		</pre>
	</NodeViewWrapper>
)
