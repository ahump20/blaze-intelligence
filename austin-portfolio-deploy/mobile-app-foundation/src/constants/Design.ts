/**
 * 🎨 BLAZE INTELLIGENCE DESIGN SYSTEM
 *
 * Championship-level design constants and theme definitions
 * Following Blaze Intelligence brand standards
 */

/**
 * 🏆 Championship Color Palette
 */
export const Colors = {
  // Primary Brand Colors
  primary: '#BF5700',           // Burnt Orange Heritage (Texas Legacy)
  primaryDark: '#A04A00',       // Darker shade for depth
  primaryLight: '#D9681A',      // Lighter shade for highlights
  primaryAlpha: 'rgba(191, 87, 0, 0.15)', // Transparent primary

  // Secondary Brand Colors
  accent: '#9BCBEB',            // Cardinal Sky Blue (Clarity)
  accentDark: '#7BB5E0',        // Darker accent
  accentLight: '#B8D9F0',       // Lighter accent
  accentAlpha: 'rgba(155, 203, 235, 0.15)', // Transparent accent

  // Supporting Colors
  tennesseeDeep: '#002244',     // Tennessee Deep (Authority)
  grizzlyTeal: '#00B2A9',       // Vancouver Teal (Innovation)
  championshipGold: '#FFD700',   // Gold for achievements

  // Neutral Colors
  backgroundDark: '#0a0e27',    // Main dark background
  backgroundLight: '#1a1a2e',   // Secondary background
  backgroundCard: '#16213e',    // Card backgrounds

  // Text Colors
  textPrimary: '#FFFFFF',       // Primary text
  textSecondary: '#A0A0A0',     // Secondary text
  textMuted: '#666666',         // Muted text
  textOnPrimary: '#000000',     // Text on primary background

  // UI Colors
  border: 'rgba(255, 255, 255, 0.1)', // Border color
  shadow: 'rgba(0, 0, 0, 0.3)',       // Shadow color
  overlay: 'rgba(0, 0, 0, 0.5)',      // Overlay color

  // Status Colors
  success: '#4CAF50',           // Success green
  warning: '#FF9800',           // Warning orange
  error: '#F44336',             // Error red
  info: '#2196F3',              // Info blue

  // Gradient Colors
  gradientPrimary: ['#BF5700', '#FFD700'],
  gradientSecondary: ['#002244', '#1a1a2e'],
  gradientAccent: ['#9BCBEB', '#00B2A9'],
  gradientBackground: ['#0a0e27', '#1a1a2e', '#16213e'],
} as const;

/**
 * 📝 Championship Typography
 */
export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    display: 'NeueHaasGrotesk-Display',
    mono: 'JetBrainsMono-Regular',
  },

  // Font Sizes
  fontSize: {
    tiny: 10,
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 20,
    title: 24,
    heading: 28,
    display: 32,
    hero: 40,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

/**
 * 📏 Championship Spacing System
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Component-specific spacing
  cardPadding: 16,
  screenPadding: 20,
  sectionSpacing: 32,
  elementSpacing: 12,
} as const;

/**
 * 🎯 Championship Border Radius
 */
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  circle: 999,

  // Component-specific radius
  button: 8,
  card: 16,
  input: 12,
  modal: 20,
} as const;

/**
 * ⚡ Championship Animation System
 */
export const Animation = {
  // Duration (milliseconds)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Scale values
  scale: {
    pressIn: 0.95,
    pressOut: 1.0,
    bounce: 1.05,
  },
} as const;

/**
 * 🔷 Championship Shadows
 */
export const Shadows = {
  // Card shadows
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  // Modal shadows
  modal: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // Button shadows
  button: {
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  // Floating element shadows
  floating: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

/**
 * 📱 Championship Device Dimensions
 */
export const Layout = {
  // Common breakpoints
  breakpoints: {
    small: 320,
    medium: 768,
    large: 1024,
  },

  // Header heights
  headerHeight: {
    default: 56,
    large: 64,
    compact: 48,
  },

  // Tab bar heights
  tabBarHeight: {
    default: 70,
    ios: 90,
  },

  // Component dimensions
  buttonHeight: {
    small: 32,
    medium: 44,
    large: 56,
  },

  inputHeight: {
    small: 36,
    medium: 48,
    large: 56,
  },

  // Icon sizes
  iconSize: {
    tiny: 12,
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
} as const;

/**
 * 🎨 Championship Component Themes
 */
export const ComponentThemes = {
  // Button themes
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
      textColor: Colors.textOnPrimary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: Colors.accent,
      textColor: Colors.accent,
    },
    success: {
      backgroundColor: Colors.success,
      borderColor: Colors.success,
      textColor: Colors.textPrimary,
    },
    warning: {
      backgroundColor: Colors.warning,
      borderColor: Colors.warning,
      textColor: Colors.textOnPrimary,
    },
    error: {
      backgroundColor: Colors.error,
      borderColor: Colors.error,
      textColor: Colors.textPrimary,
    },
  },

  // Card themes
  card: {
    default: {
      backgroundColor: Colors.backgroundCard,
      borderColor: Colors.border,
    },
    elevated: {
      backgroundColor: Colors.backgroundLight,
      borderColor: 'transparent',
    },
    primary: {
      backgroundColor: Colors.primaryAlpha,
      borderColor: Colors.primary,
    },
  },

  // Input themes
  input: {
    default: {
      backgroundColor: Colors.backgroundCard,
      borderColor: Colors.border,
      textColor: Colors.textPrimary,
      placeholderColor: Colors.textMuted,
    },
    focused: {
      borderColor: Colors.accent,
    },
    error: {
      borderColor: Colors.error,
    },
  },
} as const;

/**
 * 🏆 Championship Text Styles
 */
export const TextStyles = {
  hero: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.hero,
    lineHeight: Typography.lineHeight.tight,
    color: Colors.textPrimary,
    fontWeight: '800' as const,
  },

  heading1: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.display,
    lineHeight: Typography.lineHeight.tight,
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },

  heading2: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.heading,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },

  heading3: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.title,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },

  body: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.medium,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textPrimary,
  },

  bodyLarge: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.large,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textPrimary,
  },

  caption: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.small,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textSecondary,
  },

  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.small,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: Typography.letterSpacing.wider,
  },

  button: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.medium,
    lineHeight: Typography.lineHeight.tight,
    fontWeight: '600' as const,
  },

  monospace: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.small,
    lineHeight: Typography.lineHeight.normal,
    color: Colors.textPrimary,
  },
} as const;

/**
 * 🎯 Championship Z-Index System
 */
export const ZIndex = {
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 20,
  banner: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
  maximum: 999,
} as const;

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Animation,
  Shadows,
  Layout,
  ComponentThemes,
  TextStyles,
  ZIndex,
};