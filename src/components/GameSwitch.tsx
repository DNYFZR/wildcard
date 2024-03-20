// Create component groupings with a button based selection bar

import React, { useState } from 'react';

export type ComponentsMap = {
  [key: string]: React.ElementType;
};

interface GameSwitchProps {
  cmap: ComponentsMap;
}

const GameSwitch: React.FC<GameSwitchProps> = ({ cmap }) => {
  // Initialize state with the first key in the components map
  const [selectedComponent, setSelectedComponent] = useState(Object.keys(cmap)[0]);

  // Get the component to render from the components map
  const ComponentToRender = cmap[selectedComponent];

  return (
    <div>
      <header className='App-header'>
        {Object.keys(cmap).map((componentKey) => (
          <button
          key={componentKey}
          className={`cc-button ${componentKey === selectedComponent ? 'cc-button-selected' : 'cc-button'}`}
          onClick={() => setSelectedComponent(componentKey)}
        >
            {componentKey}
          </button>
        ))}
      </header>
      
      <ComponentToRender />
    </div>
  );
};

export default GameSwitch;
