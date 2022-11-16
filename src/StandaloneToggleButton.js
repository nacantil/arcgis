import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';

export default function StandaloneToggleButton({name, onToggleButtonChange}) {
  const [selected, setSelected] = React.useState(false);

  return (
    <ToggleButton
      value={name}
      selected={selected}
      onChange={(e) => {
        setSelected(!selected);
        onToggleButtonChange(e, !selected);
      }}
    >
    	{name}  
    </ToggleButton>
  );
}