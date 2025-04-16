// Map stain categories to icons
const stainIconMap: Record<string, string> = {
  beverage: 'ri-cup-line',
  food: 'ri-restaurant-line',
  oil: 'ri-drop-line',
  ink: 'ri-ink-bottle-line',
  dirt: 'ri-footprint-line',
  grass: 'ri-plant-line',
  bodily_fluid: 'ri-heart-pulse-line',
  makeup: 'ri-brush-line',
  other: 'ri-question-mark'
};

// Get the icon for a stain category
export const getStainIcon = (category: string): string => {
  return stainIconMap[category] || 'ri-question-mark';
};

// Material type to icon mapping
const materialIconMap: Record<string, string> = {
  natural: 'ri-t-shirt-line',
  synthetic: 'ri-t-shirt-air-line',
  leather: 'ri-handbag-line',
  upholstery: 'ri-sofa-line',
  hard_surface: 'ri-home-4-line',
  other: 'ri-file-list-line'
};

// Get the icon for a material type
export const getMaterialIcon = (type: string): string => {
  return materialIconMap[type] || 'ri-file-list-line';
};
