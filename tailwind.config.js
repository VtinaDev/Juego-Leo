/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{vue,js,ts,jsx,tsx}',
],
theme: {
extend: {
colors: {
azul: '#60A5FA',
amarillo: '#FACC15',
verde: '#86EFAC',
rosa: '#F9A8D4',
fondo: '#F8FAFC',
texto: '#374151',
},
boxShadow: {
soft: '0 8px 30px rgba(0,0,0,0.06)'
},
borderRadius: {
xl2: '1rem',
}
},
},
plugins: [],
}
