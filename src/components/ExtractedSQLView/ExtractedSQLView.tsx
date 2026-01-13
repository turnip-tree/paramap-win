import type { ParsedSQL } from '../../types';
import './ExtractedSQLView.css';

interface ExtractedSQLViewProps {
  sql: ParsedSQL;
}

const ExtractedSQLView = (props: ExtractedSQLViewProps) => {
  return (
    <div class="output-section">
      <h2 class="section-title">Extracted SQL</h2>
      <pre class="sql-output">{props.sql.originalSQL}</pre>
    </div>
  );
};

export default ExtractedSQLView;
