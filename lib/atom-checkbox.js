'use babel'

import { CompositeDisposable, Disposable, Point } from 'atom'
import AtomCheckboxView from './atom-checkbox-view.js'

const { workspace, commands, views } = atom
// TODO
// - Switch to tab instead of enter? Should also support inline easier then [X]
// - Add README [ ]
// - With demo [ ]
// - Add tests [ ]
// - Tidy up the less [ ]
//   - (or convert to stylus...?) [ ]
// - Publish [ ]
// - Using suitable colours based on editor theme...? [ ]
// - Support inline...  [X] ...checkboxes?
// - Conversion of individual TODOs to checkboxes? [ ]
// - Make the comment scope checking a bit more robust [ ]
// - Remove marker creation from this file - only use ranges here [ ]

export default {
  disposables: null,

  active_editor: null,

  editors: [],

  activate(state) {
    this.disposables = new CompositeDisposable()

    this.disposables.add(
      workspace.observeActiveTextEditor(
        (editor) => this.on_change_editor(editor)
      )
    )
  },

  deactivate() {
    this.disposables.dispose()
  },

  serialize() {
    return { }
  },

  on_change_editor(editor) {
    this.active_editor = editor

    if(!editor) {
      return
    }

    if(this.editors.indexOf(editor) >= 0) {
      return
    }

    this.editors.push(editor)
    this.setup_editor(editor)
  },

  setup_editor(editor) {
    const keydown_handler = (event) => {
      this.on_editor_keydown(event)
    }
    const editor_view = atom.views.getView(editor)

    editor_view.addEventListener('keydown', keydown_handler)

    this.disposables.add(
      new Disposable(() => {
        editor_view.removeEventListener('keydown', keydown_handler)
      })
    )

    // Wait for tokenization to complete, then we can apply existing
    // checkboxes
    const tokenize_disposer = editor.onDidTokenize(() => {
      this.apply_existing_checkboxes(editor)
      tokenize_disposer.dispose()
    })

    this.disposables.add(tokenize_disposer)
  },

  apply_existing_checkboxes(editor) {
    const text = editor.getText()
    const lines = text.split('\n')

    for(let row = 0; row < lines.length; row++) {
      const line = lines[row]

      this.foreach_checkbox_in_line(line, (index, checked) => {
        this.insert_checkbox(new Point(row, index), checked)
      })
    }
  },

  foreach_checkbox_in_line(line_content, fn) {
    const find_checkboxes = /\[(?: |([xX]))\]/g

    let match
    while(match = find_checkboxes.exec(line_content)) {
      fn(match.index, !!match[1])
    }
  },

  on_editor_keydown(event) {
    if(event.key !== 'Tab') {
      return
    }

    const { active_editor } = this
    const { row, column } = active_editor.getCursorBufferPosition()
    const line_content = active_editor.lineTextForBufferRow(row)
    const checkbox_text = this.get_checkbox_text(column, line_content)

    if(!checkbox_text) {
      return
    }

    const checked = this.is_checked_checkbox(checkbox_text)
    this.insert_checkbox(new Point(row, column - 3), checked)
  },

  get_checkbox_text(column, line_content) {
    const candidate = line_content.slice(column - 3, column)

    return candidate.match(/^\[(?: |([xX]))\]$/) ?
      candidate :
      null
  },

  is_checked_checkbox(checkbox_text) {
    return checkbox_text[1] !== ' '
  },

  insert_checkbox(pos, checked) {
    const marker = this.get_checkbox_marker(pos, checked)

    if(!marker) {
      return
    }

    if(!this.is_buffer_range_in_a_comment(marker.getBufferRange())) {
      return
    }

    this.disposables.add(this.insert_checkbox_marker(marker))
  },

  get_checkbox_marker(pos, checked) {
    const { row, column } = pos
    const { active_editor } = this

    const marker = active_editor.markBufferRange([
      [row, column],
      [row, column + 3]
    ], {
      invalidate: 'inside'
    })

    marker.checked = checked

    return marker
  },

  is_buffer_range_in_a_comment(range) {
    const { active_editor } = this
    const scope_descriptor = active_editor.scopeDescriptorForBufferPosition(
      range.start
    )

    return !!scope_descriptor.scopes.find((scope) => /comment/.test(scope))
  },

  insert_checkbox_marker(marker) {
    const { active_editor } = this
    const checkbox = new AtomCheckboxView(
      active_editor,
      marker.getBufferRange().start,
      { checked: marker.checked }
    )

    return new Disposable(() => {
      checkbox.destroy()
    })
  }
}
