import { getAllowedPropertyAttributes, getTargetDefinition } from './metadataSchema.js';

export function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function sanitizeList(items = []) {
  return items.map((item) => String(item || '').trim()).filter(Boolean);
}

export function validateTargetConfig(config) {
  const warnings = [];
  const definition = getTargetDefinition(config.target);
  if (!definition) {
    warnings.push(`Unknown target "${config.target}" was selected.`);
    return warnings;
  }

  if (!definition.supports.formFactors && config.formFactors.length > 0) {
    warnings.push(`${config.target} does not support form factors; those values will be ignored.`);
  }

  if (!definition.supports.objects && config.objects.length > 0) {
    warnings.push(`${config.target} does not support objects; those values will be ignored.`);
  }

  if (!definition.supports.properties && config.properties.length > 0) {
    warnings.push(`${config.target} does not support properties; those entries will be ignored.`);
  }

  if (definition.supports.properties && definition.propertyTypes?.length) {
    config.properties.forEach((property) => {
      if (!definition.propertyTypes.includes(property.type)) {
        warnings.push(`${config.target} does not support property type "${property.type}".`);
      }
      const allowedAttributes = getAllowedPropertyAttributes(config.target, property.type);
      Object.keys(property).forEach((propertyKey) => {
        if (!allowedAttributes.includes(propertyKey)) {
          warnings.push(`${config.target} does not support property attribute "${propertyKey}" for ${property.type}.`);
        }
      });
    });
  }

  if (!definition.supports.events && config.events?.length > 0) {
    warnings.push(`${config.target} does not support events; those entries will be ignored.`);
  }

  return warnings;
}

export function validateSelectedTargets(targets = []) {
  const warnings = [];
  targets.forEach((target) => {
    const definition = getTargetDefinition(target);
    if (!definition?.requiresAnyTarget?.length) return;
    const hasDependency = definition.requiresAnyTarget.some((requiredTarget) => targets.includes(requiredTarget));
    if (!hasDependency) {
      warnings.push(`${target} should be paired with one of: ${definition.requiresAnyTarget.join(', ')}.`);
    }
  });
  return warnings;
}

function getTargetCompatibilitySignature(target) {
  const definition = getTargetDefinition(target);
  if (!definition) return '';
  const supportsSignature = JSON.stringify(definition.supports || {});
  const propertyTypeSignature = (definition.propertyTypes || []).join('|');
  const attributeSignature = (definition.attributes || []).map((attribute) => attribute.key).sort().join('|');
  return `${supportsSignature}::${propertyTypeSignature}::${attributeSignature}`;
}

export function areTargetsGroupCompatible(targets = []) {
  if (targets.length <= 1) return true;
  const signatures = new Set(targets.map((target) => getTargetCompatibilitySignature(target)));
  return signatures.size === 1;
}

export function validateGroupedTargetConfigs(groupedConfigs = []) {
  const warnings = [];
  groupedConfigs.forEach((group) => {
    if (group.targets?.length > 1 && !areTargetsGroupCompatible(group.targets)) {
      warnings.push(`Targets ${group.targets.join(', ')} cannot share one targetConfig because their capabilities differ.`);
    }
  });
  return warnings;
}
