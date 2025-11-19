
import React from 'react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-accent/20 hover:scale-[1.02] p-6">
      <h3 className="text-2xl font-bold font-serif text-text-primary">{character.name}</h3>
      <p className="text-sm font-semibold text-accent mb-2">{character.role}</p>
      <p className="text-text-secondary mb-4 h-32 overflow-y-auto">{character.description}</p>
    </div>
  );
};

export default CharacterCard;