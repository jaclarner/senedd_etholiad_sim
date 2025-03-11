// src/utils/formatting.js
// Utility functions for consistent number and text formatting across components

/**
 * Format a number with a fixed number of decimal places
 * @param {Number} number - The number to format
 * @param {Number} decimalPlaces - How many decimal places to show (default: 1)
 * @returns {String} Formatted number as string
 */
export function formatDecimal(number, decimalPlaces = 1) {
    return Number(number).toFixed(decimalPlaces);
  }
  
  /**
   * Format a percentage value with a fixed number of decimal places
   * @param {Number} number - The percentage to format
   * @param {Number} decimalPlaces - How many decimal places to show (default: 1)
   * @returns {String} Formatted percentage as string with % symbol
   */
  export function formatPercent(number, decimalPlaces = 1) {
    return `${formatDecimal(number, decimalPlaces)}%`;
  }
  
  /**
   * Format a number with thousands separators
   * @param {Number} number - The number to format
   * @param {Number} decimalPlaces - How many decimal places to show (default: 0)
   * @returns {String} Formatted number as string with thousands separators
   */
  export function formatNumber(number, decimalPlaces = 0) {
    return Number(number).toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  }
  
  /**
   * Format party name for display
   * @param {String} party - Internal party name
   * @returns {String} Formatted party name for display
   */
  export function formatPartyName(party) {
    const partyNames = {
      'PlaidCymru': 'Plaid Cymru',
      'LibDems': 'Liberal Democrats',
      'Conservatives': 'Conservatives',
      'Labour': 'Labour',
      'Greens': 'Greens',
      'Reform': 'Reform',
      'Other': 'Other'
    };
    
    return partyNames[party] || party;
  }
  
  /**
   * Get party color for consistent styling
   * @param {String} party - Party name
   * @returns {String} HEX color code
   */
  export function getPartyColor(party) {
    const partyColors = {
      'Labour': '#DC241f',
      'Conservatives': '#0087DC',
      'PlaidCymru': '#005B54',
      'LibDems': '#FDBB30',
      'Greens': '#6AB023',
      'Reform': '#12B6CF',
      'Other': '#808080'
    };
    
    return partyColors[party] || '#808080';
  }
  
  /**
   * Get a color with transparency for a party
   * @param {String} party - Party name
   * @param {Number} alpha - Alpha transparency (0-1)
   * @returns {String} RGBA color string
   */
  export function getPartyColorWithOpacity(party, alpha = 0.5) {
    // Convert hex color to rgba
    const hexColor = getPartyColor(party);
    
    // Parse the hex color
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * Truncate a long string and add ellipsis if needed
   * @param {String} text - The text to truncate
   * @param {Number} maxLength - Maximum allowed length
   * @returns {String} Truncated text with ellipsis if needed
   */
  export function truncateText(text, maxLength = 25) {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  }
  
  /**
   * Get appropriate text color (black or white) based on background color
   * for optimal contrast and readability
   * @param {String} backgroundColor - HEX color code
   * @returns {String} Either '#FFFFFF' or '#000000'
   */
  export function getContrastText(backgroundColor) {
    // Convert hex to RGB
    let r = parseInt(backgroundColor.slice(1, 3), 16);
    let g = parseInt(backgroundColor.slice(3, 5), 16);
    let b = parseInt(backgroundColor.slice(5, 7), 16);
    
    // Calculate luminance - standard formula for perceived brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }