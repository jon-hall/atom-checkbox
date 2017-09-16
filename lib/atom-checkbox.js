'use babel'

import { CompositeDisposable, Disposable } from 'atom'
import AtomCheckboxView from './atom-checkbox-view.js'

const { workspace, commands, views } = atom
// TODO
// - Switch to tab instead of enter? Should also support inline easier then [ ]
// - Add README [ ]
// - With demo [ ]
// - Add tests [ ]
// - Tidy up the less [ ]
//   - (or convert to stylus...?) [ ]
// - Publish [ ]
// - Using suitable colours based on editor theme...? [ ]
// - Support inline checkboxes? [ ]
// - Conversion of individual TODOs to checkboxes? [ ]
// - Make the comment scope checking a bit more robust [ ]
// - Remove marker creation from this file - only use ranges here [ ]
const CHECKBOX_REGEX = /\[(?: |([xX]))\]$/

export default {
  disposables: null,

  active_editor: null,

  editors: [],

  change_listener: null,

  activate(state) {
    this.disposables = new CompositeDisposable()

    this.disposables.add(
      workspace.observeActiveTextEditor((editor) => this.on_change_editor(editor))
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
    this.change_listener = editor.onDidInsertText((event) => {
      this.on_editor_change(event.text)
    })

    this.disposables.add(this.change_listener)

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

      this.try_insert_checkbox(row, line)
    }
  },

  on_editor_change(text) {
    // For now,. only listen to enter keypress (firct character
    // of inserted text is a newline)
    if(text[0] !== '\n') {
      return
    }

    const { active_editor } = this
    const cursor_pos = active_editor.getCursorBufferPosition()
    const target_row = cursor_pos.row - 1
    const line_content = active_editor.lineTextForBufferRow(target_row)

    this.try_insert_checkbox(target_row, line_content)
  },

  try_insert_checkbox(target_row, line_content) {
    const marker = this.try_get_checkbox_marker(target_row, line_content)

    if(!marker) {
      return
    }

    if(!this.is_buffer_range_in_a_comment(marker.getBufferRange())) {
      return
    }

    this.disposables.add(this.insert_checkbox(marker))
  },

  try_get_checkbox_marker(row, line_content) {
    const { active_editor } = this
    const is_checkbox = CHECKBOX_REGEX.exec(line_content)

    if(!is_checkbox) {
      return
    }

    const marker = active_editor.markBufferRange([
      [row, line_content.length - 3],
      [row, line_content.length]
    ], {
      invalidate: 'inside'
    })

    // If we got a capture group, then it was x or X, so treat this
    // as a checked checkbox
    marker.checked = !!is_checkbox[1]

    return marker
  },

  is_buffer_range_in_a_comment(range) {
    const { active_editor } = this
    const scope_descriptor = active_editor.scopeDescriptorForBufferPosition(
      range.start
    )

    return !!scope_descriptor.scopes.find((scope) => /comment/.test(scope))
  },

  insert_checkbox(marker) {
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
