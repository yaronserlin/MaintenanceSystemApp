// src/contexts/ToolContext.jsx - Re-export EquipmentContext for backward compatibility
export {
    EquipmentProvider as ToolProvider,
    useEquipment as useTool,
    EquipmentProvider,
    useEquipment,
} from './EquipmentContext';

import EquipmentContext from './EquipmentContext';
export default EquipmentContext;