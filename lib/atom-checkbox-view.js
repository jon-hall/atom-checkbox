'use babel'

import { CompositeDisposable, Disposable } from 'atom'

export default class AtomCheckboxView {
  constructor(editor, point, serializedState) {
    this.disposables = new CompositeDisposable()
    this.marker_disposer = null
    this.decoration_disposer = null
    this.checked = false

    this.editor = editor
    this.point = point

    this.element = this.build_element()

    this.generate_marker(point)
    this.setup_decorations()

    if(serializedState.checked) {
      this.toggle()
    }
  }

  serialize() {
    return { }
  }

  destroy() {
    this.element.remove()
    this.disposables.dispose()
  }

  build_element() {
    const element = document.createElement('div')

    element.classList.add('atom-checkbox')
    element.addEventListener('click', () => this.toggle())

    return element
  }

  // Helper for methods which produce disposer and may be
  // called multiple times - each time requiring the last
  // disposer to be disposed of before creating the next one
  temp_disposer(disposer_key, fn, ...args) {
    if(this[disposer_key]) {
      this.disposables.remove(this[disposer_key])
      this[disposer_key].dispose()
    }

    const on_dispose = fn.call(this, ...args)

    this[disposer_key] = new Disposable(on_dispose)
    this.disposables.add(this[disposer_key])

    return this[disposer_key]
  }

  generate_marker(point) {
    return this.temp_disposer(
      'marker_disposer',
      () => {
        const marker = this.editor.markBufferRange([
          [point.row, point.column],
          [point.row, point.column + 3]
        ], {
          invalidate: 'inside'
        })
        this.marker = marker

        return () => marker.destroy()
      },
      point
    )
  }

  setup_decorations() {
    return this.temp_disposer(
      'decoration_disposer',
      () => {
        const { marker, editor } = this
        const checkbox_decoration = editor.decorateMarker(marker, {
          type: 'overlay',
          position: 'head',
          item: this.element
        })
        const hide_text_decoration = editor.decorateMarker(marker, {
          type: 'text',
          class: 'atom-checkbox-hide-text'
        })

        return () => {
          checkbox_decoration.destroy()
          hide_text_decoration.destroy()
        }
      }
    )
  }

  toggle() {
    this.checked = !this.checked
    if(this.checked) {
      this.element.classList.add('atom-checkbox-checked')
    } else {
      this.element.classList.remove('atom-checkbox-checked')
    }

    // Update the actual text in the marker this checkbox
    // is associated with
    const text_value = this.checked ? '[X]' : '[ ]'
    const { start } = this.marker.getBufferRange()
    this.editor.scanInBufferRange(
      // TODO: Share this between files!
      /\[(?: |([xX]))\]$/,
      this.marker.getBufferRange(),
      ({ matchText, replace }) => {
        if(matchText !== text_value) {
          replace(text_value)
          // Reapply our marker + decorations, since
          // the replace nukes them
          this.generate_marker(start)
          this.setup_decorations()
        }
      }
    )
  }

  getElement() {
    return this.element
  }
}
