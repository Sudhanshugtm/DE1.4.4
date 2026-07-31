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
