export const PROPERTY_TYPES = ['Boolean', 'Integer', 'String'];

export const TARGET_DEFINITIONS = [
  { value: 'lightning__AppPage', label: 'App Page', category: 'Pages', supports: { formFactors: true, properties: true, objects: false, events: true }, propertyTypes: ['Boolean', 'Integer', 'String'] },
  { value: 'lightning__HomePage', label: 'Home Page', category: 'Pages', supports: { formFactors: true, properties: true, objects: false, events: true }, propertyTypes: ['Boolean', 'Integer', 'String'] },
  { value: 'lightning__RecordPage', label: 'Record Page', category: 'Pages', supports: { formFactors: true, properties: true, objects: true, events: true }, propertyTypes: ['Boolean', 'Integer', 'String'] },
  { value: 'lightning__RecordAction', label: 'Record Action', category: 'Pages', supports: { formFactors: true, properties: false, objects: false, events: false }, attributes: [{ key: 'actionType', label: 'Action Type', type: 'select', options: ['ScreenAction', 'Action'] }] },
  { value: 'lightning__UtilityBar', label: 'Utility Bar', category: 'Pages', supports: { formFactors: false, properties: true, objects: false, events: false }, propertyTypes: ['Boolean', 'Integer', 'String'] },
  { value: 'lightning__FlowScreen', label: 'Flow Screen', category: 'Pages', supports: { formFactors: false, properties: true, objects: false, events: false }, propertyTypes: ['Boolean', 'Integer', 'String'], attributes: [{ key: 'configurationEditor', label: 'Configuration Editor', type: 'text', placeholder: 'c:myFlowEditor' }] },
  { value: 'lightning__Tab', label: 'Custom Tab', category: 'Pages', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightning__UrlAddressable', label: 'URL Addressable', category: 'Pages', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningCommunity__Page', label: 'Experience Builder Page', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningCommunity__Theme_Layout', label: 'Experience Builder Theme Layout', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningCommunity__Default', label: 'Experience Builder Default Config', category: 'Experience Cloud', supports: { formFactors: false, properties: true, objects: false, events: false }, propertyTypes: ['Boolean', 'Integer', 'String'], requiresAnyTarget: ['lightningCommunity__Page', 'lightningCommunity__Theme_Layout'] },
  { value: 'lightningSnapin__ChatHeader', label: 'Embedded Service Chat Header', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningSnapin__ChatMessage', label: 'Embedded Service Chat Message', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningSnapin__Minimized', label: 'Embedded Service Chat Minimized', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningSnapin__PreChat', label: 'Embedded Service Chat Pre-Chat', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningSnapin__PostChat', label: 'Embedded Service Chat Post-Chat', category: 'Experience Cloud', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightning__AgentforceInput', label: 'Agentforce Input', category: 'Agentforce', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightning__AgentforceOutput', label: 'Agentforce Output', category: 'Agentforce', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightningStatic__Email', label: 'Email Content Builder', category: 'Email', supports: { formFactors: false, properties: true, objects: false, events: false }, propertyTypes: ['Boolean', 'Integer', 'String'] },
  { value: 'lightning__Inbox', label: 'Inbox', category: 'Other', supports: { formFactors: false, properties: false, objects: false, events: false } },
  { value: 'lightning__ECSFSApp', label: 'Field Service Mobile App', category: 'Other', supports: { formFactors: false, properties: true, objects: false, events: false }, propertyTypes: ['Boolean', 'Integer', 'String'] }
];

export const FORM_FACTORS = ['Small', 'Large'];

const DEFAULT_PROPERTY_ATTRIBUTES = {
  Boolean: ['name', 'type', 'label', 'description', 'required', 'default'],
  Integer: ['name', 'type', 'label', 'description', 'required', 'default', 'min', 'max'],
  String: ['name', 'type', 'label', 'description', 'required', 'default', 'placeholder', 'datasource']
};

const PROPERTY_ATTRIBUTE_OVERRIDES = {
  lightning__FlowScreen: {
    Boolean: ['name', 'type', 'label', 'description', 'required', 'default'],
    Integer: ['name', 'type', 'label', 'description', 'required', 'default'],
    String: ['name', 'type', 'label', 'description', 'required', 'default']
  },
  lightningCommunity__Default: {
    String: ['name', 'type', 'label', 'description', 'required', 'default']
  },
  lightningStatic__Email: {
    String: ['name', 'type', 'label', 'description', 'required', 'default']
  }
};

export function getTargetDefinition(targetValue) {
  return TARGET_DEFINITIONS.find((target) => target.value === targetValue);
}

export function getAllowedPropertyAttributes(targetValue, propertyType) {
  const targetOverrides = PROPERTY_ATTRIBUTE_OVERRIDES[targetValue];
  if (targetOverrides?.[propertyType]) {
    return targetOverrides[propertyType];
  }
  return DEFAULT_PROPERTY_ATTRIBUTES[propertyType] || ['name', 'type'];
}
