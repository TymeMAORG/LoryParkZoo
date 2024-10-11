export interface Staff {
    id: number;          
    name: string;         
    animalGroup: string;  
    dateAdded: string;    
  }

  export interface Species {
    id: number;
    speciesName: string;
    animalGroup: string;
  }

  export const ANIMAL_GROUPS = [
    { label: "Big Cats", value: "bigcats" },
    { label: "Reptiles", value: "reptiles" },
    { label: "Birds", value: "birds" },
    { label: "Birds of Prey", value: "birdsofprey" },
    { label: "Primates", value: "primates" },
  ];