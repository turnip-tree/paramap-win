import type { ParsedSQL, ParsedParameter, ReplacedValue } from './types';

export interface ParserConfig {
  preparingPrefix: string;
  parametersPrefix: string;
}

export const DEFAULT_CONFIG: ParserConfig = {
  preparingPrefix: 'Preparing:',
  parametersPrefix: 'Parameters:',
};

/**
 * Extracts SQL and parameters from MyBatis JDBC logs
 */
export function parseMyBatisLogs(logText: string, config: ParserConfig = DEFAULT_CONFIG): ParsedSQL[] {
  const results: ParsedSQL[] = [];
  
  // Split by lines and find all Preparing/Parameters pairs
  const lines = logText.split('\n');
  
  let currentSQL: string | null = null;
  let currentParams: string | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match preparing prefix line - flexible pattern
    const preparingPattern = new RegExp(`${config.preparingPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`, 'i');
    const preparingMatch = line.match(preparingPattern);
    if (preparingMatch) {
      // If we have a previous SQL, process it first
      if (currentSQL && currentParams) {
        results.push(parseSQLPair(currentSQL, currentParams));
      }
      currentSQL = preparingMatch[1].trim();
      currentParams = null;
      continue;
    }
    
    // Match parameters prefix line - flexible pattern
    const paramsPattern = new RegExp(`${config.parametersPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`, 'i');
    const paramsMatch = line.match(paramsPattern);
    if (paramsMatch) {
      currentParams = paramsMatch[1].trim();
      continue;
    }
    
    // Handle multi-line parameters (continuation lines)
    const preparingEscaped = config.preparingPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parametersEscaped = config.parametersPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const continuationPattern = new RegExp(`^(${preparingEscaped}|${parametersEscaped})`, 'i');
    if (currentSQL && currentParams !== null && line && !line.match(continuationPattern)) {
      // Check if this might be a continuation of parameters
      if (line.includes('(') || line.includes(',')) {
        currentParams += ' ' + line;
      }
    }
  }
  
  // Process the last SQL/Params pair if exists
  if (currentSQL && currentParams) {
    results.push(parseSQLPair(currentSQL, currentParams));
  }
  
  return results.length > 0 ? results : [];
}

/**
 * Parses a single SQL/Parameters pair
 */
function parseSQLPair(sql: string, paramsLine: string): ParsedSQL {
  // Clean up SQL - remove extra whitespace but preserve structure
  const cleanedSQL = sql.replace(/\s+/g, ' ').trim();
  
  // Parse parameters
  const parameters = parseParameters(paramsLine, cleanedSQL);
  
  // Generate executable SQL by replacing placeholders
  const { sql: executableSQL, replacedValues } = bindParameters(cleanedSQL, parameters);
  
  // Format SQL - note: replacedValues positions are relative to executableSQL before formatting
  // We'll adjust positions after formatting
  const formattedSQL = formatSQL(executableSQL);
  const adjustedReplacedValues = adjustReplacedValuePositions(
    formattedSQL,
    replacedValues
  );
  
  return {
    originalSQL: formatSQL(cleanedSQL),
    executableSQL: formattedSQL,
    parameters,
    replacedValues: adjustedReplacedValues
  };
}

/**
 * Parses the Parameters line into structured parameter objects
 */
function parseParameters(paramsLine: string, sql: string): ParsedParameter[] {
  const params: ParsedParameter[] = [];
  
  // Pattern to match: value(Type) or value
  // Examples: "10(Integer)", "abc(String)", "true(Boolean)", "null"
  const paramPattern = /([^,()]+(?:\([^)]+\))?)/g;
  const matches = paramsLine.match(paramPattern);
  
  if (!matches) return params;
  
  // Find all ? placeholders in SQL to get context
  const placeholderMatches = [...sql.matchAll(/\?/g)];
  
  matches.forEach((match, index) => {
    const trimmed = match.trim();
    if (!trimmed) return;
    
    // Extract value and type
    const typeMatch = trimmed.match(/^(.+?)\(([^)]+)\)$/);
    let value: any;
    let type: string;
    let rawValue: string;
    
    if (typeMatch) {
      rawValue = typeMatch[1].trim();
      type = typeMatch[2].trim();
      value = parseValue(rawValue, type);
    } else {
      // No type specified, try to infer
      rawValue = trimmed;
      value = parseValue(trimmed, 'String');
      type = inferType(trimmed);
    }
    
    // Get placeholder context (surrounding SQL text)
    const placeholderContext = getPlaceholderContext(sql, index, placeholderMatches);
    
    params.push({
      index: index + 1,
      placeholderContext,
      value,
      type,
      rawValue
    });
  });
  
  return params;
}

/**
 * Gets the context around a placeholder (e.g., "user_id = ?")
 */
function getPlaceholderContext(sql: string, paramIndex: number, placeholderMatches: RegExpMatchArray[]): string {
  if (paramIndex >= placeholderMatches.length) {
    return '?';
  }
  
  const match = placeholderMatches[paramIndex];
  const start = match.index!;
  
  // Look backwards for context (up to 30 chars)
  const contextStart = Math.max(0, start - 30);
  const contextEnd = Math.min(sql.length, start + 1);
  
  let context = sql.substring(contextStart, contextEnd);
  
  // Try to extract a meaningful snippet (e.g., "user_id = ?")
  const beforeMatch = context.match(/(\w+\s*=\s*\?)$/);
  if (beforeMatch) {
    return beforeMatch[1];
  }
  
  // Fallback: show ? with some surrounding text
  return context.trim() || '?';
}

/**
 * Parses a parameter value based on its type
 */
function parseValue(rawValue: string, type: string): any {
  const lowerType = type.toLowerCase();
  
  if (rawValue === 'null' || rawValue === 'NULL') {
    return null;
  }
  
  if (lowerType.includes('integer') || lowerType.includes('int')) {
    return parseInt(rawValue, 10);
  }
  
  if (lowerType.includes('long')) {
    return BigInt(rawValue);
  }
  
  if (lowerType.includes('bigdecimal') || lowerType.includes('decimal') || lowerType.includes('double') || lowerType.includes('float')) {
    return parseFloat(rawValue);
  }
  
  if (lowerType.includes('boolean') || lowerType.includes('bool')) {
    return rawValue.toLowerCase() === 'true';
  }
  
  if (lowerType.includes('date') || lowerType.includes('timestamp')) {
    return rawValue; // Keep as string for display
  }
  
  // Default: string
  return rawValue;
}

/**
 * Infers the type of a value when not explicitly specified
 */
function inferType(value: string): string {
  if (value === 'null' || value === 'NULL') {
    return 'null';
  }
  
  if (/^-?\d+$/.test(value)) {
    return 'Integer';
  }
  
  if (/^-?\d+\.\d+$/.test(value)) {
    return 'BigDecimal';
  }
  
  if (value === 'true' || value === 'false') {
    return 'Boolean';
  }
  
  return 'String';
}

/**
 * Rebuilds executable SQL from original SQL and updated parameters
 */
export function rebuildExecutableSQL(originalSQL: string, parameters: ParsedParameter[]): ParsedSQL {
  // Clean up SQL - remove extra whitespace but preserve structure
  const cleanedSQL = originalSQL.replace(/\s+/g, ' ').trim();
  
  // Generate executable SQL by replacing placeholders
  const { sql: executableSQL, replacedValues } = bindParameters(cleanedSQL, parameters);
  
  // Format SQL
  const formattedSQL = formatSQL(executableSQL);
  const adjustedReplacedValues = adjustReplacedValuePositions(
    formattedSQL,
    replacedValues
  );
  
  return {
    originalSQL: formatSQL(cleanedSQL),
    executableSQL: formattedSQL,
    parameters,
    replacedValues: adjustedReplacedValues
  };
}

/**
 * Binds parameters to SQL placeholders and returns SQL with replaced value positions
 */
function bindParameters(sql: string, parameters: ParsedParameter[]): { sql: string; replacedValues: ReplacedValue[] } {
  let result = sql;
  let offset = 0;
  const replacedValues: ReplacedValue[] = [];
  
  // Replace each ? with the formatted parameter value
  parameters.forEach((param) => {
    const placeholderIndex = result.indexOf('?', offset);
    if (placeholderIndex !== -1) {
      const formattedValue = formatParameterValue(param.value, param.type);
      const start = placeholderIndex;
      const end = placeholderIndex + formattedValue.length;
      
      replacedValues.push({
        start,
        end,
        value: formattedValue
      });
      
      result = result.substring(0, placeholderIndex) + formattedValue + result.substring(placeholderIndex + 1);
      offset = placeholderIndex + formattedValue.length;
    }
  });
  
  return { sql: result, replacedValues };
}

/**
 * Formats a parameter value for SQL insertion
 */
function formatParameterValue(value: any, type: string): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  
  const lowerType = type.toLowerCase();
  
  // String types need quotes
  if (lowerType.includes('string') || lowerType.includes('char') || lowerType.includes('date') || lowerType.includes('timestamp')) {
    return `'${String(value).replace(/'/g, "''")}'`;
  }
  
  // Numeric and boolean types don't need quotes
  if (lowerType.includes('integer') || lowerType.includes('int') || lowerType.includes('long') || 
      lowerType.includes('bigdecimal') || lowerType.includes('decimal') || lowerType.includes('double') || 
      lowerType.includes('float') || lowerType.includes('boolean') || lowerType.includes('bool')) {
    return String(value);
  }
  
  // Default: treat as string
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Formats SQL with basic indentation
 */
function formatSQL(sql: string): string {
  // Basic SQL formatting
  let formatted = sql
    .replace(/\bSELECT\b/gi, '\nSELECT')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
    .replace(/\bON\b/gi, '\n  ON')
    .replace(/\bAND\b/gi, '\n  AND')
    .replace(/\bOR\b/gi, '\n  OR')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bINSERT INTO\b/gi, '\nINSERT INTO')
    .replace(/\bUPDATE\b/gi, '\nUPDATE')
    .replace(/\bSET\b/gi, '\nSET')
    .replace(/\bDELETE FROM\b/gi, '\nDELETE FROM')
    .replace(/\bVALUES\b/gi, '\nVALUES')
    .trim();
  
  // Add indentation for continuation lines
  formatted = formatted.replace(/\n(?!SELECT|FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|ORDER BY|GROUP BY|HAVING|INSERT INTO|UPDATE|SET|DELETE FROM|VALUES)/g, '\n  ');
  
  return formatted.trim();
}

/**
 * Adjusts replaced value positions after SQL formatting
 * This accounts for newlines and spaces added by formatSQL
 */
function adjustReplacedValuePositions(
  formattedSQL: string,
  replacedValues: ReplacedValue[]
): ReplacedValue[] {
  // Build a mapping of original positions to formatted positions
  // formatSQL mainly adds newlines before keywords, so we need to track these changes
  
  const adjusted: ReplacedValue[] = [];
  
  // For each replaced value, find its position in the formatted SQL
  replacedValues.forEach((rv) => {
    const searchValue = rv.value;
    
    // Strategy 1: Try to find the value near its expected position
    // Calculate approximate position in formatted SQL based on original position
    // This is a rough estimate since formatSQL adds newlines
    const approximatePos = Math.min(rv.start, formattedSQL.length);
    
    // Search around the approximate position
    const searchStart = Math.max(0, approximatePos - 50);
    const searchEnd = Math.min(formattedSQL.length, approximatePos + 200);
    const searchArea = formattedSQL.substring(searchStart, searchEnd);
    
    let foundIndex = searchArea.indexOf(searchValue);
    if (foundIndex !== -1) {
      foundIndex += searchStart;
      
      // Verify it's a valid match (not part of another value)
      const before = foundIndex > 0 ? formattedSQL[foundIndex - 1] : ' ';
      const after = foundIndex + searchValue.length < formattedSQL.length 
        ? formattedSQL[foundIndex + searchValue.length] 
        : ' ';
      
      const isValidBoundary = 
        (!/[a-zA-Z0-9_]/.test(before) && !/[a-zA-Z0-9_]/.test(after)) ||
        (searchValue.startsWith("'") && searchValue.endsWith("'")) ||
        searchValue === 'null';
      
      if (isValidBoundary) {
        adjusted.push({
          start: foundIndex,
          end: foundIndex + searchValue.length,
          value: searchValue
        });
        return; // Found, move to next
      }
    }
    
    // Strategy 2: Search the entire formatted SQL (fallback)
    // Use a more specific search to avoid false matches
    let globalIndex = -1;
    let searchFrom = 0;
    
    // For quoted strings, search for exact match
    if (searchValue.startsWith("'") && searchValue.endsWith("'")) {
      globalIndex = formattedSQL.indexOf(searchValue, searchFrom);
    } else {
      // For numbers and null, use word boundary
      const regex = new RegExp(`\\b${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const match = regex.exec(formattedSQL);
      if (match) {
        globalIndex = match.index;
      }
    }
    
    if (globalIndex !== -1) {
      adjusted.push({
        start: globalIndex,
        end: globalIndex + searchValue.length,
        value: searchValue
      });
    }
  });
  
  return adjusted;
}
