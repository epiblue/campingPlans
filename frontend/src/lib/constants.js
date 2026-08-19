// lib/constants.js                                                                                                                                                                                                                
export const comfortSpecificFeatures = {
    standard: [
        { label: '75m2', icon: 'camping' },
        { label: 'Luz 6amp.', icon: 'water' },
    ],
    premium: [
        { label: '100m2', icon: 'camping' },
        { label: 'Luz 10amp.', icon: 'electro' },
        { label: 'Agua', icon: 'water' },
        { label: 'Wifi', icon: 'wifi' },
    ],
    comfort_centro: [
        { label: '100m2', icon: 'camping' },
        { label: 'Luz 10amp.', icon: 'water' },
        { label: 'Wifi', icon: 'water' },
    ],
    comfort: [
        { label: '100m2', icon: 'camping' },
        { label: 'Luz 6amp.', icon: 'water' },
    ],
    comfort_plus: [
        { label: '100m2', icon: 'camping' },
        { label: 'Luz 10amp.', icon: 'water' },
        { label: 'Agua', icon: 'water' },
    ],
};

export const areaDescriptions = {
    pet_friendly: [
        { description: 'Pet friendly area' },
    ],
    bungalows: [
        { description: 'Pet friendly area' },
    ],
}

export const directionTranslations = {
    "Walk northeast.": "Caminar al noreste.",
    "Make a sharp left.": "Girar bruscamente a la izquierda.",
    "Turn left.": "Girar a la izquierda.",
    "Turn right.": "Girar a la derecha.",
    "left": "izquierda",
    "right": "derecha",
    "sharp left": "bruscamente a la izquierda",
    "sharp right": "bruscamente a la derecha",
    "Your destination is on the left.": "Tu destino está a la izquierda.",
    "Walk north": "Caminar al Norte"
};

export const directionTranslationPatterns = [
    { pattern: /^Turn (left|right|sharp left|sharp right) onto (.+)\.$/, translation: "Girar $1 en $2." },
];

export const maneuverIconMap = {
    'arrive': 'flag_check',
    'depart': 'directions_walk',
    'left': 'turn_left',
    'right': 'turn_right',
    'sharp left': 'turn_sharp_left',
    'sharp right': 'turn_sharp_right',
    'slight left': 'turn_slight_left',
    'slight right': 'turn_slight_right',
    'uturn': 'turn-uturn',
    'default': 'road',
};  