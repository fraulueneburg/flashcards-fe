import MarkdownIt from 'markdown-it'
import { useId } from 'react'

const MarkdownEditor = ({ label, value, onChange, placeholder, className }) => {
	const md = new MarkdownIt()
	const elementId = useId()

	return (
		<div>
			<label>Preview {label}</label>
			<section className="flashcard">
				<div className={className}>
					<div className="content" dangerouslySetInnerHTML={{ __html: md.render(value) }} />
				</div>
			</section>
			<label htmlFor={`${elementId}`}>Content {label}</label>
			<textarea
				id={`${elementId}`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				required
			/>
		</div>
	)
}

export default MarkdownEditor
