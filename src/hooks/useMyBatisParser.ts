import { createSignal } from 'solid-js';
import { parseMyBatisLogs, rebuildExecutableSQL, type ParserConfig, DEFAULT_CONFIG } from '../parser';
import type { ParsedSQL } from '../types';

/**
 * MyBatisログのパース処理を管理するカスタムフック
 */
export function useMyBatisParser() {
  const [parsedResults, setParsedResults] = createSignal<ParsedSQL[]>([]);
  const [selectedSQLIndex, setSelectedSQLIndex] = createSignal(0);
  const [parserConfig, setParserConfig] = createSignal<ParserConfig>(DEFAULT_CONFIG);

  /**
   * ログテキストをパースしてSQLを抽出
   */
  const parseLogs = (logText: string, config?: ParserConfig): void => {
    if (!logText.trim()) {
      setParsedResults([]);
      return;
    }

    const configToUse = config || parserConfig();
    const results = parseMyBatisLogs(logText, configToUse);
    setParsedResults(results);
    
    if (results.length > 0) {
      setSelectedSQLIndex(0);
    }
  };

  /**
   * パーサー設定を更新
   */
  const updateConfig = (config: ParserConfig): void => {
    setParserConfig(config);
  };

  /**
   * 現在選択されているSQLを取得
   */
  const getCurrentSQL = (): ParsedSQL | null => {
    const results = parsedResults();
    const index = selectedSQLIndex();
    return results[index] || null;
  };

  /**
   * SQLの選択インデックスを設定（範囲チェック付き）
   */
  const selectSQL = (index: number): void => {
    const results = parsedResults();
    if (index >= 0 && index < results.length) {
      setSelectedSQLIndex(index);
    }
  };

  /**
   * パラメータの値を更新してSQLを再生成
   */
  const updateParameter = (sqlIndex: number, paramIndex: number, value: any): void => {
    const results = parsedResults();
    if (sqlIndex < 0 || sqlIndex >= results.length) {
      return;
    }

    const sql = results[sqlIndex];
    if (paramIndex < 0 || paramIndex >= sql.parameters.length) {
      return;
    }

    // パラメータの値を更新
    const updatedParameters = [...sql.parameters];
    updatedParameters[paramIndex] = {
      ...updatedParameters[paramIndex],
      value,
      rawValue: String(value),
    };

    // SQLを再生成
    const updatedSQL = rebuildExecutableSQL(sql.originalSQL, updatedParameters);

    // 結果を更新
    const newResults = [...results];
    newResults[sqlIndex] = updatedSQL;
    setParsedResults(newResults);
  };

  return {
    parsedResults,
    selectedSQLIndex,
    parseLogs,
    getCurrentSQL,
    selectSQL,
    parserConfig,
    updateConfig,
    updateParameter,
  };
}
