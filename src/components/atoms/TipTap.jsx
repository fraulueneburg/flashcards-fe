import { useId } from 'react'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import js from 'highlight.js/lib/languages/javascript'

// load all languages with "all" or common languages with "common"
import { createLowlight } from 'lowlight'
import CodeBlockComponent from './CodeBlockComponent'

// create a lowlight instance
const lowlight = createLowlight()

// register individual languages
lowlight.register('js', js)

const Tiptap = ({ onUpdate, content, customClass, label }) => {
	const elementId = useId()

	const editor = useEditor({
		extensions: [
			StarterKit,
			Highlight,
			CodeBlockLowlight.extend({
				addNodeView() {
					return ReactNodeViewRenderer(CodeBlockComponent)
				},
			}).configure({ lowlight }),
		],
		content: content,
		injectCSS: false,
		onUpdate: ({ editor }) => {
			onUpdate(editor.getHTML())
		},
	})

	return (
		<>
			<div>
				<label htmlFor={`${elementId}`}>{label}</label>
				<section className="flashcard">
					<div className={customClass}>
						<EditorContent id={`${elementId}`} className="content" editor={editor} />
					</div>
				</section>
			</div>
		</>
	)
}

export default Tiptap
