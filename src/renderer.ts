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

let AllPages = document.querySelectorAll('.page')
let PageIndex : number = null

let Templates = [
	'<h1>Titulo</h1>', '<h1>Titulo</h1><h2>Subtitulo</h2>'
]

// Iniciar el contenido
interface Files {
    name: string,
    content: Array<Page>,
    css: string,
	directory: string
}

let InPageTool = document.createElement('div')
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
	model: any
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
	}
	file.content.push(VPage)

	// Crear el elemento en el DOM
	const Page = document.createElement('div')
	Page.classList.add('page')
	Page.innerHTML = `
		<div class="Content">${VPage.content}</div>
	`
	Pages.appendChild(Page)
	Page.addEventListener('click', () => {
		if (PageIndex !== null) {
			AllPages[PageIndex].classList.remove('Pactive')
		}
		console.log('Desactivar pagina')
		Page.classList.add('Pactive')
		PageIndex = VPage.index
		HTML.setModel(VPage.model)
		if (AllPages[PageIndex].querySelector('#InPageTool') === null) {
			AllPages[PageIndex].appendChild(InPageTool)
			InPageTool.style.display = 'block'
		}
	})
	UpdatePageList()
}

function UpdatePageList(){
	file.content.forEach((page, index) => {
		page.index = index
	})
	AllPages = document.querySelectorAll('.page')
}

document.addEventListener('DOMContentLoaded', () => {
	// Crear la primera pagina
	AddPage()

	// Cargar CSS
	CSS.setValue(file.css)

	document.querySelector('body').appendChild(InPageTool)
	InPageTool.style.display = 'none'

	document.getElementById('DeletePage').addEventListener('click', () => {
		DeletePage()
	})
})

// Crear el editor
self.MonacoEnvironment = {
	getWorker: function (workerId, label) {
		const getWorkerModule = (moduleUrl :string, label :string) => {
			return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl, label), {
				name: label,
				type: 'module'
			});
		};
		switch (label) {
			case 'css':
				return CSSWorker();
			case 'html':
				return HTMLWorker();
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

window.onresize = function(event) {
    HTML.layout();
    CSS.layout();
    };

document.getElementById('HTMLButton').addEventListener('click', () => {
    const container = document.getElementById('ContainerEditor')
    container.addEventListener('transitionend', () => {
        HTML.layout();
        CSS.layout();
    })
    if (container.classList.contains('EditorOpen')) {
        container.classList.remove('EditorOpen')
        container.classList.add('EditorClose')
    }
    else {
        container.classList.remove('EditorClose')
        container.classList.add('EditorOpen')
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
		document.querySelectorAll('.Content')[PageIndex].innerHTML = file.content[PageIndex].content
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
		AddPage(Templates[parseInt(TemplateSelectorValue)])
	}
})

/* Sistema para eliminar paginas */

function DeletePage(){
	// Eliminar la pagina
	file.content.splice(PageIndex, 1)

	// Eliminar la pagina en el DOM
	AllPages[PageIndex].remove()
	PageIndex = null

	// Actualizar el contenido
	UpdatePageList()
}