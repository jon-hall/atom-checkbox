'use babel'

import AtomCheckbox from '../lib/atom-checkbox'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AtomCheckbox', () => {
  let workspaceElement, activationPromise

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('atom-checkbox')
  });

  describe('when stuff happens', () => {
    // TODO: Tests...
    /*
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.atom-checkbox')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-checkbox:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.atom-checkbox')).toExist();

        let atomCheckboxElement = workspaceElement.querySelector('.atom-checkbox');
        expect(atomCheckboxElement).toExist();

        let atomCheckboxPanel = atom.workspace.panelForItem(atomCheckboxElement);
        expect(atomCheckboxPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'atom-checkbox:toggle');
        expect(atomCheckboxPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.atom-checkbox')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-checkbox:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let atomCheckboxElement = workspaceElement.querySelector('.atom-checkbox');
        expect(atomCheckboxElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'atom-checkbox:toggle');
        expect(atomCheckboxElement).not.toBeVisible();
      });
    });
    */
  })
})
