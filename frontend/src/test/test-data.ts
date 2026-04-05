// Test data for sub-process tracking scenarios

export const mockHandBuiltProduct = {
  id: '1',
  productCode: 'TRAY-HB-001',
  productName: 'Ceramic Tray (Hand Built)',
  productType: 'HAND_BUILT',
  quantity: 50,
  extraBuffer: 15,
};

export const mockNormalProduct = {
  id: '2',
  productCode: 'MUG-ST-001',
  productName: 'Standard Mug',
  productType: 'NORMAL',
  quantity: 100,
  extraBuffer: 10,
};

export const mockPOLData = [
  {
    id: 'pol-1',
    poNumber: 'PO-2024-001',
    clientName: 'Ceramic Arts Co.',
    details: [mockHandBuiltProduct, mockNormalProduct],
  },
];

export const mockStages = [
  {
    id: '1',
    code: 'DECORATION',
    name: 'Decoration',
    category: 'DECOR',
    color: '#ff9800',
    hasDetailProcess: true,
  },
  {
    id: '2',
    code: 'THROWING',
    name: 'Throwing',
    category: 'FORMING',
    color: '#4caf50',
    hasDetailProcess: false,
  },
];

export const mockStageCategories = [
  {
    code: 'DECOR',
    name: 'Decoration',
    color: '#ff9800',
    stages: [mockStages[0]],
  },
  {
    code: 'FORMING',
    name: 'Forming',
    color: '#4caf50',
    stages: [mockStages[1]],
  },
];

export const mockDetailProcesses = [
  {
    id: 'dp-1',
    stageId: '1',
    processName: 'Slab Preparation',
    processOrder: 1,
  },
  {
    id: 'dp-2',
    stageId: '1',
    processName: 'Carving Slab',
    processOrder: 2,
  },
  {
    id: 'dp-3',
    stageId: '1',
    processName: 'Finishing Slab',
    processOrder: 3,
  },
];

export const mockSubProcesses = [
  {
    id: 'sp-1',
    processName: 'Slabing',
    processOrder: 1,
    quantity: 50,
    rejectQuantity: 2,
    completed: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: 'sp-2',
    processName: 'Carving Slab',
    processOrder: 2,
    quantity: 48,
    rejectQuantity: 1,
    completed: true,
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T15:00:00Z',
  },
  {
    id: 'sp-3',
    processName: 'Finishing Slab',
    processOrder: 3,
    quantity: 47,
    rejectQuantity: 0,
    completed: false,
    createdAt: '2024-01-15T16:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
];

export const mockProductionWorkflow = {
  workflowType: 'HANDBUILD',
  stages: ['DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING'],
};

export const mockOperators = [
  { id: '1', fullName: 'John Smith' },
  { id: '2', fullName: 'Jane Doe' },
];

export const mockOvens = [
  { id: '1', name: 'Kiln A' },
  { id: '2', name: 'Kiln B' },
];

export const mockDefectReasons = [
  { id: '1', category: 'Surface', description: 'Crack in surface' },
  { id: '2', category: 'Shape', description: 'Warping' },
];