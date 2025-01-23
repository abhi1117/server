 import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // Correctly import ItemTypes

const EvaluatorDropArea = ({ onDrop, children }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.FIELD,
    drop: (item) => onDrop(item),
  });

  return (
    <div ref={drop} className="evaluator-drop-area">
      {children}
    </div>
  );
};

export default EvaluatorDropArea;
