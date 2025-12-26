
export enum AppState {
  INTRO = 'INTRO',
  WORKSHOP_PAN = 'WORKSHOP_PAN',
  DIALOGUE = 'DIALOGUE',
  GACHA = 'GACHA',
  RESULT = 'RESULT'
}

export interface Gift {
  id: string;
  name: string;
  color: string;
  hex: string;
  emoji: string;
  description: string;
}

export const GIFTS: Gift[] = [
  { 
    id: 'red', 
    name: "Reindeer’s Red Fake Nose", 
    color: 'Red', 
    hex: '#ff4d4d', 
    emoji: '🔴',
    description: "A fake nose the reindeer accidentally dropped while delivering gifts."
  },
  { 
    id: 'blue', 
    name: "Santa’s Signed Hat", 
    color: 'Blue', 
    hex: '#4d94ff', 
    emoji: '🎅🏼',
    description: "A hat personally signed by Santa himself."
  },
  { 
    id: 'green', 
    name: "Elf’s Staff ID", 
    color: 'Green', 
    hex: '#4dff88', 
    emoji: '🪪',
    description: "An official access pass that allows entry into Santa’s secret workshop areas."
  },
  { 
    id: 'purple', 
    name: "Grandma Claus’ Secret Pie Slice", 
    color: 'Purple', 
    hex: '#b366ff', 
    emoji: '🥧',
    description: "A secretly saved pie slice made by Grandma Claus."
  },
  { 
    id: 'pink', 
    name: "North Pole Daily News", 
    color: 'Pink', 
    hex: '#ff80bf', 
    emoji: '📰',
    description: "The daily newspaper from the North Pole, featuring workshop headlines."
  },
  { 
    id: 'yellow', 
    name: "Squirrel’s Mini Festive Tree", 
    color: 'Yellow', 
    hex: '#ffff4d', 
    emoji: '🎄',
    description: "A tiny decorated Christmas tree carried by a festive squirrel."
  },
  { 
    id: 'white', 
    name: "Polar Bear’s Red Scarf", 
    color: 'White', 
    hex: '#ffffff', 
    emoji: '🧣',
    description: "A warm red scarf belonging to a polar bear."
  }
];
