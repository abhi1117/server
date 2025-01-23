 import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // Correctly import ItemTypes

const EvaluatorDraggableItem = ({ id, name }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { id, name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className="evaluator-draggable-item" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {name}
    </div>
  );
};

export default EvaluatorDraggableItem;
