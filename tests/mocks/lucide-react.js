/**
 * @fileOverview Mock for lucide-react icons
 * 
 * This mock provides simplified versions of lucide-react icons for testing.
 * Each icon is mocked as a simple div with a data-testid for easy testing.
 */

const React = require('react');

// Generic icon component factory
const createMockIcon = (iconName) => {
  const MockIcon = ({ className, ...props }) => (
    React.createElement('div', {
      'data-testid': `${iconName.toLowerCase()}-icon`,
      className: `mock-icon ${className || ''}`,
      'aria-label': iconName,
      ...props
    })
  );
  MockIcon.displayName = iconName;
  return MockIcon;
};

// Export all commonly used lucide-react icons using CommonJS
module.exports = {
  User: createMockIcon('User'),
  Mail: createMockIcon('Mail'),
  LogOut: createMockIcon('LogOut'),
  Shield: createMockIcon('Shield'),
  Crown: createMockIcon('Crown'),
  Chrome: createMockIcon('Chrome'),
  ScrollText: createMockIcon('ScrollText'),
  AlertTriangle: createMockIcon('AlertTriangle'),
  Eye: createMockIcon('Eye'),
  EyeOff: createMockIcon('EyeOff'),
  Lock: createMockIcon('Lock'),
  Unlock: createMockIcon('Unlock'),
  Home: createMockIcon('Home'),
  Settings: createMockIcon('Settings'),
  Search: createMockIcon('Search'),
  Plus: createMockIcon('Plus'),
  Minus: createMockIcon('Minus'),
  Check: createMockIcon('Check'),
  X: createMockIcon('X'),
  ChevronLeft: createMockIcon('ChevronLeft'),
  ChevronRight: createMockIcon('ChevronRight'),
  ChevronUp: createMockIcon('ChevronUp'),
  ChevronDown: createMockIcon('ChevronDown'),
  Menu: createMockIcon('Menu'),
  MoreVertical: createMockIcon('MoreVertical'),
  Edit: createMockIcon('Edit'),
  Trash: createMockIcon('Trash'),
  Save: createMockIcon('Save'),
  Download: createMockIcon('Download'),
  Upload: createMockIcon('Upload'),
  Share: createMockIcon('Share'),
  Copy: createMockIcon('Copy'),
  ExternalLink: createMockIcon('ExternalLink'),
  Info: createMockIcon('Info'),
  HelpCircle: createMockIcon('HelpCircle'),
  Bell: createMockIcon('Bell'),
  Calendar: createMockIcon('Calendar'),
  Clock: createMockIcon('Clock'),
  Star: createMockIcon('Star'),
  Heart: createMockIcon('Heart'),
  ThumbsUp: createMockIcon('ThumbsUp'),
  MessageCircle: createMockIcon('MessageCircle'),
  Send: createMockIcon('Send'),
  Image: createMockIcon('Image'),
  File: createMockIcon('File'),
  Folder: createMockIcon('Folder'),
  Book: createMockIcon('Book'),
  BookOpen: createMockIcon('BookOpen'),
  Globe: createMockIcon('Globe'),
  Wifi: createMockIcon('Wifi'),
  WifiOff: createMockIcon('WifiOff'),
  Battery: createMockIcon('Battery'),
  Power: createMockIcon('Power'),
  Refresh: createMockIcon('Refresh'),
  RotateCcw: createMockIcon('RotateCcw'),
  RotateCw: createMockIcon('RotateCw'),
  ZoomIn: createMockIcon('ZoomIn'),
  ZoomOut: createMockIcon('ZoomOut'),
  Maximize: createMockIcon('Maximize'),
  Minimize: createMockIcon('Minimize'),
  Filter: createMockIcon('Filter'),
  Sort: createMockIcon('Sort'),
  Grid: createMockIcon('Grid'),
  List: createMockIcon('List'),
  Play: createMockIcon('Play'),
  Pause: createMockIcon('Pause'),
  Stop: createMockIcon('Stop'),
  Volume: createMockIcon('Volume'),
  VolumeOff: createMockIcon('VolumeOff'),
  // Default export for any other icons
  default: createMockIcon('DefaultIcon')
}; 