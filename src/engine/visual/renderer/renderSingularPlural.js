import { renderPairs } from './renderPairs'

export function renderSingularPlural(app, exercise, handlers = {}) {
  return renderPairs(app, exercise, { ...handlers, mode: 'singular_plural' })
}

export default renderSingularPlural
