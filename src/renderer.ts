/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './index.css';
import * as monaco from 'monaco-editor';
import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';


// Obtener elementos para el manejo del contenido
const Pages = document.getElementById('pages')
const CSSContent = document.getElementById('CSSContent')

let PageIndex : number = null

//Templates variables
const TemplateModal = document.createElement('div')
TemplateModal.classList.add('FloatMenu')
TemplateModal.id = 'TemplateModal'
TemplateModal.innerHTML = `
	<div class="ModalContent">
	<h2>Nombre de la plantilla</h2>
	<input type="text" id="SaveTemplate-Input">
	<div class="ButtonSaveTemplate"><button id="SaveTemplateCancel-Button">Cancelar</button><button id="SaveTemplate-Button">Guardar</button></div>
	</div>
`

declare global {
	type Template = {
		name: string,
		content: string
	}

	interface Window {
		API: {
			Templates: Template[],
			saveTemplateFile : (templates: Template[]) => void
		}
	}
}

let Templates : Template[] = [
]

Templates = [...window.API.Templates]

// Iniciar el contenido
interface Files {
    name: string,
    content: Array<Page>,
    css: string,
	directory: string
}

const InPageTool = document.createElement('div')
InPageTool.id = 'InPageTool'
InPageTool.innerHTML = `
	<a id="DeletePage"><span class="material-symbols-outlined">
	delete
	</span></a>
	<a id="AddCommentButton"><span class="material-symbols-outlined">
	comment
	</span></a>
	<a id="SaveTemplate"><span class="material-symbols-outlined">
	bookmark_add
	</span></a>
`

type Page = {
	content: string,
	index: number,
	model: monaco.editor.ITextModel,
	element: HTMLDivElement,
	contentElement: HTMLDivElement
}

const file : Files = {
    name: 'Documento sin titulo',
    content: [],
    css : '',
	directory: null
}
file.css = CSSContent.innerHTML

function AddPage(template?: string){

	// Crear la pagina
	const VPage : Page = {
		content: template || '',
		index: file.content.length,
		model: monaco.editor.createModel(template || '', 'html'),
		element: document.createElement('div'),
		contentElement: document.createElement('div')
	}
	file.content.push(VPage)

	// Crear el elemento en el DOM
	const Page = VPage.element
	const Content = VPage.contentElement
	Content.innerHTML = VPage.content
	Page.classList.add('page')
	Content.classList.add('Content')
	Page.appendChild(Content)
	Pages.appendChild(Page)
	Page.addEventListener('click', () => {
			//if (PageIndex === VPage.index) return
			if (PageIndex !== null && file.content[PageIndex] !== undefined) file.content[PageIndex].element.classList.remove('Pactive')
			Page.classList.add('Pactive')
			PageIndex = VPage.index
			HTML.setModel(VPage.model)
			if (file.content[PageIndex].element.querySelector('#InPageTool') === null) {
				file.content[PageIndex].element.appendChild(InPageTool)
				InPageTool.style.display = 'block'
			}
	})
	Page.addEventListener('dblclick', (e) => {
		const container = document.getElementById('ContainerEditor')
    if (container.classList.contains('EditorOpen')) {
        container.classList.remove('EditorOpen')
        container.classList.add('EditorClose')
    }
    else {
        container.classList.remove('EditorClose')
        container.classList.add('EditorOpen')
		if (e.ctrlKey){
			CSS.focus()
		}
		else HTML.focus()
    }
	})
		
	UpdatePageList()
}

function UpdatePageList(){
	file.content.forEach((page, index) => {
		page.index = index
	})

	type blazeCounterElement = HTMLElement & {
		update: (count: number) => void
	}
	const PageCounter : blazeCounterElement = document.getElementById('PageCount') as blazeCounterElement
	PageCounter.update(file.content.length)
}

document.addEventListener('DOMContentLoaded', () => {
	// Escuchar cuando el editor termine una transicion
	document.getElementById('ContainerEditor').addEventListener('transitionend', () => {
        HTML.layout();
        CSS.layout();
    })

	// Crear la primera pagina
	AddPage()

	// Cargar CSS
	CSS.setValue(file.css)

	// Template menu
	LoadTemplate()
	document.querySelector('body').appendChild(TemplateModal)
	TemplateModal.style.display = 'none'
	document.getElementById('SaveTemplate-Button').addEventListener('click', () => {
		const TemplateName = document.getElementById('SaveTemplate-Input') as HTMLInputElement
		const template : Template = {
			name: TemplateName.value,
			content: HTML.getValue()
		}
		if (TemplateName.value === '') return
		Templates.push(template)
		LoadTemplate()
		TemplateName.value = ''
		TemplateModal.style.display = 'none'
		window.API.saveTemplateFile(Templates)
	})
	document.getElementById('SaveTemplateCancel-Button').addEventListener('click', () => {
		TemplateModal.style.display = 'none'
	})

	// Agregar el panel de herramientas
	document.querySelector('body').appendChild(InPageTool)
	InPageTool.style.display = 'none'

	document.getElementById('SaveTemplate').addEventListener('click', () => {
		SaveTemplate()
	})

	document.getElementById('DeletePage').addEventListener('click', () => {
		DeletePage()
	})
})

// Crear el editor
self.MonacoEnvironment = {
	getWorker: function (moduleId, label) {
		switch (label) {
			case 'css':
				return CSSWorker();
			case 'html':
				return HTMLWorker();
			default:
				throw new Error('Invalid label: ' + label);
		}
	}
};

const HTML = monaco.editor.create(document.getElementById('HTMLEditor'), {
	language: 'html',
    theme: 'vs-dark'
});

const CSS = monaco.editor.create(document.getElementById('CSSEditor'), {
	language: 'css',
    theme: 'vs-dark'
});

window.onresize = function() {
	HTML.layout();
	CSS.layout();
};

document.getElementById('HTMLButton').addEventListener('click', () => {
    const container = document.getElementById('ContainerEditor')
    if (container.classList.contains('EditorOpen')) {
        container.classList.remove('EditorOpen')
        container.classList.add('EditorClose')
    }
    else {
        container.classList.remove('EditorClose')
        container.classList.add('EditorOpen')
		HTML.focus()
    }
})

/* Agregar los eventos de escucha a las pagina */
	// Agregar evento de cambio de contenido
	CSS.onDidChangeModelContent(() => {
		file.css = CSS.getValue()
		CSSContent.innerHTML = file.css
	})

	HTML.onDidChangeModelContent(() => {
		file.content[PageIndex].content = HTML.getValue()
		file.content[PageIndex].contentElement.innerHTML = file.content[PageIndex].content
	})

/* Sistema para agregar paginas */
const AddPageButton = document.getElementById('AddPageButton')

AddPageButton.addEventListener('click', () => {
	// Obtener el template
	const TemplateSelector : HTMLSelectElement = document.getElementById('TemplateSelector') as HTMLSelectElement
	const TemplateSelectorValue = TemplateSelector.value
	if (TemplateSelectorValue === '-1') {
		AddPage()
	}else{
		AddPage(Templates[parseInt(TemplateSelectorValue)].content)
	}
})

/* Sistema para eliminar paginas */

function DeletePage(){
	// Eliminar la pagina en el DOM
	const DeleteContent = file.content[PageIndex].element
	DeleteContent.classList.remove('Pactive')
	DeleteContent.remove()

	// Eliminar la pagina
	file.content.splice(PageIndex, 1)

	// Actualizar el indice
	PageIndex = null
	UpdatePageList()
}

/* Sistema para agregar un nuevo template */

function SaveTemplate(){
	TemplateModal.style.display = 'block'
}

function LoadTemplate(){
	const TemplateSelector : HTMLSelectElement = document.getElementById('TemplateSelector') as HTMLSelectElement
	TemplateSelector.innerHTML = '<option value="-1">Plantilla en blanco</option>'
	Templates.forEach((template, index) => {
		const Option = document.createElement('option')
		Option.value = index.toString()
		Option.innerHTML = template.name
		TemplateSelector.appendChild(Option)
	})
}

// Shortcuts
document.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key === 'Escape') {
		console.log('Escape')
		if (TemplateModal.style.display === 'block') {
			TemplateModal.style.display = 'none'
			return
		}
		if (document.getElementById('ContainerEditor').classList.contains('EditorOpen')) {
			document.getElementById('ContainerEditor').classList.remove('EditorOpen')
			document.getElementById('ContainerEditor').classList.add('EditorClose')
			return
		}
	}
	})


// Pegar texto
document.addEventListener('paste', (e: ClipboardEvent) => {
	const text = e.clipboardData.getData('text/html')
	const prevData = HTML.getValue()
	HTML.setValue(prevData + '\n' + text)
})