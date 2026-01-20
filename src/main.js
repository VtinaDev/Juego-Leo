import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { validateTemplates } from './engine/logic/utils/validateTemplates'

async function bootstrap() {
  try {
    const validation = await validateTemplates({
      verbose: import.meta.env.DEV
    })

    if (!validation.valid) {
      console.error(
        '❌ Se encontraron errores críticos en las plantillas. Revisa la consola para más detalles.'
      )
    }
  } catch (err) {
    console.error('❌ Error durante la validación de plantillas:', err)
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

bootstrap()
