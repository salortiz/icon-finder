import type { UITranslation } from './types';

/**
 * Phrases.
 *
 * Do not import phrases from this file, use ../config/phrases.ts instead
 */
export const phrases: UITranslation = {
	lang: 'Español',
	search: {
		placeholder: {
			collection: 'Busca {name}',
			collections: 'Filtra colecciones',
		},
		defaultPlaceholder: 'Busca todos los íconos',
		button: 'Busca Iconos',
	},
	errors: {
		noCollections: 'No se encontró conjunto de íconos.',
		noIconsFound: 'No se encontró íconos.',
		defaultError: 'Error loading Iconify Icon Finder.',
		custom: {
			loading: 'Cargando...',
			timeout: 'Could not connect to Iconify API.',
			invalid_data: 'Invalid response from Iconify API.',
			empty: 'Nada que mostrar.',
			not_found: 'La colección {prefix} no existe.',
			bad_route: 'Ruta inválida.',
			home: 'Click aquí para regresar a la página principal.',
		},
	},
	icons: {
		header: {
			full: 'Mostrando {count} íconos:',
			more:
				'Mostrando {count} íconos (haga click en siguiente página para cargar más):',
			modes: {
				list: 'Muestra lista de íconos',
				grid: 'Muestra cuadricula de íconos',
			},
			select: 'Seleccione multiple íconos',
		},
		headerWithCount: {
			0: 'No íconos que mostrar.',
			1: 'Mostrando un ícono:',
		},
		tooltip: {
			size: '\nTamaño: {size}',
			colorless: '',
			colorful: '\nTiene paleta',
			char: '\nIcon font character: {char}',
			length: '', //'\nContent: {length} bytes',
		},
		more: 'Busca más iconos', // '3 ...',
		moreAsNumber: false, // True if text above refers to third page, false if text above shows "Find more icons" or similar text
	},
	pagination: {
		prev: 'Página previa',
		next: 'Página siguiente',
	},
	filters: {
		'uncategorised': 'Uncategorised',
		'collections': 'Filter search results by icon set:',
		'collections-collections': '',
		'tags': 'Filter by category:',
		'themePrefixes': 'Tipo de Ícono:',
		'themeSuffixes': 'Tipo de Ícono:',
	},
	collectionInfo: {
		total: 'Número de íconos:',
		height: 'Altura de íconos:',
		author: 'Autor:',
		license: 'Licencia:',
		palette: 'Paleta:',
		colorless: 'Color neutro',
		colorful: 'Tiene colores',
		link: 'Muestra todos los iconos',
	},
	parent: {
		default: 'Regresa a la página previa',
		collections: 'Regresa a las colecciones',
		collection: 'Regresa a {name}',
		search: 'Regresa a los resultados de la búsqueda',
	},
	collection: {
		by: 'por ',
	},
	providers: {
		section: 'Origen de los iconos:',
		add: 'Agrega Proveedor',
		addForm: {
			title: "Enter API provider's host name:",
			placeholder: 'https://api.iconify.design',
			submit: 'Add API Provider',
			invalid:
				'Example of a valid API host name: https://api.iconify.design',
		},
		status: {
			loading: 'Checking {host}...',
			error: '{host} is not a valid Iconify API.',
			exists:
				'API from {host} is already available or API has wrong configuration.',
			unsupported: 'API from {host} does not support icon search.',
		},
	},
	footer: {
		iconName: 'Icono seleccionado:',
		iconNamePlaceholder: 'Icono por nombre...',
		inlineSample: {
			before: 'Text with icon sample',
			after: 'to show icon alignment in text.',
		},
		remove: 'Elimina {name}',
		select: 'Seleccione {name}',
		about: 'A cerca de {title}',
	},
	footerButtons: {
		submit: 'Envía',
		change: 'Cambia',
		select: 'Selecciona',
		cancel: 'Cancela',
		close: 'Cierra',
	},
	footerBlocks: {
		title: 'Customize icon',
		title2: 'Customize icons',
		color: 'Color',
		flip: 'Voltea',
		hFlip: 'Horizontal',
		vFlip: 'Vertical',
		rotate: 'Rota',
		width: 'Ancho',
		height: 'Alto',
		size: 'Tamaño', // Width + height in one block
		alignment: 'Alineación',
		mode: 'Modo',
		icons: 'Iconos seleccionados',
	},
	footerOptionButtons: {
		hFlip: 'Horizontal',
		vFlip: 'Vertical',
		rotate: '{num}' + String.fromCharCode(0x00b0),
		rotateTitle: 'Rota {num}' + String.fromCharCode(0x00b0),
		inline: 'Inline',
		block: 'Block',
		inlineHint:
			'Icon is vertically aligned slightly below baseline, like icon font, fitting perfectly in text.',
		blockHint: 'Icon is rendered as is, without custom vertical alignment.',
	},
	codeSamples: {
		copy: 'Copia al portapapeles',
		copied: 'Copiado al portapapeles.',
		headingHidden: 'Show code for "{name}" for developers',
		heading: 'Code for "{name}" for developers',
		childTabTitle: '{key} versions:',
		childTabTitles: {
			react: 'React component versions:',
			svg: 'SVG options:',
		},
		docsDefault: 'Click here for more information about {title} component.',
		docs: {
			iconify:
				'Click here for more information about Iconify SVG framework.',
			css: 'Click here for more code examples.',
		},
		intro: {
			'svg-box':
				'This SVG contains extra empty rectangle that matches viewBox. It is needed to keep icon dimensions when importing icon in software that ignores viewBox attribute.',
			'svg-uri':
				'You can use this as background image or as content for pseudo element in stylesheet.',
			'css':
				"Add code below to your stylesheet to use icon as background image or as pseudo element's content:",
		},
		component: {
			'install-offline': 'Install component and icon set:',
			'install-simple': 'Install component:',
			'install-addon': 'Install addon:',
			'import-offline': 'Import component and icon data:',
			'import-simple': 'Import component:',
			'vue-offline':
				'Add icon data and icon component to your component:',
			'vue-simple': 'Add icon component to your component:',
			'use-in-code': 'Use it in your code:',
			'use-in-html': 'Use it in HTML code:',
			'use-in-template': 'Use component in template:',
			'use-generic': '',
		},
		iconify: {
			intro1:
				'Iconify SVG framework makes using icons as easy as icon fonts. To use "{name}" in HTML, add this code to the document:',
			intro2:
				'Iconify SVG framework will load icon data from Iconify API and replace that placeholder with SVG.',
			head: 'Make sure you import Iconify SVG framework:',
		},
	},
};
