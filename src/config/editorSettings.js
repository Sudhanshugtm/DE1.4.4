/**
 * Editor settings configuration
 * Defines the structure and default values for editor settings
 */

export const defaultSettings = {
  entryPoint: {
    style: 'quiet', // 'icon' | 'quiet' | 'text' | 'floating' | 'force'
    autoFocus: 'true', // 'true' | 'false'
  },
  outline: {
    location: 'rail', // 'rail' | 'popover'
    // The sheet stays put after adding, so a few sections can be brought in
    // without reopening it each time.
    persistence: 'keep-open', // 'keep-open' | 'close'
  },
}

/**
 * Entry point style labels for display in the settings dialog
 */
export const entryPointLabels = {
  icon: 'Icon-only button',
  quiet: 'Animated label',
  text: 'Inline placeholder',
  floating: 'Floating placeholder',
  force: 'Rail button',
}

export const autoFocusLabels = {
  true: 'Focus editor on launch',
  false: "Don't focus on launch",
}

export const outlineLocationLabels = {
  rail: 'Side panel',
  popover: 'Popover',
}

export const outlinePersistenceLabels = {
  'keep-open': 'Keep open after adding content',
  close: 'Close after adding content',
}
