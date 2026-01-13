import type { ParsedSQL } from '../../types';
import './ExecutableSQLView.css';

interface ExecutableSQLViewProps {
  sql: ParsedSQL;
}

/**
 * Highlights SQL keywords and replaced parameter values in the executable SQL
 */
function highlightSQL(sql: string, replacedValues?: Array<{ start: number; end: number; value: string }>): string {
  // SQL keywords to highlight (case-insensitive) - order matters: longer keywords first
  const sqlKeywords = [
    'UNION ALL', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'ORDER BY', 'GROUP BY', 'UNION', 'INTERSECT', 'EXCEPT',
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE',
    'JOIN', 'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'LIKE', 'BETWEEN',
    'HAVING', 'SET', 'VALUES', 'AS', 'DISTINCT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CAST', 'CONVERT'
  ];

  // First, highlight replaced parameter values using position information (before HTML escaping)
  const paramPlaceholders: Array<{ placeholder: string; replacement: string }> = [];
  
  if (replacedValues && replacedValues.length > 0) {
    // Sort by start position in reverse order to avoid position shifts
    const sortedValues = [...replacedValues].sort((a, b) => b.start - a.start);
    
    sortedValues.forEach((rv, index) => {
      if (rv.start >= 0 && rv.end <= sql.length && rv.start < rv.end) {
        const value = sql.substring(rv.start, rv.end);
        // Verify the value matches (it should)
        if (value === rv.value) {
          const placeholder = `__PARAM_${paramPlaceholders.length}__`;
          // Escape the value for HTML
          const escapedValue = value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          
          paramPlaceholders.push({
            placeholder,
            replacement: `<span class="sql-parameter">${escapedValue}</span>`
          });
          sql = sql.substring(0, rv.start) + placeholder + sql.substring(rv.end);
        }
      }
    });
  }

  // Escape HTML special characters
  let result = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Then highlight SQL keywords
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword.replace(/\s+/g, '\\s+')})\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Skip if it's a placeholder
      if (match.startsWith('__PARAM_')) return match;
      return `<span class="sql-keyword">${match}</span>`;
    });
  });

  // Restore parameter placeholders
  paramPlaceholders.forEach(({ placeholder, replacement }) => {
    result = result.replace(placeholder, replacement);
  });

  return result;
}

const ExecutableSQLView = (props: ExecutableSQLViewProps) => {
  const highlightedSQL = () => highlightSQL(props.sql.executableSQL, props.sql.replacedValues);

  return (
    <div class="output-section">
      <h2 class="section-title">Executable SQL (Parameter-Bound)</h2>
      <pre class="sql-output executable" innerHTML={highlightedSQL()}></pre>
    </div>
  );
};

export default ExecutableSQLView;
